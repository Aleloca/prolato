export function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('project_name e\' obbligatorio');
  }
  if (name.length > 63) {
    throw new Error('project_name: massimo 63 caratteri');
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error('project_name: solo lettere minuscole, numeri e trattini, non puo\' iniziare con trattino');
  }
  return true;
}

export function validateDeployPayload(payload) {
  const { project_name, git_repo_url, branch, deploy_type, owner, port } = payload || {};
  validateProjectName(project_name);
  if (!git_repo_url) throw new Error('git_repo_url e\' obbligatorio');
  if (!branch) throw new Error('branch e\' obbligatorio');
  if (!owner) throw new Error('owner e\' obbligatorio');
  if (!['static', 'docker'].includes(deploy_type)) {
    throw new Error('deploy_type deve essere "static" o "docker"');
  }
  if (deploy_type === 'docker' && (port === undefined || port === null)) {
    throw new Error('port e\' obbligatorio per deploy docker');
  }
}
