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
    const mockShell = {
      exec: async () => '',
      execSafe: async () => 'abc123\n',
    };
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

  describe('Authorization', () => {
    it('DELETE /projects/:name rejects when project belongs to different owner', async () => {
      const registry = app.locals.registry;
      await registry.addProject('alice-app', { owner: 'alice', deploy_type: 'static' });

      const res = await request(app)
        .delete('/projects/alice-app?owner=bob')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(403);
    });

    it('POST /projects/:name/rollback rejects when project belongs to different owner', async () => {
      const registry = app.locals.registry;
      await registry.addProject('alice-app', {
        owner: 'alice',
        deploy_type: 'static',
        previous_sha: 'abc123',
        current_sha: 'def456',
      });

      const res = await request(app)
        .post('/projects/alice-app/rollback?owner=bob')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(403);
    });

    it('DELETE /projects/:name requires owner query parameter', async () => {
      const registry = app.locals.registry;
      await registry.addProject('alice-app', { owner: 'alice', deploy_type: 'static' });

      const res = await request(app)
        .delete('/projects/alice-app')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(400);
    });

    it('POST /projects/:name/rollback requires owner', async () => {
      const registry = app.locals.registry;
      await registry.addProject('alice-app', {
        owner: 'alice',
        deploy_type: 'static',
        previous_sha: 'abc123',
        current_sha: 'def456',
      });

      const res = await request(app)
        .post('/projects/alice-app/rollback')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /deploy', () => {
    it('returns 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/deploy')
        .set('Authorization', 'Bearer test-token-12345')
        .send({ project_name: 'INVALID' });
      expect(res.status).toBe(400);
    });

    it('deploys a static project', async () => {
      const res = await request(app)
        .post('/deploy')
        .set('Authorization', 'Bearer test-token-12345')
        .send({
          project_name: 'test-app',
          git_repo_url: 'git@git.example.dev:alice/test-app.git',
          branch: 'deploy',
          deploy_type: 'static',
          owner: 'alice',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.url).toContain('test-app');
    });
  });

  describe('POST /projects/:name/rollback', () => {
    it('returns 404 for non-existent project', async () => {
      const res = await request(app)
        .post('/projects/nope/rollback?owner=alice')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /projects/:name', () => {
    it('returns 404 for non-existent project', async () => {
      const res = await request(app)
        .delete('/projects/nope?owner=alice')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /projects/:name/logs', () => {
    it('returns 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/projects/nope/logs')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /projects/:name/status', () => {
    it('returns 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/projects/nope/status')
        .set('Authorization', 'Bearer test-token-12345');
      expect(res.status).toBe(404);
    });
  });

  describe('Rate limiting', () => {
    it('returns 429 after too many requests', async () => {
      const promises = Array.from({ length: 110 }, () =>
        request(app).get('/health')
      );
      const responses = await Promise.all(promises);
      const tooMany = responses.filter(r => r.status === 429);
      expect(tooMany.length).toBeGreaterThan(0);
    });
  });

  describe('Security headers', () => {
    it('sets security headers on responses', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });
});
