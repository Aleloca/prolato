export function createAuthMiddleware(token) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const provided = header.slice(7);
    if (provided !== token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
}
