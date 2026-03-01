import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Registry } from '../../src/lib/registry.js';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Registry', () => {
  let tempDir;
  let registryPath;
  let registry;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prolato-test-'));
    registryPath = join(tempDir, 'registry.json');
    registry = new Registry(registryPath);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('read', () => {
    it('returns empty registry when file does not exist', async () => {
      const data = await registry.read();
      expect(data).toEqual({ projects: {}, next_port: 3001, users: {} });
    });

    it('returns parsed data when file exists', async () => {
      const testData = { projects: { test: { owner: 'bob' } }, next_port: 3002, users: {} };
      await registry.write(testData);
      const data = await registry.read();
      expect(data).toEqual(testData);
    });
  });

  describe('addProject', () => {
    it('adds a project to the registry', async () => {
      await registry.addProject('my-app', {
        deploy_type: 'static',
        owner: 'alice',
        git_repo_url: 'git@git.example.com:alice/my-app.git',
        branch: 'deploy',
        path: '/var/www/projects/my-app',
        url: 'https://my-app.example.com',
      });
      const project = await registry.getProject('my-app');
      expect(project.owner).toBe('alice');
      expect(project.deploy_type).toBe('static');
      expect(project.created_at).toBeDefined();
      expect(project.updated_at).toBeDefined();
    });
  });

  describe('getProject', () => {
    it('returns null for non-existent project', async () => {
      const project = await registry.getProject('nope');
      expect(project).toBeNull();
    });
  });

  describe('updateProject', () => {
    it('merges data into existing project', async () => {
      await registry.addProject('my-app', {
        deploy_type: 'static',
        owner: 'alice',
        current_sha: 'aaa',
      });
      await registry.updateProject('my-app', {
        current_sha: 'bbb',
        previous_sha: 'aaa',
      });
      const project = await registry.getProject('my-app');
      expect(project.current_sha).toBe('bbb');
      expect(project.previous_sha).toBe('aaa');
      expect(project.owner).toBe('alice');
    });
  });

  describe('removeProject', () => {
    it('removes a project from the registry', async () => {
      await registry.addProject('my-app', { owner: 'alice' });
      await registry.removeProject('my-app');
      const project = await registry.getProject('my-app');
      expect(project).toBeNull();
    });
  });

  describe('assignPort', () => {
    it('returns 3001 for first assignment', async () => {
      const port = await registry.assignPort();
      expect(port).toBe(3001);
    });

    it('increments next_port after assignment', async () => {
      await registry.assignPort();
      const port = await registry.assignPort();
      expect(port).toBe(3002);
    });
  });

  describe('listProjects', () => {
    it('returns all projects', async () => {
      await registry.addProject('app-1', { owner: 'alice' });
      await registry.addProject('app-2', { owner: 'bob' });
      const projects = await registry.listProjects();
      expect(Object.keys(projects)).toHaveLength(2);
    });

    it('filters by owner', async () => {
      await registry.addProject('app-1', { owner: 'alice' });
      await registry.addProject('app-2', { owner: 'bob' });
      const projects = await registry.listProjects('alice');
      expect(Object.keys(projects)).toHaveLength(1);
      expect(projects['app-1'].owner).toBe('alice');
    });
  });

  describe('atomic writes', () => {
    it('writes atomically (uses temp file + rename)', async () => {
      await registry.addProject('atomic-test', { owner: 'alice', deploy_type: 'static' });
      // Verify no .tmp files left behind
      const files = readdirSync(tempDir);
      expect(files.some(f => f.endsWith('.tmp'))).toBe(false);
      // Verify data persisted correctly
      const project = await registry.getProject('atomic-test');
      expect(project.owner).toBe('alice');
    });
  });

  describe('addUser', () => {
    it('adds a user to the registry', async () => {
      await registry.addUser('alice', { email: 'alice@example.com' });
      const data = await registry.read();
      expect(data.users.alice.email).toBe('alice@example.com');
      expect(data.users.alice.created_at).toBeDefined();
    });
  });
});
