const simpleGit = vi.fn(() => ({
  status: vi.fn(() =>
    Promise.resolve({
      files: [
        { path: 'another.md', index: ' ', working_dir: ' ' },
        { path: 'nested/nested.md', index: ' ', working_dir: ' ' },
        { path: 'test.md', index: ' ', working_dir: ' ' },
      ],
    }),
  ),
  checkIsRepo: vi.fn(() => Promise.resolve(true)),
}));

export default simpleGit;
