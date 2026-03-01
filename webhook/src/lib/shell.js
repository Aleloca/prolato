import { exec as execCb, execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(execCb);
const execFileAsync = promisify(execFileCb);

// SAFE: uses execFile (no shell), arguments passed as array
export async function execSafe(command, args = [], options = {}) {
  const { stdout } = await execFileAsync(command, args, {
    timeout: options.timeout || 120000,
    maxBuffer: 10 * 1024 * 1024,
    cwd: options.cwd,
    env: options.env,
  });
  return stdout;
}

// LEGACY: kept for commands that genuinely need a shell (e.g., pipes, sudo)
// Only use for hardcoded commands, NEVER with user input
export async function exec(command, options = {}) {
  const { stdout } = await execAsync(command, {
    timeout: options.timeout || 120000,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
  return stdout;
}
