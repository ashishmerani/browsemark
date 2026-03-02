---
title: API Reference
description: REST API endpoints and WebSocket interface for browsemark server
category: Documentation
tags:
  - api
  - endpoints
  - websocket
  - development
---

# API Reference

browsemark exposes HTTP endpoints and a WebSocket channel for reading files, managing settings, and receiving live-reload events. An embedded MCP server handles AI annotation — see the [Annotation Workflow Guide](annotation-workflow.md) for details.

## Base URL

Default: `http://localhost:8521` (configurable via `--port`)

## REST API Endpoints

### File Tree API

#### `GET /api/filetree`
Returns the sorted file tree for the served directory, including git status per file.

**Response:**
```json
{
  "fileTree": [...],
  "mountedDirectoryPath": "/path/to/directory"
}
```

### Markdown Content API

#### `GET /api/markdown/:path`
Returns raw markdown file content. The `:path` is the file path relative to the mounted directory.

**Response:** Raw file content as `text/plain`. The path is decoded, normalized, and validated against path traversal before serving.

**Error Responses:**
- `403 Forbidden` — path traversal attempt detected
- `404 Not Found` — file does not exist

### Outline API

#### `GET /api/outline?filePath=<file_path>`
Extracts headings from a markdown file and returns them as a flat list with levels and anchor IDs.

**Parameters:**
- `filePath` (required) — relative path to the markdown file

**Response:**
```json
[
  {
    "level": 1,
    "content": "Heading Text",
    "id": "heading-text"
  }
]
```

**Error Responses:**
- `400 Bad Request` — `filePath` query parameter is missing
- `403 Forbidden` — path traversal attempt detected

### Configuration API

#### `GET /api/config`
Reads the active theme, font, and syntax-highlighting preferences.

**Response:**
```json
{
  "fontFamily": "Inter",
  "fontFamilyMonospace": "JetBrains Mono",
  "fontSize": 16,
  "theme": "default",
  "syntaxHighlighterTheme": "auto"
}
```

#### `POST /api/config`
Merges the provided fields into the current configuration and saves to disk.

**Request Body:**
```json
{
  "fontFamily": "Arial",
  "fontSize": 18,
  "theme": "dark"
}
```

**Response:** `200 OK` — `Config saved`

### PlantUML API

#### `POST /api/plantuml/svg`
Generates an SVG image from PlantUML diagram source. **Requires Java** installed on the server (PlantUML runs via `node-plantuml-back`).

**Request Body:**
```json
{
  "diagram": "@startuml\nAlice -> Bob: Hello\n@enduml"
}
```

**Response:** SVG image with `Content-Type: image/svg+xml`.

**Error Responses:**
- `400 Bad Request` — `diagram` body parameter is missing

### Welcome Content API

#### `GET /api/markdown/browsemark-welcome.md`
Serves the built-in welcome page shown when no file is selected. Returned as `text/plain`.

## WebSocket Interface

### Connection
Open a WebSocket connection to the same host and port as the HTTP server (e.g. `ws://localhost:8521`).

### Messages

#### File Watching
To receive live reload events, tell the server which file you're viewing:

```json
{
  "type": "watch-file",
  "filePath": "relative/path/to/file.md"
}
```

#### Server Messages
Two event types are pushed from the server:

**Content reload** — when the currently watched file changes:
```json
{
  "type": "reload-content"
}
```

**Tree reload** — when a markdown file is added or removed from the directory:
```json
{
  "type": "reload-tree"
}
```

## Error Responses

Endpoints use conventional HTTP status codes:

- `200` — request succeeded
- `400` — a required field is absent (e.g. `filePath`, `diagram`)
- `403` — the requested path escapes the served directory
- `404` — no file at the given path
- `500` — unexpected server-side failure

Every non-200 response includes a plain-text body explaining what went wrong.

## Usage Examples

### Fetch File Tree
```bash
curl http://localhost:8521/api/filetree
```

### Get Markdown Content
```bash
curl http://localhost:8521/api/markdown/README.md
```

### Get Document Outline
```bash
curl "http://localhost:8521/api/outline?filePath=README.md"
```

### Generate PlantUML Diagram
```bash
curl -X POST http://localhost:8521/api/plantuml/svg \
  -H "Content-Type: application/json" \
  -d '{"diagram": "@startuml\nAlice -> Bob: Hello\n@enduml"}'
```

### Update Configuration
```bash
curl -X POST http://localhost:8521/api/config \
  -H "Content-Type: application/json" \
  -d '{"fontSize": 18, "theme": "dark"}'
```

## Notes

- All returned paths are relative to the directory you passed to `npx browsemark`
- The SPA handles WebSocket lifecycle internally — you only need the REST endpoints for scripting
- Settings persist to `~/.config/browsemark/config.json`
- No authentication is required — browsemark is intended for local use only