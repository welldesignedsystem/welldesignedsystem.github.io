+++
date = '2025-06-22T12:44:47+10:00'
draft = false
title = 'Claude Notes'
tags = ['Claude']
summary = "Claude is a family of large language models developed by Anthropic, designed to be helpful, harmless, and honest. This document provides an overview of Claude's capabilities, architecture, and applications — with all examples using LangChain (Python)."
+++

## Part 1: Claude Code

Claude Code is Anthropic's **agentic CLI tool** for software development. Unlike IDE plugins (GitHub Copilot, Cursor) that assist you as you type, Claude Code operates **autonomously** — it reads your codebase, writes files, runs commands, browses the web, calls APIs, and iterates on its own output.

### What Claude Code Can Do

- Read and write files across your entire project
- Execute shell commands (tests, builds, git operations)
- Search the web for documentation and solutions
- Connect to external services via MCP (GitHub, Slack, databases, etc.)
- Run parallel sub-agents for complex multi-part tasks
- Integrate into CI/CD pipelines as a fully automated agent

### What Makes It Different from Cursor/Copilot

| Feature            | Cursor / Copilot | Claude Code               |
| ------------------ | ---------------- | ------------------------- |
| Primary interface  | IDE (GUI)        | Terminal (CLI)            |
| Context awareness  | Open files       | Entire codebase           |
| Autonomy level     | Suggestions      | Full autonomous execution |
| MCP / Hooks        | No               | Yes                       |
| CI/CD integration  | No               | Yes (GitHub Actions)      |
| Custom agents      | No               | Yes                       |
| Sandboxing control | Limited          | Full control              |

---

## Installation & Setup

### Requirements

- **Node.js** 18+ (required)
- macOS 10.15+, Ubuntu 20.04+/Debian 10+, or Windows via WSL/Git Bash
- Minimum 4GB RAM
- Active internet connection

### Install

```bash
npm install -g @anthropic-ai/claude-code
```

### Authenticate

```bash
claude  # Opens browser for Anthropic login on first run
```

Or set via environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### Verify Installation

```bash
claude --version
claude --help
```

---

## Architecture & Mental Model

Understanding Claude Code's layered architecture is the key to mastering it.

```mermaid
graph TD
    subgraph CORE["🔷 Core Layer"]
        CLI["Claude Code CLI + Session Management"]
        CTX["CLAUDE.md context · conversation loop"]
    end

    subgraph DELEGATION["🔷 Delegation Layer"]
        SA["Sub-Agents"]
        SK["Skills"]
        SC["Slash Commands"]
    end

    subgraph EXTENSION["🔷 Extension Layer"]
        MCP["MCP Servers"]
        HK["Hooks"]
        PL["Plugins"]
    end

    CORE --> DELEGATION
    DELEGATION --> EXTENSION
```

**Most users only use the Core Layer** — that's where context bloat and high costs come from. Power users delegate to Sub-Agents, automate with Hooks, and extend with MCP.

### Key Insight

> CLAUDE.md gives Claude _memory_ → Slash Commands create _repeatable workflows_ → Sub-Agents handle _parallel work_ → Hooks enforce _deterministic rules_ → MCP connects _external services_

---

## CLI Commands & Flags

### Starting Sessions

```bash
claude                              # Start new interactive session
claude "fix the authentication bug" # Start session with initial prompt
claude -p "explain this function"   # One-shot query, then exit (non-interactive)
claude -c                           # Continue the most recent session
claude --resume                     # Pick a past session to resume
```

### Model Selection

```bash
claude --model opus          # Use Claude Opus (most capable)
claude --model sonnet        # Use Claude Sonnet (balanced)
claude --model haiku          # Use Claude Haiku (fastest, cheapest)
```

### Permissions Flags

```bash
claude --allowedTools "Read" "Write" "Bash"     # Skip dialog for these tools
claude --disallowedTools "Write"                 # Remove a tool entirely
claude --dangerously-skip-permissions            # Skip ALL permission dialogs (use with extreme caution)
claude --permission-mode plan                    # Start in plan-only mode
```

### Context & Prompt Flags

```bash
claude --system-prompt "You are a React expert"            # Replace system prompt
claude --append-system-prompt "Never delete test files"    # Add to system prompt
claude --agent MyCustomAgent                               # Use a specific sub-agent
```

### Output Flags (for scripting/CI)

```bash
claude -p "analyze code" --output-format json              # JSON output
claude -p "review" --max-turns 5 > report.txt             # Limit turns, pipe output
claude -p "audit" --allowedTools Read,Grep,Glob \
  --output-format json > security_report.json
```

### Worktrees (Parallel Isolation)

```bash
claude --worktree feature-auth   # Create isolated git worktree for this session
```

---

## In-Session Shortcuts & Commands

### Keyboard Shortcuts

| Shortcut                 | Action                                                     |
| ------------------------ | ---------------------------------------------------------- |
| `SHIFT + TAB`            | Cycle between modes (Default → Write → Plan)               |
| `CTRL + C`               | Cancel current input                                       |
| `ESC`                    | Cancel current generation (can inject new prompt mid-task) |
| `ESC + ESC`              | Undo the last action Claude performed                      |
| `CTRL + B`               | Move task to background (Claude continues autonomously)    |
| `OPTION + P` / `ALT + P` | Switch model mid-session                                   |
| `CTRL + O`               | Toggle verbose output                                      |
| `CTRL + V` / `CMD + V`   | Paste text or image into prompt                            |
| `↑ / ↓ arrows`           | Scroll through past messages                               |

### Slash Commands (Built-in)

```bash
/help          # List all available commands including custom ones
/model         # Switch AI model for current session
/clear         # Clear context window (start fresh)
/compact       # Summarize + clear context (retains summary)
/compact retain the error handling patterns  # Compact with specific retention
/context       # View context window stats and usage %
/usage         # View plan usage / remaining quota
/init          # Analyze project and generate CLAUDE.md
/mcp           # View and manage connected MCP servers
/permissions   # View and update permission settings
/rewind        # Undo to earlier conversation point
/config        # Open interactive settings menu
/statusline    # Configure the terminal status bar
```

**Rule of thumb:** Use `/compact` when context hits 70-80%. Use `/clear` when switching tasks entirely.

---

## CLAUDE.md — The Agent's Constitution

`CLAUDE.md` is the most important file in your Claude Code setup. It gives Claude **persistent project memory** — instructions that load automatically at the start of every session.

### File Hierarchy

```
~/.claude/CLAUDE.md              # Global — applies to ALL your projects
your-project/CLAUDE.md           # Project — shared via Git with team
your-project/CLAUDE.local.md     # Local — personal overrides, NOT in Git
```

### What to Put in CLAUDE.md

```markdown
# Project: E-Commerce API

## Tech Stack

- Python 3.12 + FastAPI + SQLAlchemy
- PostgreSQL (primary DB), Redis (cache)
- Docker for local dev, AWS ECS for production

## Code Conventions

- Use type hints everywhere — no untyped functions
- Snake_case for variables, PascalCase for classes
- Write docstrings for all public functions
- Tests in `/tests` mirroring the src structure
- Use pytest with fixtures, not unittest

## Architecture Rules

- All DB access goes through the repository pattern
- Business logic in services, NOT in route handlers
- Never return raw SQLAlchemy models — use Pydantic schemas

## DO NOT

- Modify `.env` or `.env.example` files
- Delete or alter database migration files
- Change any `*_schema.py` files without asking
- Push directly to `main` branch — always create a PR

## Running the Project

- Start: `docker-compose up`
- Tests: `pytest -v`
- Migrations: `alembic upgrade head`
- Lint: `ruff check .`
```

