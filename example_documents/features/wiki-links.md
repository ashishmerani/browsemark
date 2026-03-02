---
title: Wiki-Links
description: Wiki-link syntax and resolution
---

# Wiki-Links

browsemark renders `[[wiki-links]]` (Obsidian-compatible syntax) as clickable navigation links. Links resolve against the file tree — click any link below to navigate.

## Basic Links

Link to a file by name: [[tables-and-alerts]]

The syntax is simple — wrap the filename in double brackets: `[[tables-and-alerts]]`

## Display Text

Show custom text with the pipe syntax: [[mermaid-diagrams|Mermaid diagram examples]]

Written as: `[[mermaid-diagrams|Mermaid diagram examples]]`

## Heading Links

Link to a specific heading: [[math-and-code#Inline Math]]

Written as: `[[math-and-code#Inline Math]]` — the heading is used for navigation, and the displayed text includes the hash (e.g., `math-and-code#Inline Math`).

## Cross-Referencing a Project

Wiki-links work across directories. Here are links into the sample project:

- [[project-overview]] — the project's main PRD
- [[architecture|Architecture spec]] — system design with Mermaid diagrams
- [[api-spec|API specification]] — endpoints and data models

## Back to Start

Return to [[_getting-started|Getting Started]] to explore other features.
