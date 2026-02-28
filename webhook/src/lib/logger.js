import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class DeployLogger {
  constructor(filePath) {
    this.filePath = filePath;
  }

  log(entry) {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    appendFileSync(this.filePath, JSON.stringify(logEntry) + '\n', 'utf-8');
  }
}
