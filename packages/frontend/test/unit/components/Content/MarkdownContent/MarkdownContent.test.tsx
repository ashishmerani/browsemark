import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createTestStore } from '../../../../utils';
import MarkdownContent from '../../../../../src/components/Content/MarkdownContent/MarkdownContent';
import { fetchContent } from '../../../../../src/store/slices/contentSlice';

// Vitest doesn't auto-mock node_modules like Jest — explicit call needed,
// but without a factory Vitest discovers __mocks__/react-markdown.tsx
vi.mock('react-markdown');

vi.mock('../../../../../src/store/slices/contentSlice', async () => ({
  __esModule: true,
  ...(await vi.importActual('../../../../../src/store/slices/contentSlice')),
  fetchContent: vi.fn((path) => (dispatch) => {
    dispatch({ type: 'content/fetchContent', payload: path });
  }),
}));

describe('MarkdownContent', () => {
  let store;

  beforeEach(() => {
    store = createTestStore({
      content: {
        content: '# Test Markdown',
        loading: false,
        error: null,
      },
      fileTree: {
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
  });

  test('renders welcome message when no file is selected', async () => {
    store = createTestStore({
      content: {
        content: '',
        loading: false,
        error: null,
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: null,
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
    let fragment;
    await act(async () => {
      const { asFragment } = render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
      fragment = asFragment;
    });
    expect(fragment()).toMatchSnapshot();
    expect(screen.getByText('🎉 Welcome to browsemark!')).toBeInTheDocument();
    expect(fetchContent).toHaveBeenCalledWith(null);
  });

  test('renders file content when a file is selected', async () => {
    store = createTestStore({
      content: {
        content: '# Test Markdown',
        loading: false,
        error: null,
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: '/path/to/test.md',
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

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });

    fireEvent.click(screen.getByRole('tab', { name: /raw/i }));
    expect(screen.getByTestId('mock-react-markdown')).toBeInTheDocument();
  });

  test('displays loading spinner when content is loading', async () => {
    store = createTestStore({
      content: {
        content: '',
        loading: true,
        error: null,
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: '/path/to/test.md',
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

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when there is an error', async () => {
    store = createTestStore({
      content: {
        content: '',
        loading: false,
        error: 'Failed to load content',
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: '/path/to/test.md',
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

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });
    expect(screen.getByText('Error: Failed to load content')).toBeInTheDocument();
  });

  test('calls onDirectorySelect when breadcrumb link is clicked', async () => {
    const handleDirectorySelect = vi.fn();
    store = createTestStore({
      content: {
        content: '# Test Markdown',
        loading: false,
        error: null,
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: '/path/to/test.md',
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

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} onDirectorySelect={handleDirectorySelect} />
          </BrowserRouter>
        </Provider>
      );
    });

    const link = screen.getByRole('link', { name: /path/i });
    fireEvent.click(link);
    expect(handleDirectorySelect).toHaveBeenCalledWith('path');
  });

  test('parses and displays frontmatter', async () => {
    const contentWithFrontmatter = '---\ntitle: Test Title\nauthor: Test Author\n---\n# Markdown Content';
    store = createTestStore({
      content: {
        content: contentWithFrontmatter,
        loading: false,
        error: null,
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: '/path/to/test.md',
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

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });

    fireEvent.click(screen.getByText('Frontmatter'));

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getAllByText('Test Title').length).toBeGreaterThan(0);
    expect(screen.getByText('author')).toBeInTheDocument();
    expect(screen.getAllByText('Test Author').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Preview'));

    expect(screen.getByTestId('mock-react-markdown')).toBeInTheDocument();
  });

  test('scrolls to element when scrollToId is provided', async () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const contentWithId = '<a id="test-id">Test Heading</a>';
    store = createTestStore({
      content: {
        content: contentWithId,
        loading: false,
        error: null,
      },
      fileTree: {
        loading: false,
      },
      history: {
        currentPath: '/path/to/test.md',
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

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId="test-id" />
          </BrowserRouter>
        </Provider>
      );
    });

    await screen.findByText('Test Heading');
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  test('renders tag chips when frontmatter has tags', async () => {
    const contentWithTags = '---\ntitle: Tagged Post\ntags:\n  - javascript\n  - react\n---\n# Content';
    store = createTestStore({
      content: {
        content: contentWithTags,
        loading: false,
        error: null,
      },
      fileTree: { loading: false },
      history: { currentPath: '/path/to/tagged.md', isDirectory: false },
      appSetting: { contentMode: 'compact' },
      config: { fontFamily: 'Inter', fontFamilyMonospace: 'JetBrains Mono', fontSize: 14 },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  test('renders category chips when frontmatter has categories', async () => {
    const contentWithCategories = '---\ntitle: Categorized\ncategories:\n  - tutorials\n  - guides\n---\n# Content';
    store = createTestStore({
      content: {
        content: contentWithCategories,
        loading: false,
        error: null,
      },
      fileTree: { loading: false },
      history: { currentPath: '/path/to/categorized.md', isDirectory: false },
      appSetting: { contentMode: 'compact' },
      config: { fontFamily: 'Inter', fontFamilyMonospace: 'JetBrains Mono', fontSize: 14 },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });

    expect(screen.getByText('tutorials')).toBeInTheDocument();
    expect(screen.getByText('guides')).toBeInTheDocument();
  });

  test('does not render chips when tags and categories are empty arrays', async () => {
    const contentWithEmptyTags = '---\ntitle: No Tags\ntags: []\ncategories: []\n---\n# Content';
    store = createTestStore({
      content: {
        content: contentWithEmptyTags,
        loading: false,
        error: null,
      },
      fileTree: { loading: false },
      history: { currentPath: '/path/to/empty.md', isDirectory: false },
      appSetting: { contentMode: 'compact' },
      config: { fontFamily: 'Inter', fontFamilyMonospace: 'JetBrains Mono', fontSize: 14 },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MarkdownContent scrollToId={null} />
          </BrowserRouter>
        </Provider>
      );
    });

    // MUI Chip components have role="button" — none should be present
    const chips = screen.queryAllByRole('button');
    // Filter out any non-chip buttons (tabs, etc.)
    expect(chips.filter(el => el.classList.contains('MuiChip-root'))).toHaveLength(0);
  });
});
