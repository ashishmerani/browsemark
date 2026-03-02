import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { useTheme } from '../../../src/hooks/useTheme';
import { createTestStore } from '../../utils';

describe('useTheme', () => {
  test('should return a light theme when darkMode is false', () => {
    const store = createTestStore({ appSetting: { darkMode: 'light' } });
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    expect(result.current.palette.mode).toBe('light');
    expect(result.current.palette.background.default).toBe('#f8fafb');
    expect(result.current.palette.background.paper).toBe('#f0f4f5');
  });

  test('should return a dark theme when darkMode is true', () => {
    const store = createTestStore({ appSetting: { darkMode: 'dark' } });
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    expect(result.current.palette.mode).toBe('dark');
    expect(result.current.palette.background.default).toBe('#0f1419');
    expect(result.current.palette.background.paper).toBe('#0a1014');
  });

  test('should return correct primary colors for each mode', () => {
    const lightStore = createTestStore({ appSetting: { darkMode: 'light' } });
    const { result: lightThemeResult } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <Provider store={lightStore}>{children}</Provider>,
    });
    expect(lightThemeResult.current.palette.primary.main).toBe('#0d9488');

    const darkStore = createTestStore({ appSetting: { darkMode: 'dark' } });
    const { result: darkThemeResult } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <Provider store={darkStore}>{children}</Provider>,
    });
    expect(darkThemeResult.current.palette.primary.main).toBe('#2dd4bf');
  });
});
