---
title: Mermaid Diagrams
description: Interactive diagrams with stable re-rendering
---

# Mermaid Diagrams

browsemark renders Mermaid diagrams inline. Navigate away from this page and come back — the diagrams re-render correctly every time.

## Flowchart

```mermaid
flowchart TD
    A[User opens directory] --> B{Has markdown files?}
    B -->|Yes| C[Render file tree]
    B -->|No| D[Show welcome page]
    C --> E[User clicks a file]
    E --> F[Render markdown]
    F --> G[Show document outline]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Browser
    participant Server
    participant FileSystem

    Browser->>Server: GET /api/filetree
    Server->>FileSystem: Read directory
    FileSystem-->>Server: File entries
    Server-->>Browser: Sorted file tree JSON

    Browser->>Server: GET /api/markdown/path
    Server->>FileSystem: Read .md file
    FileSystem-->>Server: Raw markdown
    Server-->>Browser: Markdown content
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Ready: Files loaded
    Loading --> Error: Read failed
    Ready --> Navigating: User clicks file
    Navigating --> Ready: Content rendered
    Ready --> Refreshing: File changed on disk
    Refreshing --> Ready: Live reload complete
```

## Pie Chart

```mermaid
pie title Example Directory Composition
    "Feature Demos" : 4
    "Sample Project" : 3
    "Getting Started" : 1
```

## See Also

- [[architecture]] — Mermaid diagrams in a real project context
- [[_getting-started|Getting Started]] — Feature overview
