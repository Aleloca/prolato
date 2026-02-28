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

export function validateDeployPayload(payload) {
  const { project_name, git_repo_url, branch, deploy_type, owner, port } = payload || {};
  validateProjectName(project_name);
  if (!git_repo_url) throw new Error('git_repo_url is required');
  if (!branch) throw new Error('branch is required');
  if (!owner) throw new Error('owner is required');
  if (!['static', 'docker'].includes(deploy_type)) {
    throw new Error('deploy_type must be "static" or "docker"');
  }
  if (deploy_type === 'docker' && (port === undefined || port === null)) {
    throw new Error('port is required for docker deploy');
  }
}
