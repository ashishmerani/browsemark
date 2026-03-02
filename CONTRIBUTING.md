# Contributing to browsemark

We welcome contributions — whether that's reporting a bug, suggesting a feature, improving docs, or submitting code. browsemark is a browser-based markdown viewer with AI annotation support, and there's plenty of room to make it better.

## Getting Started

**Requires Node.js 22+** — [install it here](https://nodejs.org/) if you don't have it.

```bash
git clone https://github.com/ashishmerani/browsemark.git
cd browsemark
npm install
cd packages/frontend && npm install
cd ../..
npm run build && npm run build:frontend
```

browsemark is a TypeScript monorepo: the Express backend lives in `src/`, the React frontend in `packages/frontend/`.

### Development

```bash
npm run dev                # Parallel watch mode (backend + frontend)
npm run build && npm run build:frontend   # Full production build
```

### Testing

```bash
npm test && npm run test:frontend    # Run all tests
npm run lint && npm run lint:frontend  # Lint check
```

## How to Contribute

**Found a bug?** Open an issue with steps to reproduce. Include your Node.js version and OS.

**Have a feature idea?** Open an issue describing the use case and why it matters.

**Want to send a PR?** Run through this checklist first:

1. **Build passes:**
   ```
   npm run build && npm run build:frontend
   ```

2. **Tests pass:**
   ```
   npm test && npm run test:frontend
   ```

3. **Lint clean:**
   ```
   npm run lint && npm run lint:frontend
   ```

4. Each PR should address a single topic.
5. If your change affects user-facing behavior, update the relevant docs.
6. No secrets or personal paths in committed files.

## Philosophy

Guiding principles:

- **Local-first** — everything runs on your machine, no cloud, no accounts
- **Zero config** — `npx` and point at a directory, no build step or setup
- **AI annotation** — annotations flow to coding agents via MCP
- **Focused** — renders markdown with wiki-links, diagrams, and themes. Nothing more.

## Contact

Questions? Reach out to [@ashishmerani](https://github.com/ashishmerani).
