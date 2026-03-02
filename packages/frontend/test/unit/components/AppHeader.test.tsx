import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import AppHeader from '../../../src/components/AppHeader';
import { createTestStore } from '../../utils';

const defaultProps = {
  handleFileSelect: vi.fn(),
  onSettingsClick: vi.fn(),
  fileTreeOpen: true,
  outlineOpen: true,
  contentMode: 'compact' as const,
  onToggleFileTree: vi.fn(),
  onToggleOutline: vi.fn(),
  onToggleContentMode: vi.fn(),
};

describe('AppHeader', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    vi.spyOn(store, 'dispatch');
    defaultProps.handleFileSelect = vi.fn();
    defaultProps.onSettingsClick = vi.fn();
    defaultProps.onToggleFileTree = vi.fn();
    defaultProps.onToggleOutline = vi.fn();
    defaultProps.onToggleContentMode = vi.fn();
  });

  test('renders correctly', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <AppHeader {...defaultProps} />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('calls handleFileSelect when logo is clicked', () => {
    render(
      <Provider store={store}>
        <AppHeader {...defaultProps} />
      </Provider>
    );
    fireEvent.click(screen.getByText('browsemark'));
    expect(defaultProps.handleFileSelect).toHaveBeenCalledWith('');
  });

  test('calls onToggleFileTree when file tree toggle is clicked', () => {
    render(
      <Provider store={store}>
        <AppHeader {...defaultProps} />
      </Provider>
    );
    fireEvent.click(screen.getByLabelText('Toggle file tree'));
    expect(defaultProps.onToggleFileTree).toHaveBeenCalledTimes(1);
  });

  test('calls onToggleOutline when outline toggle is clicked', () => {
    render(
      <Provider store={store}>
        <AppHeader {...defaultProps} />
      </Provider>
    );
    fireEvent.click(screen.getByLabelText('Toggle outline'));
    expect(defaultProps.onToggleOutline).toHaveBeenCalledTimes(1);
  });

  test('toggle buttons render when panels are closed', () => {
    render(
      <Provider store={store}>
        <AppHeader {...defaultProps} fileTreeOpen={false} outlineOpen={false} />
      </Provider>
    );
    expect(screen.getByLabelText('Toggle file tree')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle outline')).toBeInTheDocument();
  });

  test('renders both ViewSidebarOutlined icons', () => {
    render(
      <Provider store={store}>
        <AppHeader {...defaultProps} />
      </Provider>
    );
    const sidebarIcons = screen.getAllByTestId('ViewSidebarOutlinedIcon');
    expect(sidebarIcons).toHaveLength(2);
  });

  test('renders vaultName when mountedDirectoryPath is set', () => {
    const storeWithPath = createTestStore({
      fileTree: { mountedDirectoryPath: '/home/user/my-vault' },
    });
    render(
      <Provider store={storeWithPath}>
        <AppHeader {...defaultProps} />
      </Provider>
    );
    expect(screen.getByText('my-vault')).toBeInTheDocument();
  });
});
