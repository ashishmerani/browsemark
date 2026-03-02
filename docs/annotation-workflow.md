# Annotation Workflow

browsemark includes [Agentation](https://agentation.dev/) for annotating rendered markdown directly in the browser. Annotations flow to your AI coding tool via MCP (Model Context Protocol).

## How It Works

```
1. Start browsemark        →  Server + Agentation HTTP server start automatically
2. Browse and annotate          →  Select text, add comments in the browser toolbar
3. AI tool picks up annotations →  Via MCP tools (one-time setup)
```

No separate installation needed. The annotation toolbar and backend are bundled in the npm package.

## Setup (One-Time)

Configure your AI tool to connect to the Agentation MCP server. This persists across sessions — you only do this once.

### <img src="images/logos/claude.svg" width="20" height="20" alt="Claude"> Claude Code (CLI & VS Code Extension)

MCP support is built-in. No extension or plugin needed.

```bash
# Global (all projects):
claude mcp add -s user agentation -- npx agentation-mcp server --mcp-only --http-url http://localhost:4747

# Or project-scoped (this repo only):
claude mcp add -s project agentation -- npx agentation-mcp server --mcp-only --http-url http://localhost:4747
```

The VS Code extension shares the same config — no separate setup needed.

Claude Code detects MCP changes automatically — no restart needed.

### <img src="images/logos/cursor.svg" width="20" height="20" alt="Cursor"> Cursor

MCP support is built-in. No extension or plugin needed.

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "agentation": {
      "command": "npx",
      "args": ["agentation-mcp", "server", "--mcp-only", "--http-url", "http://localhost:4747"]
    }
  }
}
```

After saving, restart Cursor or use Command Palette → "MCP: Restart Servers".

### <img src="images/logos/codex.svg" width="20" height="20" alt="Codex"> Codex CLI & VS Code Extension (OpenAI)

**Requires:** Node.js 18+, OpenAI account. Install: `npm install -g @openai/codex`

```bash
codex mcp add agentation -- npx agentation-mcp server --mcp-only --http-url http://localhost:4747
```

Config is saved to `~/.codex/config.toml`. The VS Code extension shares the same config — no separate setup needed.

Restart Codex CLI or the VS Code extension after adding the config.

### <img src="images/logos/gemini.svg" width="20" height="20" alt="Gemini"> Gemini CLI (Google)

**Requires:** Node.js 18+, Google account. Install: `npm install -g @google/gemini-cli`

Add to `~/.gemini/settings.json` (create the file if it doesn't exist):

```json
{
  "mcpServers": {
    "agentation": {
      "command": "npx",
      "args": ["agentation-mcp", "server", "--mcp-only", "--http-url", "http://localhost:4747"]
    }
  }
}
```

If the file already exists with other settings, add the `agentation` entry inside the existing `mcpServers` object.

Restart Gemini CLI after saving.

### VS Code (GitHub Copilot)

**Requires:** [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) installed and signed in. MCP is a Copilot feature, not available in bare VS Code.

Add to `.vscode/mcp.json` (workspace) or user settings:

```json
{
  "servers": {
    "agentation": {
      "command": "npx",
      "args": ["agentation-mcp", "server", "--mcp-only", "--http-url", "http://localhost:4747"]
    }
  }
}
```

**Note:** VS Code uses `"servers"` as the root key, not `"mcpServers"`.

After saving, restart VS Code or use Command Palette → "Developer: Reload Window". Verify via Command Palette → "MCP: List Servers". Use Copilot Chat in **Agent mode** to access MCP tools.

### Windsurf

MCP support is built-in via Cascade. No extension needed.

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "agentation": {
      "command": "npx",
      "args": ["agentation-mcp", "server", "--mcp-only", "--http-url", "http://localhost:4747"]
    }
  }
}
```

Or add via Windsurf Settings → Cascade → MCP Servers. Restart Windsurf after adding.

### <img src="images/logos/opencode.svg" width="20" height="20" alt="OpenCode"> OpenCode

