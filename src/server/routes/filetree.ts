import { Router } from 'express';
import fs, { Dirent } from 'fs';
import path from 'path';
import simpleGit, { SimpleGit, StatusResult, FileStatusResult } from 'simple-git';
import { EXCLUDED_DIRECTORIES } from '../../constants';

type FileTreeItem = { path: string, status: string, isDirectory?: boolean } | { [key: string]: FileTree };
type FileTree = FileTreeItem[];

export const fileTreeRouter = (directory: string): Router => {
  const router = Router();
  const git: SimpleGit = simpleGit({ baseDir: directory });

  router.get('/', async (req, res) => {
    const isRepo = await git.checkIsRepo();
    const gitStatus = isRepo ? await git.status() : null;
    const fileTree = await getFileTree(directory, '', gitStatus);
    res.json({ fileTree, mountedDirectoryPath: directory });
  });

  return router;
};

const isDotFileOrDirectory = (entryName: string): boolean => {
  return entryName.startsWith('.');
};

const shouldIncludeEntry = (entry: Dirent): boolean => {
  return !isDotFileOrDirectory(entry.name) && !EXCLUDED_DIRECTORIES.includes(entry.name);
};

const getFileTree = async (
  baseDirectory: string,
  currentRelativePath: string,
  gitStatus: StatusResult | null
): Promise<FileTree> => {
  const fullPath = path.join(baseDirectory, currentRelativePath);
  const entriesInDir = fs.readdirSync(
    fullPath,
    { withFileTypes: true }
  );
  const entries = entriesInDir.filter(shouldIncludeEntry);

  entries.sort((a, b) => {
    const aIsDir = a.isDirectory();
    const bIsDir = b.isDirectory();
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
    const aName = a.name;
    const bName = b.name;
    const aUnderscore = aName.startsWith('_');
    const bUnderscore = bName.startsWith('_');
    if (aUnderscore !== bUnderscore) return aUnderscore ? -1 : 1;
    const aZz = aName.startsWith('zz_');
    const bZz = bName.startsWith('zz_');
    if (aZz !== bZz) return aZz ? 1 : -1;
    return aName.localeCompare(bName);
  });

  const tree: FileTree = [];

  for (const entry of entries) {
    const entryPath = path.join(currentRelativePath, entry.name);
    if (entry.isDirectory()) {
      const subTree = await getFileTree(baseDirectory, entryPath, gitStatus);
      if (subTree.length > 0) {
        tree.push({ [entry.name]: subTree });
      }
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
      let status = ' ';
      if (gitStatus) {
        const fileStatus = gitStatus.files.find((f: FileStatusResult) => f.path === entryPath);
        if (fileStatus) {
          status = fileStatus.index !== ' ' ? fileStatus.index : fileStatus.working_dir;
        }
      }
      tree.push({ path: entryPath, status });
    }
  }
  return tree;
};

