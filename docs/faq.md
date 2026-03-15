---
title: FAQ - Frequently Asked Questions
description: Common questions and answers about browsemark usage and features
category: Documentation
tags:
  - faq
  - help
  - troubleshooting
---

## What is browsemark?

browsemark is a local markdown viewer with built-in AI annotation. Point it at any directory and browse your docs in a three-panel layout (file tree, rendered markdown, document outline). Annotate rendered elements and send structured feedback to your AI coding agent via MCP.

## How is this different from tools like grip, markserv, or md-fileserver?

Those tools focus on rendering markdown. browsemark adds a three-panel layout (file tree, viewer, outline), wiki-link resolution, and AI annotation via MCP — so you can annotate rendered docs and send structured feedback directly to your coding agent. None of the others connect the reading experience to an AI workflow.

## Do I need to install it?

No installation is required. Run it instantly with [`npx`](https://docs.npmjs.com/cli/v10/commands/npx):

```bash
npx browsemark .
```

## Is it safe to use for private documentation?

Yes. browsemark only serves files from your local machine on `localhost`. Everything runs locally — no cloud, no accounts, no data leaves your system. If you change the host to be accessible over the network, browsemark has no authentication — do not expose it on a shared or public network.

## Can I customize the style or layout?

Yes. Click the gear icon in the header to open the settings dialog:

- **Layout**: Compact (centered) or full-width content
- **Color scheme**: 21 application themes with light/dark/auto mode
- **Syntax highlighting**: Multiple code themes (Atom Dark, VS Dark Plus, GHColors, etc.)
- **Fonts**: Custom font family, size, and monospace font for code blocks

Browser preferences (theme, layout, panel state) are saved to localStorage. Font and theme defaults are also saved to `~/.config/browsemark/config.json`. All settings persist across sessions.

## Does it support live reload?

Yes. Edit a markdown file in your editor and browsemark reloads the content in the browser automatically via WebSocket.

## What is MCP and why does browsemark include it?

MCP (Model Context Protocol) is an open standard that lets AI coding tools communicate with external services. browsemark includes an MCP server so that when you annotate rendered markdown in the browser, your AI tool (Claude Code, Cursor, Codex CLI, Gemini CLI, and OpenCode) can read and act on those annotations automatically. No copy-paste needed.

## Do I need MCP to use browsemark?

No. MCP annotation is entirely optional. browsemark works perfectly as a standalone markdown viewer without any MCP configuration. The annotation feature is there when you want it.

## How do I set up AI annotations?

browsemark starts the MCP server automatically — no extra steps for that part. You just need to tell your AI tool where to find it (a one-time config). See the [Annotation Workflow Guide](./annotation-workflow.md) for step-by-step instructions for Claude Code, Cursor, Codex, Gemini CLI, OpenCode, and more.