**Requires:** Node.js 18+. Install: see [opencode.ai](https://opencode.ai)

Add to `opencode.json` (project root) or global config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "agentation": {
      "type": "remote",
      "url": "http://localhost:4747/mcp",
      "enabled": true
    }
  }
}
```

OpenCode supports remote MCP servers natively — no stdio wrapper needed.

### Other MCP-Compatible Tools

Any tool that supports MCP can connect using the same command pattern. The core config is always:

```
command: npx
args: agentation-mcp server --mcp-only --http-url http://localhost:4747
```

See the [MCP clients registry](https://modelcontextprotocol.io/clients) for 70+ compatible tools.

## Verify It Works

After configuring your AI tool:

1. **Restart your AI tool** (or restart MCP servers if your tool supports it)
2. Ask your AI tool: *"List my annotation sessions"*
3. Expected response: The tool calls `agentation_list_sessions` and returns session data (or an empty list if you haven't annotated yet)

If the tool doesn't respond or says the tool is unavailable, see [Troubleshooting](./troubleshooting.md#annotation--mcp).

**Copy-paste fallback:** If your AI tool can't connect via MCP, you can copy annotation text from the browser toolbar and paste it directly into your AI tool's chat.

## Compatibility

Tested with the following tools (as of browsemark v1.0.0):

| Tool | Status | Notes |
|------|--------|-------|
| Claude Code (CLI + VS Code) | Works | Full tool invocation |
| Cursor | Works | Full tool invocation |
| Codex CLI + VS Code (OpenAI) | Works | Full tool invocation |
| Gemini CLI (Google) | Works | Full tool invocation |
| OpenCode | Works | Full tool invocation via remote MCP |
| VS Code + GitHub Copilot | Partial | MCP server detected; tool invocation inconsistent |
| Windsurf (Cascade) | Partial | Tools visible in UI; Cascade may not invoke them |

## Using Annotations

### Level 1: Ask Your AI Tool (Default)

Once connected, just ask naturally:

```
You:    "What annotations do I have?"
AI:     [calls agentation_get_all_pending → shows results]

You:    "Review my feedback on the API spec"
AI:     [calls agentation_get_session → processes annotations]
```

No special commands needed. The AI tool has access to these MCP tools:

| Tool | Purpose |
|------|---------|
| `agentation_list_sessions` | See which pages have annotations |
| `agentation_get_session` | Get all annotations for a page |
| `agentation_get_pending` | Get unacknowledged annotations for a page |
| `agentation_get_all_pending` | Get all unaddressed annotations across all pages |
| `agentation_acknowledge` | Mark an annotation as seen |
| `agentation_resolve` | Mark as addressed (with optional summary) |
| `agentation_dismiss` | Reject with reasoning |
| `agentation_reply` | Add a threaded response |
| `agentation_watch_annotations` | Block and wait for new annotations |

### Level 2: Watch Mode (Power Users)

For continuous monitoring during an active session:

```
You:    "Watch for my annotations"
AI:     [calls agentation_watch_annotations — blocks, waits]
        [you annotate in browser]
AI:     [receives batch → acknowledges → processes → resolves → loops]
```

The AI loops automatically until you stop it. Useful when you're annotating in one window and want the AI to pick up feedback in real time.

### Level 3: Fully Automatic (Future)

The MCP specification supports push notifications (`resources/subscribe`), but most AI tools haven't implemented this yet. When they do, annotations will flow automatically without any prompt. We're watching this at [MCP Discussion #1192](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192).

## Troubleshooting

**Annotations not appearing?**
- Verify browsemark is running: check for "MCP HTTP server listening at http://localhost:4747" in logs
- Verify MCP is configured: in Claude Code, run `claude mcp list` and check for `agentation`
- Try `npx agentation-mcp doctor` to diagnose connectivity

**Resolved annotations still showing markers?**
- This is an upstream Agentation issue — resolved annotations may continue showing markers in the browser until the page is refreshed

**Port 4747 in use?**
- If another instance of browsemark is already running, annotations route through the existing server
- The second instance logs "Port 4747 in use" and continues normally

**Tool not calling MCP tools?**
- Some AI tools (e.g., GitHub Copilot, Windsurf Cascade) may connect to the MCP server but not invoke tools when asked naturally. Try being explicit: "Use the agentation_list_sessions tool to show my sessions"
- If the tool still won't invoke, use the copy-paste fallback below

**Copy-paste fallback:**
- If MCP isn't configured or your tool won't invoke MCP tools, you can still copy annotation output from the browser and paste it into your AI tool
