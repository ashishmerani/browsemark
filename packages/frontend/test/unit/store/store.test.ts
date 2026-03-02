import { saveAppSetting } from '../../../src/store/slices/appSettingSlice';

// We test loadState and the listener middleware by creating a real store
// Using dynamic import() because vi.resetModules() re-evaluates the module each time

describe('store', () => {
  let originalGetItem: typeof Storage.prototype.getItem;
  let originalSetItem: typeof Storage.prototype.setItem;

  beforeEach(() => {
    originalGetItem = Storage.prototype.getItem;
    originalSetItem = Storage.prototype.setItem;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
    vi.restoreAllMocks();
    document.body.removeAttribute('data-theme');
  });

  describe('loadState', () => {
    it('returns undefined when localStorage has no appSetting', async () => {
      Storage.prototype.getItem = vi.fn().mockReturnValue(null);

      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      const state = store.getState();
      expect(state.appSetting).toBeDefined();
      expect(state.appSetting.darkMode).toBeDefined();
    });

    it('loads valid JSON from localStorage into appSetting', async () => {
      const savedSetting = {
        darkMode: 'light',
        contentMode: 'full',
        fileTreeOpen: false,
        outlineOpen: false,
      };
      Storage.prototype.getItem = vi.fn().mockReturnValue(JSON.stringify(savedSetting));

      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      const state = store.getState();
      expect(state.appSetting.darkMode).toBe('light');
      expect(state.appSetting.contentMode).toBe('full');
    });

    it('returns undefined and logs error for invalid JSON', async () => {
      Storage.prototype.getItem = vi.fn().mockReturnValue('not valid json{{{');

      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      expect(console.error).toHaveBeenCalledWith(
        'Could not load state from localStorage',
        expect.any(Error),
      );
      expect(store.getState().appSetting).toBeDefined();
    });
  });

  describe('theme listener middleware', () => {
    it('sets data-theme to dark when darkMode is dark', async () => {
      Storage.prototype.getItem = vi.fn().mockReturnValue(null);
      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      store.dispatch(saveAppSetting({
        darkMode: 'dark',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      }));

      expect(document.body.getAttribute('data-theme')).toBe('dark');
    });

    it('sets data-theme to light when darkMode is light', async () => {
      Storage.prototype.getItem = vi.fn().mockReturnValue(null);
      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      store.dispatch(saveAppSetting({
        darkMode: 'light',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      }));

      expect(document.body.getAttribute('data-theme')).toBe('light');
    });

    it('uses matchMedia for auto mode', async () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      Storage.prototype.getItem = vi.fn().mockReturnValue(null);
      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      store.dispatch(saveAppSetting({
        darkMode: 'auto',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      }));

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(document.body.getAttribute('data-theme')).toBe('dark');
    });

    it('uses light theme for auto mode when prefers-color-scheme is light', async () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      Storage.prototype.getItem = vi.fn().mockReturnValue(null);
      vi.resetModules();
      const { store } = await import('../../../src/store/store');

      store.dispatch(saveAppSetting({
        darkMode: 'auto',
        contentMode: 'compact',
        fileTreeOpen: true,
        outlineOpen: true,
      }));

      expect(document.body.getAttribute('data-theme')).toBe('light');
    });
  });
});
