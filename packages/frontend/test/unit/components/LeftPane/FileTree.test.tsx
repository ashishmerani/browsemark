import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../../utils';
import FileTree from '../../../../src/components/LeftPane/FileTree';
import { fetchFileTree, setSearchQuery, expandAllNodes, setExpandedNodes } from '../../../../src/store/slices/fileTreeSlice';

vi.mock('../../../../src/store/slices/fileTreeSlice', async () => ({
  __esModule: true,
  ...(await vi.importActual('../../../../src/store/slices/fileTreeSlice')),
  fetchFileTree: Object.assign(vi.fn(() => ({ type: 'test/fileTree/fetchFileTree' })), {
    fulfilled: vi.fn((payload) => ({ type: 'test/fileTree/fetchFileTree/fulfilled', payload })),
  }),
  expandAllNodes: vi.fn((payload) => ({ type: 'test/fileTree/expandAllNodes', payload })),
  setExpandedNodes: vi.fn((payload) => ({ type: 'test/fileTree/setExpandedNodes', payload })),
  setFilteredFileTree: vi.fn((payload) => ({ type: 'test/fileTree/setFilteredFileTree', payload }))
}));

describe('FileTree', () => {
  let store;
  const initialState = {
    fileTree: {
      fileTree: [
        { path: 'file3.js', status: ' ' },
        { 'folder1': [{ path: 'folder1/file1.md', status: ' ' }, { path: 'folder1/file2.txt', status: ' ' }] },
      ],
      filteredFileTree: [
        { path: 'file3.js', status: ' ' },
        { 'folder1': [{ path: 'folder1/file1.md', status: ' ' }, { path: 'folder1/file2.txt', status: ' ' }] },
      ],
      loading: false,
      error: null,
      searchQuery: '',
      expandedNodes: [],
      mountedDirectoryPath: '',
    },
  };

  beforeEach(() => {
    store = createTestStore(initialState);
    vi.spyOn(store, 'dispatch');
  });

  test('renders correctly', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('dispatches fetchFileTree on mount', () => {
    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );
    expect(store.dispatch).toHaveBeenCalledWith(fetchFileTree());
  });

  test('dispatches setSearchQuery on search input change', () => {
    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search files...');
    fireEvent.change(searchInput, { target: { value: 'file' } });

    expect(store.dispatch).toHaveBeenCalledWith(setSearchQuery('file'));
  });

  test('clears search query when clear button is clicked', () => {
    store = createTestStore({
      fileTree: {
        ...initialState.fileTree,
        searchQuery: 'file',
        filteredFileTree: [{ path: '/folder1/file1.md', status: ' ' }],
      },
    });
    vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    const clearButton = screen.getByLabelText('clear search');
    fireEvent.click(clearButton);

    expect(store.dispatch).toHaveBeenCalledWith(setSearchQuery(''));
  });

  test('dispatches expandAllNodes when expand all button is clicked', () => {
    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    const expandAllButton = screen.getByLabelText('expand all');
    fireEvent.click(expandAllButton);

    expect(store.dispatch).toHaveBeenCalledWith(expandAllNodes(initialState.fileTree.fileTree));
  });

  test('dispatches setExpandedNodes with empty array when collapse all button is clicked', () => {
    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    const collapseAllButton = screen.getByLabelText('collapse all');
    fireEvent.click(collapseAllButton);

    expect(store.dispatch).toHaveBeenCalledWith(setExpandedNodes([]));
  });

  test('updates expandedNodes when search query changes and filteredFileTree is not empty', async () => {
    const updatedFileTree = [{ 'folder1': [{ path: 'folder1/file1.md', status: ' ' }] }];
    let currentStore = createTestStore(initialState);
    const { rerender } = render(
      <Provider store={currentStore}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    await act(async () => {
      // Simulate dispatching setSearchQuery and the reducer updating the state
      const newStoreState = {
        fileTree: {
          ...initialState.fileTree,
          searchQuery: 'file1',
          filteredFileTree: updatedFileTree,
        },
      };
      currentStore = createTestStore(newStoreState);
      vi.spyOn(currentStore, 'dispatch'); // Re-spy on the new store's dispatch
      rerender(
        <Provider store={currentStore}>
          <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(currentStore.dispatch).toHaveBeenCalledWith(setExpandedNodes(['folder1']));
    });
  });

  test('hides search and tree content when closed', () => {
    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={false} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    expect(screen.queryByPlaceholderText('Search files...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-simple-tree-view')).not.toBeInTheDocument();
  });

  test('does not update expandedNodes when search query is empty', async () => {
    const updatedState = {
      fileTree: {
        ...initialState.fileTree,
        searchQuery: '',
        filteredFileTree: [{ 'folder1': [{ path: 'file1.md', status: ' ' }] }],
      },
    };
    store = createTestStore(updatedState);
    vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <FileTree onFileSelect={vi.fn()} isOpen={true} onToggle={vi.fn()} selectedFilePath={null} />
      </Provider>
    );

    // Simulate search query change to empty
    store.dispatch(setSearchQuery(''));

    await waitFor(() => {
      expect(store.dispatch).not.toHaveBeenCalledWith(setExpandedNodes([]));
    });
  });
});
