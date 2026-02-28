import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeployLogger } from '../../src/lib/logger.js';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('DeployLogger', () => {
  let tempDir;
  let logPath;
  let logger;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prolato-log-test-'));
    logPath = join(tempDir, 'deploy-log.jsonl');
    logger = new DeployLogger(logPath);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates log file on first write', () => {
    logger.log({ action: 'deploy', project: 'my-app', owner: 'alice', result: 'success' });
    const content = readFileSync(logPath, 'utf-8');
    expect(content).toBeTruthy();
  });

  it('writes valid JSON per line', () => {
    logger.log({ action: 'deploy', project: 'my-app', owner: 'alice', result: 'success' });
    const content = readFileSync(logPath, 'utf-8').trim();
    const entry = JSON.parse(content);
    expect(entry.action).toBe('deploy');
    expect(entry.project).toBe('my-app');
    expect(entry.timestamp).toBeDefined();
  });

  it('appends multiple entries on separate lines', () => {
    logger.log({ action: 'deploy', project: 'app-1', owner: 'alice', result: 'success' });
    logger.log({ action: 'delete', project: 'app-2', owner: 'bob', result: 'success' });
    const lines = readFileSync(logPath, 'utf-8').trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]).project).toBe('app-1');
    expect(JSON.parse(lines[1]).project).toBe('app-2');
  });

  it('includes duration_ms when provided', () => {
    logger.log({ action: 'deploy', project: 'my-app', owner: 'alice', result: 'success', duration_ms: 1500 });
    const entry = JSON.parse(readFileSync(logPath, 'utf-8').trim());
    expect(entry.duration_ms).toBe(1500);
  });

  it('includes error when provided', () => {
    logger.log({ action: 'deploy', project: 'my-app', owner: 'alice', result: 'failure', error: 'disk full' });
    const entry = JSON.parse(readFileSync(logPath, 'utf-8').trim());
    expect(entry.error).toBe('disk full');
  });
});