### Tips for Good CLAUDE.md Files

1. **Be specific** — "Use snake_case" beats "follow Python conventions"
2. **List what NOT to do** — prevents costly mistakes
3. **Include run commands** — Claude can test its own changes
4. **Keep it under 25KB** — larger files slow down context loading
5. **Update it regularly** — treat it like living documentation

### Modular Rules (Alternative to One Big File)

```
.claude/
└── rules/
    ├── code-style.md
    ├── security.md
    ├── testing.md
    └── git-workflow.md
```

---

## Configuration & Settings Files

### File Locations

```
~/.claude.json                          # Global user settings
~/.claude/settings.json                 # Global Claude Code settings
your-project/.claude/settings.json      # Project-shared settings (commit to Git)
your-project/.claude/settings.local.json # Personal project settings (gitignore)
```

### Key Settings

```json
{
  "model": "claude-sonnet-4-6",
  "alwaysThinkingEnabled": true,
  "permissions": {
    "allow": ["Read", "Write", "Bash(git *)", "Bash(npm *)"],
    "deny": ["Bash(rm -rf *)", "Write(.env*)"]
  },
  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug"
  },
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...]
  }
}
```

### Project Folder Structure (Best Practice)

```
your-project/
├── CLAUDE.md                    # Shared project instructions (commit this)
├── CLAUDE.local.md              # Personal instructions (gitignore)
├── .mcp.json                    # MCP server configs (commit this)
└── .claude/
    ├── settings.json            # Shared settings (commit this)
    ├── settings.local.json      # Personal settings (gitignore)
    ├── commands/                # Custom slash commands
    │   ├── pr.md
    │   ├── review.md
    │   └── deploy.md
    ├── agents/                  # Sub-agent definitions
    │   ├── security-auditor.md
    │   └── test-writer.md
    ├── skills/                  # Auto-activated expertise
    │   └── python-typing/
    │       └── SKILL.md
    └── hooks/                   # Hook scripts
        ├── pre-commit-check.sh
        └── block-env-writes.sh
```

---

## Permissions & Security

Claude Code asks for permission before performing potentially risky actions. You control this granularity.

### Permission Levels (Modes)

| Mode                | Behavior                                     |
| ------------------- | -------------------------------------------- |
| `default`           | Ask permission for each new tool/action type |
| `acceptEdits`       | Auto-approve file writes, ask for Bash       |
| `plan`              | Read-only — plan actions, execute nothing    |
| `bypassPermissions` | Skip all dialogs (dangerous!)                |

### Setting Granular Permissions

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Bash(git *)",
      "Bash(npm run *)",
      "Bash(pytest *)",
      "Bash(docker-compose *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Write(.env*)",
      "Write(**/migrations/**)"
    ]
  }
}
```

### Via CLI Flags

```bash
# Allow specific tools without dialog
claude --allowedTools "Read" "Write" "Bash(git *)"

# Deny specific tools entirely
claude --disallowedTools "Write"
```

---

## MCP — Model Context Protocol

MCP transforms Claude Code from a file reader/writer into a tool that can interact with **any external system** — databases, GitHub, Slack, Jira, etc.

### What MCP Enables

Without MCP, Claude Code can only read files and run bash commands.  
With MCP, Claude can:

- Query your production database
- Create GitHub PRs and issues
- Post Slack messages
- Check Sentry errors
- Interact with any API your team uses

The MCP ecosystem grew from ~100K downloads in Nov 2024 to 8M+ by April 2025 — 80x growth. Over 300 integrations exist.

### Adding MCP Servers

```bash
# Via CLI (wizard)
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# With environment variables
claude mcp add github -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=your-token \
  -- npx -y @modelcontextprotocol/server-github

# View installed servers
claude mcp list
```

### Via Config File (Better for Teams)

Edit `.mcp.json` directly — much easier for complex configs:

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

### Using MCP Tools in Sessions

Once connected, MCP tools appear as slash commands:

```bash
/mcp__github__create_issue
/mcp__github__search_repositories
/mcp__filesystem__read_file
/mcp__memory__create_entities
```

### Popular MCP Servers

| Server                                             | Use Case                  |
| -------------------------------------------------- | ------------------------- |
| `@modelcontextprotocol/server-github`              | GitHub PRs, issues, repos |
| `@modelcontextprotocol/server-postgres`            | Query PostgreSQL          |
| `@modelcontextprotocol/server-filesystem`          | Extended filesystem ops   |
| `@modelcontextprotocol/server-slack`               | Slack messaging           |
| `@playwright/mcp`                                  | Browser automation        |
| `@modelcontextprotocol/server-sequential-thinking` | Structured reasoning      |

### MCP Tool Naming in Hooks

MCP tools follow the pattern `mcp__<server>__<tool>` and work in hooks exactly like built-in tools:

```json
{
  "matcher": "mcp__github__.*",   // Match all GitHub MCP tools
  "hooks": [...]
}
```

---

## Hooks — Deterministic Automation

Hooks are **the most powerful and underused Claude Code feature**. They execute shell commands, HTTP endpoints, or LLM prompts automatically at specific lifecycle points — regardless of what Claude decides to do.

Think of CLAUDE.md as "should do" rules. Hooks are "must do" rules.

### Hook Events

| Event                | When It Fires                                  |
| -------------------- | ---------------------------------------------- |
| `PreToolUse`         | Before Claude executes any tool — can BLOCK it |
| `PostToolUse`        | After a tool completes successfully            |
| `PostToolUseFailure` | After a tool fails                             |
| `PermissionRequest`  | When Claude asks for a new permission          |
| `Elicitation`        | When an MCP server requests user input         |

### Hook Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/pre-commit-check.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/run-linter.sh"
          }
        ]
      }
    ]
  }
}
```

### Pre-Commit Enforcement Hook (Real Example)

This hook blocks Claude from committing until all tests pass:

```bash
#!/bin/bash
# .claude/hooks/pre-commit-check.sh

# Run tests
npm run test 2>&1

if [ $? -ne 0 ]; then
  echo '{"decision": "block", "reason": "Tests must pass before committing"}'
  exit 0
fi

# Tests passed — allow commit
echo '{"decision": "allow"}'
```

### Block Dangerous Commands Hook

```bash
#!/bin/bash
# .claude/hooks/block-dangerous.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['tool_input'].get('command',''))")

# Block rm -rf
if echo "$COMMAND" | grep -qE "rm\s+-rf\s+/"; then
  echo '{"decision": "block", "reason": "Refusing to delete system directories"}'
  exit 0
fi

echo '{"decision": "allow"}'
```

### Block Writes to .env Files

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'INPUT=$(cat); FILE=$(echo $INPUT | python3 -c \"import sys,json; print(json.load(sys.stdin)[\\\"tool_input\\\"][\\\"path\\\"]\"); if [[ $FILE == *.env* ]]; then echo \\'{{\"decision\":\"block\",\"reason\":\"Cannot write to .env files\"}}\\'; else echo \\'{{\"decision\":\"allow\"}}\\'; fi'"
          }
        ]
      }
    ]
  }
}
```

### Hook Best Practices

- **Block at commit, not at write** — blocking mid-plan confuses Claude
- **Use hint hooks for warnings** — non-blocking feedback is less disruptive
- **Log hook execution** — helps debug agent behavior in production
- **Match specifically** — overly broad matchers slow everything down

---

## Custom Slash Commands

Create your own `/commands` that Claude executes on demand — reusable, parameterized workflows.

### Creating Commands

```bash
# Project-specific command
mkdir -p .claude/commands
echo "Review this code for security vulnerabilities, focusing on OWASP Top 10:" \
  > .claude/commands/security-review.md

