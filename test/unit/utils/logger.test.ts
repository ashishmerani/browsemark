// Unmock logger (globally mocked in setupTests.ts)
vi.unmock('../../../src/utils/logger');

// Mock chalk to return identity functions (avoids ANSI in test output)
vi.mock('chalk', () => {
  const identity = (text: string) => text;
  return {
    __esModule: true,
    default: {
      hex: () => identity,
      bgGreen: { black: identity },
      bgCyan: { black: identity },
      bgBlue: { black: identity },
      bgYellow: { black: identity },
      bgMagenta: { black: identity },
      bgWhite: { black: identity },
      bgRed: { black: identity },
    },
  };
});

// Logger uses dynamic import('chalk').then().then() — multiple microtask ticks.
// vi.waitFor polls until the assertion passes (replaces setImmediate flush).

describe('logger', () => {
  let logger: typeof import('../../../src/utils/logger').logger;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Re-import to get fresh instance
    vi.resetModules();
    const mod = await import('../../../src/utils/logger');
    logger = mod.logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log()', () => {
    it('outputs to console.log with formatted tag and message', async () => {
      logger.log('Server', 'test message');
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
      const callArg = (console.log as Mock).mock.calls[0][0];
      expect(callArg).toContain('Server');
      expect(callArg).toContain('test message');
    });

    it('formats URLs with OSC 8 hyperlink sequences', async () => {
      logger.log('Server', 'Visit http://localhost:3000 for details');
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
      const callArg = (console.log as Mock).mock.calls[0][0];
      expect(callArg).toContain('\x1b]8;;http://localhost:3000\x1b\\');
    });

    it('passes additional args to console.log', async () => {
      logger.log('CLI', 'count:', 42);
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('CLI'),
          42,
        );
      });
    });
  });

  describe('error()', () => {
    it('outputs to console.error', async () => {
      logger.error('something went wrong');
      await vi.waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          expect.any(String),
          'something went wrong',
        );
      });
    });

    it('passes Error objects as additional args', async () => {
      const err = new Error('test error');
      logger.error('failure:', err);
      await vi.waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          expect.any(String),
          'failure:',
          err,
        );
      });
    });
  });

  describe('setSilent()', () => {
    it('suppresses log output when set to true', async () => {
      logger.setSilent(true);
      logger.log('Server', 'should not appear');
      // Give time for any async chain to complete, then assert NOT called
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('re-enables log output when set to false', async () => {
      logger.setSilent(true);
      logger.setSilent(false);
      logger.log('Server', 'should appear');
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
    });
  });

  describe('showLogo()', () => {
    it('outputs ANSI art to console.log', async () => {
      logger.showLogo();
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
    });

    it('logo contains product name', async () => {
      logger.showLogo();
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
      const output = (console.log as Mock).mock.calls[0][0].toLowerCase();
      expect(output).toContain('browsemark');
    });

    it('is suppressed when silent', async () => {
      logger.setSilent(true);
      logger.showLogo();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('tag colors', () => {
    it.each([
      'CLI', 'Server', 'Livereload', 'Announcement', 'Agentation',
    ] as const)('logs with %s tag without error', async (tag) => {
      logger.log(tag, 'test');
      await vi.waitFor(() => {
        expect(console.log).toHaveBeenCalled();
      });
    });
  });
});
