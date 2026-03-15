import { Router } from 'express';
import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import path from 'path';
import { logger } from '../../utils/logger';

const md = new MarkdownIt();

interface OutlineItem {
  level: number;
  content: string;
  id: string;
}

const isMissingFileError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'ENOENT';

export const outlineRouter = (directory: string): Router => {
  const router = Router();

  router.get('/', async (req, res) => {
    const filePath = req.query.filePath as string;
    if (!filePath) {
      return res.status(400).send('filePath query parameter is required.');
    }
    try {
      if (filePath === 'browsemark-welcome.md') {
        const welcomePath = path.join(__dirname, '../public/welcome.md');
        const outline = await parseOutline(fs.readFileSync(welcomePath, 'utf-8'));
        return res.json(outline);
      }

      const resolvedRoot = fs.realpathSync(directory);
      const rootPrefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`;
      const decodedPath = decodeURIComponent(filePath);
      const normalizedPath = path.normalize(decodedPath);
      const resolvedPath = path.resolve(resolvedRoot, normalizedPath);

      if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(rootPrefix)) {
        logger.error(`🚫 Attempted path traversal on outline: ${resolvedPath}`);
        return res.status(403).send('Forbidden');
      }

      let safePath: string;
      try {
        safePath = fs.realpathSync(resolvedPath);
      } catch (error) {
        if (isMissingFileError(error)) {
          return res.json([]);
        }
        throw error;
      }

      if (safePath !== resolvedRoot && !safePath.startsWith(rootPrefix)) {
        logger.error(`🚫 Attempted path traversal on outline: ${safePath}`);
        return res.status(403).send('Forbidden');
      }

      const outline = await parseOutline(fs.readFileSync(safePath, 'utf-8'));
      return res.json(outline);
    } catch (error) {
      logger.error(`Error getting outline for ${filePath}:`, error);
      return res.status(500).send('Error getting outline.');
    }
  });

  return router;
};

const parseOutline = async (fileContent: string): Promise<OutlineItem[]> => {
  const slugger = await import('github-slugger')
    .then(module => module.default)
    .then(GithubSlugger => new GithubSlugger());

  const tokens = md.parse(fileContent, {});
  const outline: OutlineItem[] = [];

  for (const token of tokens) {
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.substring(1));
      const nextToken = tokens[tokens.indexOf(token) + 1];
      if (nextToken && nextToken.type === 'inline') {
        const content = nextToken.content;
        const id = slugger.slug(content);
        outline.push({ level, content, id });
      }
    }
  }

  return outline;
};
