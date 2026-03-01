import { describe, it, expect } from 'vitest';
import { validateProjectName, validateDeployPayload, validateLines } from '../../src/lib/validate.js';

describe('validateProjectName', () => {
  it('accepts valid names', () => {
    expect(validateProjectName('my-app')).toBe(true);
    expect(validateProjectName('landing-page-2')).toBe(true);
    expect(validateProjectName('a')).toBe(true);
  });

  it('rejects names with uppercase', () => {
    expect(() => validateProjectName('MyApp')).toThrow('only lowercase');
  });

  it('rejects names with underscores', () => {
    expect(() => validateProjectName('my_app')).toThrow('only lowercase');
  });

  it('rejects names with spaces', () => {
    expect(() => validateProjectName('my app')).toThrow('only lowercase');
  });

  it('rejects empty names', () => {
    expect(() => validateProjectName('')).toThrow();
  });

  it('rejects names longer than 63 characters', () => {
    expect(() => validateProjectName('a'.repeat(64))).toThrow('maximum 63 characters');
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

  describe('branch validation', () => {
    it('rejects branch with shell metacharacters', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        branch: 'main; rm -rf /',
      })).toThrow('branch');
    });

    it('rejects branch with $() substitution', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        branch: 'main$(whoami)',
      })).toThrow('branch');
    });

    it('accepts valid branch names', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        branch: 'main',
      })).not.toThrow();
      expect(() => validateDeployPayload({
        ...validPayload,
        branch: 'feature/add-login',
      })).not.toThrow();
      expect(() => validateDeployPayload({
        ...validPayload,
        branch: 'release-v1.2.3',
      })).not.toThrow();
    });
  });

  describe('git_repo_url validation', () => {
    it('rejects URLs with shell metacharacters', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        git_repo_url: 'git@host:repo.git; rm -rf /',
      })).toThrow('git_repo_url');
    });

    it('accepts valid SSH git URLs', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        git_repo_url: 'git@git.example.dev:alice/my-app.git',
      })).not.toThrow();
    });

    it('accepts valid HTTPS git URLs', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        git_repo_url: 'https://git.example.dev/alice/my-app.git',
      })).not.toThrow();
    });
  });

  describe('port validation', () => {
    it('rejects port < 1024', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        deploy_type: 'docker',
        port: 80,
      })).toThrow('port');
    });

    it('rejects port > 65535', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        deploy_type: 'docker',
        port: 70000,
      })).toThrow('port');
    });

    it('rejects non-integer port', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        deploy_type: 'docker',
        port: 'abc',
      })).toThrow('port');
    });

    it('accepts valid port', () => {
      expect(() => validateDeployPayload({
        ...validPayload,
        deploy_type: 'docker',
        port: 3000,
      })).not.toThrow();
    });
  });
});

describe('validateLines', () => {
  it('returns default 50 for undefined', () => {
    expect(validateLines(undefined)).toBe(50);
  });

  it('returns parsed integer for valid string', () => {
    expect(validateLines('100')).toBe(100);
  });

  it('caps at 10000', () => {
    expect(validateLines('999999')).toBe(10000);
  });

  it('returns default for non-numeric', () => {
    expect(validateLines('abc')).toBe(50);
  });

  it('returns default for negative', () => {
    expect(validateLines('-5')).toBe(50);
  });
});