# Global command (all projects)
mkdir -p ~/.claude/commands
echo "Write comprehensive tests for the selected code:" \
  > ~/.claude/commands/write-tests.md
```

### Parameterized Commands

Use `$ARGUMENTS` to pass dynamic input:

```markdown
<!-- .claude/commands/fix-issue.md -->

Fix GitHub issue #$ARGUMENTS following our coding standards in CLAUDE.md.

Steps:

1. Read the issue description
2. Identify affected files
3. Implement the fix with tests
4. Run the test suite
5. Create a descriptive commit message
```

```bash
# Usage in session
/fix-issue 342
```

### Complex Multi-Step Command

```markdown
<!-- .claude/commands/pr.md -->

Create a pull request for the current changes.

Steps:

1. Run `git diff` to understand all changes
2. Run the full test suite — abort if any fail
3. Write a clear PR description explaining WHY, not just what
4. Create the PR with appropriate labels
5. Request review from the relevant team members based on the files changed
```

### Viewing Available Commands

```bash
/help   # Lists all built-in AND custom commands
```

---

## Sub-Agents (Parallel Task Delegation)

Sub-agents are **specialized Claude instances** you can spawn for specific tasks. They run in isolated contexts, preventing context pollution and enabling parallel execution.

### Defining a Sub-Agent

```markdown
## <!-- .claude/agents/security-auditor.md -->

name: security-auditor
description: Specialized in application security analysis and vulnerability assessment
allowed-tools: Read, Grep, Glob, Bash(git log:_), Bash(git diff:_)

---

# Security Auditor Agent

You are a senior application security engineer specializing in:

## Expertise

- OWASP Top 10 vulnerabilities
- SQL injection, XSS, CSRF patterns
- Authentication and authorization flaws
- Secrets and credential exposure
- Dependency vulnerability analysis

## Response Format

Always provide:

1. Severity rating (Critical/High/Medium/Low)
2. Affected files and line numbers
3. Proof of concept or explanation
4. Concrete remediation steps
5. References (CVE, OWASP, etc.)
```

### More Agent Examples

```markdown
## <!-- .claude/agents/test-writer.md -->

name: test-writer
description: Writes comprehensive tests for new or modified code
allowed-tools: Read, Write, Bash(pytest _), Bash(npm test _)

---

You are a test engineering specialist. For every function or component:

- Write unit tests covering happy path, edge cases, and error conditions
- Follow existing test patterns in the codebase
- Aim for >90% branch coverage
- Use descriptive test names that explain what's being tested
```

```markdown
## <!-- .claude/agents/db-expert.md -->

name: db-expert
description: Database query optimization, schema design, and migration planning
allowed-tools: Read, Bash(psql _), mcp**postgres**._

---

You are a database architect expert focused on:

- Query performance and indexing strategy
- Schema normalization and design
- Safe migration planning
- Analyze EXPLAIN ANALYZE output
  Always provide performance impact estimates.
```

### Using Sub-Agents

```bash
# In a session, just refer to the agent by name
claude --agent security-auditor "audit the authentication module"

# Or Claude will automatically delegate when appropriate
"Use the security-auditor agent to review all API endpoints"
```

---

## Skills — Auto-Activated Expertise

Unlike slash commands (user-triggered), **skills activate automatically** when Claude detects they're relevant to the current task.

### How Skills Work

1. You define a skill with a `SKILL.md` file
2. Claude reads all skill descriptions at session start
3. When your task matches a skill's description, Claude loads and applies it
4. You never explicitly invoke a skill — it just activates

### Skill Structure

```
.claude/skills/
└── python-typing/
    ├── SKILL.md         # Description + instructions
    └── examples/        # Optional example files
```

```markdown
## <!-- .claude/skills/python-typing/SKILL.md -->

name: python-typing
description: Adding or improving Python type hints and type annotations in Python code

---

When adding type hints to Python code:

1. Use `from __future__ import annotations` for forward references
2. Prefer `X | Y` over `Optional[X]` or `Union[X, Y]` (Python 3.10+)
3. Use `TypeAlias` for complex type aliases
4. Add `Protocol` for structural subtyping
5. Annotate all function signatures including return types
6. Use `TypeVar` for generic functions
7. Add `py.typed` marker file if it's a library

Always run `mypy --strict` after adding type hints to verify correctness.
```

---

## Plugins

Plugins are **packaged collections** of hooks, commands, skills, and MCP configurations — shareable and installable as a unit.

### Plugin Structure

```
my-plugin/
├── plugin.json          # Plugin manifest
├── commands/
│   └── security-check.md
├── hooks/
│   └── pre-commit.sh
├── skills/
│   └── security/
│       └── SKILL.md
└── mcp/
    └── config.json
```

### Installing a Plugin

```bash
# Via npm (if published)
npm install -g claude-code-plugin-security

# Or directly from GitHub
claude plugin install https://github.com/user/my-plugin
```

Plugins are ideal for **distributing opinionated team configurations** — install once, get consistent agent behavior across everyone's machines.

---

## Context Management

Context is your most important resource in Claude Code. Managing it well is the difference between accurate autonomous work and hallucination-prone output.

### Context Warning Signs

| Context Usage | Status      | Action             |
| ------------- | ----------- | ------------------ |
| 0–50%         | ✅ Good     | Work freely        |
| 50–70%        | ⚠️ Watch    | Plan ahead         |
| 70–90%        | 🟡 Danger   | Run `/compact`     |
| 90%+          | 🔴 Critical | `/clear` mandatory |

At 70%+ context, Claude starts losing precision. At 85%+, hallucinations increase significantly.

### Check Context Usage

```bash
/context   # Shows used / total tokens, percentage
```

### Compaction Strategies

```bash
/compact                                    # Summarize everything
/compact retain the error handling patterns # Keep specific things
/compact retain all API endpoints discovered so far
```

### Manual Session History

Claude Code saves all sessions to `~/.claude/projects/`. You can analyze these:

```bash
# Resume a previous session
claude --resume

# Continue most recent
claude -c

# Advanced: analyze session logs for patterns
ls ~/.claude/projects/my-project/
```

### Reducing Context Bloat

1. **Use sub-agents** for exploration tasks — they run in separate contexts
2. **Use `--worktree`** to isolate parallel tasks
3. **Be specific in requests** — vague tasks cause Claude to read more files
4. **Use `/clear`** when switching between unrelated tasks in the same project

---

## Modes — Default, Plan, Write

### Switching Modes

```bash
SHIFT + TAB    # Cycle through modes in session
--permission-mode plan    # Start in plan mode
```

### Mode Behaviors

**Default Mode**

- Claude asks permission per tool category
- Good balance of safety and speed
- Best for most tasks

**Plan Mode (`plan`)**

- Claude can only read — no writes or execution
- Claude proposes a plan for your approval
- Use for: reviewing architecture changes, understanding impact before committing

**Write Mode (`acceptEdits`)**

- Auto-approves file writes
- Still asks for Bash execution
- Use for: known-safe code generation tasks

**Bypass Mode (`bypassPermissions` / `--dangerously-skip-permissions`)**

- Skips ALL dialogs
- Use only in sandboxed CI/CD environments
- Never use on production systems or with untrusted prompts

---

## Remote Sessions & GitHub Actions

### Remote Web Sessions

```bash
claude --remote "Add dark mode to the settings page"
```

Starts a remote (web-based) Claude Code session — useful for sharing work or running headless.

### GitHub Actions Integration

This is how teams run Claude Code in CI/CD pipelines — Claude becomes a fully automated engineering agent triggered by PRs, issues, Slack messages, or alerts.

```yaml
# .github/workflows/claude-agent.yml
name: Claude Code Agent

