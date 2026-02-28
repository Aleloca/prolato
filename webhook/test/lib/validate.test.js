import { describe, it, expect } from 'vitest';
import { validateProjectName, validateDeployPayload } from '../../src/lib/validate.js';

describe('validateProjectName', () => {
  it('accepts valid names', () => {
    expect(validateProjectName('my-app')).toBe(true);
    expect(validateProjectName('landing-page-2')).toBe(true);
    expect(validateProjectName('a')).toBe(true);
  });

  it('rejects names with uppercase', () => {
    expect(() => validateProjectName('MyApp')).toThrow('solo lettere minuscole');
  });

  it('rejects names with underscores', () => {
    expect(() => validateProjectName('my_app')).toThrow('solo lettere minuscole');
  });

  it('rejects names with spaces', () => {
    expect(() => validateProjectName('my app')).toThrow('solo lettere minuscole');
  });

  it('rejects empty names', () => {
    expect(() => validateProjectName('')).toThrow();
  });

  it('rejects names longer than 63 characters', () => {
    expect(() => validateProjectName('a'.repeat(64))).toThrow('massimo 63 caratteri');
  });

  it('rejects names starting with hyphen', () => {
    expect(() => validateProjectName('-my-app')).toThrow();
  });
});

describe('validateDeployPayload', () => {
  const validPayload = {
    project_name: 'my-app',
    git_repo_url: 'git@git.example.com:user/repo.git',
    branch: 'main',
    deploy_type: 'static',
    owner: 'alice',
  };

  it('accepts valid static payload', () => {
    expect(() => validateDeployPayload(validPayload)).not.toThrow();
  });

  it('accepts valid docker payload', () => {
    expect(() => validateDeployPayload({
      ...validPayload,
      deploy_type: 'docker',
      port: 3000,
    })).not.toThrow();
  });

  it('rejects docker payload without port', () => {
    expect(() => validateDeployPayload({
      ...validPayload,
      deploy_type: 'docker',
    })).toThrow('port');
  });

  it('rejects invalid deploy_type', () => {
    expect(() => validateDeployPayload({
      ...validPayload,
      deploy_type: 'serverless',
    })).toThrow('deploy_type');
  });

  it('rejects missing project_name', () => {
    const { project_name, ...rest } = validPayload;
    expect(() => validateDeployPayload(rest)).toThrow();
  });

  it('rejects missing owner', () => {
    const { owner, ...rest } = validPayload;
    expect(() => validateDeployPayload(rest)).toThrow();
  });
});
