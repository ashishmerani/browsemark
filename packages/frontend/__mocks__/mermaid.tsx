import { vi } from 'vitest';

const mermaid = {
  initialize: vi.fn(),
  render: vi.fn(() => Promise.resolve({ svg: '<svg></svg>' })),
};

export default mermaid;
