import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../../../utils';
import DirectoryContent from '../../../../../src/components/Content/DirectoryContent/DirectoryContent';
import { FileTreeItem } from '../../../../../src/store/slices/fileTreeSlice';

describe('DirectoryContent', () => {
  let store;
  const mockFileTree: (FileTreeItem | { [key: string]: (FileTreeItem | object)[] })[] = [
    { 'folder1': [{ path: 'file1.md', status: ' ' }] },
    { path: 'file2.txt', status: ' ' },
  ];

  beforeEach(() => {
    store = createTestStore({
      fileTree: {
        fileTree: mockFileTree,
        filteredFileTree: mockFileTree,
        loading: false,
        error: null,
      },
      history: {
        currentPath: '',
        isDirectory: true,
      },
      appSetting: {
        contentMode: 'compact',
      },
    });
  });

  test('renders correctly with initial state', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <DirectoryContent onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('calls onFileSelect when a file is clicked', () => {
    const onFileSelectMock = vi.fn();
    const onDirectorySelectMock = vi.fn();

    render(
      <Provider store={store}>
        <DirectoryContent onFileSelect={onFileSelectMock} onDirectorySelect={onDirectorySelectMock} />
      </Provider>
    );

    fireEvent.click(screen.getByText('file2.txt'));
    expect(onFileSelectMock).toHaveBeenCalledWith('file2.txt');
    expect(onDirectorySelectMock).not.toHaveBeenCalled();
  });

  test('calls onDirectorySelect when a folder is clicked', () => {
    const onFileSelectMock = vi.fn();
    const onDirectorySelectMock = vi.fn();

    render(
      <Provider store={store}>
        <DirectoryContent onFileSelect={onFileSelectMock} onDirectorySelect={onDirectorySelectMock} />
      </Provider>
    );

    fireEvent.click(screen.getByText('folder1'));
    expect(onDirectorySelectMock).toHaveBeenCalledWith('folder1');
    expect(onFileSelectMock).not.toHaveBeenCalled();
  });

  test('displays loading spinner when fileTree is loading', () => {
    store = createTestStore({
      fileTree: {
        fileTree: mockFileTree,
        filteredFileTree: mockFileTree,
        loading: true,
        error: null,
      },
      history: {
        currentPath: '',
        isDirectory: true,
      },
      appSetting: {
        contentMode: 'compact',
      },
    });

    render(
      <Provider store={store}>
        <DirectoryContent onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} />
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when there is an error', () => {
    store = createTestStore({
      fileTree: {
        fileTree: mockFileTree,
        filteredFileTree: mockFileTree,
        loading: false,
        error: 'Failed to load directory',
      },
      history: {
        currentPath: '',
        isDirectory: true,
      },
      appSetting: {
        contentMode: 'compact',
      },
    });

    render(
      <Provider store={store}>
        <DirectoryContent onFileSelect={vi.fn()} onDirectorySelect={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText('Error: Failed to load directory')).toBeInTheDocument();
  });
});
