---
title: Tables and Alerts
description: GFM tables and GitHub-style alert callouts
---

# Tables and Alerts

browsemark supports GitHub Flavored Markdown tables with alignment and GitHub-style alert callouts.

## Tables

### Project Status

| Component | Status | Owner | Priority |
|:----------|:--------------:|--------------:|:--------:|
| Backend API | ==Complete== | Alice | P0 |
| Auth module | In Progress | Bob | P0 |
| CLI client | Planned | Charlie | P1 |
| Dashboard | Not Started | — | P2 |

### Column Alignment

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Content | Content | Content |
| More | More | More |
| Data | Data | Data |

## Alerts

GitHub-style alert callouts render with distinct styling:

> [!NOTE]
> Wiki-links resolve against the file tree in the sidebar. If a link target doesn't match any file, it renders as plain text.

> [!TIP]
> Use the document outline panel (right side) to jump between sections in long documents.

> [!IMPORTANT]
> Files prefixed with `_` sort to the top of the file tree. Files prefixed with `zz_` sort to the bottom.

> [!WARNING]
> The `![[embed]]` syntax is not yet supported. Embedded note references render as raw text.

> [!CAUTION]
> browsemark serves files over localhost. Do not expose it to the public internet without additional security measures.

## See Also

- [[math-and-code]] — Math formulas and code blocks
- [[_getting-started|Getting Started]] — Feature overview
