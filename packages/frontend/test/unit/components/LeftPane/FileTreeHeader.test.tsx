import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import FileTreeHeader from '../../../../src/components/LeftPane/FileTreeHeader';

describe('FileTreeHeader', () => {
  test('renders correctly when open', () => {
    const { asFragment } = render(
      <FileTreeHeader
        isOpen={true}
        onToggle={vi.fn()}
        onExpandAllClick={vi.fn()}
        onCollapseAll={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByText('File Tree')).toBeInTheDocument();
    expect(screen.getByLabelText('expand all')).toBeInTheDocument();
    expect(screen.getByLabelText('collapse all')).toBeInTheDocument();
  });

  test('renders correctly when closed', () => {
    const { asFragment } = render(
      <FileTreeHeader
        isOpen={false}
        onToggle={vi.fn()}
        onExpandAllClick={vi.fn()}
        onCollapseAll={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(screen.queryByText('File Tree')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('expand all')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('collapse all')).not.toBeInTheDocument();
  });

  test('calls onToggle when toggle button is clicked', () => {
    const onToggleMock = vi.fn();
    render(
      <FileTreeHeader
        isOpen={true}
        onToggle={onToggleMock}
        onExpandAllClick={vi.fn()}
        onCollapseAll={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('ChevronLeftIcon'));
    expect(onToggleMock).toHaveBeenCalled();
  });

  test('calls onExpandAllClick when expand all button is clicked', () => {
    const onExpandAllClickMock = vi.fn();
    render(
      <FileTreeHeader
        isOpen={true}
        onToggle={vi.fn()}
        onExpandAllClick={onExpandAllClickMock}
        onCollapseAll={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('expand all'));
    expect(onExpandAllClickMock).toHaveBeenCalled();
  });

  test('calls onCollapseAll when collapse all button is clicked', () => {
    const onCollapseAllMock = vi.fn();
    render(
      <FileTreeHeader
        isOpen={true}
        onToggle={vi.fn()}
        onExpandAllClick={vi.fn()}
        onCollapseAll={onCollapseAllMock}
      />
    );
    fireEvent.click(screen.getByLabelText('collapse all'));
    expect(onCollapseAllMock).toHaveBeenCalled();
  });
});
