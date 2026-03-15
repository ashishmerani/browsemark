import { type Express, type NextFunction, type Request, type Response } from 'express';
import * as fs from 'fs';
import net from 'net';
import { startHttpServer } from 'agentation-mcp';
import { createApp, serve } from '../../../src/server/server';
import { setupWatcher } from '../../../src/server/watcher';
import { getConfig, saveConfig } from '../../../src/server/config';
import { logger } from '../../../src/utils/logger';

vi.mock('express', () => {
  const mockUse = vi.fn();
  const mockGet = vi.fn();
  const mockListen = vi.fn((port, host, callback) => {
    if (callback) {
      callback();
    }
    return { close: vi.fn() };
  });
  const mockPost = vi.fn();
  const mockExpress = vi.fn(() => ({
    use: mockUse,
    get: mockGet,
    post: mockPost,
    listen: mockListen,
  }));
  mockExpress.static = vi.fn().mockReturnValue(vi.fn());
  mockExpress.json = vi.fn(() => vi.fn());
  const MockRouter = vi.fn(() => ({
    json: vi.fn().mockReturnValue(vi.fn()),
    get: vi.fn(),
    post: vi.fn(),
  }));
  mockExpress.Router = MockRouter;
  return { default: mockExpress, Router: MockRouter };
});

// Mock fs.existsSync and fs.statSync
vi.mock('fs', async () => ({
  ...(await vi.importActual<typeof import('fs')>('fs')),
  existsSync: vi.fn(),
  statSync: vi.fn(),
}));

// Mock setupWatcher
vi.mock('../../../src/server/watcher');

// Mock agentation-mcp
vi.mock('agentation-mcp', () => ({
  startHttpServer: vi.fn(),
}));

// Mock net for isPortAvailable — need default + named exports
vi.mock('net', () => ({
  default: { createServer: vi.fn() },
  createServer: vi.fn(),
}));

// Mock config functions
vi.mock('../../../src/server/config', () => ({
  getConfig: vi.fn(),
  saveConfig: vi.fn(),
  VALID_CONFIG_KEYS: new Set(['fontFamily', 'fontFamilyMonospace', 'fontSize', 'theme', 'syntaxHighlighterTheme']),
}));

