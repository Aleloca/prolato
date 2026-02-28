import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CaddyManager } from '../../src/lib/caddy.js';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('CaddyManager', () => {
  let tempDir;
  let caddy;
  const mockShell = { exec: vi.fn() };

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prolato-caddy-test-'));
    caddy = new CaddyManager(tempDir, 'example.dev', mockShell);
    mockShell.exec.mockReset();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('generateConfig', () => {
    it('creates a Caddy config file for a project', () => {
      caddy.generateConfig('my-app', 3001);
      const configPath = join(tempDir, 'my-app');
      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      expect(content).toContain('my-app.example.dev');
      expect(content).toContain('localhost:3001');
    });

    it('generates valid Caddy syntax with @matcher and handle', () => {
      caddy.generateConfig('dashboard', 3005);
      const content = readFileSync(join(tempDir, 'dashboard'), 'utf-8');
      expect(content).toContain('@dashboard host dashboard.example.dev');
      expect(content).toContain('handle @dashboard');
      expect(content).toContain('reverse_proxy localhost:3005');
    });
  });

  describe('removeConfig', () => {
    it('removes a Caddy config file', () => {
      caddy.generateConfig('my-app', 3001);
      caddy.removeConfig('my-app');
      expect(existsSync(join(tempDir, 'my-app'))).toBe(false);
    });

    it('does not throw if config does not exist', () => {
      expect(() => caddy.removeConfig('nope')).not.toThrow();
    });
  });

  describe('reload', () => {
    it('calls caddy reload via shell', async () => {
      mockShell.exec.mockResolvedValue('');
      await caddy.reload();
      expect(mockShell.exec).toHaveBeenCalledWith(
        'sudo caddy reload --config /etc/caddy/Caddyfile'
      );
    });
  });
});
