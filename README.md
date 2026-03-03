<h1 align="center">
  <img src="docs/images/logo.svg" alt="browsemark" width="400">
</h1>

<p align="center">
  <strong>Browse and annotate your markdown docs in the browser.</strong><br>
  Three-panel layout. Wiki-links. Live reload. AI annotation via MCP.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/browsemark"><img src="https://img.shields.io/npm/v/browsemark?label=npm&color=cb3837&logo=npm&logoColor=white" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D%2022-brightgreen?logo=node.js&logoColor=white" alt="Node.js >= 22">
  <img src="https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/tests-539%20passing-brightgreen" alt="Tests: 537 passing">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey" alt="Platform">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MCP-compatible-8B5CF6?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4=" alt="MCP Compatible">
  <img src="https://img.shields.io/badge/Wiki--links-supported-7C3AED" alt="Wiki-links Supported">
  <img src="https://img.shields.io/badge/zero%20config-npx-F97316" alt="Zero Config">
  <img src="https://img.shields.io/badge/fully%20local-no%20cloud-10B981" alt="Fully Local">
</p>

<p align="center">
  <img src="docs/images/screen_animation.gif" width="640" alt="browsemark demo — three-panel layout with file tree, markdown viewer, and document outline">
</p>

---

## Quick Start

> Requires **Node.js 22+** — [install it here](https://nodejs.org/) if you don't have it. No other setup needed.

```bash
npx browsemark docs/          # Your project docs
npx browsemark specs/         # Spec-driven development files
npx browsemark .              # Current directory
```

Opens `http://localhost:8521` in your browser.

---

## AI Annotation

Send feedback from your browser to your AI coding agent — no copy-paste.

**1. Browse your docs** (from Quick Start above)

**2. Connect your AI tool** — one-time setup, one command:

```bash
# Claude Code — no restart needed
claude mcp add browsemark -- npx agentation-mcp server --mcp-only --http-url http://localhost:4747
```

**3. Click any element** — headings, paragraphs, code blocks, list items — and add your comment. Your AI agent picks it up via MCP.

> Verify it works: ask your AI agent *"List my annotation sessions"* — if it responds, you're connected.

<p align="center">
  <img src="https://img.shields.io/badge/Claude%20Code-Works-D97706?style=for-the-badge" alt="Claude Code">
  <img src="https://img.shields.io/badge/Cursor-Works-D97706?style=for-the-badge" alt="Cursor">
  <img src="https://img.shields.io/badge/Codex%20CLI-Works-D97706?style=for-the-badge" alt="Codex CLI">
  <img src="https://img.shields.io/badge/Gemini%20CLI-Works-D97706?style=for-the-badge" alt="Gemini CLI">
  <img src="https://img.shields.io/badge/OpenCode-Works-D97706?style=for-the-badge" alt="OpenCode">
</p>

<p align="center">
  ...and should work with any tool that speaks <a href="https://modelcontextprotocol.io">MCP</a>.
</p>

<p align="center">
  <a href="docs/annotation-workflow.md">Setup guide for all supported tools →</a>
</p>

---

## Use Cases

| Workflow | What you get |
| -------- | ------------ |
| **Spec-driven development** | Browse the PRDs, design docs, and task files your AI agent works from |
| **Docs-as-code review** | Render and annotate your team's markdown documentation before merging |
| **RFC and ADR browsing** | Navigate RFCs and ADRs with wiki-link cross-references |
| **Any markdown directory** | Personal notes, blog drafts, README collections |

---

## Options

```bash
npx browsemark <directory> --host 0.0.0.0 --port 3000 --silent
```

| Option              | Description                                | Default        |
| ------------------- | ------------------------------------------ | -------------- |
| `<directory>`       | Path to serve                              | `.` (current)  |
| `--host`, `-H`      | Bind address                               | `localhost`    |
| `--port`, `-p`      | Listen port                                | `8521`         |
| `--silent`, `-s`    | Hide server logs                           |                |
| `--no-open`         | Skip automatic browser launch              |                |
| `--version`, `-V`   | Print version                              |                |
| `--help`, `-h`      | Show usage                                 |                |

---

## Documentation

| Guide | Description |
| ----- | ----------- |
| [Annotation Workflow](docs/annotation-workflow.md) | MCP setup for Claude Code, Cursor, Codex CLI, and more |
| [Markdown Features](docs/markdown-features.md) | Wiki-links, Mermaid, syntax highlighting, and rendering details |
| [API Reference](docs/api.md) | REST and WebSocket endpoints |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and fixes |
| [FAQ](docs/faq.md) | Frequently asked questions |

## Highlights

<table>
<tr>
<td width="50%" valign="top">

### 💬 AI Annotation
Click any element, add a comment, and your AI coding agent picks it up via MCP. No copy-paste.

</td>
<td width="50%" valign="top">

### 📝 Three-Panel Layout
File tree + rendered markdown + document outline — side by side, like an IDE.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔒 Fully Local
Everything runs on your machine. No cloud, no accounts, no data ever leaves your system. Localhost only.

</td>
<td width="50%" valign="top">

### 🔁 Live Reload
Edit a file in your editor, see it update in the browser instantly via WebSocket. No manual refresh.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔗 Wiki-Links
<code>[[links]]</code>, <code>[[links|display text]]</code>, <code>[[links#heading]]</code> — Obsidian-compatible resolution across your entire directory.

</td>
<td width="50%" valign="top">

### 📊 Mermaid Diagrams
Flowcharts, sequence diagrams, ERDs, and more — rendered inline.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎨 21 Themes
Light, dark, and auto mode. Custom fonts and syntax highlighting. Switch with one click.

</td>
<td width="50%" valign="top">

### ⚡ Zero Config
No build step. No deployment. No account. Just run:
<pre>npx browsemark docs/</pre>

</td>
</tr>
</table>

---

## Contributing

Contributions welcome — bugs, ideas, or code. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.
