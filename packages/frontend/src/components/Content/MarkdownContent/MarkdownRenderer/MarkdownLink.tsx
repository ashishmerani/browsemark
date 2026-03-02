import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FileTreeItem } from '../../../../store/slices/fileTreeSlice';
import { RootState } from '../../../../store/store';

interface MarkdownLinkProps {
  href?: string;
  children?: React.ReactNode;
  selectedFilePath: string | null;
}

const collectPaths = (
  tree: (FileTreeItem | { [key: string]: (FileTreeItem | object)[] })[]
): string[] => {
  const paths: string[] = [];
  for (const item of tree) {
    if ('path' in item) {
      paths.push((item as FileTreeItem).path);
    } else {
      const key = Object.keys(item)[0];
      const children = item[key];
      if (Array.isArray(children)) {
        paths.push(...collectPaths(children as (FileTreeItem | { [key: string]: (FileTreeItem | object)[] })[]));
      }
    }
  }
  return paths;
};

const slugify = (str: string): string =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

const MarkdownLink: React.FC<MarkdownLinkProps> = ({ href, children, selectedFilePath }) => {
  const navigate = useNavigate();
  const fileTree = useSelector((state: RootState) => state.fileTree.fileTree);

  const slugToPath = useMemo(() => {
    const paths = collectPaths(fileTree ?? []);
    const map = new Map<string, string>();
    for (const p of paths) {
      const filename = p.split('/').pop() || '';
      const nameWithoutExt = filename.replace(/\.md$/, '');
      map.set(slugify(nameWithoutExt), p);
    }
    return map;
  }, [fileTree]);

  const resolveWikiLink = useCallback((href: string): string | null => {
    if (!href.startsWith('/')) return null;
    const slug = href.slice(1).replace(/\/$/, '');
    if (!slug) return null;
    const match = slugToPath.get(slug);
    if (match) return `/${match}`;
    const lastSegment = slug.split('/').pop() || '';
    const partialMatch = slugToPath.get(lastSegment);
    if (partialMatch) return `/${partialMatch}`;
    return null;
  }, [slugToPath]);

  const resolvePath = useCallback((href: string) => {
    if (!selectedFilePath || href.startsWith('http') || href.startsWith('//')) {
      return href;
    }
    if (href.startsWith('/')) {
      const wikiResolved = resolveWikiLink(href);
      if (wikiResolved) return wikiResolved;
      return href;
    }
    const baseUrl = selectedFilePath.substring(0, selectedFilePath.lastIndexOf('/') + 1);
    return new URL(href, new URL(baseUrl, window.location.origin)).pathname;
  }, [selectedFilePath, resolveWikiLink]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) return;
    const resolvedHref = resolvePath(href);
    e.preventDefault();
    navigate(resolvedHref);
  }, [href, resolvePath, navigate]);

  if (!href) {
    return <a data-testid="markdown-link">{children}</a>;
  }
  if (href.startsWith('#')) {
    return <a data-testid="markdown-link" href={href}>{children}</a>;
  }

  const resolvedHref = resolvePath(href);
  if (resolvedHref.startsWith('http') || resolvedHref.startsWith('//')) {
    return <a data-testid="markdown-link" href={resolvedHref} target="_blank" rel="noopener noreferrer">{children}</a>;
  }

  return <a data-testid="markdown-link" href={resolvedHref} onClick={handleClick}>{children}</a>;
};

export default MarkdownLink;
