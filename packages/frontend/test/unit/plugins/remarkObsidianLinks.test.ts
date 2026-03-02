import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkObsidianLinks from '../../../src/plugins/remarkObsidianLinks';
import type { Node } from 'unist';

interface LinkNode extends Node {
  type: 'link';
  url: string;
  children: Array<{ type: string; value: string }>;
}

interface HtmlNode extends Node {
  type: 'html';
  value: string;
}

interface TextNode extends Node {
  type: 'text';
  value: string;
}

const parse = (markdown: string): Node => {
  return unified()
    .use(remarkParse)
    .use(remarkObsidianLinks)
    .runSync(unified().use(remarkParse).parse(markdown));
};

const findNodes = (tree: Node, type: string): Node[] => {
  const results: Node[] = [];
  const walk = (node: Node) => {
    if (node.type === type) results.push(node);
    if ('children' in node && Array.isArray((node as { children: Node[] }).children)) {
      (node as { children: Node[] }).children.forEach(walk);
    }
  };
  walk(tree);
  return results;
};

describe('remarkObsidianLinks', () => {
  describe('wiki-links', () => {
    test('[[page]] creates link with slugified href', () => {
      const tree = parse('Visit [[My Page]] for details');
      const links = findNodes(tree, 'link') as LinkNode[];
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/my-page');
      expect(links[0].children[0].value).toBe('My Page');
    });

    test('[[page|display text]] creates link with custom text', () => {
      const tree = parse('See [[target page|Click Here]]');
      const links = findNodes(tree, 'link') as LinkNode[];
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/target-page');
      expect(links[0].children[0].value).toBe('Click Here');
    });

    test('[[page#heading]] creates link with anchor stripped from href', () => {
      const tree = parse('Go to [[My Page#section]]');
      const links = findNodes(tree, 'link') as LinkNode[];
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/my-page');
      expect(links[0].children[0].value).toBe('My Page#section');
    });

    test('multiple [[links]] in single text node', () => {
      const tree = parse('See [[Page A]] and [[Page B]]');
      const links = findNodes(tree, 'link') as LinkNode[];
      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('/page-a');
      expect(links[1].url).toBe('/page-b');
    });

    test('empty brackets [[]] are left as text (no match)', () => {
      const tree = parse('Empty [[]] here');
      const links = findNodes(tree, 'link') as LinkNode[];
      // Regex [^\]]+ requires at least one char, so [[]] does not match
      expect(links).toHaveLength(0);
    });
  });

  describe('highlights', () => {
    test('==text== creates <mark> html node', () => {
      const tree = parse('This is ==highlighted== text');
      const htmlNodes = findNodes(tree, 'html') as HtmlNode[];
      expect(htmlNodes).toHaveLength(1);
      expect(htmlNodes[0].value).toBe('<mark>highlighted</mark>');
    });
  });

  describe('mixed content', () => {
    test('[[link]] and ==highlight== in same paragraph', () => {
      const tree = parse('Visit [[My Page]] and see ==important== notes');
      const links = findNodes(tree, 'link') as LinkNode[];
      const htmlNodes = findNodes(tree, 'html') as HtmlNode[];
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/my-page');
      expect(htmlNodes).toHaveLength(1);
      expect(htmlNodes[0].value).toBe('<mark>important</mark>');
    });

    test('surrounding text is preserved', () => {
      const tree = parse('before [[link]] after');
      const links = findNodes(tree, 'link') as LinkNode[];
      expect(links).toHaveLength(1);
      // Check that text nodes surround the link
      const paragraph = findNodes(tree, 'paragraph')[0] as { children: Node[] };
      const textNodes = paragraph.children.filter(c => c.type === 'text') as TextNode[];
      expect(textNodes.some(t => t.value.includes('before'))).toBe(true);
      expect(textNodes.some(t => t.value.includes('after'))).toBe(true);
    });
  });

  describe('no-op cases', () => {
    test('plain text without wiki-links or highlights is unchanged', () => {
      const tree = parse('Just plain text');
      const links = findNodes(tree, 'link') as LinkNode[];
      const htmlNodes = findNodes(tree, 'html') as HtmlNode[];
      expect(links).toHaveLength(0);
      expect(htmlNodes).toHaveLength(0);
    });

    test('malformed patterns do not crash', () => {
      expect(() => parse('Text with [[ unclosed bracket')).not.toThrow();
      expect(() => parse('Text with == unclosed highlight')).not.toThrow();
      expect(() => parse('Nested [[page [[inner]]]]')).not.toThrow();
    });
  });
});
