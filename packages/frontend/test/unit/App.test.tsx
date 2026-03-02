import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';
import { createTestStore } from '../utils';

vi.mock('@mui/material', async () => ({
  ...(await vi.importActual<typeof import('@mui/material')>('@mui/material')),
  CssBaseline: () => null, // Mock CssBaseline to render nothing
  AppBar: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>, // Mock AppBar
}));

vi.mock('@mui/x-tree-view', async () => ({
  ...(await vi.importActual<typeof import('@mui/x-tree-view')>('@mui/x-tree-view')),
  SimpleTreeView: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="mock-simple-tree-view" {...props}>
      {children}
    </div>
  ),
}));

// Mock the useFileTree hook
vi.mock('../../src/api', () => ({
  fetchData: vi.fn(() => Promise.resolve([])),
}));


describe('App', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      );
    });
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
