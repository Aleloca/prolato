export class DeployLock {
  constructor() {
    this.locks = new Map();
  }

  acquire(projectName) {
    if (this.locks.get(projectName)) {
      throw new Error(`Deploy already in progress for ${projectName}`);
    }
    this.locks.set(projectName, true);
    return true;
  }

  release(projectName) {
    this.locks.delete(projectName);
  }

  isLocked(projectName) {
    return this.locks.get(projectName) === true;
  }
}
