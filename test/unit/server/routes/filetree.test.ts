import express from 'express';
import fs from 'fs';
import request from 'supertest';
import { fileTreeRouter } from '../../../../src/server/routes/filetree';

// Mock the fs module — need `default` for `import fs from 'fs'`
vi.mock('fs', () => {
  const mock = {
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  };
  return { ...mock, default: mock };
});

// Helper function to create a mock Dirent
const mockDirent = (name: string, isDirectory: boolean) => ({
  name,
  isDirectory: () => isDirectory,
  isFile: () => !isDirectory,
});

describe('filetree.ts', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (fs.readdirSync as Mock).mockReset();
    (fs.statSync as Mock).mockReset();
  });

  describe('fileTreeRouter', () => {
    let app: express.Application;
    const mockDirectory = '/mock/base/dir';

    beforeEach(() => {
      app = express();
      app.use('/api/filetree', fileTreeRouter(mockDirectory));
    });

    it('should return the file tree as JSON', async () => {
      (fs.readdirSync as Mock)
        .mockReturnValueOnce([ // For root
          mockDirent('dir1', true),
          mockDirent('file1.md', false),
        ])
        .mockReturnValueOnce([ // For dir1
          mockDirent('subfile1.md', false),
        ]);

      const response = await request(app).get('/api/filetree');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        fileTree: [
          { 'dir1': [{ path: 'dir1/subfile1.md', status: ' ' }] },
          { path: 'file1.md', status: ' ' },
        ],
        mountedDirectoryPath: mockDirectory,
      });
    });

    it('should return an empty array if no markdown files are found', async () => {
      (fs.readdirSync as Mock).mockReturnValueOnce([
        mockDirent('file1.txt', false),
        mockDirent('dir1', true),
      ]).mockReturnValueOnce([]); // For dir1

      const response = await request(app).get('/api/filetree');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        fileTree: [],
        mountedDirectoryPath: mockDirectory,
      });
    });
  });
});
