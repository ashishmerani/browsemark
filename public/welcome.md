# browsemark

Browse your codebase specs, PRDs, and docs in the browser. Zero config. Annotate and send structured feedback to your AI coding agent via MCP with a one-time setup.

---

## Quick start

```bash
npx browsemark <path-to-your-markdown-directory>
```

Open `http://localhost:8521` in your browser. That's it.

---

## What makes it different

**Three-panel layout** — file tree, rendered markdown, and document outline side by side. Browse your entire `docs/` or `specs/` folder like a docs site.

**Wiki-links** — `[[links]]`, `[[links|display text]]`, and `[[links#headings]]` resolve against your file tree automatically. Obsidian-compatible.

**Annotate with AI** — Select any rendered element and send structured feedback to your coding agent via MCP. No copy-paste. Quick one-time setup — see the [Annotation Workflow Guide](https://github.com/ashishmerani/browsemark/blob/main/docs/annotation-workflow.md) for your AI tool's config.

**Live reload** — Edit a file in your editor, see it update in the browser instantly.

**21 themes** — Light, dark, and auto mode. Customize fonts, syntax highlighting, and layout in Settings.

---

## Serve any directory

```bash
npx browsemark docs/              # Project documentation
npx browsemark specs/             # Spec-driven development files
npx browsemark .                  # Current directory
```

---

## Learn more

- [Documentation](https://github.com/ashishmerani/browsemark/tree/main/docs)
- [Annotation Setup Guide](https://github.com/ashishmerani/browsemark/blob/main/docs/annotation-workflow.md)
- [GitHub](https://github.com/ashishmerani/browsemark)
