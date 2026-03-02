import { fetchData } from '../../src/api';

describe('fetchData', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('successful JSON response returns parsed object', async () => {
    const mockData = { key: 'value', nested: { a: 1 } };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchData('/api/test', 'json');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/test');
  });

  test('successful text response returns string', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('# Markdown content'),
    });

    const result = await fetchData<string>('/api/markdown/file.md', 'text');
    expect(result).toBe('# Markdown content');
  });

  test('HTTP 404 throws Error with status', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchData('/api/missing', 'json')).rejects.toThrow('HTTP error! status: 404');
  });

  test('HTTP 500 throws Error with status', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchData('/api/broken', 'json')).rejects.toThrow('HTTP error! status: 500');
  });

  test('network error re-throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchData('/api/offline', 'json')).rejects.toThrow('Failed to fetch');
  });

  test('console.error is called on failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(fetchData('/api/forbidden', 'json')).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching from /api/forbidden:',
      expect.any(Error)
    );
  });
});
