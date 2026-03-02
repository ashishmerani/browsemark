---
title: API Specification
description: REST API endpoints for the TaskFlow API
---

# TaskFlow — API Specification

> Part of the [[project-overview|TaskFlow PRD]]. See [[architecture]] for system design context.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All requests require an `X-API-Key` header:

```bash
curl -H "X-API-Key: tk_live_abc123" http://localhost:3000/api/v1/tasks
```

## Endpoints

### List Tasks

```
GET /tasks
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `open`, `in_progress`, `done`, `archived` |
| `priority` | integer | Filter by priority (0-3) |
| `limit` | integer | Results per page (default: 20, max: 100) |
| `offset` | integer | Pagination offset |

**Response:**

```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implement user authentication",
      "status": "in_progress",
      "priority": 0,
      "created_at": "2025-02-01T10:00:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### Create Task

```
POST /tasks
```

**Request body:**

```json
{
  "title": "Add rate limiting to API",
  "description": "Implement per-key rate limiting using Redis.\n\nSee [[architecture]] for Redis setup.",
  "status": "open",
  "priority": 1
}
```

> [!NOTE]
> Task descriptions support markdown, including wiki-links. When rendered in the dashboard, links resolve against the project's documentation.

### Update Task

```
PATCH /tasks/:id
```

**Request body** (partial update):

```json
{
  "status": "done",
  "priority": 0
}
```

### Delete Task

```
DELETE /tasks/:id
```

Returns `204 No Content` on success.

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task with id '...' not found"
  }
}
```

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 404 | `NOT_FOUND` | Resource does not exist |
| 429 | `RATE_LIMITED` | ==Too many requests== — retry after cooldown |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## WebSocket Events

Connect to `ws://localhost:3000/ws` with the API key as a query parameter:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws?key=tk_live_abc123');

ws.onmessage = (event) => {
  const { type, task } = JSON.parse(event.data);
  // type: "task.created" | "task.updated" | "task.deleted"
};
```

## See Also

- [[project-overview]] — Requirements and decision log
- [[architecture]] — System design and deployment
- [[_getting-started|Getting Started]] — Back to the example docs
