import { join } from 'node:path';

export class Deployer {
  constructor({ registry, lock, logger, caddy, shell, config }) {
    this.registry = registry;
    this.lock = lock;
    this.logger = logger;
    this.caddy = caddy;
    this.shell = shell;
    this.config = config;
  }

  async deploy(payload) {
    const { project_name, deploy_type, owner } = payload;

    this.lock.acquire(project_name);

    try {
      const existing = await this.registry.getProject(project_name);

      if (existing && existing.owner !== owner) {
        throw new Error(`Il progetto ${project_name} appartiene a ${existing.owner}`);
      }

      const isUpdate = existing !== null;
      const cleanupActions = [];

      let result;
      if (deploy_type === 'static') {
        result = await this._deployStatic({ ...payload, isUpdate, cleanupActions });
      } else if (deploy_type === 'docker') {
        result = await this._deployDocker({ ...payload, isUpdate, cleanupActions });
      } else {
        throw new Error(`Unknown deploy_type: ${deploy_type}`);
      }

      this.logger.log({
        action: 'deploy',
        project: project_name,
        deploy_type,
        owner,
        result: 'success',
      });

      return result;
    } catch (error) {
      this.logger.log({
        action: 'deploy',
        project: project_name,
        deploy_type,
        owner,
        result: 'failure',
        error: error.message,
      });
      throw error;
    } finally {
      this.lock.release(project_name);
    }
  }

  async _deployStatic({ project_name, git_repo_url, branch, owner, isUpdate, cleanupActions }) {
    const projectPath = join(this.config.projectsDir, project_name);
    const url = `https://${project_name}.${this.config.domain}`;

    if (!isUpdate) {
      await this.registry.addProject(project_name, {
        deploy_type: 'static',
        owner,
        git_repo_url,
        branch,
        url,
      });
      cleanupActions.push(async () => {
        await this.registry.removeProject(project_name);
      });

      try {
        await this.shell.exec(`git clone -b ${branch} ${git_repo_url} ${projectPath}`);
      } catch (error) {
        await this._cleanup(cleanupActions);
        throw error;
      }
      cleanupActions.push(async () => {
        await this.shell.exec(`rm -rf ${projectPath}`);
      });

      const sha = await this._getHeadSha(projectPath);
      await this.registry.updateProject(project_name, { current_sha: sha });
    } else {
      const existing = await this.registry.getProject(project_name);
      const previousSha = existing.current_sha;

      await this.shell.exec(`cd ${projectPath} && git pull origin ${branch}`);

      const sha = await this._getHeadSha(projectPath);
      await this.registry.updateProject(project_name, {
        current_sha: sha,
        previous_sha: previousSha,
      });
    }

    return {
      success: true,
      url,
      repo_url: git_repo_url,
      deploy_type: 'static',
      timestamp: new Date().toISOString(),
    };
  }

  async _deployDocker({ project_name, git_repo_url, branch, owner, port, env_production, isUpdate, cleanupActions }) {
    const projectPath = join(this.config.dockerProjectsDir, project_name);
    const url = `https://${project_name}.${this.config.domain}`;

    if (isUpdate) {
      const existing = await this.registry.getProject(project_name);
      const previousSha = existing.current_sha;

      await this.shell.exec(`cd ${projectPath} && git pull`);

      if (env_production) {
        const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');
        if (!existsSync(projectPath)) mkdirSync(projectPath, { recursive: true });
        const envContent = Buffer.from(env_production, 'base64').toString('utf-8');
        writeFileSync(join(projectPath, '.env.production'), envContent, 'utf-8');
      }

      await this.shell.exec(`cd ${projectPath} && docker compose down && docker compose up -d --build`);

      const sha = await this._getHeadSha(projectPath);
      await this.registry.updateProject(project_name, {
        current_sha: sha,
        previous_sha: previousSha,
      });
    } else {
      // Assign port
      const assignedPort = await this.registry.assignPort();

      await this.registry.addProject(project_name, {
        deploy_type: 'docker',
        owner,
        git_repo_url,
        branch,
        path: projectPath,
        url,
        port: assignedPort,
      });
      cleanupActions.push(async () => {
        await this.registry.removeProject(project_name);
      });

      try {
        // Clone
        await this.shell.exec(`git clone -b ${branch} ${git_repo_url} ${projectPath}`);

        // Write .env.production
        if (env_production) {
          const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');
          if (!existsSync(projectPath)) mkdirSync(projectPath, { recursive: true });
          const envContent = Buffer.from(env_production, 'base64').toString('utf-8');
          writeFileSync(join(projectPath, '.env.production'), envContent, 'utf-8');
        }

        // Write .env for docker compose
        {
          const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');
          const { randomBytes } = await import('node:crypto');
          if (!existsSync(projectPath)) mkdirSync(projectPath, { recursive: true });
          const dbPassword = randomBytes(24).toString('hex');
          writeFileSync(
            join(projectPath, '.env'),
            `APP_PORT=${assignedPort}\nDB_PASSWORD=${dbPassword}\nPROJECT_NAME=${project_name}\n`,
            'utf-8'
          );
        }

        // Docker compose up
        await this.shell.exec(`cd ${projectPath} && docker compose up -d --build`);

        // Caddy config
        this.caddy.generateConfig(project_name, assignedPort);
        await this.caddy.reload();

        const sha = await this._getHeadSha(projectPath);
        await this.registry.updateProject(project_name, { current_sha: sha });
      } catch (error) {
        await this._cleanup(cleanupActions);
        throw error;
      }
    }

    return {
      success: true,
      url,
      repo_url: `${this.config.giteaUrl}/${owner}/${project_name}`,
      deploy_type: 'docker',
      timestamp: new Date().toISOString(),
    };
  }

