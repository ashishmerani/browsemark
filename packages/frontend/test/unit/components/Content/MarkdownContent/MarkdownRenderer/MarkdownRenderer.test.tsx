import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { createTestStore } from '../../../../../utils';
import MarkdownRenderer
  from '../../../../../../src/components/Content/MarkdownContent/MarkdownRenderer/MarkdownRenderer';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: vi.fn(),
}));

// Mock Mermaid component
vi.mock('../../../../../../src/components/Content/MarkdownContent/MarkdownRenderer/MermaidRenderer', () => ({
  __esModule: true,
  default: ({ chart }: { chart: string }) => <div data-testid="mock-mermaid-chart">{chart}</div>,
}));

// Mock ReactMarkdown to pass through children and allow inspection of components prop
vi.mock('react-markdown', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const { default: ActualReactMarkdown } = await vi.importActual<typeof import('react-markdown')>('react-markdown');


  const MockCode = (props: React.ComponentProps<'pre'>) => {
    if (props.className && props.className.includes('language-mermaid')) {
      return <div data-testid="mock-mermaid-chart">{props.children}</div>;
    }
    return (
      <pre data-testid="mock-syntax-highlighter" className={props.className}>
        <code data-testid="mock-syntax-highlighter-code">{props.children}</code>
      </pre>
    );
  };
  const MockH1 = (props: React.ComponentProps<'h1'>) => <h1 data-testid="mock-h1" {...props}>{props.children}</h1>;
  const MockP = (props: React.ComponentProps<'p'>) => <p data-testid="mock-p" {...props}>{props.children}</p>;

  return {
    __esModule: true,
    default: ({ children, components, remarkPlugins, rehypePlugins }: {
      children: string;
      components?: Record<string, React.ComponentType<React.ComponentProps<React.ElementType>>>;
      remarkPlugins?: unknown[];
      rehypePlugins?: unknown[];
    }) => {
      const finalComponents = {
        ...components,

        code: MockCode,
        h1: MockH1,
        p: MockP,
      };
      return (
        <div data-testid="mock-react-markdown-root">
          <ActualReactMarkdown components={finalComponents} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
            {children}
          </ActualReactMarkdown>
        </div>
      );
    },
  };
});

// Mock SyntaxHighlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: {
    SyntaxHighlighter: ({
      children,
      language,
      ...props
    }: {
      children: React.ReactNode;
      language: string;
      [key: string]: unknown;
    }) => (
      <pre data-testid="mock-syntax-highlighter" className={`language-${language}`} {...props}>
        <code data-testid="mock-syntax-highlighter-code">{children}</code>
      </pre>
    ),
  },
  nightOwl: {},
  prism: {},
}));


const renderWithProviders = (content: string, selectedFilePath: string | null = null) => {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
  });
  const store = createTestStore({
    content: {
      content: '# Test Markdown',
      loading: false,
      error: null,
    },
    fileTree: {
      fileTree: [],
      loading: false,
    },
    history: {
      currentPath: '/',
      isDirectory: false,
    },
    appSetting: {
      contentMode: 'compact',
    },
    config: {
      fontFamily: 'Inter',
      fontFamilyMonospace: 'JetBrains Mono',
      fontSize: 14,
    }
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <MarkdownRenderer content={content} selectedFilePath={selectedFilePath} />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('MarkdownRenderer', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('renders markdown content correctly', () => {
    const content = '# Hello World\n\nThis is a paragraph.';
    const { asFragment } = renderWithProviders(content);
    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', () => {
    const content = '```javascript\nconsole.log("Hello");\n```';
    renderWithProviders(content);
    expect(screen.getByTestId('mock-syntax-highlighter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-syntax-highlighter-code')).toHaveTextContent('console.log("Hello");');
    expect(screen.getByTestId('mock-syntax-highlighter')).toHaveClass('language-javascript');
  });

  it('renders mermaid diagrams for mermaid code blocks', () => {
    const content = '```mermaid\ngraph TD; A-->B;\n```';
    renderWithProviders(content);
    expect(screen.getByTestId('mock-mermaid-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-mermaid-chart')).toHaveTextContent('graph TD; A-->B;');
  });

  it('resolves relative paths correctly for internal links', () => {
    const content = '[Link to another file](another.md)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    expect(link).toHaveAttribute('href', '/path/to/another.md');
  });

  it('navigates to the correct path on internal link click', () => {
    const content = '[Link to another file](another.md)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    fireEvent.click(link);
    expect(mockNavigate).toHaveBeenCalledWith('/path/to/another.md');
  });

  it('opens external links in a new tab', () => {
    const content = '[External Link](https://example.com)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles absolute paths correctly', () => {
    const content = '[Absolute Link](/absolute/path.md)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    expect(link).toHaveAttribute('href', '/absolute/path.md');
  });

  it('handles root path correctly', () => {
    const content = '[Root Link](/)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('handles hash links correctly', () => {
    const content = '[Hash Link](#section)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    expect(link).toHaveAttribute('href', '#section');
  });

  it('renders code block without language specifier', () => {
    const content = '```\nplain code\n```';
    renderWithProviders(content);
    expect(screen.getByTestId('mock-syntax-highlighter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-syntax-highlighter-code')).toHaveTextContent('plain code');
  });

  it('renders links with MarkdownLink component', () => {
    const content = '[Internal Link](/some/page)';
    renderWithProviders(content, '/path/to/current.md');
    const link = screen.getByTestId('markdown-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Internal Link');
  });

  it('renders inline code', () => {
    const content = 'Use `console.log()` for debugging';
    renderWithProviders(content);
    expect(screen.getByText(/console\.log\(\)/)).toBeInTheDocument();
  });
});
