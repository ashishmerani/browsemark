import { act, render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../../utils';
import Outline from '../../../../src/components/RightPane/Outline';
import { fetchOutline } from '../../../../src/store/slices/outlineSlice';

vi.mock('../../../../src/store/slices/outlineSlice', async () => ({
  __esModule: true,
  ...(await vi.importActual('../../../../src/store/slices/outlineSlice')),
  fetchOutline: vi.fn(() => ({ type: 'test/outline/fetchOutline' })),
}));

describe('Outline', () => {
  let store;

  beforeEach(() => {
    store = createTestStore({
      outline: {
        outline: [{ id: 'title', content: 'Title', level: 1 }],
        loading: false,
        error: null,
      },
    });
    vi.spyOn(store, 'dispatch');
  });

  test('renders correctly', async () => {
    let asFragment;
    await act(async () => {
      const { asFragment: f } = render(
        <Provider store={store}>
          <Outline filePath="/test.md" onItemClick={vi.fn()} isOpen={true} onToggle={vi.fn()} />
        </Provider>
      );
      asFragment = f;
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test('dispatches fetchOutline on mount with correct filePath', () => {
    render(
      <Provider store={store}>
        <Outline filePath="/test.md" onItemClick={vi.fn()} isOpen={true} onToggle={vi.fn()} />
      </Provider>
    );
    expect(store.dispatch).toHaveBeenCalledWith(fetchOutline('/test.md'));
  });

  test('dispatches fetchOutline with null when filePath is null', () => {
    render(
      <Provider store={store}>
        <Outline filePath={null} onItemClick={vi.fn()} isOpen={true} onToggle={vi.fn()} />
      </Provider>
    );
    expect(store.dispatch).toHaveBeenCalledWith(fetchOutline(null));
  });

  test('calls onItemClick when an outline item is clicked', () => {
    const onItemClickMock = vi.fn();
    render(
      <Provider store={store}>
        <Outline filePath="/test.md" onItemClick={onItemClickMock} isOpen={true} onToggle={vi.fn()} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Title'));
    expect(onItemClickMock).toHaveBeenCalledWith('title');
  });

  test('displays loading spinner when outline is loading', () => {
    store = createTestStore({
      outline: {
        outline: [],
        loading: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <Outline filePath="/test.md" onItemClick={vi.fn()} isOpen={true} onToggle={vi.fn()} />
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('hides outline content when closed', () => {
    render(
      <Provider store={store}>
        <Outline filePath="/test.md" onItemClick={vi.fn()} isOpen={false} onToggle={vi.fn()} />
      </Provider>
    );

    expect(screen.queryByText('Title')).not.toBeInTheDocument();
  });

  test('displays error message when there is an error', () => {
    store = createTestStore({
      outline: {
        outline: [],
        loading: false,
        error: 'Failed to load outline',
      },
    });

    render(
      <Provider store={store}>
        <Outline filePath="/test.md" onItemClick={vi.fn()} isOpen={true} onToggle={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText('Error: Failed to load outline')).toBeInTheDocument();
  });
});