on:
  issues:
    types: [labeled]

jobs:
  fix-issue:
    if: github.event.label.name == 'claude-fix'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Code Agent
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          claude -p "
            Fix GitHub issue #${{ github.event.issue.number }}: 
            ${{ github.event.issue.title }}
            
            Issue body: ${{ github.event.issue.body }}
            
            Steps:
            1. Understand the issue
            2. Identify the root cause
            3. Implement the fix with tests
            4. Verify tests pass
            5. Create a pull request
          " \
          --allowedTools "Read,Write,Bash(git *),Bash(npm *)" \
          --max-turns 20
```

### CI/CD Best Practices

- Use `--output-format json` for machine-readable output
- Set `--max-turns` to prevent runaway agents
- Use `--allowedTools` to restrict to safe operations
- Always review logs — Claude Code logs full agent activity in GHA

---

## Production Best Practices

### Keep CLAUDE.md as the Source of Truth

Treat CLAUDE.md like code. Review changes, version it, keep it accurate. The quality of Claude's output directly correlates with CLAUDE.md quality.

### Use Hooks for Critical Enforcement

Don't rely on CLAUDE.md instructions for things that must never happen (writing to `.env`, deleting migrations). Use PreToolUse hooks that block — they're deterministic.

### Block at Commit, Not at Write

Blocking Claude mid-plan (on file writes) confuses it. Let it finish, then enforce at the commit stage:

```bash
# PreToolUse hook on git commit — check tests passed first
# This is better than blocking on every Edit/Write operation
```

### Use Sub-Agents for Exploration

When Claude needs to explore the codebase to understand something before making changes, delegate to a sub-agent. This keeps the main context clean.

### Model Selection by Task

```bash
# Use Haiku for cheap, fast exploration tasks
claude --model haiku "find all files that import from auth module"

# Use Sonnet for most production tasks (best balance)
claude --model sonnet "refactor the payment service"

# Use Opus only for very complex reasoning
claude --model opus "design the new event sourcing architecture"
```

### Log Everything in CI/CD

```bash
claude -p "..." \
  --output-format json \
  --max-turns 15 2>&1 | tee agent_log_$(date +%Y%m%d).json
```

Review these logs periodically for common errors and use them to improve CLAUDE.md.

### The Meta-Loop (Advanced)

```bash
# Analyze what other Claude instances got stuck on, then fix it
cat ~/.claude/projects/*/logs/*.json | \
  claude -p "see what the other Claude sessions got stuck on and improve our CLAUDE.md"
```

---

## Security Considerations

### Known Risks

- **Supply chain attacks** — malicious skills and MCP servers exist. Only use vetted community tools.
- **MCP server access** — MCP servers can read and write your codebase by default. Scope their permissions.
- **Prompt injection** — content Claude reads (files, web pages) can contain instructions trying to hijack Claude's behavior.
- **Context leakage** — Claude may inadvertently expose secrets from files it reads.

### Security Checklist

```bash
# 1. Explicitly deny dangerous operations
{
  "permissions": {
    "deny": ["Bash(rm -rf *)", "Bash(sudo *)", "Write(.env*)"]
  }
}

# 2. Use --allowedTools in CI/CD to whitelist only what's needed
claude -p "..." --allowedTools "Read,Grep,Glob"

# 3. Never use --dangerously-skip-permissions in any shared environment

# 4. Audit installed MCP servers regularly
claude mcp list

# 5. Scope MCP permissions — not every server needs Write access
```

### Preventing .env Access

```json
{
  "permissions": {
    "deny": ["Read(.env*)", "Write(.env*)", "Read(**/.env*)"]
  }
}
```

---

## Quick Reference Cheat Sheet

### CLI

```bash
claude                          # New session
claude "task"                   # New session with prompt
claude -p "task"                # One-shot, exit when done
claude -c                       # Continue last session
claude --resume                 # Pick session to resume
claude --model sonnet           # Set model
claude --allowedTools "Read,Write"   # Pre-approve tools
claude --permission-mode plan   # Plan-only mode
claude --append-system-prompt "..."  # Add to system prompt
claude --agent MyAgent          # Use specific sub-agent
claude --worktree feature-x     # Isolated git worktree
```

### In-Session

```bash
SHIFT+TAB    → cycle modes
ESC          → cancel generation
ESC+ESC      → undo last action
CTRL+B       → background task
CTRL+O       → verbose toggle
/compact     → summarize + clear
/clear       → clear context
/model       → switch model
/context     → check usage %
/mcp         → manage MCP servers
/permissions → update permissions
```

### Files

```
CLAUDE.md                     → project instructions (commit)
CLAUDE.local.md               → personal instructions (gitignore)
.claude/settings.json         → shared settings (commit)
.claude/settings.local.json   → personal settings (gitignore)
.mcp.json                     → MCP servers (commit)
.claude/commands/             → custom slash commands
.claude/agents/               → sub-agent definitions
.claude/skills/               → auto-activated skills
.claude/hooks/                → hook scripts
~/.claude/CLAUDE.md           → global instructions (all projects)
```

### Context Rules of Thumb

```
< 70%  → work freely
70-90% → /compact now
90%+   → /clear mandatory
switching tasks → /clear
```

### MCP Tool Pattern

```
mcp__<server>__<tool>
mcp__github__create_issue
mcp__postgres__query
mcp__filesystem__read_file
```

---

## Part 2: Programmatically using it

Claude is a family of large language models developed by **Anthropic**. Focus of each:

- OpenAI focuses on **capability maximization**
- Google **scale-first**
- Anthropic's focuses **safety-first AI development**.

## Ways to Access Claude

### Anthropic Interfaces

- **Claude.ai** — consumer web/mobile/desktop chat interface
- **Claude for mobile devices** — native Android/iOS app
- **Claude Desktop App** — native macOS and Windows app

### Developer Tools

- **Anthropic API** — direct API access for building applications
- **Claude Code** — agentic CLI for software development
- **Claude Code for IDEs** - VS Code, IntelliJ, PyCharm and other JetBrains IDEs

### Embedded Product Integrations

- **Claude in Browsers** — browser-based browsing agent
- **Claude in Excel/PowerPoint**
- **Claude Code for Slack** — Claude accessible within Slack workspaces
- **Cowork** — desktop tool for non-developers to automate file and task management

### Third-Party Cloud Providers

- **Amazon Bedrock** — Claude models via AWS
- **Google Cloud Vertex AI** — Claude models via GCP

### Ecosystem / Third-Party Apps

Various platforms building on the Anthropic API, including tools like Cursor, Notion, Perplexity, and more.

### Key Strengths of Claude

- Large Token context window
- Native **PDF and document understanding**
- Strong **instruction following** and structured output
- Excellent at **code generation and reasoning**
- Unique **Extended Thinking** capability
- Strong **multilingual** performance

## AI Model Context Window Comparison (April 2026)

To understand 1 Million tokens - think of entire Harry Potter series its almost ~1.08M Tokens. 1 Million Tokens is approx ~3000 pages.

| Model                 | Provider   | Context Window | How They Achieve It                                                           |
| --------------------- | ---------- | -------------- | ----------------------------------------------------------------------------- |
| **Llama 4 Scout**     | Meta       | 10M tokens     | Mixture-of-Experts (17B active / 109B total params); open-weight, self-hosted |
| **Gemini 1.5 Pro**    | Google     | 2M tokens      | Efficient attention scaling; optimized for retrieval over synthesis           |
| **Claude Opus 4.6**   | Anthropic  | 1M tokens      | Constitutional AI architecture; strong recall & reasoning at depth            |
| **GPT-5.4**           | OpenAI     | 1M tokens      | Large dense model with extended attention; Codex-tier access                  |
| **Gemini 3.1 Pro**    | Google     | 1M tokens      | Native multimodal attention across text, image, audio, video                  |
| **Qwen 3.6 Plus**     | Alibaba    | 1M tokens      | Sparse MoE transformer; cost-efficient at scale                               |
| **Grok 4.20**         | xAI        | 2M tokens      | High-throughput transformer with extended positional encoding                 |
| **Gemini 3.1 Flash**  | Google     | 200K tokens    | Distilled Flash architecture; optimized for speed and low latency             |
| **Claude Sonnet 4.6** | Anthropic  | 200K tokens    | Balanced compute/quality; strong instruction-following                        |
| **Claude Haiku 4.5**  | Anthropic  | 200K tokens    | Lightweight; optimized for fast, high-volume tasks                            |
| **GPT-4o**            | OpenAI     | 128K tokens    | Dense transformer with rotary position embeddings                             |
| **Perplexity Sonar**  | Perplexity | 200K tokens    | RAG-augmented; retrieval offsets context limits                               |

## Constitutional AI — How Claude Thinks

This is the most important Claude-specific concept. Claude is not just RLHF-trained — it uses **Constitutional AI (CAI)**, Anthropic's proprietary alignment approach.

### How Constitutional AI Works

**Step 1 — Supervised Learning:** Claude is trained on human-generated data (like other LLMs).

**Step 2 — Self-Critique via a Constitution:** A set of principles (the "constitution") is used to have Claude critique its own outputs. For example:

> _"Does this response help someone do something harmful? If so, rewrite it."_

**Step 3 — RLHF from AI Feedback (RLAIF):** Instead of only using human feedback, Claude uses AI-generated feedback based on the constitution. This scales alignment without needing infinite human labelers.

### The Three Core Principles (HHH)

| Principle    | What It Means                                                     |
| ------------ | ----------------------------------------------------------------- |
| **Helpful**  | Actually useful to the human, not watered-down or overly cautious |
| **Harmless** | Avoids enabling physical, psychological, or societal harm         |
| **Honest**   | Truthful, calibrated in uncertainty, non-deceptive                |

### Why This Matters for Engineers

- Claude will **push back** on instructions that violate its values — design _with_ this, not against it
- Claude's refusals are more **consistent and principled** than other models
- You can rely on Claude not sycophantically agreeing with wrong answers
- Constitutional values are **internalized**, not just surface-level filters

---

## Claude Model Families

As of 2025–2026, Claude models are organized into families. The current generation is **Claude 4**.

### Current Models (Claude 4 Family)

| Model               | Best For                                       | Speed   | Cost    |
| ------------------- | ---------------------------------------------- | ------- | ------- |
| **Claude Opus 4**   | Complex reasoning, research, hard problems     | Slow    | Highest |
| **Claude Sonnet 4** | Production apps, balanced intelligence + speed | Medium  | Medium  |
| **Claude Haiku 4**  | High-volume, simple tasks, real-time responses | Fastest | Lowest  |

### Model String IDs (for LangChain)

```
claude-opus-4-6         # Opus 4
claude-sonnet-4-6       # Sonnet 4 (most common in production)
claude-haiku-4-5-20251001  # Haiku 4
```

### How to Choose

```
Need deep reasoning or complex analysis? → Opus
Building a production app with real users? → Sonnet (default choice)
High-volume, classification, simple Q&A? → Haiku
Streaming chatbot, real-time features? → Haiku or Sonnet
```

### Older Generations (Still Available)

- **Claude 3** family: Opus 3, Sonnet 3.5, Haiku 3 — still widely used
- **Claude 2** — largely deprecated, avoid for new projects

---

## Using Claude with LangChain

### Installation

```bash
pip install -U langchain-anthropic langgraph
```

> Current latest: `langchain-anthropic==1.4.1`

### Basic Call

```python
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(
    model="claude-sonnet-4-6",
    # api_key="sk-ant-..."  # or set ANTHROPIC_API_KEY env var
    max_tokens=1024
)

