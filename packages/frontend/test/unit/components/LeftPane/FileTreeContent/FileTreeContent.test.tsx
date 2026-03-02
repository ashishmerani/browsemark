import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FileTreeContent from '../../../../../src/components/LeftPane/FileTreeContent/FileTreeContent';

vi.mock('@mui/x-tree-view', async () => ({
  ...(await vi.importActual<typeof import('@mui/x-tree-view')>('@mui/x-tree-view')),
  SimpleTreeView: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="mock-simple-tree-view" {...props}>
      {children}
    </div>
  ),
}));

describe('FileTreeContent', () => {
  const mockFileTree = [
    { 'folder1': [{ path: 'file1.md', status: ' ' }, { 'subfolder': [{ path: 'folder1/subfolder/file2.txt', status: ' ' }] }] },
    { path: 'file3.js', status: ' ' },
  ];

  test('renders loading spinner when loading is true', () => {
    render(
      <FileTreeContent
        filteredFileTree={[]} // Can be empty when loading
        loading={true}
        error={null}
        expandedNodes={[]}
        onFileSelect={vi.fn()}
        onExpandedItemsChange={vi.fn()}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error message when error is present', () => {
    render(
      <FileTreeContent
        filteredFileTree={[]} // Can be empty when error
        loading={false}
        error="Failed to load tree"
        expandedNodes={[]}
        onFileSelect={vi.fn()}
        onExpandedItemsChange={vi.fn()}
      />
    );
    expect(screen.getByText('Error: Failed to load tree')).toBeInTheDocument();
  });

  test('renders file tree correctly', () => {
    const { asFragment } = render(
      <FileTreeContent
        filteredFileTree={mockFileTree}
        loading={false}
        error={null}
        expandedNodes={['folder1']}
        onFileSelect={vi.fn()}
        onExpandedItemsChange={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file3.js')).toBeInTheDocument();
  });

  test('calls onFileSelect when a file is clicked', () => {
    const onFileSelectMock = vi.fn();
    render(
      <FileTreeContent
        filteredFileTree={mockFileTree}
        loading={false}
        error={null}
        expandedNodes={[]}
        onFileSelect={onFileSelectMock}
        onExpandedItemsChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('file3.js'));
    expect(onFileSelectMock).toHaveBeenCalledWith('file3.js');
  });

  test('calls onExpandedItemsChange when a folder is expanded/collapsed', () => {
    const onExpandedItemsChangeMock = vi.fn();
    render(
      <FileTreeContent
        filteredFileTree={mockFileTree}
        loading={false}
        error={null}
        expandedNodes={[]}
        onFileSelect={vi.fn()}
        onExpandedItemsChange={onExpandedItemsChangeMock}
      />
    );
    // Simulate expanding 'folder1'
    fireEvent.click(screen.getByText('folder1'));
    expect(onExpandedItemsChangeMock).toHaveBeenCalledWith(expect.any(Object), ['folder1']);
  });

  describe('git status colors', () => {
    const renderWithStatus = (status: string) => {
      const tree = [{ path: 'file.md', status }];
      return render(
        <FileTreeContent
          filteredFileTree={tree}
          loading={false}
          error={null}
          expandedNodes={[]}
          onFileSelect={vi.fn()}
          onExpandedItemsChange={vi.fn()}
        />
      );
    };

    test('file with status M (modified) renders with status indicator', () => {
      renderWithStatus('M');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    test('file with status A (added) renders with status indicator', () => {
      renderWithStatus('A');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    test('file with status D (deleted) renders with status indicator', () => {
      renderWithStatus('D');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    test('file with status R (renamed) renders with status indicator', () => {
      renderWithStatus('R');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      expect(screen.getByText('R')).toBeInTheDocument();
    });

    test('file with status C (copied) renders with status indicator', () => {
      renderWithStatus('C');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    test('file with status ? (untracked) renders with status indicator', () => {
      renderWithStatus('?');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    test('file with status " " (clean) does not show status indicator', () => {
      renderWithStatus(' ');
      expect(screen.getByText('file.md')).toBeInTheDocument();
      // FileTreeItemView only renders status Typography when status !== ' '
      // So no separate status badge element should exist
      const container = screen.getByText('file.md').closest('[class*="MuiBox"]');
      const typographies = container?.querySelectorAll('[class*="MuiTypography"]') ?? [];
      // Should only have the filename Typography, no status badge
      expect(typographies).toHaveLength(1);
    });
  });
});
