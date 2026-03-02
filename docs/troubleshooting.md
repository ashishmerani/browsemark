---
title: Troubleshooting
description: Solutions for common browsemark issues
category: Documentation
tags:
  - troubleshooting
  - debugging
---

# Troubleshooting

## Installation & Startup

### npx not found

You need Node.js 18+ installed. Get it from [nodejs.org](https://nodejs.org/), then confirm:

```bash
node --version   # should be 18+
npm --version
```

### Port conflict on startup

If port 8521 is taken, pick another:

```bash
npx browsemark --port 3000
```

To see what's occupying the default port (macOS/Linux): `lsof -i :8521`

## Rendering

### Mermaid diagrams show as code

Ensure your code block uses the `mermaid` language identifier:

````
```mermaid
graph TD
    A --> B
```
````

Check that the diagram syntax itself is valid — browsemark passes it directly to Mermaid.js for client-side rendering.

### PlantUML diagrams show an error

PlantUML rendering requires Java installed on your machine. If Java is not available, `/api/plantuml/svg` returns a 500 error. Install a Java runtime (JDK or JRE) and restart browsemark.

## Configuration

### Settings don't persist

browsemark auto-creates `~/.config/browsemark/config.json` when saving settings. If writes fail, check that your user owns `~/.config/`:

```bash
ls -la ~/.config/
```

## Live Reload

### Changes not appearing

browsemark watches only the currently open file. If edits aren't reflected, refresh the page to re-establish the WebSocket connection, or restart browsemark.

## Annotation & MCP

### AI tool doesn't see annotations

1. Check terminal for "MCP HTTP server listening at http://localhost:4747"
2. Verify MCP config in your AI tool:
   - Claude Code: `claude mcp list` — look for `agentation` (browsemark's bundled MCP integration)
   - Cursor: Check `~/.cursor/mcp.json` or `.cursor/mcp.json`
   - VS Code: Command Palette → "MCP: List Servers"
3. **Restart your AI tool** after saving MCP config — most tools don't hot-reload MCP settings
4. Try `npx agentation-mcp doctor` to diagnose connectivity

### Port 4747 already in use

This is expected when another browsemark instance is already running. Annotations route through the existing MCP server — no action needed. To start fresh, stop all instances and restart.

### AI tool connects but won't invoke MCP tools

- Try being explicit: "Use the agentation_list_sessions tool to show my sessions"
- VS Code Copilot: Make sure you're in **Agent mode** (not just Chat mode)
- Windsurf: Cascade may detect tools but not invoke them — this is a known Windsurf limitation
- **Fallback:** Copy annotation output from the browser toolbar and paste directly into your AI tool's chat

## Still stuck?

1. See the [FAQ](faq.md) for common questions
2. Browse [existing issues](https://github.com/ashishmerani/browsemark/issues) for similar reports
3. File a bug report including: your OS, Node.js version (`node --version`), browsemark version (`npx browsemark --version`), reproduction steps, and any error output