# Modern style: pass tuples directly — no need to import message classes
messages = [
    ("system", "You are a senior Python engineer."),
    ("human", "Explain async/await in Python"),
]

response = llm.invoke(messages)
print(response.content)
```

### Key Differences from Raw Anthropic SDK

| Feature           | Raw Anthropic SDK             | LangChain (`ChatAnthropic`)                  |
| ----------------- | ----------------------------- | -------------------------------------------- |
| System prompt     | Top-level `system` param      | `("system", "...")` tuple or `SystemMessage` |
| Response access   | `response.content[0].text`    | `response.content` (string)                  |
| Streaming         | `client.messages.stream(...)` | `for chunk in llm.stream(...)`               |
| Chaining          | Manual                        | `\|` operator with LCEL                      |
| Memory            | Manual history management     | LangGraph checkpointer                       |
| Structured output | Manual JSON parsing           | `llm.with_structured_output(MyModel)`        |
| Tool calling      | Manual loop                   | `llm.bind_tools([...])`                      |

> **Tip:** You can pass messages as plain tuples `("system", "...")` / `("human", "...")` — no need to import `SystemMessage` / `HumanMessage` for basic usage.

### Multi-Turn Conversations

The modern approach uses **LangGraph with a checkpointer** — this replaces the older `RunnableWithMessageHistory` pattern:

```python
from langchain_anthropic import ChatAnthropic
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=512)

# Build a minimal stateful graph
def call_model(state: MessagesState):
    response = llm.invoke(state["messages"])
    return {"messages": response}

workflow = StateGraph(state_schema=MessagesState)
workflow.add_edge(START, "model")
workflow.add_node("model", call_model)

app = workflow.compile(checkpointer=MemorySaver())

# Each invocation with the same thread_id shares memory
config = {"configurable": {"thread_id": "user-1"}}

# Turn 1
app.invoke({"messages": [("human", "My name is Alex")]}, config=config)

# Turn 2 — Claude remembers Alex
result = app.invoke({"messages": [("human", "What's my name?")]}, config=config)
print(result["messages"][-1].content)
```

> The older `RunnableWithMessageHistory` still works but LangGraph is the recommended approach for new projects.

---

## Prompt Engineering for Claude

Claude is specifically trained to respond well to certain prompt patterns.

### XML Tags — Claude's Superpower

Claude is explicitly trained to parse and respect XML structure. Use `ChatPromptTemplate` to keep this clean:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_anthropic import ChatAnthropic

prompt = ChatPromptTemplate.from_messages([
    ("system", """
<role>You are a senior data engineer at a fintech company.</role>
<constraints>
  - Focus only on indexing and query plan issues
  - Return your answer in JSON format
  - Do not suggest schema changes
</constraints>
"""),
    ("human", """
<task>Analyze the SQL query below and identify performance bottlenecks.</task>
<query>{query}</query>
""")
])

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)
chain = prompt | llm

response = chain.invoke({"query": "SELECT * FROM transactions WHERE user_id = 123 ORDER BY created_at DESC;"})
print(response.content)
```

### Few-Shot Prompting

