import { describe, it, expect } from 'vitest';
import { DeployLock } from '../../src/lib/lock.js';

describe('DeployLock', () => {
  it('acquires lock for unlocked project', () => {
    const lock = new DeployLock();
    expect(lock.acquire('my-app')).toBe(true);
  });

  it('throws when project is already locked', () => {
    const lock = new DeployLock();
    lock.acquire('my-app');
    expect(() => lock.acquire('my-app')).toThrow('Deploy already in progress for my-app');
  });

  it('releases lock so project can be locked again', () => {
    const lock = new DeployLock();
    lock.acquire('my-app');
    lock.release('my-app');
    expect(lock.acquire('my-app')).toBe(true);
  });

  it('locks different projects independently', () => {
    const lock = new DeployLock();
    lock.acquire('app-1');
    expect(lock.acquire('app-2')).toBe(true);
  });

  it('isLocked returns correct state', () => {
    const lock = new DeployLock();
    expect(lock.isLocked('my-app')).toBe(false);
    lock.acquire('my-app');
    expect(lock.isLocked('my-app')).toBe(true);
    lock.release('my-app');
    expect(lock.isLocked('my-app')).toBe(false);
  });

  it('release is safe for unlocked project', () => {
    const lock = new DeployLock();
    expect(() => lock.release('my-app')).not.toThrow();
  });
});
