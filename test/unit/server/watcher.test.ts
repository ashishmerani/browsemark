import chokidar, { type FSWatcher } from 'chokidar';
import * as fs from 'fs';
import * as http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { setupWatcher } from '../../../src/server/watcher';
import { logger } from '../../../src/utils/logger';

// Mock chokidar
vi.mock('chokidar');

// Mock fs.statSync
vi.mock('fs', async () => ({
  ...(await vi.importActual<typeof import('fs')>('fs')),
  statSync: vi.fn(),
}));

// Mock WebSocketServer
let mockWss: {
  on: Mock;
  clients: Set<WebSocket>;
};
vi.mock('ws', () => ({
  // Must use regular functions (not arrows) so they can be called with `new`
  WebSocket: vi.fn(function () {
    return { on: vi.fn(), send: vi.fn(), close: vi.fn() };
  }),
  WebSocketServer: vi.fn(function () {
    return mockWss;
  }),
}));

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    showLogo: vi.fn(),
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('watcher.ts unit tests', () => {
  let mockServer: http.Server;
  let mockDirectoryWatcher: FSWatcher;
  let mockContentWatcher: FSWatcher;
  let mockClient: WebSocket;

  let onClientMessage: (message: string) => void;
  let onClientClose: () => void;
  let onClientError: (error: Error) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    mockServer = {} as http.Server;

    mockDirectoryWatcher = {
      on: vi.fn().mockReturnThis(),
      close: vi.fn(),
    } as unknown as FSWatcher;
    (chokidar.watch as Mock).mockReturnValue(mockDirectoryWatcher);

    mockContentWatcher = {
      on: vi.fn().mockReturnThis(),
      close: vi.fn(),
    } as unknown as FSWatcher;

    mockWss = {
      on: vi.fn(),
      clients: new Set<WebSocket>(),
    };

    mockClient = new WebSocket('');
    mockWss.clients.add(mockClient);

    (mockWss.on as Mock).mockImplementation((event, callback) => {
      if (event === 'listening') {
        callback();
      } else if (event === 'connection') {
        callback(mockClient);
      }
    });

    // Capture client's on message/close/error handlers
    (mockClient.on as Mock).mockImplementation((event, callback) => {
      if (event === 'message') {
        onClientMessage = callback;
      } else if (event === 'close') {
        onClientClose = callback;
      } else if (event === 'error') {
        onClientError = callback;
      }
    });
  });

  it('should setup WebSocketServer and directory watcher', () => {
    setupWatcher('/mock/directory', mockServer, 3000);
    expect(WebSocketServer).toHaveBeenCalledWith({ server: mockServer });
    expect(chokidar.watch).toHaveBeenCalledWith('/mock/directory', expect.any(Object));
  });

  it('should log when WebSocket server is listening', () => {
    (mockWss.on as Mock).mockImplementation((event, callback) => {
      if (event === 'listening') {
        callback();
      }
    });
    setupWatcher('/mock/directory', mockServer, 3000);
    expect(logger.log).toHaveBeenCalledWith('Livereload', '🚀 WebSocket server listening at ws://localhost:3000');
  });

  describe('WebSocket client interactions', () => {
    beforeEach(() => {
      setupWatcher('/mock/directory', mockServer, 3000);
      // Manually trigger connection to set up client handlers
      (mockWss.on as Mock).mock.calls.find(call => call[0] === 'connection')[1](mockClient);
    });

    it('should log when Livereload Client connected', () => {
      expect(logger.log).toHaveBeenCalledWith('Livereload', '🤝 Livereload Client connected');
    });

    it('should log when Livereload Client closed and close content watcher if no other clients', () => {
      // Ensure content watcher is set up before closing
      (chokidar.watch as Mock).mockReturnValueOnce(mockContentWatcher);
      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/initial.md' }));

      // Simulate the client being removed from the set on close
      mockWss.clients.delete(mockClient);
      expect(mockContentWatcher.close).not.toHaveBeenCalled(); // Should not be called initially
      onClientClose();
      expect(logger.log).toHaveBeenCalledWith('Livereload', '👋 Livereload Client closed');
      expect(mockContentWatcher.close).toHaveBeenCalled();
    });

    it('should not close content watcher if other clients exist', () => {
      // Ensure content watcher is set up before closing
      (chokidar.watch as Mock).mockReturnValueOnce(mockContentWatcher);
      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/initial.md' }));

      const anotherClient = new WebSocket('');
      mockWss.clients.add(anotherClient);
      onClientClose();
      expect(mockContentWatcher.close).not.toHaveBeenCalled();
    });

    it('should log WebSocket client errors', () => {
      const error = new Error('Client error');
      onClientError(error);
      expect(logger.error).toHaveBeenCalledWith('🚫 Error on WebSocket client:', error);
    });

    it('should handle watch-file message and setup content watcher', () => {
      (chokidar.watch as Mock).mockReturnValueOnce(mockContentWatcher); // For content watcher
      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/file.md' }));

      expect(logger.log).toHaveBeenCalledWith('Livereload', '👀 Watching file: /mock/file.md');
      expect(chokidar.watch)
        .toHaveBeenCalledWith(path.join('/mock/directory', '/mock/file.md'), { ignoreInitial: true });
      expect(mockContentWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockContentWatcher.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should send reload-content message when watched file changes', () => {
      (chokidar.watch as Mock).mockReturnValueOnce(mockContentWatcher);
      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/file2.md' }));

      expect(mockContentWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockContentWatcher.on).toHaveBeenCalledWith('error', expect.any(Function));

      const onChangeCallback = (mockContentWatcher.on as Mock).mock.calls.find(call => call[0] === 'change')[1];
      onChangeCallback('/mock/file.md');

      expect(logger.log).toHaveBeenCalledWith('Livereload', '🔃 File changed: /mock/file.md, reloading content...');
      expect(mockClient.send).toHaveBeenCalledWith(JSON.stringify({ type: 'reload-content' }));
    });

    it('should close previous content watcher when new watch-file message received', () => {
      const firstContentWatcher = { on: vi.fn(), close: vi.fn() } as unknown as FSWatcher;
      const secondContentWatcher = { on: vi.fn(), close: vi.fn() } as unknown as FSWatcher;

      (chokidar.watch as Mock)
        .mockReturnValueOnce(firstContentWatcher) // First call for content watcher
        .mockReturnValueOnce(secondContentWatcher); // Second call for content watcher

      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/file1.md' }));
      expect(firstContentWatcher.close).not.toHaveBeenCalled();

      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/file2.md' }));
      expect(firstContentWatcher.close).toHaveBeenCalled();
      expect(secondContentWatcher.close).not.toHaveBeenCalled();
    });

    it('should not call setupContentWatcher if watch-file message has invalid filePath type', () => {
      // Clear previous calls to chokidar.watch to accurately test this scenario
      (chokidar.watch as Mock).mockClear();
      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: 123 })); // Invalid filePath
      expect(chokidar.watch).not.toHaveBeenCalled();
    });

    it('should log error if content watcher encounters an error', () => {
      (chokidar.watch as Mock).mockReturnValueOnce(mockContentWatcher);
      onClientMessage(JSON.stringify({ type: 'watch-file', filePath: '/mock/file.md' }));

      const onErrorCallback = (mockContentWatcher.on as Mock).mock.calls.find(call => call[0] === 'error')[1];
      const error = new Error('Content watch error');
      onErrorCallback(error);

      expect(logger.error).toHaveBeenCalledWith('🚫 Error watching content file /mock/file.md:', error);
    });
  });

  describe('Directory watcher interactions', () => {
    beforeEach(() => {
      setupWatcher('/mock/directory', mockServer, 3000);
    });

    it('should send reload-tree message on file add', () => {
      const client = { send: vi.fn() } as unknown as WebSocket;
      mockWss.clients.add(client);

      const onAddCallback = (mockDirectoryWatcher.on as Mock).mock.calls.find(call => call[0] === 'add')[1];
      onAddCallback('new-file.md');

      expect(logger.log).toHaveBeenCalledWith('Livereload', '🌲 File added: new-file.md, reloading tree...');
      expect(client.send).toHaveBeenCalledWith(JSON.stringify({ type: 'reload-tree' }));
    });

    it('should send reload-tree message on file unlink', () => {
      const client = { send: vi.fn() } as unknown as WebSocket;
      mockWss.clients.add(client);

      const onUnlinkCallback = (mockDirectoryWatcher.on as Mock).mock.calls.find(call => call[0] === 'unlink')[1];
      onUnlinkCallback('deleted-file.md');

      expect(logger.log).toHaveBeenCalledWith('Livereload', '🌲 File removed: deleted-file.md, reloading tree...');
      expect(client.send).toHaveBeenCalledWith(JSON.stringify({ type: 'reload-tree' }));
    });

    it('should handle chokidar watch error for directory watcher', () => {
      (chokidar.watch as Mock).mockImplementationOnce(() => {
        throw new Error('Directory watch error');
      });

      setupWatcher('/mock/directory', mockServer, 3000);

      expect(logger.error).toHaveBeenCalledWith('🚫 Error watching directory:', expect.any(Error));
      expect(logger.error).toHaveBeenCalledWith('Livereload will be disabled');
    });

    it('should handle EMFILE error with specific message', () => {
      const onErrorCallback = (mockDirectoryWatcher.on as Mock).mock.calls.find(call => call[0] === 'error')[1];
      const emfileError = Object.assign(new Error('EMFILE: too many open files'), { code: 'EMFILE' });

      // Mock watcher.unwatch and watcher.close for the error handler
      (mockDirectoryWatcher as unknown as { unwatch: Mock }).unwatch = vi.fn();
      (mockDirectoryWatcher.close as Mock).mockResolvedValue(undefined);

      onErrorCallback(emfileError);

      expect(logger.error).toHaveBeenCalledWith('🚫 Error watching directory:', emfileError);
      expect(logger.error).toHaveBeenCalledWith('Livereload will be disabled');
      expect(logger.error).toHaveBeenCalledWith(
        'This error is likely caused by too many open files. Try increasing the ulimit.',
      );
    });

    it('should close watcher and unwatch directory on error', () => {
      const onErrorCallback = (mockDirectoryWatcher.on as Mock).mock.calls.find(call => call[0] === 'error')[1];
      const error = new Error('Generic watcher error');

      (mockDirectoryWatcher as unknown as { unwatch: Mock }).unwatch = vi.fn();
      (mockDirectoryWatcher.close as Mock).mockResolvedValue(undefined);

      onErrorCallback(error);

      const unwatchMock = (mockDirectoryWatcher as unknown as { unwatch: Mock }).unwatch;
      expect(unwatchMock).toHaveBeenCalledWith('/mock/directory');
      expect(mockDirectoryWatcher.close).toHaveBeenCalled();
    });
  });

  describe('WebSocket message parsing', () => {
    beforeEach(() => {
      setupWatcher('/mock/directory', mockServer, 3000);
      (mockWss.on as Mock).mock.calls.find(call => call[0] === 'connection')[1](mockClient);
    });

    it('should log error for invalid JSON message', () => {
      onClientMessage('not valid json{{{');
      expect(logger.error).toHaveBeenCalledWith(
        '🚫 Error parsing WebSocket message:',
        expect.any(SyntaxError),
      );
    });
  });

  describe('chokidar ignored option', () => {
    let ignoredFn: (path: string) => boolean;

    beforeEach(() => {
      setupWatcher('/mock/directory', mockServer, 3000);
      ignoredFn = (chokidar.watch as Mock).mock.calls.find(call => call[0] === '/mock/directory')[1].ignored;
    });

    it('should ignore files in node_modules', () => {
      expect(ignoredFn('/mock/directory/node_modules/some-package/index.js')).toBe(true);
    });

    it('should not ignore directories', () => {
      (fs.statSync as Mock).mockReturnValue({ isDirectory: () => true });
      expect(ignoredFn('/mock/directory/some_dir')).toBe(false);
    });

    it('should not ignore markdown files', () => {
      (fs.statSync as Mock).mockReturnValue({ isDirectory: () => false });
      expect(ignoredFn('test.md')).toBe(false);
      expect(ignoredFn('test.markdown')).toBe(false);
    });

    it('should ignore non-markdown files', () => {
      (fs.statSync as Mock).mockReturnValue({ isDirectory: () => false, isFile: () => true });
      expect(ignoredFn('test.txt', { isDirectory: () => false, isFile: () => true })).toBe(true);
    });

    it('should not ignore files if statSync fails', () => {
      (fs.statSync as Mock).mockImplementation(() => {
        throw new Error('stat sync error');
      });
      expect(ignoredFn('anyfile')).toBe(false);
    });
  });
});
