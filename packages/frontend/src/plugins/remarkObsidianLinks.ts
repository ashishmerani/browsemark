import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

interface TextNode extends Node {
  type: 'text';
  value: string;
}

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/;
const HIGHLIGHT_RE = /==([^=]+)==/;

const slugify = (str: string): string =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-/]/g, '');

const remarkObsidianLinks = (): (tree: Node) => void => {
  return (tree: Node): void => {
    visit(tree, 'text', (node: TextNode, index: number | undefined, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;

      const value: string = node.value;
      if (!WIKI_LINK_RE.test(value) && !HIGHLIGHT_RE.test(value)) return;

      const children: Node[] = [];
      let lastIndex = 0;
      const combined = /\[\[([^\]]+)\]\]|==([^=]+)==/g;
      let match;

      while ((match = combined.exec(value)) !== null) {
        if (match.index > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, match.index) });
        }

        if (match[1] !== undefined) {
          // Wiki-link: [[page]] or [[page|display text]]
          const parts = match[1].split('|');
          const target = parts[0].replace(/#.*$/, '');
          const display = parts.length > 1 ? parts[1] : parts[0];
          children.push({
            type: 'link',
            url: `/${slugify(target)}`,
            children: [{ type: 'text', value: display }],
          });
        } else if (match[2] !== undefined) {
          // Highlight: ==text==
          children.push({
            type: 'html',
            value: `<mark>${match[2]}</mark>`,
          });
        }

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
};

export default remarkObsidianLinks;
