import express from 'express';
import request from 'supertest';
import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import path from 'path';
import { outlineRouter } from '../../../../src/server/routes/outline';

// Mock the fs module
vi.mock('fs', async () => {
  const originalModule = await vi.importActual<typeof import('fs')>('fs');
  return {
    __esModule: true,
    ...originalModule,
    realpathSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});
vi.mock('markdown-it', async () => {
  const originalModule = await vi.importActual<typeof import('markdown-it')>('markdown-it');
  return {
    default: vi.fn(function () {
      return {
        parse: vi.fn((markdown: string, env: object) => {
          const md = new originalModule.default();
          return md.parse(markdown, env);
        }),
      };
    }),
  };
});
describe('outline.ts', () => {
  beforeEach(() => {
    const mockedFs = fs as Mocked<typeof import('fs')>;
    mockedFs.readFileSync.mockReset();
    mockedFs.realpathSync.mockReset();
    mockedFs.realpathSync.mockImplementation(filePath => String(filePath));
    (MarkdownIt as Mock).mockClear();
  });

  describe('outlineRouter', () => {
    let app: express.Application;
    const mockDirectory = '/mock/base/dir';

    beforeEach(() => {
      app = express();
      app.use('/api/outline', outlineRouter(mockDirectory));
    });

    it('should return 400 if filePath is not provided', async () => {
      const response = await request(app).get('/api/outline');

      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('filePath query parameter is required.');
    });

    it('should return outline for a valid markdown file', async () => {
      const markdownContent = '# Test Heading';
      const mockedFs = fs as Mocked<typeof import('fs')>;
      mockedFs.readFileSync.mockReturnValueOnce(markdownContent);
      const response = await request(app).get('/api/outline?filePath=test.md');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        { level: 1, content: 'Test Heading', id: 'test-heading' },
      ]);
    });

    it('should handle browsemark-welcome.md correctly', async () => {
      const welcomeMarkdownContent = '# Welcome';
      const mockedFs = fs as Mocked<typeof import('fs')>;
      mockedFs.readFileSync.mockReturnValueOnce(welcomeMarkdownContent);
      const response = await request(app).get('/api/outline?filePath=browsemark-welcome.md');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        { level: 1, content: 'Welcome', id: 'welcome' },
      ]);
      const expectedPath = expect.stringContaining(path.join('public', 'welcome.md'));
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf-8');
    });

    it('should return 403 for path traversal attempts', async () => {
      const response = await request(app).get('/api/outline?filePath=../../etc/passwd');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('Forbidden');
    });

    it('should return 403 for encoded path traversal', async () => {
      const response = await request(app).get('/api/outline?filePath=%2e%2e%2f%2e%2e%2fetc%2fpasswd');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('Forbidden');
    });

    it('should allow valid files when mounted at filesystem root', async () => {
      const rootApp = express();
      const rootDirectory = path.parse(process.cwd()).root;
      const mockedFs = fs as Mocked<typeof import('fs')>;
      mockedFs.readFileSync.mockReturnValueOnce('# Root Heading');
      rootApp.use('/api/outline', outlineRouter(rootDirectory));

      const response = await request(rootApp).get('/api/outline?filePath=test.md');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        { level: 1, content: 'Root Heading', id: 'root-heading' },
      ]);
    });

    it('should return 403 when a symlink resolves outside the mounted directory', async () => {
      const mockedFs = fs as Mocked<typeof import('fs')>;
      mockedFs.realpathSync.mockImplementation(filePath => {
        if (String(filePath).endsWith('symlink.md')) {
          return '/etc/passwd';
        }
        return String(filePath);
      });

      const response = await request(app).get('/api/outline?filePath=symlink.md');

      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('Forbidden');
    });

    it('should return 200 if file does not exist', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockedFs = fs as Mocked<typeof import('fs')>;
      mockedFs.realpathSync.mockImplementation(filePath => {
        if (String(filePath).endsWith('nonexistent.md')) {
          const error = new Error('File not found') as NodeJS.ErrnoException;
          error.code = 'ENOENT';
          throw error;
        }
        return String(filePath);
      });
      const response = await request(app).get('/api/outline?filePath=nonexistent.md');

      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[]');

      consoleErrorSpy.mockRestore();
    });
  });
});
