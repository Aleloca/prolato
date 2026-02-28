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

  async _deployDocker() {
    throw new Error('Not implemented');
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
