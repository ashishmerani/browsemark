import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';
import { useViewMode } from '../../../src/hooks/useViewMode';

// Mock useSearchParams from react-router-dom
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useSearchParams: vi.fn(),
}));

describe('useViewMode', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    mockSetSearchParams.mockClear();
  });

  test('should return "preview" by default when no tab param is present', () => {
    (useSearchParams as Mock).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('preview');
  });

  test('should return "frontmatter" when tab param is "frontmatter"', () => {
    const params = new URLSearchParams();
    params.set('tab', 'frontmatter');
    (useSearchParams as Mock).mockReturnValue([params, mockSetSearchParams]);
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('frontmatter');
  });

  test('should return "raw" when tab param is "raw"', () => {
    const params = new URLSearchParams();
    params.set('tab', 'raw');
    (useSearchParams as Mock).mockReturnValue([params, mockSetSearchParams]);
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('raw');
  });

  test('should return "invalid" when tab param is "invalid"', () => {
    const params = new URLSearchParams();
    params.set('tab', 'invalid');
    (useSearchParams as Mock).mockReturnValue([params, mockSetSearchParams]);
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('invalid');
  });
});
