# CLAUDE.md

## Project

browsemark — browse and annotate rendered markdown from any local directory. Three-panel IDE-like interface (file tree + markdown viewer + document outline) with AI annotation support via Agentation MCP.

```
npm install -g browsemark    # or: npx browsemark <dir>
```

## Structure

Monorepo: Express 5 backend (`src/`, ~575 LOC (approximate)), React 19 SPA frontend (`packages/frontend/`, ~4K LOC (approximate)).

```
src/                          # Backend (Express 5, TypeScript)
  server/routes/              # API routes (filetree, markdown, outline, config, plantuml)
  server/server.ts            # HTTP + WebSocket + Agentation MCP server
packages/frontend/
  src/components/             # React components (Content, LeftPane, RightPane, SettingsDialog)
  src/plugins/                # remarkObsidianLinks.ts (custom wiki-link parser)
  src/store/                  # Redux Toolkit slices
example_documents/            # Default content shown when no directory is specified
docs/                         # User-facing documentation
```

## Commands

```bash
npm run build && npm run build:frontend    # Build both (required after code changes)
npm run dev                                # Dev mode (parallel watch)
npm run test && npm run test:frontend      # All tests
npm run lint && npm run lint:frontend      # All linting
```

`dist/` is gitignored — rebuild after clone or pull.

## Requirements

- Node.js 22+ (see `.nvmrc`)
- Tests: Vitest 4

## Architecture

- **API routes:** `/api/filetree`, `/api/markdown/:path`, `/api/outline`, `/api/config` (GET/POST), `/api/plantuml`, `*` (SPA catch-all)
- **Live reload:** WebSocket pushes `fileChanged` events via chokidar
- **Wiki-link resolution:** `MarkdownLink.tsx` walks the Redux file tree (`state.fileTree.fileTree`). Changes to the filetree API or Redux slice will break wiki-link resolution.
- **Annotations:** Embedded Agentation MCP server on port 4747

## Gotchas

- **`remark-obsidian` npm package is NOT browser-compatible** — it uses Node.js APIs (`path`, `url.fileURLToPath`). We use a custom plugin: `packages/frontend/src/plugins/remarkObsidianLinks.ts`
- **Mermaid re-render bug** — requires unique IDs (monotonic counter) and `mermaid.initialize()` before each render. See `MermaidRenderer.tsx`
- **Path traversal protection** on `/api/markdown/:path` — do not bypass or weaken
- **E2E test fixtures** in `test/fixtures/mountDirectory/dist/` are force-tracked (`git add -f`) — they bypass the `dist/` gitignore intentionally

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
