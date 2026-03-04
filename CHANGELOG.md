# Changelog

## 2.0.1 — 2026-03-03

Infrastructure and CI improvements.

- OIDC trusted publishing (replaces NPM_TOKEN)
- GitHub App token for release workflow (branch protection bypass)
- Gitleaks secret scanning in CI
- Aligned npm keywords with GitHub repo topics
- Merged Dependabot bumps: @typescript-eslint/eslint-plugin, @stylistic/eslint-plugin, @typescript-eslint/parser, @types/supertest
- Regenerated frontend lock file (fixes Dependabot CI failures)

## 2.0.0 — 2026-03-02

First npm publish. No feature changes from 1.0.0 — version jumped to 2.0.0 due to a failed workflow run that pushed a v1.0.0 tag before build validation.

- Published to npm with provenance (`npx browsemark`)
- Full README restored with dynamic npm badge
- SHA-pinned all GitHub Actions

## 1.0.0 — 2026-02-28

Initial public release.

- Three-panel layout: file tree, markdown viewer, document outline
- Wiki-link support: `[[links]]`, `[[link|display text]]`, `[[link#heading]]` (Obsidian-compatible)
- Mermaid and PlantUML diagram rendering
- KaTeX math formula rendering
- GitHub-style alerts (NOTE, WARNING, TIP, IMPORTANT, CAUTION)
- 21 color themes with dark/light/auto mode
- Configurable fonts (Inter + JetBrains Mono defaults)
- Syntax highlighting with customizable themes
- AI annotation via Agentation MCP — annotations flow to coding agents
- Live reload on file changes via WebSocket
- Path traversal protection on file-serving API endpoints
- `npx browsemark` — zero-install startup
