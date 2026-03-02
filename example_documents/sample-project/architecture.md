---
title: Architecture
description: System design for the TaskFlow API
---

# TaskFlow — Architecture

> Part of the [[project-overview|TaskFlow PRD]]. This document covers system design, component interactions, and data flow.

## System Overview

```mermaid
flowchart TB
    subgraph Clients
        CLI[CLI Client]
        Web[Dashboard UI]
        Hook[Git Hooks]
    end

    subgraph API["API Server"]
        Router[Express Router]
        Auth[Auth Middleware]
        WS[WebSocket Server]
    end

    subgraph Storage
        DB[(PostgreSQL)]
        Cache[(Redis Cache)]
    end

    CLI --> Router
    Web --> Router
    Hook --> Router
    Router --> Auth
    Auth --> DB
    Auth --> Cache
    WS --> Web
    DB --> WS
```

## Component Breakdown

### API Server

The Express application handles REST requests and WebSocket connections:

| Component | Responsibility |
|-----------|---------------|
| Router | Route matching, request validation |
| Auth Middleware | API key verification, rate limiting |
| Task Controller | CRUD operations, business logic |
| WebSocket Server | Push notifications on task changes |

### Data Layer

PostgreSQL with the following schema approach:

```sql
CREATE TABLE tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT CHECK (status IN ('open', 'in_progress', 'done', 'archived')),
    priority    INTEGER DEFAULT 0,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Auth as Auth Middleware
    participant DB as PostgreSQL

    Client->>Auth: Request + API Key header
    Auth->>DB: Look up API key
    DB-->>Auth: User record (or null)
    alt Valid key
        Auth->>Client: Continue to handler
    else Invalid key
        Auth->>Client: 401 Unauthorized
    end
```

## Key Decisions

- ==PostgreSQL over SQLite== — concurrent access needed for multi-user scenarios. See decision log in [[project-overview]].
- ==Redis for caching== — API key lookups cached for 5 minutes to reduce DB load.
- ==WebSocket over polling== — real-time updates for the dashboard without polling overhead.

## Deployment

```mermaid
flowchart LR
    subgraph Production
        LB[Load Balancer] --> A1[API Instance 1]
        LB --> A2[API Instance 2]
        A1 --> PG[(PostgreSQL)]
        A2 --> PG
        A1 --> RD[(Redis)]
        A2 --> RD
    end
```

## See Also

- [[project-overview]] — Requirements and timeline
- [[api-spec]] — Endpoint specifications
- [[_getting-started|Getting Started]] — Back to the example docs
