+++
date = '2026-05-04T12:00:00+10:00'
draft = false
title = 'OpenCode'
tags = ['AI', 'Coding Agent', 'Open Source', 'CLI', 'LLM']
summary = "Reference for OpenCode — the open-source AI coding agent with multi-provider support, agentic workflows, LSP integration, and session management."
+++

---

## Introduction

OpenCode is an open-source AI coding agent that runs in your terminal, IDE, or desktop app. It is provider-agnostic — you can bring your own model from 75+ providers including Claude, GPT, Gemini, and local models via Ollama — or use the included free models via Zen.

- **GitHub:** [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode) — 160K+ stars, 900+ contributors
- **Website:** [opencode.ai](https://opencode.ai)
- **Install:** `npm i -g opencode-ai@latest` or `brew install anomalyco/tap/opencode`

---

## Installation

```bash
# curl (Linux/macOS)
curl -fsSL https://opencode.ai/install | bash

# npm
npm i -g opencode-ai@latest

# macOS/Linux (anomalyco tap — always up to date)
brew install anomalyco/tap/opencode

# macOS/Linux (official formula — updated less frequently)
brew install opencode

# Windows (Scoop)
scoop bucket add extras; scoop install extras/opencode

# Windows (Chocolatey)
choco install opencode

# Arch Linux (stable)
sudo pacman -S opencode

# Arch Linux (latest from AUR)
paru -S opencode-bin

# Any OS (mise)
mise use -g opencode

# Bun
bun install -g opencode-ai
```

**Authentication:**

```bash
# Use Zen (free curated models, no config needed)
opencode

# GitHub Copilot or ChatGPT Plus/Pro (use existing subscription)
opencode auth login

# Custom provider API key
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
opencode
```

---

## Core Concepts

### Agent Loop
OpenCode implements a continuous agent loop:
1. **Receive prompt** — user input, conversation history, tool definitions
2. **Plan** — the model reasons about what to do
3. **Execute** — tools run (file ops, bash, search, web)
4. **Observe** — results are fed back to the model
5. **Repeat** — until the task is complete

### Multi-Agent Architecture
OpenCode uses a multi-agent system with two primary built-in agents, switchable with the `Tab` key:
- **Plan mode** — read-only agent for analysis and code exploration
- **Build mode** — default, full-access agent for development work

A general-purpose subagent is also included for complex searches and multi-step tasks. It is used internally and can be invoked with `@general` in messages.

### Sessions
Every conversation is a persistent session stored in SQLite. Sessions can be:
- **Resumed** — pick up exactly where you left off
- **Shared** — generate a share link for debugging or reference
- **Forked** — explore alternatives without losing the original thread

```bash
# List all sessions
opencode session list

# Resume the most recent session
opencode --continue
# or shorthand
opencode -c

# Resume a specific session by ID (IDs shown by session list)
opencode --continue <session-id>
```

### Context Management
- **Automatic compaction** — when context nears the window limit, older history is summarized
- **Prompt caching** — static content (system prompt, tool definitions) is prompt-cached across turns
- **LSP integration** — automatically loads the right language servers to provide accurate code context

---

## Tools

OpenCode ships with built-in tools that the agent uses autonomously:

| Category | Tool | What It Does |
|---|---|---|
| **File** | `Read` | Read files in the working directory |
| | `Write` | Create or overwrite files |
| | `Edit` | Make precise edits to existing files |
| | `Glob` | Find files by pattern |
| | `Grep` | Search file contents with regex |
| **Execution** | `Bash` | Run shell commands, scripts, git |
| | `Process` | Manage background processes (list, poll, log, kill) |
| **Web** | `WebSearch` | Search the web |
| | `WebFetch` | Fetch and parse web pages |
| **Agent** | `Agent` | Spawn subagents for delegation |
| **Tool** | `Skill` | Load domain-specific skill instructions |
| | `ToolSearch` | Dynamically discover tools |
| **Planning** | `TodoWrite` | Maintain structured task lists |

---

## CLI Usage

```bash
# Start an interactive session
opencode

# Run a one-shot prompt (non-interactive/scripting mode)
opencode run "Refactor the auth module to use JWT"

# Attach a file to the prompt
opencode run --file path/to/file.py "Review this file"

# Name a session (useful for automation workflows)
opencode run --title "Payment API refactor" "Refactor the payment processing module"

# Run with specific provider/model
opencode --provider openai --model gpt-4o run "Write tests for api.py"

# Run in a specific directory
opencode run --workdir /path/to/project "Fix the lint errors"

# Resume the most recent session
opencode --continue

# Start headless HTTP server (OpenAPI)
opencode serve

# Start headless server with built-in web UI
opencode web

# Refresh available model list
opencode models --refresh

# View token and cost stats
opencode stats

# Use a specific MCP configuration
opencode run --mcp mcp.json "Query the database"
```

### CLI Flags

| Flag | Description |
|---|---|
| `--provider` | LLM provider to use |
| `--model` | Model name |
| `--workdir` | Working directory |
| `--continue` / `-c` | Resume most recent (or specified) session |
| `--title` | Set a name for the session (non-interactive mode) |
| `--file` | Attach a file to the prompt |
| `--pty` | Enable PTY for interactive TUI |
| `--timeout` | Max execution time |
| `--background` | Run as background session |

---

## TUI, Slash Commands & Shortcuts

### TUI Overview
Running `opencode` in a project directory launches the Terminal User Interface (TUI) — a chat-like interface with full project context. The TUI provides three primary interaction methods: **slash commands**, **command palette**, and **keyboard shortcuts**.

```
cd /path/to/project
opencode
```

### Built-in Slash Commands
Type `/` in the TUI prompt to see the autocomplete list. Here are all available commands:

| Command | Alias | Action |
|---|---|---|
| `/init` | — | Create or update `AGENTS.md` with project analysis |
| `/connect` | — | Add an LLM provider (select and paste API key) |
| `/models` | — | List and switch available models |
| `/sessions` | `/resume`, `/continue` | List and switch between saved sessions |
| `/new` | `/clear` | Start a fresh session |
| `/undo` | — | Revert last message and all file changes |
| `/redo` | — | Restore a previously undone message and file changes |
| `/compact` | `/summarize` | Manually compact context by summarizing older history |
| `/share` | — | Create a public shareable link to the current session |
| `/unshare` | — | Remove sharing from the current session |
| `/export` | — | Export conversation to Markdown and open in editor |
| `/editor` | — | Open external editor to compose a message |
| `/theme` | — | List and switch TUI color themes |
| `/thinking` | — | Toggle display of AI reasoning/thinking blocks |
| `/details` | — | Toggle visibility of tool execution details |
| `/help` | — | Show the help dialog |
| `/exit` | `/quit`, `/q` | Exit OpenCode |

### Custom Commands
Define your own slash commands as Markdown files in `.opencode/commands/`:

`.opencode/commands/review.md`:
```markdown
---
description: Review recent changes
agent: plan
---
Review the recent git changes and suggest improvements:

!`git log --oneline -10`
```

Type `/review` in the TUI to run it. Supports:
- **Arguments** — `$ARGUMENTS`, `$1`, `$2`, etc.
- **Shell output** — `` !`command` `` injects bash output into the prompt
- **File references** — `@path/to/file` includes file content

### File References with `@`
Reference files in messages using `@` for fuzzy file search:

```
How is auth handled in @packages/functions/src/api/index.ts?
```

The file content is added to the conversation automatically. Configured references also appear in autocomplete — type `@alias/` to browse files.

### Bash Commands with `!`
Start a message with `!` to run a shell command inline:

```
!npm test
```

The command output is added to the conversation as a tool result.

### Keyboard Shortcuts (Keybinds)

OpenCode uses a **leader key** (default `Ctrl+X`) for many shortcuts. Press the leader, then the action key.

| Shortcut | Action |
|---|---|
| `Tab` / `Shift+Tab` | Cycle agent modes (plan → build) |
| `Ctrl+T` | Cycle model variants |
| `F2` / `Shift+F2` | Cycle recent models |
| `Ctrl+P` | Open command palette |
| `Ctrl+X` `n` | New session |
| `Ctrl+X` `l` | List sessions |
| `Ctrl+X` `c` | Compact session |
| `Ctrl+X` `u` | Undo last message |
| `Ctrl+X` `r` | Redo last undo |
| `Ctrl+X` `e` | Open editor |
| `Ctrl+X` `x` | Export session |
| `Ctrl+X` `s` | View status |
| `Ctrl+X` `m` | List models |
| `Ctrl+X` `t` | List themes |
| `Ctrl+X` `a` | List agents |
| `Ctrl+X` `b` | Toggle sidebar |
| `Ctrl+X` `q` | Exit OpenCode |
| `Ctrl+X` `h` | Toggle tips |
| `Ctrl+X` `y` | Copy message |
| `Escape` | Interrupt current response |
| `PageUp` / `PageDown` | Scroll messages |
| `Ctrl+G` / `Home` | Jump to top |
| `Ctrl+Alt+G` / `End` | Jump to bottom |
| `Ctrl+A` / `Ctrl+E` | Line start / end (input) |
| `Ctrl+U` / `Ctrl+K` | Delete to line start / end |
| `Ctrl+W` / `Alt+D` | Delete previous / next word |
| `Ctrl+D` | Delete character under cursor |
| `y` / `n` | Allow / Deny permission prompt |
| `a` | Always allow (current session) |

### Configuring Keybinds
Customize shortcuts in `opencode.json` (or a dedicated `tui.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "keybinds": {
    "leader": "ctrl+x",
    "session_new": "<leader>n",
    "session_list": "<leader>l",
    "app_exit": "ctrl+c,ctrl+d,<leader>q"
  }
}
```

Disable any keybind by setting it to `"none"`. Multiple bindings per action use comma separation or arrays.

### TUI Config
TUI behaviour is configured under the `tui` key in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": { "enabled": true },
    "diff_style": "auto"
  },
  "attention": {
    "enabled": true,
    "notifications": true,
    "sound": true,
    "volume": 0.4,
    "sound_pack": "opencode.default"
  }
}
```

The `attention` block enables desktop notifications and sounds for questions, permissions, errors, and session completions when the terminal is blurred.

---

## Provider Support

OpenCode supports **75+ LLM providers**, including:

| Provider | How to Connect |
|---|---|
| **Zen (free)** | No config — included out of the box |
| **OpenAI** | `OPENAI_API_KEY` |
| **Anthropic** | `ANTHROPIC_API_KEY` |
| **Google Gemini** | `GEMINI_API_KEY` |
| **GitHub Copilot** | `opencode auth login` |
| **ChatGPT Plus/Pro** | `opencode auth login` |
| **AWS Bedrock** | AWS credentials |
| **Ollama (local)** | Local Ollama instance |
| **OpenRouter** | `OPENROUTER_API_KEY` |
| **Groq** | `GROQ_API_KEY` |

You can also use local models with full agentic capabilities via Ollama — no API costs, fully offline.

---

## MCP (Model Context Protocol)

OpenCode supports MCP servers for connecting to external systems — databases, browsers, APIs, and custom tooling. Both local (stdio-based) and remote (HTTP-based) MCP servers are supported. The MCP ecosystem available to OpenCode users includes over 1,200 servers.

```json
{
  "mcp": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./data.db"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/share"]
    }
  }
}
```

Use `opencode run --mcp mcp.json` to load MCP servers, or configure them in your project's `opencode.json`.

---

## HTTP Server

OpenCode's client/server architecture means even the TUI is just a client talking to a local server. You can run the server standalone for programmatic access or to support remote clients (e.g. a mobile app driving a session running on your machine).

```bash
# Headless HTTP server (OpenAPI)
opencode serve

