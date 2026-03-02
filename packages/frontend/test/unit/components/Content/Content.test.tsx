import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../../utils';
import Content from '../../../../src/components/Content/Content';
import DirectoryContent from '../../../../src/components/Content/DirectoryContent/DirectoryContent';
import MarkdownContent from '../../../../src/components/Content/MarkdownContent/MarkdownContent';

vi.mock('../../../../src/components/Content/DirectoryContent/DirectoryContent');
vi.mock('../../../../src/components/Content/MarkdownContent/MarkdownContent');

describe('Content', () => {
  let store;

  beforeEach(() => {
    store = createTestStore({
      history: {
        currentPath: null,
        isDirectory: false,
      },
      appSetting: {
        darkMode: 'auto',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      },
      content: {
        content: '',
        loading: false,
        error: null,
        scrollPosition: 0,
      },
    });
    DirectoryContent.mockClear();
    MarkdownContent.mockClear();

    (DirectoryContent as Mock).mockImplementation(() => <div data-testid="mock-directory-content" />);
    (MarkdownContent as Mock).mockImplementation(() => <div data-testid="mock-markdown-content" />);
  });

  test('renders correctly', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <Content onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} scrollToId={null} />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders MarkdownContent when currentPath is null', () => {
    render(
      <Provider store={store}>
        <Content onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} scrollToId={null} />
      </Provider>
    );
    expect(screen.getByTestId('mock-markdown-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-directory-content')).not.toBeInTheDocument();
  });

  test('renders MarkdownContent when currentPath is a file', () => {
    store = createTestStore({
      history: {
        currentPath: 'path/to/file.md',
        isDirectory: false,
      },
      appSetting: {
        darkMode: 'auto',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      },
      content: {
        content: '',
        loading: false,
        error: null,
        scrollPosition: 0,
      },
    });
    render(
      <Provider store={store}>
        <Content onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} scrollToId={null} />
      </Provider>
    );
    expect(screen.getByTestId('mock-markdown-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-directory-content')).not.toBeInTheDocument();
  });

  test('renders DirectoryContent when currentPath is a directory', () => {
    store = createTestStore({
      history: {
        currentPath: 'path/to/directory',
        isDirectory: true,
      },
      appSetting: {
        darkMode: 'auto',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      },
      content: {
        content: '',
        loading: false,
        error: null,
        scrollPosition: 0,
      },
    });
    render(
      <Provider store={store}>
        <Content onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} scrollToId={null} />
      </Provider>
    );
    expect(screen.getByTestId('mock-directory-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-markdown-content')).not.toBeInTheDocument();
  });

  test('passes correct props to MarkdownContent', () => {
    const onDirectorySelectMock = vi.fn();
    render(
      <Provider store={store}>
        <Content onFileSelect={vi.fn()} onDirectorySelect={onDirectorySelectMock} scrollToId="test-id" />
      </Provider>
    );
    expect(MarkdownContent).toHaveBeenCalledWith(
      expect.objectContaining({
        onDirectorySelect: onDirectorySelectMock,
        scrollToId: 'test-id',
      }),
      undefined
    );
  });

  test('passes correct props to DirectoryContent', () => {
    const onFileSelectMock = vi.fn();
    const onDirectorySelectMock = vi.fn();
    store = createTestStore({
      history: {
        currentPath: 'path/to/directory',
        isDirectory: true,
      },
      appSetting: {
        darkMode: 'auto',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      },
      content: {
        content: '',
        loading: false,
        error: null,
        scrollPosition: 0,
      },
    });
    render(
      <Provider store={store}>
        <Content onFileSelect={onFileSelectMock} onDirectorySelect={onDirectorySelectMock} scrollToId={null} />
      </Provider>
    );
    expect(DirectoryContent).toHaveBeenCalledWith(
      expect.objectContaining({
        onFileSelect: onFileSelectMock,
        onDirectorySelect: onDirectorySelectMock,
      }),
      undefined
    );
  });
});