```python
from langchain_core.prompts import FewShotChatMessagePromptTemplate, ChatPromptTemplate
from langchain_anthropic import ChatAnthropic

examples = [
    {"input": "gonna grab some coffee real quick",
     "output": "I will briefly step away to get some coffee."},
    {"input": "can u fix this bug asap",
     "output": "Could you please resolve this bug at your earliest convenience?"},
]

example_prompt = ChatPromptTemplate.from_messages([
    ("human", "{input}"),
    ("ai", "{output}"),
])

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages([
    ("system", "Convert each sentence to formal English."),
    few_shot_prompt,
    ("human", "{input}"),
])

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=256)
chain = final_prompt | llm
response = chain.invoke({"input": "lemme know when ur done"})
print(response.content)
```

### Chain of Thought

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_anthropic import ChatAnthropic

prompt = ChatPromptTemplate.from_messages([
    ("human", """
Solve this problem step by step, showing your reasoning at each stage.

Problem: {problem}
""")
])

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)
chain = prompt | llm

response = chain.invoke({
    "problem": "A train travels 120km at 60km/h, then 80km at 40km/h. What is the average speed?"
})
print(response.content)
```

### Structured Output with Pydantic

LangChain makes structured output very clean via `.with_structured_output()`:

```python
from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel

class ExtractedData(BaseModel):
    name: str
    email: str | None
    sentiment: str   # "positive" | "negative" | "neutral"
    priority: int    # 1-5

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=512)
structured_llm = llm.with_structured_output(ExtractedData)

result = structured_llm.invoke(
    "Hi, I'm Sarah (sarah@email.com). I'm very frustrated with the billing issue and need this fixed ASAP."
)
print(result.name)       # Sarah
print(result.sentiment)  # negative
print(result.priority)   # 5
```

---

## Tool Use & Function Calling

### Defining Tools with LangChain

The cleanest modern approach uses `Annotated` type hints on plain functions — no `@tool` decorator needed for `bind_tools`:

```python
from typing_extensions import Annotated
from langchain_anthropic import ChatAnthropic

def get_weather(
    city: Annotated[str, "The city name, e.g. 'Sydney' or 'New York'"],
    unit: Annotated[str, "Temperature unit: 'celsius' or 'fahrenheit'"] = "celsius",
) -> str:
    """Get current weather for a specific city."""
    return f"The weather in {city} is 22°{unit[0].upper()} and sunny."

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)
llm_with_tools = llm.bind_tools([get_weather])

response = llm_with_tools.invoke("What's the weather in Sydney?")
print(response.tool_calls)
```

### Strict Tool Use (Recommended for Production)

Add `strict=True` to guarantee schema-compliant inputs — prevents type mismatches like `passengers: "2"` instead of `passengers: 2`:

```python
llm_with_tools = llm.bind_tools([get_weather], strict=True)
# Requires langchain-anthropic>=1.1.0 and Claude Sonnet 4.5+ or Opus 4.1+
```

### Full Agent Loop with LangGraph

For production agents, LangGraph is the recommended approach:

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"22°C and sunny in {city}"

@tool
def search_web(query: str) -> str:
    """Search the web for current information."""
    return f"Search results for: {query}"

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)
agent = create_react_agent(llm, tools=[get_weather, search_web])

result = agent.invoke({"messages": [("user", "What's the weather in Sydney?")]})
print(result["messages"][-1].content)
```

---

## Extended Thinking

Claude's most unique capability — it can expose its **internal reasoning chain** before answering.

### What It Is

Extended Thinking allows Claude to spend tokens "thinking" before formulating its final answer. This is built into the model at a fundamental level — not just prompt-level chain-of-thought.

### When to Use It

- Complex math or logic problems
- Multi-step reasoning tasks
- Hard coding challenges
- Any situation where accuracy matters more than speed/cost

### How to Enable It in LangChain

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage

llm = ChatAnthropic(
    model="claude-opus-4-6",   # Works best on Opus
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000}
)

response = llm.invoke([
    HumanMessage(content="Prove that the square root of 2 is irrational.")
])

# Response content may contain thinking blocks
for block in response.content:
    if isinstance(block, dict):
        if block.get("type") == "thinking":
            print("CLAUDE'S REASONING:\n", block["thinking"])
        elif block.get("type") == "text":
            print("FINAL ANSWER:\n", block["text"])
```

### Budget Tokens

- Minimum: 1,000 tokens
- Recommended for hard problems: 5,000–15,000 tokens
- Higher budget = more thorough reasoning = better accuracy (but higher cost)

---

## Vision, Images & Native PDF Support

### Sending Images

```python
import base64
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage

with open("chart.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)

message = HumanMessage(content=[
    {
        "type": "image_url",
        "image_url": {"url": f"data:image/png;base64,{image_data}"}
    },
    {
        "type": "text",
        "text": "Describe what's in this chart and identify the trend."
    }
])

response = llm.invoke([message])
print(response.content)
```

### Supported Image Formats

- JPEG, PNG, GIF, WebP
- Max size: 5MB per image
- Max images per request: 20

### Native PDF Support (Claude-Specific)

Claude reads PDFs natively, including preserving layout context — other LLMs require you to extract text first.

```python
import base64
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage

with open("report.pdf", "rb") as f:
    pdf_data = base64.b64encode(f.read()).decode("utf-8")

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=2048)

message = HumanMessage(content=[
    {
        "type": "document",
        "source": {
            "type": "base64",
            "media_type": "application/pdf",
            "data": pdf_data
        }
    },
    {"type": "text", "text": "Summarize the key findings from this report."}
])

response = llm.invoke([message])
print(response.content)
```

---

## Prompt Caching

A Claude-specific feature that dramatically reduces cost and latency for repeated large contexts.

### How It Works

When you send the same large context (system prompt, documents, etc.) repeatedly, Claude caches it server-side and charges significantly less for subsequent requests.

### Cache Pricing

| Token Type  | Cost vs Normal        |
| ----------- | --------------------- |
| Cache write | ~25% more than normal |
| Cache read  | ~90% less than normal |

Break-even: After just ~2 reads, you save money overall.

### How to Enable Caching in LangChain

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)

# Mark large system prompt for caching using extra_headers or beta flag
# LangChain passes cache_control through the `additional_kwargs` on messages

system_msg = SystemMessage(
    content=[{
        "type": "text",
        "text": "You are an expert on our 500-page company policy document.\n[... very long content ...]",
        "cache_control": {"type": "ephemeral"}   # ← Mark for caching
    }]
)

response = llm.invoke([
    system_msg,
    HumanMessage(content="What is our vacation policy?")
])
print(response.content)
```

### Best Use Cases

- Long system prompts (> 1024 tokens) used repeatedly
- RAG: caching retrieved documents for a session
- Code review tools: caching the entire codebase
- Customer support bots: caching product documentation

### Cache Lifetime

- Ephemeral cache: lasts **5 minutes** after last use

---

## Memory & Context Management

Claude has **no built-in persistent memory**. LangChain provides abstractions for this.

### Context Window: 200K Tokens

```
200,000 tokens ≈ 150,000 words ≈ ~400 pages of text
```

### The "Lost in the Middle" Problem

Claude (like all LLMs) performs best when important information is at the **beginning or end** of the context. Information buried in the middle may be ignored.

**Best practice:** Put critical instructions at both the top AND bottom of your prompt.

### Strategies for Long Conversations

**1. LangGraph with MemorySaver (recommended):**

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph

# LangGraph automatically trims/manages history via the checkpointer
app = workflow.compile(checkpointer=MemorySaver())
```

**2. Trim messages manually in the graph:**

```python
from langchain_core.messages import trim_messages

