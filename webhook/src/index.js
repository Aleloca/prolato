import { createApp } from './server.js';
import { Registry } from './lib/registry.js';
import { DeployLock } from './lib/lock.js';
import { DeployLogger } from './lib/logger.js';
import { CaddyManager } from './lib/caddy.js';
import * as shell from './lib/shell.js';

const config = {
  deployToken: process.env.DEPLOY_TOKEN,
  domain: process.env.DOMAIN,
  giteaUrl: process.env.GITEA_URL,
  projectsDir: process.env.PROJECTS_DIR || '/var/www/projects',
  dockerProjectsDir: process.env.DOCKER_PROJECTS_DIR || '/opt/docker-projects',
};

if (!config.deployToken) {
  console.error('DEPLOY_TOKEN environment variable is required');
  process.exit(1);
}
if (!config.domain) {
  console.error('DOMAIN environment variable is required');
  process.exit(1);
}

const registry = new Registry(process.env.REGISTRY_PATH || '/opt/webhook/registry.json');
const lock = new DeployLock();
const logger = new DeployLogger(process.env.DEPLOY_LOG_PATH || '/opt/webhook/deploy-log.jsonl');
const caddy = new CaddyManager(
  process.env.CADDY_PROJECTS_DIR || '/etc/caddy/projects.d',
  config.domain,
  shell
);

const app = createApp({ config, registry, lock, logger, caddy, shell });
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Prolato webhook listening on port ${PORT}`);
  console.log(`Domain: ${config.domain}`);
});
