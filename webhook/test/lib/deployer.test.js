import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Deployer } from '../../src/lib/deployer.js';
import { Registry } from '../../src/lib/registry.js';
import { DeployLock } from '../../src/lib/lock.js';
import { DeployLogger } from '../../src/lib/logger.js';
import { CaddyManager } from '../../src/lib/caddy.js';
import { mkdtempSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Deployer', () => {
  let tempDir;
  let deployer;
  let registry;
  let lock;
  let logger;
  let caddy;
  let mockShell;
  let config;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prolato-deployer-test-'));
    const projectsDir = join(tempDir, 'projects');
    const dockerProjectsDir = join(tempDir, 'docker-projects');
    const caddyDir = join(tempDir, 'caddy');
    mkdirSync(projectsDir, { recursive: true });
    mkdirSync(dockerProjectsDir, { recursive: true });
    mkdirSync(caddyDir, { recursive: true });

    registry = new Registry(join(tempDir, 'registry.json'));
    lock = new DeployLock();
    logger = new DeployLogger(join(tempDir, 'deploy-log.jsonl'));
    mockShell = { exec: vi.fn().mockResolvedValue('abc123\n') };
    caddy = new CaddyManager(caddyDir, 'example.dev', mockShell);

    config = {
      domain: 'example.dev',
      projectsDir,
      dockerProjectsDir,
      giteaUrl: 'https://git.example.dev',
    };

    deployer = new Deployer({ registry, lock, logger, caddy, shell: mockShell, config });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('static deploy', () => {
    const payload = {
      project_name: 'my-landing',
      git_repo_url: 'git@git.example.dev:alice/my-landing.git',
      branch: 'deploy',
      deploy_type: 'static',
      owner: 'alice',
    };

    it('clones repo for new static project', async () => {
      const result = await deployer.deploy(payload);
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://my-landing.example.dev');
      const calls = mockShell.exec.mock.calls.map(c => c[0]);
      expect(calls.some(c => c.includes('git clone'))).toBe(true);
    });

    it('saves project to registry', async () => {
      await deployer.deploy(payload);
      const project = await registry.getProject('my-landing');
      expect(project).not.toBeNull();
      expect(project.deploy_type).toBe('static');
      expect(project.owner).toBe('alice');
    });

    it('pulls for existing static project (update)', async () => {
      await deployer.deploy(payload);
      mockShell.exec.mockClear();
      mockShell.exec.mockResolvedValue('def456\n');

      const result = await deployer.deploy(payload);
      expect(result.success).toBe(true);
      const calls = mockShell.exec.mock.calls.map(c => c[0]);
      expect(calls.some(c => c.includes('git pull'))).toBe(true);
    });

    it('rejects concurrent deploy for same project', async () => {
      lock.acquire('my-landing');
      await expect(deployer.deploy(payload)).rejects.toThrow('Deploy already in progress');
    });

    it('logs the deploy operation', async () => {
      await deployer.deploy(payload);
      const logContent = readFileSync(join(tempDir, 'deploy-log.jsonl'), 'utf-8').trim();
      const entry = JSON.parse(logContent);
      expect(entry.action).toBe('deploy');
      expect(entry.project).toBe('my-landing');
      expect(entry.result).toBe('success');
    });

    it('releases lock even on failure', async () => {
      mockShell.exec.mockRejectedValueOnce(new Error('git clone failed'));
      await expect(deployer.deploy(payload)).rejects.toThrow();
      expect(lock.isLocked('my-landing')).toBe(false);
    });

    it('cleans up registry on failure', async () => {
      mockShell.exec.mockRejectedValueOnce(new Error('git clone failed'));
      await expect(deployer.deploy(payload)).rejects.toThrow();
      const project = await registry.getProject('my-landing');
      expect(project).toBeNull();
    });

    it('rejects deploy when different owner', async () => {
      await deployer.deploy(payload);
      await expect(deployer.deploy({ ...payload, owner: 'bob' })).rejects.toThrow('appartiene a');
    });

    it('saves current_sha from git rev-parse HEAD', async () => {
      await deployer.deploy(payload);
      const project = await registry.getProject('my-landing');
      expect(project.current_sha).toBe('abc123');
    });

    it('saves previous_sha on update', async () => {
      await deployer.deploy(payload);
      mockShell.exec.mockClear();
      mockShell.exec.mockResolvedValue('def456\n');
      await deployer.deploy(payload);
      const project = await registry.getProject('my-landing');
      expect(project.current_sha).toBe('def456');
      expect(project.previous_sha).toBe('abc123');
    });
  });
});