def call_model(state: MessagesState):
    trimmed = trim_messages(state["messages"], max_tokens=4000, token_counter=llm)
    response = llm.invoke(trimmed)
    return {"messages": response}
```

**3. Summarization — Compact old history:**

```python
from langchain_core.prompts import ChatPromptTemplate

summarize_prompt = ChatPromptTemplate.from_messages([
    ("human", """
Summarize the following conversation into bullet points,
preserving all key facts, decisions, and user preferences:

{conversation}
""")
])

summary_chain = summarize_prompt | llm
summary = summary_chain.invoke({"conversation": old_conversation_text})
```

**4. External Memory** — Use a vector database (Pinecone, Weaviate, pgvector) for long-term memory across sessions.

---

## RAG with Claude + LangChain

LangChain's ecosystem makes RAG very straightforward with Claude.

### Basic RAG Pattern

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import FAISS
from langchain_anthropic import AnthropicEmbeddings  # or use OpenAI embeddings

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)

# Build retriever from your documents
vectorstore = FAISS.load_local("my_index", embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant. Answer questions based ONLY on the
provided context. If the answer isn't in the context, say "I don't have that information."
Always cite which part of the context you used."""),
    ("human", """
<context>
{context}
</context>

<question>
{question}
</question>
""")
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
)

response = rag_chain.invoke("What is our vacation policy?")
print(response.content)
```

### Claude RAG Advantages

- **200K context** = you can stuff more documents without chunking
- **Native PDF** = skip the text extraction step entirely
- **Prompt caching** = cache your retrieved docs across a session cheaply

---

## Streaming

```python
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)

for chunk in llm.stream([("human", "Write a short story about a robot.")]):
    print(chunk.text, end="", flush=True)
```

### Async Streaming

```python
async for chunk in llm.astream([("human", "Tell me a joke.")]):
    print(chunk.text, end="", flush=True)
```

### Streaming in a Chain

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([("human", "{input}")])
chain = prompt | llm

for chunk in chain.stream({"input": "Tell me a joke."}):
    print(chunk.text, end="", flush=True)
```

---

## Batch Processing

LangChain supports batching natively via `.batch()`, and you can also use the Anthropic Batch API for large-scale async workloads (~50% cost reduction).

### LangChain Native Batch

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=512)

docs = ["Summary of doc 1...", "Summary of doc 2...", "Summary of doc 3..."]
messages_batch = [[HumanMessage(content=f"Summarize: {doc}")] for doc in docs]

results = llm.batch(messages_batch)
for r in results:
    print(r.content)
```

### Anthropic Batch API (via SDK, for 10K+ requests)

For very large offline workloads, drop down to the raw SDK for Batch API access:

```python
import anthropic
import time

client = anthropic.Anthropic()

batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"doc-{i:03d}",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 512,
                "messages": [{"role": "user", "content": f"Summarize: {doc}"}]
            }
        }
        for i, doc in enumerate(docs)
    ]
)

# Poll until complete
while True:
    batch = client.messages.batches.retrieve(batch.id)
    if batch.processing_status == "ended":
        break
    time.sleep(60)

for result in client.messages.batches.results(batch.id):
    print(f"{result.custom_id}: {result.result.message.content[0].text}")
```

---

## Claude Code & CLI

Claude Code is an **agentic coding tool** that runs in your terminal and can read, write, and execute code autonomously.

### Installation

```bash
npm install -g @anthropic-ai/claude-code
claude  # Start a session
```

### Key CLI Commands

```bash
claude                          # Start new session
claude "fix the login bug"      # Start with initial prompt
claude -p "explain this code"   # One-shot query, then exit
claude -c                       # Continue most recent session
claude --model opus             # Use specific model
claude --allowedTools "Read" "Write"   # Skip permission dialogs for these
claude --dangerously-skip-permissions  # Skip ALL permission dialogs (careful!)
```

### Key In-Session Shortcuts

| Shortcut      | Action                                    |
| ------------- | ----------------------------------------- |
| `SHIFT + TAB` | Switch modes (default / write / plan)     |
| `CTRL + C`    | Cancel current input                      |
| `ESC`         | Cancel generation (can inject new prompt) |
| `ESC + ESC`   | Undo last action                          |
| `CTRL + B`    | Move task to background                   |
| `/compact`    | Summarize and clear context               |
| `/model`      | Switch model mid-session                  |
| `/clear`      | Clear context window                      |

### CLAUDE.md — Project Instructions File

Create a `CLAUDE.md` in your project root to give Claude persistent instructions:

```markdown
# Project: E-Commerce API

## Stack

- Python 3.12 + FastAPI
- PostgreSQL with SQLAlchemy ORM
- Redis for caching

## Conventions

- All endpoints must have type hints
- Use snake_case for variable names
- Write tests for every new function in /tests

## DO NOT

- Modify .env files
- Delete migration files
- Change database schema without asking first
```

---

## MCP — Model Context Protocol

Anthropic's open standard for connecting Claude to external tools, data sources, and services. Think of it as a **universal plugin system** for LLMs.

### What It Solves

Without MCP, every tool integration is custom-built. With MCP, any Claude client can connect to any MCP-compliant server using a standard protocol.

### Architecture

```
Claude Client (Claude.ai / Claude Code / Your App)
        ↕ MCP Protocol
MCP Server (exposes tools + resources)
        ↕
External Service (GitHub, Slack, Databases, APIs...)
```

### MCP Concepts

| Concept        | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| **MCP Server** | A service that exposes tools and resources via the MCP protocol        |
| **Tools**      | Functions Claude can call (e.g., `create_issue`, `send_slack_message`) |
| **Resources**  | Data Claude can read (e.g., files, database records)                   |
| **Prompts**    | Pre-built prompt templates exposed by the server                       |

### Using MCP in LangChain

As of `langchain-anthropic>=0.3.9`, **Remote MCP is built directly into `ChatAnthropic`** — no separate adapter package needed:

```python
from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import create_react_agent

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1000)

# Attach remote MCP servers directly to the model
llm_with_mcp = llm.bind_tools([{
    "type": "mcp",
    "server_label": "github",
    "server_url": "https://github.mcp.server/sse",
    "headers": {"Authorization": "Bearer your-token"},
    "allowed_tools": ["create_issue", "search_repositories"],
}])

response = llm_with_mcp.invoke(
    "Create a GitHub issue for the login bug we discussed"
)
print(response.content)
```

For local (stdio) MCP servers or complex multi-server setups, use the `langchain-mcp-adapters` package:

```python
# pip install langchain-mcp-adapters
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

async def run_mcp_agent():
    async with MultiServerMCPClient({
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"},
            "transport": "stdio",
        }
    }) as client:
        tools = client.get_tools()
        llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1000)
        agent = create_react_agent(llm, tools)
        result = await agent.ainvoke({
            "messages": [("user", "Create a GitHub issue for the login bug")]
        })
        print(result["messages"][-1].content)
```

### Popular MCP Servers (2025)

- GitHub, GitLab
- Slack, Gmail, Google Calendar
- Notion, Confluence
- PostgreSQL, SQLite
- Filesystem, Web Search, Browser automation

---

## Agents & Agentic Workflows

LangGraph is the recommended framework for production Claude agents.

### Core Agent Loop with LangGraph

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=4096)

@tool
def read_file(path: str) -> str:
    """Read the contents of a file."""
    with open(path) as f:
        return f.read()

