import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(execCb);

export async function exec(command, options = {}) {
  const { stdout } = await execAsync(command, {
    timeout: options.timeout || 120000,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
  return stdout;
}
