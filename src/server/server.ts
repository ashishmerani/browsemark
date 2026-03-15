import express from 'express';
import rateLimit from 'express-rate-limit';
import * as fs from 'fs';
import net from 'net';
import path from 'path';
import { startHttpServer } from 'agentation-mcp';
import { logger } from '../utils/logger';
import { fileTreeRouter } from './routes/filetree';
import { outlineRouter } from './routes/outline';
import { getConfig, saveConfig, VALID_CONFIG_KEYS } from './config';
import { setupWatcher } from './watcher';
import { plantumlRouter } from './routes/plantuml';

const MCP_PORT = 4747;

const isPortAvailable = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => { tester.close(() => resolve(true)); })
      .listen(port);
  });

export const serve = (directory: string, port: number, host: string): import('http').Server => {
  const app = createApp(directory);
  const server = app.listen(port, host, () => {
    logger.log('Server', `📁 Mounted directory: ${directory}`);
    logger.log('Server', `🚀 Server listening at http://${host}:${port}`);
  });

  setupWatcher(directory, server, port);

  isPortAvailable(MCP_PORT).then((available) => {
    if (available) {
      startHttpServer(MCP_PORT);
      logger.log('Agentation', `MCP HTTP server listening at http://localhost:${MCP_PORT}`);
    } else {
      logger.log('Agentation',
        `Port ${MCP_PORT} in use (another instance). Annotations route through existing server.`);
    }
  });

  return server;
};

export const createApp = (
  directory: string,
  currentLocation: string = __dirname,
): express.Express => {
  const app = express();

  // Rate limiter scoped to API routes — does not consume budget on static assets
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  const fileAccessLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  // JSON middleware - must be before routes that need it
  app.use(express.json());

  // Mount library static files
  app.use(express.static(path.join(currentLocation, './public')));
  app.use(express.static(path.join(currentLocation, '../frontend')));

  // Define API
  app.use('/api/filetree', fileTreeRouter(directory));
  app.use('/api/outline', outlineRouter(directory));
  // Stricter rate limit for PlantUML — each request spawns a JVM subprocess
  app.use('/api/plantuml', rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }));
  app.use('/api/plantuml', plantumlRouter());
  app.get('/api/config', (req, res) => {
    res.json(getConfig());
  });
  app.post('/api/config', (req, res) => {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).send('Invalid config: expected a JSON object');
      }
      const hasValidKey = Object.keys(body).some(k => VALID_CONFIG_KEYS.has(k));
      if (!hasValidKey) {
        return res.status(400).send('Invalid config: no recognized keys');
      }
      saveConfig(body);
      res.status(200).send('Config saved');
    } catch (error) {
      logger.error('Failed to save config:', error);
      res.status(500).send('Failed to save config');
    }
  });

  app.get('/api/markdown/browsemark-welcome.md', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile('welcome.md', { root: path.join(currentLocation, './public') });
  });

  app.use('/api/markdown', (req, res, next) => {
    // Decode the URI component to handle encoded characters in the path
    const decodedPath = decodeURIComponent(req.path);
    // Normalize the path to resolve '..' and '.' segments
    const normalizedPath = path.normalize(decodedPath);

    // Construct the full file path
    const filePath = path.join(directory, normalizedPath);

    // Security check: Ensure the resolved path is within the designated directory
    // This prevents path traversal attacks (e.g., accessing files outside 'directory')
    const relative = path.relative(directory, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      logger.error(`🚫 Attempted path traversal: ${filePath}`);
      return res.status(403).send('Forbidden');
    }

    if (!fs.existsSync(filePath)) {
      logger.error(`🚫 File not found: ${filePath}`);
      return res.status(404).send('File not found');
    }
    next();
  });
  app.use('/api/markdown', express.static(directory));

  // Catch-all route to serve index.html for any other requests
  app.get('*splat', fileAccessLimiter, async (req, res) => {
    const decodedPath = decodeURIComponent(req.path);
    const normalizedPath = path.normalize(decodedPath);
    const filePath = path.join(directory, normalizedPath);

    // Security: prevent path traversal before any fs access
    const relative = path.relative(directory, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return res.status(403).send('Forbidden');
    }

    let isDirectory = false;
    try {
      const stats = fs.statSync(filePath);
      isDirectory = stats.isDirectory();
    } catch {
      // File or directory does not exist, proceed as if it's a file
    }

    if (
      isDirectory ||
      normalizedPath.toLowerCase().endsWith('.md') ||
      normalizedPath.toLowerCase().endsWith('.markdown')
    ) {
      return res.sendFile('index.html', { root: path.join(currentLocation, '../frontend') });
    } else {
      return res.sendFile(normalizedPath, { root: directory }, (err) => {
        if (err) {
          if ('code' in err && err.code === 'ENOENT') {
            logger.error(`🚫 File not found: ${filePath}`);
            res.status(404).send('File not found');
          } else {
            logger.error(`🚫 Error serving file ${filePath}:`, err);
            res.status(500).send('Internal Server Error');
          }
        }
      });
    }
  });

  return app;
};