@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file."""
    with open(path, "w") as f:
        f.write(content)
    return f"Written to {path}"

@tool
def run_tests() -> str:
    """Run the test suite."""
    import subprocess
    result = subprocess.run(["pytest", "-v"], capture_output=True, text=True)
    return result.stdout + result.stderr

agent = create_react_agent(llm, tools=[read_file, write_file, run_tests])
result = agent.invoke({"messages": [("user", "Fix the failing tests in test_auth.py")]})
print(result["messages"][-1].content)
```

### Multi-Agent Architecture

```python
from langchain_anthropic import ChatAnthropic

# Use different models for different agent roles
research_llm = ChatAnthropic(model="claude-haiku-4-5-20251001", max_tokens=1024)   # Fast, cheap
code_llm     = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=4096)           # Balanced
review_llm   = ChatAnthropic(model="claude-opus-4-6", max_tokens=2048)             # Thorough

# Wire into a LangGraph multi-agent workflow
# (see LangGraph docs for full multi-agent patterns)
```

### Best Practices for Agents

1. **Give Claude a way to ask clarifying questions** before starting long tasks
2. **Build in checkpoints** — have Claude summarize progress periodically
3. **Set clear success criteria** in the initial prompt
4. **Use Opus for planning**, lighter models for execution
5. **Log everything** — agentic tasks can fail in unexpected ways
6. **Implement human-in-the-loop** for irreversible actions (deleting, sending emails, etc.)

---

## Safety, Guardrails & Refusals

### What Claude Won't Do

Claude will refuse to:

- Generate content that enables mass harm (bioweapons, CSAM, etc.)
- Help with clearly illegal activities targeting real people
- Impersonate real individuals deceptively

### What Claude Will Do That Others Won't

Claude is notably **less over-cautious** than many competitors. It can:

- Discuss sensitive historical events in depth
- Help with security research and penetration testing
- Write morally complex fiction
- Give direct medical/legal information (with appropriate caveats)

### Designing Around Refusals

```python
# Bad — vague, triggers caution
llm.invoke("Help me hack into a system")

# Good — clear professional context
from langchain_core.messages import SystemMessage, HumanMessage

llm.invoke([
    SystemMessage(content="You are a security engineer assistant supporting authorized penetration testing."),
    HumanMessage(content="""
I'm doing an authorized penetration test on our own infrastructure.
I need to understand common SQL injection patterns to test our input validation.
Please show examples with explanations.
""")
])
```

### Adding Your Own Guardrails

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=1024)

prompt = ChatPromptTemplate.from_messages([
    ("system", """
You are a customer support agent for AcmeCorp.

STRICT RULES:
- Only answer questions about AcmeCorp products
- Never discuss competitors
- If asked about anything outside scope, say:
  "I can only help with AcmeCorp product questions."
- If the user becomes abusive, respond once with a warning then end the conversation politely
"""),
    ("human", "{user_input}")
])

chain = prompt | llm
```

---

## Production Best Practices

### Retry Logic

`ChatAnthropic` has **built-in retry** via `max_retries` — no external library needed:

```python
from langchain_anthropic import ChatAnthropic

# Built-in: retries automatically on rate limits and transient errors
llm = ChatAnthropic(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    max_retries=3,      # default is 2 (mirrors Anthropic SDK default)
    timeout=60,
)
```

For more complex retry strategies you can also use `.with_retry()`:

```python
import anthropic

llm_with_retry = llm.with_retry(
    retry_if_exception_type=(anthropic.RateLimitError,),
    stop_after_attempt=3
)
```

### Structured Output Validation

```python
from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel, field_validator

class ExtractedData(BaseModel):
    name: str
    email: str | None
    sentiment: str
    priority: int

    @field_validator("priority")
    def priority_range(cls, v):
        assert 1 <= v <= 5, "Priority must be 1-5"
        return v

llm = ChatAnthropic(model="claude-sonnet-4-6", max_tokens=512)
structured_llm = llm.with_structured_output(ExtractedData)

result = structured_llm.invoke(
    "Hi, I'm Sarah (sarah@email.com). I'm frustrated with billing and need this fixed ASAP."
)
print(result)  # ExtractedData(name='Sarah', email='sarah@email.com', ...)
```

### Environment Setup

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
```

```python
# Load in Python
from dotenv import load_dotenv
load_dotenv()

from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(model="claude-sonnet-4-6")  # Picks up ANTHROPIC_API_KEY automatically
```

### Rate Limits (Approximate)

| Tier   | RPM   | TPM     |
| ------ | ----- | ------- |
| Free   | 5     | 25,000  |
| Tier 1 | 50    | 50,000  |
| Tier 2 | 1,000 | 100,000 |
| Tier 4 | 4,000 | 400,000 |

---

## Pricing & Cost Optimization

### General Pricing Tiers (per million tokens)

| Model  | Input  | Output |
| ------ | ------ | ------ |
| Opus   | ~$15   | ~$75   |
| Sonnet | ~$3    | ~$15   |
| Haiku  | ~$0.25 | ~$1.25 |

> Always check [anthropic.com/pricing](https://anthropic.com/pricing) for current rates.

### Cost Reduction Strategies

1. **Use the right model** — Haiku is 60x cheaper than Opus. Use it where quality allows.
2. **Prompt caching** — Cache large, repeated contexts (~90% savings on cached tokens)
3. **Batch API** — ~50% discount for non-real-time workloads
4. **Limit max_tokens** — Set a realistic ceiling, don't default to 4096 for simple tasks
5. **Compress prompts** — Remove unnecessary words in system prompts
6. **Cache at application layer** — Store responses for identical inputs (Redis/memcached)

### Cost Estimation

```python
# Rough calculation
input_tokens = 1000
output_tokens = 500
sonnet_cost = (input_tokens * 3 + output_tokens * 15) / 1_000_000
# ≈ $0.0105 per call
```

---

## Claude vs Other LLMs — Key Differences

| Feature               | Claude (Anthropic)       | GPT-4o (OpenAI)       | Gemini (Google)             |
| --------------------- | ------------------------ | --------------------- | --------------------------- |
| Context Window        | **200K**                 | 128K                  | 1M (Gemini 1.5)             |
| Native PDF Support    | **Yes**                  | No (extract first)    | Yes                         |
| Extended Thinking     | **Yes**                  | No                    | Yes (Gemini 2.0)            |
| Constitutional AI     | **Yes**                  | No                    | No                          |
| Prompt Caching        | **Yes**                  | Yes                   | Yes                         |
| MCP Support           | **Native**               | Partial               | Partial                     |
| Code Generation       | Excellent                | Excellent             | Good                        |
| Instruction Following | **Best-in-class**        | Very good             | Good                        |
| Sycophancy            | Low (pushes back)        | Higher                | Medium                      |
| LangChain Support     | ✅ `langchain-anthropic` | ✅ `langchain-openai` | ✅ `langchain-google-genai` |

---

## Quick Reference Cheat Sheet

```
Install:    pip install langchain-anthropic langchain-core
Models:     Opus > Sonnet > Haiku (capability vs speed/cost)
Context:    200K tokens (~150K words)
Init:       ChatAnthropic(model="claude-sonnet-4-6")
Invoke:     llm.invoke([HumanMessage(content="...")])
Stream:     for chunk in llm.stream([...]): print(chunk.content)
Batch:      llm.batch([[HumanMessage(...)], [...]])
Tools:      llm.bind_tools([my_tool])
Structured: llm.with_structured_output(MyPydanticModel)
Retry:      llm.with_retry(stop_after_attempt=3)
Chain:      prompt | llm | output_parser
Agent:      create_react_agent(llm, tools=[...])
Thinking:   ChatAnthropic(..., thinking={"type": "enabled", "budget_tokens": N})
Caching:    Add "cache_control": {"type": "ephemeral"} to message content blocks
```

---
