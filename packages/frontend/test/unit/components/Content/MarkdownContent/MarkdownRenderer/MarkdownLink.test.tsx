import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createTestStore } from '../../../../../utils';
import MarkdownLink from '../../../../../../src/components/Content/MarkdownContent/MarkdownRenderer/MarkdownLink';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore({
    fileTree: {
      fileTree: [],
      loading: false,
    },
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

describe('MarkdownLink', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render correctly with no href', () => {
    const { getByTestId } = renderWithProviders(<MarkdownLink>Test Link</MarkdownLink>);
    expect(getByTestId('markdown-link')).toHaveTextContent('Test Link');
    expect(getByTestId('markdown-link').tagName).toBe('A');
    expect(getByTestId('markdown-link')).not.toHaveAttribute('href');
  });

  it('should render correctly with hash href', () => {
    const { getByTestId } = renderWithProviders(<MarkdownLink href="#section">Test Link</MarkdownLink>);
    expect(getByTestId('markdown-link')).toHaveAttribute('href', '#section');
  });

  it('should render correctly with external href', () => {
    const { getByTestId } = renderWithProviders(<MarkdownLink href="https://example.com">External Link</MarkdownLink>);
    expect(getByTestId('markdown-link')).toHaveAttribute('href', 'https://example.com');
    expect(getByTestId('markdown-link')).toHaveAttribute('target', '_blank');
    expect(getByTestId('markdown-link')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should navigate to internal link when clicked', () => {
    const { getByTestId } = renderWithProviders(
      <MarkdownLink href="/path/to/page" selectedFilePath="/current/file.md">Internal Link</MarkdownLink>
    );
    fireEvent.click(getByTestId('markdown-link'));
    expect(mockNavigate).toHaveBeenCalledWith('/path/to/page');
  });

  it('should resolve relative path correctly', () => {
    const { getByTestId } = renderWithProviders(
      <MarkdownLink href="../another.md" selectedFilePath="/current/dir/file.md">Relative Link</MarkdownLink>
    );
    fireEvent.click(getByTestId('markdown-link'));
    expect(mockNavigate).toHaveBeenCalledWith('/current/another.md');
  });

  it('should resolve wiki-link via file tree slug matching', () => {
    const store = createTestStore({
      fileTree: {
        fileTree: [
          { path: 'docs/my-page.md', status: ' ' },
          { path: 'notes/other.md', status: ' ' },
        ],
        loading: false,
      },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <MarkdownLink href="/my-page" selectedFilePath="/current.md">Wiki Link</MarkdownLink>
        </BrowserRouter>
      </Provider>
    );
    fireEvent.click(getByTestId('markdown-link'));
    expect(mockNavigate).toHaveBeenCalledWith('/docs/my-page.md');
  });

  it('should fall back to partial slug match when full slug not found', () => {
    const store = createTestStore({
      fileTree: {
        fileTree: [
          { 'deep': [{ path: 'deep/nested/target.md', status: ' ' }] },
        ],
        loading: false,
      },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <MarkdownLink href="/some/path/target" selectedFilePath="/current.md">Partial Match</MarkdownLink>
        </BrowserRouter>
      </Provider>
    );
    fireEvent.click(getByTestId('markdown-link'));
    expect(mockNavigate).toHaveBeenCalledWith('/deep/nested/target.md');
  });

  it('should handle null selectedFilePath gracefully', () => {
    const { getByTestId } = renderWithProviders(
      <MarkdownLink href="relative.md" selectedFilePath={null}>No Selection</MarkdownLink>
    );
    // With null selectedFilePath, non-protocol href is returned as-is
    expect(getByTestId('markdown-link')).toHaveAttribute('href', 'relative.md');
  });

  it('should treat protocol-relative URL as external link', () => {
    const { getByTestId } = renderWithProviders(
      <MarkdownLink href="//example.com/page" selectedFilePath="/current.md">Protocol Relative</MarkdownLink>
    );
    expect(getByTestId('markdown-link')).toHaveAttribute('href', '//example.com/page');
    expect(getByTestId('markdown-link')).toHaveAttribute('target', '_blank');
  });

  it('should resolve wiki-link in deeply nested folder structure', () => {
    const store = createTestStore({
      fileTree: {
        fileTree: [
          { 'a': [{ 'b': [{ 'c': [{ path: 'a/b/c/deep-file.md', status: ' ' }] }] }] },
        ],
        loading: false,
      },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <MarkdownLink href="/deep-file" selectedFilePath="/current.md">Deep Link</MarkdownLink>
        </BrowserRouter>
      </Provider>
    );
    fireEvent.click(getByTestId('markdown-link'));
    expect(mockNavigate).toHaveBeenCalledWith('/a/b/c/deep-file.md');
  });
});
