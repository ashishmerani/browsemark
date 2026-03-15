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

export const outlineRouter = (directory: string): Router => {
  const router = Router();

  router.get('/', async (req, res) => {
    const filePath = req.query.filePath as string;
    if (!filePath) {
      return res.status(400).send('filePath query parameter is required.');
    }
    try {
      let absolutePath: string;
      let allowedRoot: string;
      if (filePath === 'browsemark-welcome.md') {
        allowedRoot = path.join(__dirname, '../public');
        absolutePath = path.join(allowedRoot, 'welcome.md');
      } else {
        allowedRoot = directory;
        const decodedPath = decodeURIComponent(filePath);
        const normalizedPath = path.normalize(decodedPath);
        absolutePath = path.join(directory, normalizedPath);

        const relative = path.relative(directory, absolutePath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          logger.error(`🚫 Attempted path traversal on outline: ${absolutePath}`);
          return res.status(403).send('Forbidden');
        }
      }
      const outline = await getMarkdownOutline(absolutePath, allowedRoot);
      res.json(outline);
    } catch (error) {
      logger.error(`Error getting outline for ${filePath}:`, error);
      res.status(500).send('Error getting outline.');
    }
  });

  return router;
};

const getMarkdownOutline = async (filePath: string, allowedRoot?: string): Promise<OutlineItem[]> => {
  // Defense-in-depth: validate path is within allowed root even though caller checks too
  if (allowedRoot) {
    const relative = path.relative(allowedRoot, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return [];
    }
  }

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const slugger = await import('github-slugger')
    .then(module => module.default)
    .then(GithubSlugger => new GithubSlugger());

  const fileContent = fs.readFileSync(filePath, 'utf-8');
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
