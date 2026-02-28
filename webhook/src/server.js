import express from 'express';
import { createAuthMiddleware } from './lib/auth.js';

export function createApp({ config, registry, lock, logger, caddy, shell }) {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const auth = createAuthMiddleware(config.deployToken);

  // Health check — no auth
  app.get('/health', async (req, res) => {
    try {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  // All other routes require auth
  app.use(auth);

  // GET /projects
  app.get('/projects', async (req, res) => {
    try {
      const owner = req.query.owner || null;
      const projects = await registry.listProjects(owner);
      res.json({ projects });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Store dependencies for test access
  app.locals = { config, registry, lock, logger, caddy, shell };

  return app;
}
