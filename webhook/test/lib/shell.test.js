import { describe, it, expect } from 'vitest';
import { execSafe } from '../../src/lib/shell.js';

describe('execSafe', () => {
  it('executes a command with arguments array', async () => {
    const result = await execSafe('echo', ['hello']);
    expect(result.trim()).toBe('hello');
  });

  it('does not interpret shell metacharacters', async () => {
    const result = await execSafe('echo', ['hello; echo injected']);
    expect(result.trim()).toBe('hello; echo injected');
  });

  it('rejects when command fails', async () => {
    await expect(execSafe('false', [])).rejects.toThrow();
  });

  it('respects timeout option', async () => {
    await expect(
      execSafe('sleep', ['10'], { timeout: 100 })
    ).rejects.toThrow();
  });
});