  async rollback(projectName) {
    const project = await this.registry.getProject(projectName);
    if (!project) throw new Error('Progetto non trovato');
    if (!project.previous_sha) throw new Error('Nessun deploy precedente disponibile per il rollback');

    this.lock.acquire(projectName);

    try {
      const projectPath = this._getProjectPath(project, projectName);

      await this.shell.exec(`cd ${projectPath} && git checkout ${project.previous_sha}`);

      if (project.deploy_type === 'docker') {
        await this.shell.exec(`cd ${projectPath} && docker compose down && docker compose up -d --build`);
      }

      await this.registry.updateProject(projectName, {
        current_sha: project.previous_sha,
        previous_sha: project.current_sha,
      });

      this.logger.log({
        action: 'rollback',
        project: projectName,
        owner: project.owner,
        result: 'success',
      });

      return { success: true, url: project.url, rolled_back_to: project.previous_sha };
    } catch (err) {
      this.logger.log({
        action: 'rollback',
        project: projectName,
        owner: project.owner,
        result: 'failure',
        error: err.message,
      });
      throw err;
    } finally {
      this.lock.release(projectName);
    }
  }

  async deleteProject(projectName) {
    const project = await this.registry.getProject(projectName);
    if (!project) throw new Error('Progetto non trovato');

    const projectPath = this._getProjectPath(project, projectName);

    if (project.deploy_type === 'docker') {
      await this.shell.exec(`cd ${projectPath} && docker compose down -v`).catch(() => {});
    }

    await this.shell.exec(`rm -rf ${projectPath}`).catch(() => {});

    if (project.deploy_type === 'docker') {
      this.caddy.removeConfig(projectName);
      await this.caddy.reload().catch(() => {});
    }

    await this.registry.removeProject(projectName);

    this.logger.log({
      action: 'delete',
      project: projectName,
      owner: project.owner,
      result: 'success',
    });

    return { success: true, deleted: projectName };
  }

  async getProjectLogs(projectName, lines = 50) {
    const project = await this.registry.getProject(projectName);
    if (!project) throw new Error('Progetto non trovato');
    if (project.deploy_type !== 'docker') throw new Error('Logs disponibili solo per progetti Docker');

    const projectPath = this._getProjectPath(project, projectName);
    const logs = await this.shell.exec(
      `cd ${projectPath} && docker compose logs --tail=${lines} 2>&1`
    );
    return { logs };
  }

  async getProjectStatus(projectName) {
    const project = await this.registry.getProject(projectName);
    if (!project) throw new Error('Progetto non trovato');

    const projectPath = this._getProjectPath(project, projectName);

    if (project.deploy_type === 'static') {
      const { existsSync } = await import('node:fs');
      const hasIndex = existsSync(join(projectPath, 'index.html'));
      return { status: hasIndex ? 'serving' : 'missing_files', deploy_type: 'static' };
    }

    const psOutput = await this.shell.exec(
      `cd ${projectPath} && docker compose ps --format json 2>&1`
    ).catch(() => '');
    return { status: 'checked', deploy_type: 'docker', containers: psOutput };
  }

  _getProjectPath(project, projectName) {
    if (project.path) return project.path;
    if (project.deploy_type === 'docker') {
      return join(this.config.dockerProjectsDir, projectName);
    }
    return join(this.config.projectsDir, projectName);
  }

  async _getHeadSha(projectPath) {
    const output = await this.shell.exec(`git -C ${projectPath} rev-parse HEAD`);
    return output.trim();
  }

  async _cleanup(actions) {
    for (let i = actions.length - 1; i >= 0; i--) {
      try {
        await actions[i]();
      } catch {
        // best-effort cleanup, ignore errors
      }
    }
  }
}
