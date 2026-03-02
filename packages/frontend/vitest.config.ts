import { defineConfig } from 'vitest/config';
import path from 'path';

const mockDir = path.resolve(__dirname, '__mocks__');

export default defineConfig({
  resolve: {
    alias: {
      // Sub-path must come before the base path to match first
      'react-syntax-highlighter/dist/esm/styles/prism': path.join(mockDir, 'react-syntax-highlighter.tsx'),
      'react-syntax-highlighter': path.join(mockDir, 'react-syntax-highlighter.tsx'),
      'mermaid': path.join(mockDir, 'mermaid.tsx'),
      // Use devlop's production (no-op) build. Vitest resolves the "development"
      // conditional export which has strict assertions that react-markdown triggers
      // on empty strings. Jest resolved "default" (no-op). This matches Jest behavior.
      'devlop': path.resolve(__dirname, 'node_modules/devlop/lib/default.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    setupFiles: ['test/setupTests.ts'],
    css: false,
    // Inline devlop so Vite's resolve.alias applies to imports within node_modules
    // (pre-bundled deps use esbuild which doesn't see Vite aliases)
    server: {
      deps: {
        inline: ['devlop', 'react-markdown'],
      },
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
});
