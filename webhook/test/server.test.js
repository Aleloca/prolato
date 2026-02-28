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

describe('Server', () => {
  let tempDir;
  let app;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prolato-server-test-'));
    const caddyDir = join(tempDir, 'caddy');
    mkdirSync(caddyDir, { recursive: true });

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
    const mockShell = { exec: async () => '' };
    const caddy = new CaddyManager(caddyDir, config.domain, mockShell);
    app = createApp({ config, registry, lock, logger, caddy, shell: mockShell });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('GET /health', () => {
    it('returns 200 without auth', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Auth', () => {
    it('returns 401 for protected routes without token', async () => {
      const res = await request(app).get('/projects');
      expect(res.status).toBe(401);
    });

    it('returns 200 for protected routes with valid token', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /projects', () => {
    it('returns empty list initially', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(200);
      expect(res.body.projects).toEqual({});
    });

    it('returns projects after adding them', async () => {
      const registry = app.locals.registry;
      await registry.addProject('app-1', { owner: 'alice', deploy_type: 'static' });
      await registry.addProject('app-2', { owner: 'bob', deploy_type: 'docker' });

      const res = await request(app)
        .get('/projects')
        .set('Authorization', 'Bearer test-token-12345');
      expect(Object.keys(res.body.projects)).toHaveLength(2);
    });

    it('filters by owner', async () => {
      const registry = app.locals.registry;
      await registry.addProject('app-1', { owner: 'alice', deploy_type: 'static' });
      await registry.addProject('app-2', { owner: 'bob', deploy_type: 'docker' });

      const res = await request(app)
        .get('/projects?owner=alice')
        .set('Authorization', 'Bearer test-token-12345');
      expect(Object.keys(res.body.projects)).toHaveLength(1);
      expect(res.body.projects['app-1']).toBeDefined();
    });
  });

  describe('GET /projects/:name', () => {
    it('returns 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/projects/nope')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(404);
    });

    it('returns project details', async () => {
      const registry = app.locals.registry;
      await registry.addProject('my-app', { owner: 'alice', deploy_type: 'static', url: 'https://my-app.example.dev' });

      const res = await request(app)
        .get('/projects/my-app')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(200);
      expect(res.body.project.owner).toBe('alice');
      expect(res.body.project.url).toBe('https://my-app.example.dev');
    });
  });
});