describe('server.ts unit tests', () => {
  let app: Express;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock for fs.existsSync and fs.statSync
    (fs.existsSync as Mock).mockReturnValue(true);
    (fs.statSync as Mock).mockReturnValue({
      isDirectory: vi.fn().mockReturnValue(false),
    });

    app = createApp('/mock/directory');
  });

  describe('createApp', () => {
    const getCatchAllRouteHandler = () => (app.get as Mock).mock.calls.find(
      (call: [string, unknown, (req: Request, res: Response) => void]) => call[0] === '*splat' && call.length === 3,
    )[2];

    it('should create an express app', () => {
      expect(app).toBeDefined();
    });

    it('should serve static files from public and frontend', () => {
      expect(app.use).toHaveBeenCalledWith(expect.any(Function)); // for express.static
      expect(app.use).toHaveBeenCalledWith(expect.any(Function)); // for express.static
    });

    it('should define /api/filetree and /api/outline routes', () => {
      expect(app.use).toHaveBeenCalledWith('/api/filetree', expect.objectContaining({ get: expect.any(Function) }));
      expect(app.use).toHaveBeenCalledWith('/api/outline', expect.objectContaining({ get: expect.any(Function) }));
    });

    it('should define /api/config GET route', async () => {
      const mockConfig = { fontFamily: 'Test', fontSize: 16 };
      (getConfig as Mock).mockReturnValue(mockConfig);
      const mockJson = vi.fn();
      const configGetHandler = (app.get as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response) => void]) =>
          call[0] === '/api/config' && call.length === 2,
      )[1];
      configGetHandler({} as Request, { json: mockJson } as unknown as Response);
      expect(getConfig).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockConfig);
    });

    it('should define /api/config POST route', async () => {
      const mockBody = { fontFamily: 'NewFont', fontSize: 18 };
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const configPostCall = (app.post as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response) => void]) =>
          call[0] === '/api/config',
      );
      const configPostHandler = configPostCall[1];
      configPostHandler({ body: mockBody } as Request, { status: mockStatus, send: mockSend } as unknown as Response);
      expect(saveConfig).toHaveBeenCalledWith(mockBody);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith('Config saved');
    });

    it('should handle errors in /api/config POST route', async () => {
      (saveConfig as Mock).mockImplementation(() => {
        throw new Error('Save failed');
      });
      const mockBody = { fontFamily: 'NewFont', fontSize: 18 };
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const configPostCall = (app.post as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response) => void]) =>
          call[0] === '/api/config',
      );
      const configPostHandler = configPostCall[1];
      configPostHandler({ body: mockBody } as Request, { status: mockStatus, send: mockSend } as unknown as Response);
      expect(saveConfig).toHaveBeenCalledWith(mockBody);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Failed to save config');
    });

    it('should serve welcome markdown', async () => {
      const mockSendFile = vi.fn();
      const welcomeRouteHandler = (app.get as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response) => void]) =>
          call[0] === '/api/markdown/browsemark-welcome.md',
      )[1];
      welcomeRouteHandler(
        {} as Request,
        { setHeader: vi.fn(), sendFile: mockSendFile } as unknown as Response,
      );
      expect(mockSendFile).toHaveBeenCalledWith(
        expect.stringContaining('welcome.md'),
        expect.any(Object),
      );
    });

    it('should prevent path traversal for /api/markdown', async () => {
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const mockNext = vi.fn();
      const req = { path: '../package.json' } as Request;
      const res = { status: mockStatus, send: mockSend } as unknown as Response;

      const markdownMiddleware = (app.use as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response, next: NextFunction) => void]) =>
          call[0] === '/api/markdown' && call.length === 2,
      )[1];
      await markdownMiddleware(req, res, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockSend).toHaveBeenCalledWith('Forbidden');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent files in /api/markdown', async () => {
      (fs.existsSync as Mock).mockReturnValue(false);
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const mockNext = vi.fn();
      const req = { path: 'nonexistent.md' } as Request;
      const res = { status: mockStatus, send: mockSend } as unknown as Response;

      const markdownMiddleware = (app.use as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response, next: NextFunction) => void]) =>
          call[0] === '/api/markdown' && call.length === 2,
      )[1];
      await markdownMiddleware(req, res, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('File not found');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next for existing files in /api/markdown', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const mockNext = vi.fn();
      const req = { path: 'existing.md' } as Request;
      const res = { status: mockStatus, send: mockSend } as unknown as Response;

      const markdownMiddleware = (app.use as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response, next: NextFunction) => void]) =>
          call[0] === '/api/markdown' && call.length === 2,
      )[1];
      await markdownMiddleware(req, res, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockSend).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not call statSync for traversal paths in catch-all route', async () => {
      // Express normalizes URL paths, so /../.. becomes /. Our handler adds
      // defense-in-depth: decodeURIComponent + path.normalize + path.relative check
      // before touching the filesystem. The path resolves safely inside the
      // mount directory, so statSync is called but only on a safe path.
      (fs.statSync as Mock).mockImplementation(() => { throw new Error('not found'); });
      const mockSendFile = vi.fn((filePath, options, callback) => {
        callback({ code: 'ENOENT' });
      });
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const req = { path: '/etc/passwd' } as Request;
      const res = { status: mockStatus, send: mockSend, sendFile: mockSendFile } as unknown as Response;

      const catchAllRoute = getCatchAllRouteHandler();
      await catchAllRoute(req, res);

      // The path resolves inside mount dir, so it's safe — returns 404 not a traversal leak
      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should reject config POST with only unknown keys', async () => {
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const configPostCall = (app.post as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response) => void]) =>
          call[0] === '/api/config',
      );
      const configPostHandler = configPostCall[1];
      configPostHandler(
        { body: { evil: 'payload' } } as Request,
        { status: mockStatus, send: mockSend } as unknown as Response,
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockSend).toHaveBeenCalledWith('Invalid config: no recognized keys');
      expect(saveConfig).not.toHaveBeenCalled();
    });

    it('should reject config POST with non-object body', async () => {
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const configPostCall = (app.post as Mock).mock.calls.find(
        (call: [string, (req: Request, res: Response) => void]) =>
          call[0] === '/api/config',
      );
      const configPostHandler = configPostCall[1];
      configPostHandler(
        { body: null } as Request,
        { status: mockStatus, send: mockSend } as unknown as Response,
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockSend).toHaveBeenCalledWith('Invalid config: expected a JSON object');
    });

    it('should serve index.html for markdown paths', async () => {
      const mockSendFile = vi.fn();
      const req = { path: 'test.md' } as Request;
      const res = { sendFile: mockSendFile } as unknown as Response;

      const catchAllRoute = getCatchAllRouteHandler();
      await catchAllRoute(req, res);

      expect(mockSendFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.any(Object),
      );
    });

    it('should serve index.html for directory paths', async () => {
      (fs.statSync as Mock).mockReturnValue({
        isDirectory: vi.fn().mockReturnValue(true),
      });
      const mockSendFile = vi.fn();
      const req = { path: '/some/directory' } as Request;
      const res = { sendFile: mockSendFile } as unknown as Response;

      const catchAllRoute = getCatchAllRouteHandler();
      await catchAllRoute(req, res);

      expect(mockSendFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.any(Object),
      );
    });

    it('should serve non-markdown files with root option', async () => {
      (fs.statSync as Mock).mockImplementation(() => {
        throw new Error('File not found'); // Simulate file not found for statSync
      });
      const mockSendFile = vi.fn((filePath, options, callback) => {
        callback(null); // Simulate success
      });
      const req = { path: 'image.png' } as Request;
      const res = { sendFile: mockSendFile } as unknown as Response;

      const catchAllRoute = getCatchAllRouteHandler();
      await catchAllRoute(req, res);

      expect(mockSendFile).toHaveBeenCalledWith(
        'image.png',
        { root: '/mock/directory' },
        expect.any(Function),
      );
    });

    it('should handle error when serving non-markdown files', async () => {
      (fs.statSync as Mock).mockImplementation(() => {
        throw new Error('File not found'); // Simulate file not found for statSync
      });
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const mockSendFile = vi.fn((filePath, options, callback) => {
        callback({ code: 'ENOENT' }); // Simulate ENOENT error
      });
      const req = { path: 'nonexistent.png' } as Request;
      const res = {
        status: mockStatus,
        send: mockSend,
        sendFile: mockSendFile,
      } as unknown as Response;

      const catchAllRoute = getCatchAllRouteHandler();
      await catchAllRoute(req, res);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('File not found');
    });

    it('should handle generic error when serving non-markdown files', async () => {
      (fs.statSync as Mock).mockImplementation(() => {
        throw new Error('File not found'); // Simulate file not found for statSync
      });
      const mockStatus = vi.fn().mockReturnThis();
      const mockSend = vi.fn();
      const mockSendFile = vi.fn((filePath, options, callback) => {
        callback(new Error('Generic error')); // Simulate generic error
      });
      const req = { path: 'error.png' } as Request;
      const res = {
        status: mockStatus,
        send: mockSend,
        sendFile: mockSendFile,
      } as unknown as Response;

      const catchAllRoute = getCatchAllRouteHandler();
      await catchAllRoute(req, res);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith('Internal Server Error');
    });
  });

  describe('serve', () => {
    it('should start a server and setup watcher', () => {
      // Mock net.createServer for isPortAvailable
      const mockTester = {
        once: vi.fn().mockReturnThis(),
        listen: vi.fn().mockReturnThis(),
        close: vi.fn((cb) => cb && cb()),
      };
      (net.createServer as Mock).mockReturnValue(mockTester);

      const server = serve('/mock/directory', 3000, 'localhost');
      expect(app.listen).toHaveBeenCalledWith(3000, 'localhost', expect.any(Function));
      expect(setupWatcher).toHaveBeenCalledWith('/mock/directory', server, 3000);
    });

    it('should start MCP server when port 4747 is available', async () => {
      const mockTester = {
        once: vi.fn().mockReturnThis(),
        listen: vi.fn().mockReturnThis(),
        close: vi.fn((cb) => cb && cb()),
      };
      (net.createServer as Mock).mockReturnValue(mockTester);

      serve('/mock/directory', 3000, 'localhost');

      // Simulate port available: trigger the 'listening' callback
      const listeningCb = mockTester.once.mock.calls.find(
        (call: string[]) => call[0] === 'listening',
      )?.[1];
      listeningCb();

      // Wait for the promise chain to resolve
      await new Promise(resolve => setImmediate(resolve));

      expect(startHttpServer).toHaveBeenCalledWith(4747);
      expect(logger.log).toHaveBeenCalledWith(
        'Agentation',
        'MCP HTTP server listening at http://localhost:4747',
      );
    });

    it('should log warning when MCP port 4747 is in use', async () => {
      const mockTester = {
        once: vi.fn().mockReturnThis(),
        listen: vi.fn().mockReturnThis(),
        close: vi.fn(),
      };
      (net.createServer as Mock).mockReturnValue(mockTester);

      serve('/mock/directory', 3000, 'localhost');

      // Simulate port in use: trigger the 'error' callback
      const errorCb = mockTester.once.mock.calls.find(
        (call: string[]) => call[0] === 'error',
      )?.[1];
      errorCb();

      await new Promise(resolve => setImmediate(resolve));

      expect(startHttpServer).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(
        'Agentation',
        'Port 4747 in use (another instance). Annotations route through existing server.',
      );
    });
  });
});
