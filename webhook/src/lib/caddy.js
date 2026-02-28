import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export class CaddyManager {
  constructor(configDir, domain, shell) {
    this.configDir = configDir;
    this.domain = domain;
    this.shell = shell;
  }

  generateConfig(projectName, port) {
    const config = `@${projectName} host ${projectName}.${this.domain}
handle @${projectName} {
    reverse_proxy localhost:${port}
}
`;
    writeFileSync(join(this.configDir, projectName), config, 'utf-8');
  }

  removeConfig(projectName) {
    const configPath = join(this.configDir, projectName);
    if (existsSync(configPath)) {
      unlinkSync(configPath);
    }
  }

  async reload() {
    await this.shell.exec('sudo caddy reload --config /etc/caddy/Caddyfile');
  }
}
