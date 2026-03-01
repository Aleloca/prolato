export function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('project_name is required');
  }
  if (name.length > 63) {
    throw new Error('project_name: maximum 63 characters');
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error('project_name: only lowercase letters, numbers and hyphens allowed, cannot start with a hyphen');
  }
  return true;
}

export function validateBranch(branch) {
  if (!branch || typeof branch !== 'string') {
    throw new Error('branch is required');
  }
  if (!/^[a-zA-Z0-9._\/-]+$/.test(branch)) {
    throw new Error('branch: invalid characters');
  }
  if (branch.length > 255) {
    throw new Error('branch: maximum 255 characters');
  }
}

export function validateGitRepoUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('git_repo_url is required');
  }
  const sshPattern = /^git@[a-zA-Z0-9._-]+:[a-zA-Z0-9._\/-]+\.git$/;
  const httpsPattern = /^https?:\/\/[a-zA-Z0-9._-]+(:[0-9]+)?\/[a-zA-Z0-9._\/-]+\.git$/;
  if (!sshPattern.test(url) && !httpsPattern.test(url)) {
    throw new Error('git_repo_url: must be a valid SSH or HTTPS git URL');
  }
}

export function validatePort(port) {
  const p = Number(port);
  if (!Number.isInteger(p) || p < 1024 || p > 65535) {
    throw new Error('port: must be an integer between 1024 and 65535');
  }
}

export function validateLines(lines) {
  if (lines === undefined || lines === null) return 50;
  const parsed = parseInt(lines, 10);
  if (isNaN(parsed) || parsed < 1) return 50;
  return Math.min(parsed, 10000);
}

export function validateDeployPayload(payload) {
  const { project_name, git_repo_url, branch, deploy_type, owner, port } = payload || {};
  validateProjectName(project_name);
  validateGitRepoUrl(git_repo_url);
  validateBranch(branch);
  if (!owner || typeof owner !== 'string') throw new Error('owner is required');
  if (!['static', 'docker'].includes(deploy_type)) {
    throw new Error('deploy_type must be "static" or "docker"');
  }
  if (deploy_type === 'docker') {
    if (port === undefined || port === null) {
      throw new Error('port is required for docker deploy');
    }
    validatePort(port);
  }
}
