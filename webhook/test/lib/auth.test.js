import { describe, it, expect, vi } from 'vitest';
import { createAuthMiddleware } from '../../src/lib/auth.js';

function mockReqResNext(headers = {}) {
  const req = { headers };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('Auth middleware', () => {
  const auth = createAuthMiddleware('secret-token-12345');

  it('returns 401 when Authorization header is missing', () => {
    const { req, res, next } = mockReqResNext();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is wrong', () => {
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer wrong-token' });
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when token is correct', () => {
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer secret-token-12345' });
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('handles token without Bearer prefix', () => {
    const { req, res, next } = mockReqResNext({ authorization: 'secret-token-12345' });
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
