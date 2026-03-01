import express from 'express';
import rateLimit from 'express-rate-limit';
import { createAuthMiddleware } from './lib/auth.js';
import { validateDeployPayload, validateLines } from './lib/validate.js';
import { Deployer } from './lib/deployer.js';

export function createApp({ config, registry, lock, logger, caddy, shell }) {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });
  app.use(limiter);

  const auth = createAuthMiddleware(config.deployToken);
  const deployer = new Deployer({ registry, lock, logger, caddy, shell, config });

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

  // GET /projects/:name/logs — MUST be before GET /projects/:name
  app.get('/projects/:name/logs', async (req, res) => {
    try {
      const lines = validateLines(req.query.lines);
      const result = await deployer.getProjectLogs(req.params.name, lines);
      res.json(result);
    } catch (err) {
      if (err.message === 'Project not found') {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === 'Logs only available for Docker projects') {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // GET /projects/:name/status — MUST be before GET /projects/:name
  app.get('/projects/:name/status', async (req, res) => {
    try {
      const result = await deployer.getProjectStatus(req.params.name);
      res.json(result);
    } catch (err) {
      if (err.message === 'Project not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // POST /projects/:name/rollback — MUST be before GET /projects/:name
  app.post('/projects/:name/rollback', async (req, res) => {
    try {
      const owner = req.query.owner || (req.body && req.body.owner);
      if (!owner) {
        return res.status(400).json({ error: 'owner is required' });
      }
      const project = await registry.getProject(req.params.name);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (project.owner !== owner) {
        return res.status(403).json({ error: 'Forbidden: project belongs to another owner' });
      }
      const result = await deployer.rollback(req.params.name);
      res.json(result);
    } catch (err) {
      if (err.message === 'Project not found') {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === 'No previous deploy available for rollback') {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /projects/:name
  app.delete('/projects/:name', async (req, res) => {
    try {
      const owner = req.query.owner;
      if (!owner) {
        return res.status(400).json({ error: 'owner query parameter is required' });
      }
      const project = await registry.getProject(req.params.name);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (project.owner !== owner) {
        return res.status(403).json({ error: 'Forbidden: project belongs to another owner' });
      }
      const result = await deployer.deleteProject(req.params.name);
      res.json(result);
    } catch (err) {
      if (err.message === 'Project not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // GET /projects/:name
  app.get('/projects/:name', async (req, res) => {
    try {
      const project = await registry.getProject(req.params.name);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ project });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /deploy
  app.post('/deploy', async (req, res) => {
    try {
      validateDeployPayload(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const result = await deployer.deploy(req.body);
      res.json(result);
    } catch (err) {
      if (err.message.startsWith('Deploy already in progress')) {
        return res.status(409).json({ error: err.message });
      }
      if (err.message.includes('belongs to')) {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Store dependencies for test access
  app.locals = { config, registry, lock, logger, caddy, shell };

  return app;
}
