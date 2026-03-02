vi.mock('../src/utils/logger', () => ({
  logger: {
    showLogo: vi.fn(),
    log: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('simple-git');