# Headless server + built-in web UI
opencode web

# With explicit host and port
opencode serve --hostname 0.0.0.0 --port 4096

# Password-protect the server
OPENCODE_SERVER_PASSWORD=secret opencode serve
```

The server exposes an OpenAPI 3.1 spec at `/doc` (e.g. `http://localhost:4096/doc`), which can be used to generate typed clients or explore the API in a Swagger UI. When you run `opencode` normally, a TUI and a server both start — the TUI is simply a client of that server.

Server settings can also be configured in `opencode.json`:

```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "mdnsDomain": "myproject.local",
    "cors": ["http://localhost:5173"]
  }
}
```

`mdns` enables mDNS service discovery so other devices on the local network can find your OpenCode server automatically.

---

## ACP (Agent Client Protocol)

OpenCode supports ACP — an open JSON-RPC standard introduced by Zed that allows code editors and IDEs to connect to AI coding agents over stdio. This is the protocol that enables native IDE integrations (Zed, JetBrains, etc.) to drive OpenCode as a subprocess rather than each editor needing a bespoke integration.

ACP is configured separately from the HTTP server. See [opencode.ai/docs](https://opencode.ai/docs) for client-specific setup instructions.

---

## GitHub Actions Integration

OpenCode can be used directly in GitHub issues and pull requests via the `opencode-agent` GitHub App.

Install the app on your repository, then add a workflow file:

```yaml
# .github/workflows/opencode.yml
on:
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]
```

OpenCode will automatically review PRs when opened/updated, triage issues, and respond to `@opencode` mentions in comments. Per-tool permission settings apply just as they do locally.

---

## Desktop App

OpenCode's desktop app (beta) is available for macOS, Windows, and Linux. It provides:
- Native OS integration
- Desktop notifications
- Persistent background sessions
- Visual session management

```bash
# macOS (Homebrew Cask)
brew install --cask opencode-desktop

# Windows (Scoop)
scoop bucket add extras; scoop install extras/opencode-desktop
```

Or [download directly from opencode.ai/download](https://opencode.ai/download).

---

## Configuration

OpenCode is configured via `opencode.json` or `opencode.jsonc` in the project root. Configuration files are **merged**, not replaced, in this precedence order (highest wins): project config → global config (`~/.config/opencode/opencode.json`) → remote org config.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true,
  "permission": {
    "edit": "ask",
    "bash": "ask"
  },
  "mcp": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Key Config Options

| Option | Type | Description |
|---|---|---|
| `model` | string | Provider/model string, e.g. `"anthropic/claude-sonnet-4-5"` |
| `permission` | object | Per-tool approval rules (`"ask"`, `"allow"`, `"deny"`) |
| `mcp` | object | MCP server connections |
| `agent` | object | Custom agent/subagent definitions |
| `lsp` | object | LSP server configuration |
| `server` | object | HTTP server settings (port, hostname, mDNS, CORS) |
| `tui` | object | TUI behaviour (scroll speed, diff style) |
| `systemPrompt` | string | Append to base system prompt |
| `autoupdate` | boolean | Auto-update OpenCode on launch |
| `shell` | string | Shell used for Bash tool and terminal |

Organizations can provide default configuration via a `.well-known/opencode` endpoint, which is fetched automatically when authenticating with a supporting provider. Remote config is the base layer; global and project configs override it.

---

## Subagents

Subagents let the main agent delegate focused subtasks to fresh agent instances. Each starts with a clean context; only the final result returns to the parent.

Subagents can be defined in `opencode.json`:

```jsonc
{
  "agent": {
    "code-reviewer": {
      "description": "Expert code reviewer",
      "prompt": "Analyse code quality, security, and performance.",
      "tools": ["Read", "Glob", "Grep"]
    },
    "test-writer": {
      "description": "Writes comprehensive tests",
      "prompt": "Write pytest unit tests with edge cases.",
      "tools": ["Read", "Write", "Bash"]
    }
  }
}
```

Agents can also be defined as Markdown files in `.opencode/agents/` (project-local) or `~/.config/opencode/agents/` (global).

---

## LSP Integration

OpenCode automatically loads Language Server Protocol (LSP) servers for the languages in your project. This gives the agent:

- **Accurate code context** — type information, definitions, references
- **Go-to-definition** — navigate code structure
- **Autocomplete** — suggestions grounded in actual types
- **Diagnostics** — errors and warnings visible to the agent

Supports all major LSPs: TypeScript, Python (pyright), Rust (rust-analyzer), Go (gopls), and more. Configure or disable LSP servers via the `lsp` key in `opencode.json`.

---

## Skills

Skills are reusable, domain-specific instruction sets that extend OpenCode's capabilities. Each skill is a folder containing a `SKILL.md` file with YAML frontmatter.

OpenCode searches the following locations (all are checked):

```
# Project-local (highest priority)
.opencode/skills/*/SKILL.md

# Also searched for cross-tool compatibility
.claude/skills/*/SKILL.md
.agents/skills/*/SKILL.md

# Global
~/.config/opencode/skills/*/SKILL.md
~/.claude/skills/*/SKILL.md
~/.agents/skills/*/SKILL.md
```

Example layout:

```
.opencode/
  skills/
    deploy/
      SKILL.md         ← Deployment workflow
    code-review/
      SKILL.md         ← Code review checklist
```

Each `SKILL.md` must start with YAML frontmatter:

```markdown
---
name: code-review
description: "Detailed code review covering quality, security, and performance"
---

# Code Review Checklist
...
```

The agent loads skill names and descriptions at startup, then loads full content only when a relevant task is encountered (progressive disclosure).

---

## Permission Model

Control tool access via the `permission` key in `opencode.json`:

```jsonc
{
  "permission": {
    "edit": "allow",
    "bash": "ask",
    "bash(rm -rf:*)": "deny"
  }
}
```

### Permission Values

| Value | Behaviour |
|---|---|
| `"allow"` | Auto-approve without prompting |
| `"ask"` | Prompt the user each time |
| `"deny"` | Block the tool entirely |

By default, OpenCode allows all operations without requiring explicit approval.

---

## Comparison

### OpenCode vs Claude Code

| | OpenCode | Claude Code |
|---|---|---|
| **Provider** | Any (75+ providers) | Anthropic only |
| **License** | MIT (open source) | Proprietary |
| **Local models** | ✅ Yes (Ollama) | ❌ No |
| **Cost** | Free (BYOK or Zen) | Claude subscription |
| **LSP** | ✅ Yes | ✅ Yes |
| **Desktop app** | ✅ Beta | ❌ No |
| **GitHub Copilot** | ✅ Native | ❌ No |
| **Privacy** | No data stored | Anthropic processes data |
| **Stars** | 160K+ | N/A |

### OpenCode vs Aider

| | OpenCode | Aider |
|---|---|---|
| **Interface** | TUI + CLI + Desktop | CLI only |
| **MCP** | ✅ Yes | Limited |
| **Subagents** | ✅ Yes | ❌ No |
| **Multi-session** | ✅ Yes | ❌ No |
| **Git integration** | ✅ Auto-commit | ✅ Auto-commit (stronger) |
| **LSP** | ✅ Yes | ❌ No |

---

## Common Workflows

### Code Review
```bash
opencode run --agent plan "Review the auth module for security vulnerabilities"
```

### Bug Fixing
```bash
opencode run "Find and fix the bug causing the 500 error in api/users.py"
```

### Refactoring
```bash
opencode run "Refactor the payment service to use the strategy pattern"
```

### Testing
```bash
opencode run "Add comprehensive unit tests for the data processing pipeline"
```

### Research
```bash
opencode run "Research best practices for rate limiting in FastAPI and implement them"
```

### CI/CD Pipeline
```bash
opencode run --timeout 300000 "Run the test suite and fix any failures"
```

---

## Key Features Summary

- **160K+ GitHub stars**, 900+ contributors, 7.5M+ monthly developers
- **Provider-agnostic** — 75+ LLM providers, including local models
- **Multi-agent architecture** — plan mode, build mode, subagents
- **LSP integration** — accurate code context for the agent
- **MCP support** — connect to databases, browsers, APIs (1,200+ servers)
- **Persistent sessions** — SQLite-backed, resumable, shareable
- **Desktop app** — macOS, Windows, Linux (beta)
- **HTTP server** — OpenAPI-based, supports remote clients via `opencode serve` / `opencode web`
- **ACP support** — JSON-RPC protocol for native IDE integration
- **GitHub Actions** — `opencode-agent` app for CI/CD and PR automation
- **Skills system** — reusable domain-specific instructions
- **Fine-grained permissions** — per-tool allow/ask/deny controls
- **Privacy-first** — no code or context data stored
- **Built-in Zen** — free curated models included, no config needed

---

## References

- [OpenCode Website](https://opencode.ai)
- [Documentation](https://opencode.ai/docs)
- [GitHub Repository](https://github.com/anomalyco/opencode)
- [Changelog](https://opencode.ai/changelog)
- [Desktop App Download](https://opencode.ai/download)
- [Enterprise](https://opencode.ai/enterprise)
