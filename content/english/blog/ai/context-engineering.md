+++
date = '2026-06-14T12:00:00+10:00'
draft = false
title = 'Context Engineering'
tags = ['Context Engineering', 'Claude Code', 'OpenCode', 'Coding Agent', 'Design Patterns', 'LLM']
summary = "Design patterns, best practices and caveats for engineering context in AI coding agents like Claude Code and OpenCode."
+++

## What Is Context Engineering

Context engineering is the practice of deliberately designing, structuring and optimizing the context provided to a large language model to produce more accurate, reliable and relevant outputs (https://www.ibm.com/think/topics/context-engineering). It is the natural progression of prompt engineering — the clearest tell that you have crossed from one discipline into the other is whether your improvements come from rewording or from rewiring (https://sourcegraph.com/blog/context-engineering).

Where prompt engineering focuses on writing and organizing LLM instructions, context engineering manages the entire context state: system prompts, tool definitions, MCP connections, external data sources, conversation history, and the interplay between them (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Every token that enters the context window depletes the model's limited attention budget, and as context grows, recall accuracy decreases — a phenomenon known as context rot (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

The guiding principle: find the smallest possible set of high-signal tokens that maximize the likelihood of your desired outcome (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

---

## Claude Code Context Architecture

Claude Code and OpenCode share a common lineage and expose similar primitives for context engineering. Understanding how each layer contributes to the context window is the foundation for designing effective patterns.

### Prompt Files: AGENTS.md and Instructions

The canonical rules file is `AGENTS.md` in the project root. `CLAUDE.md` is a fallback used only when no `AGENTS.md` exists (https://opencode.ai/docs/rules/). This file is loaded at session start and its content is injected directly into the system prompt — every token counts.

```markdown
# AGENTS.md

## Project Overview
This is a Rust monorepo with Cargo workspaces. Key crates:
- `core/` — shared data models
- `api/` — HTTP API (axum)
- `cli/` — CLI binary

## Conventions
- Use `thiserror` for error types
- Follow the Rust API Guidelines
- Run `cargo test` before committing
```

Additional instruction files can be loaded via the `instructions` field in `opencode.json`, supporting glob patterns and remote URLs (https://opencode.ai/docs/config/):

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

All instruction files are combined with `AGENTS.md` into the system prompt. Keep them concise — they compete for attention budget with every user turn.

### Skills

Skills are reusable domain-specific instruction sets stored as `SKILL.md` files in a `.opencode/skills/<name>/` directory. Unlike `AGENTS.md` which loads every session, skills use progressive disclosure — the agent loads skill names and descriptions at startup, but fetches full content only when a relevant task is encountered (https://code.claude.com/docs/en/skills) (https://opencode.ai/docs).

```markdown
---
name: code-review
description: "Detailed code review covering quality, security and performance"
---

When reviewing code, check for:
1. Error handling — are all fallible operations covered?
2. Security — are inputs validated and secrets protected?
3. Test coverage — are edge cases tested?
4. Performance — are there obvious inefficiencies?
```

Skills include frontmatter fields for controlling invocation: `disable-model-invocation: true` prevents automatic use (for side-effect workflows like deploys), `user-invocable: false` hides the skill from the slash menu while allowing automatic invocation, and `allowed-tools` grants auto-approval for specific tools while the skill is active (https://code.claude.com/docs/en/skills). The `context: fork` field runs the skill in an isolated subagent context, keeping the main window clean.

Keep each `SKILL.md` under 500 lines — move detailed reference material to supporting files within the skill directory (https://code.claude.com/docs/en/skills).

### Subagents

Subagents run in their own context window with custom system prompts, specific tool access and independent permissions (https://code.claude.com/docs/en/sub-agents). Only the result summary (typically 1K-2K tokens) returns to the parent context, making subagents a powerful tool for context isolation.

Built-in subagents include:

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| Explore | Haiku | Read-only | Codebase search, file discovery |
| Plan | Inherits | Read-only | Codebase research for planning |
| General-purpose | Inherits | All tools | Complex multi-step tasks |

Custom subagents are defined in `.opencode/agents/` or `opencode.json`:

```json
{
  "agent": {
    "code-reviewer": {
      "description": "Expert code reviewer for Rust crates",
      "prompt": "Review Rust code for safety, idiomatic patterns and performance.",
      "tools": ["Read", "Glob", "Grep"],
      "model": "sonnet"
    }
  }
}
```

Key frontmatter fields for agents include `permissionMode` (`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`), `skills` for preloading skill content into agent context at startup, `memory` for cross-session persistence (`user`, `project`, `local`), and `isolation: worktree` for running in an isolated git worktree copy (https://code.claude.com/docs/en/sub-agents).

### Plugins

Plugins package skills, agents, hooks, MCP servers, LSP servers, background monitors, output styles, themes and executables into a shareable bundle (https://code.claude.com/docs/en/plugins-reference). When a plugin is enabled, all its components are loaded:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Manifest (name, description, version)
├── skills/                  # Skills as <name>/SKILL.md directories
├── agents/                  # Custom agent definitions
├── hooks/
│   └── hooks.json           # Event handlers
├── monitors/
│   └── monitors.json        # Background monitor configs
├── bin/                     # Executables added to Bash tool PATH
├── .mcp.json                # MCP server configs
└── settings.json            # Default settings
```

A common mistake: putting `skills/`, `agents/` or `hooks/` inside `.claude-plugin/`. Only `plugin.json` goes in that directory — all other component directories must be at the plugin root (https://code.claude.com/docs/en/plugins-reference).

Plugin skills use namespaced names (`plugin-name:skill-name`) to prevent conflicts. When starting, prefer standalone configuration in `.opencode/` for fast iteration, then convert to a plugin when you need to share (https://code.claude.com/docs/en/plugins-reference).

### MCP Servers

MCP (Model Context Protocol) servers connect coding agents to external systems — databases, browsers, APIs, file systems. Each server exposes tools, resources and prompts that the agent can use (https://code.claude.com/docs/en/mcp) (https://opencode.ai/docs).

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/db"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

MCP servers can be scoped at three levels: `local` (`.claude.json` per-project), `project` (`.mcp.json` in project root, shared via version control), or `user` (`~/.claude.json` top-level, available across all projects) (https://code.claude.com/docs/en/mcp). Use `allowedTools` with wildcards (`mcp__server__*`) for MCP permissions — this is narrower than `bypassPermissions` and more secure (https://code.claude.com/docs/en/mcp) (https://code.claude.com/docs/en/permissions).

### Configuration Layering

Configuration files are merged, not replaced. Later configs override earlier ones only for conflicting keys (https://opencode.ai/docs/config/):

1. Remote config (`.well-known/opencode`) — organizational defaults
2. Global config (`~/.config/opencode/opencode.json`) — user preferences
3. Custom config (`OPENCODE_CONFIG` env var)
4. Project config (`opencode.json` in project root)
5. `.opencode` directories — agents, skills, commands, plugins
6. Inline config (`OPENCODE_CONFIG_CONTENT` env var) — runtime overrides

The `.opencode/` directory uses plural names for subdirectories: `agents/`, `commands/`, `modes/`, `plugins/`, `skills/`, `tools/`, `themes/`. Singular names are supported for backwards compatibility (https://opencode.ai/docs/config/).

---

## What Goes Where: Choosing the Right Primitive

The most common source of confusion in context engineering is knowing which primitive to use for which job. Each layer has a different lifecycle, scope, token cost and invocation model. Choosing wrong means paying token premiums for context that rarely applies, or worse, burying critical instructions in a rarely-loaded skill.

### Decision Matrix

| Primitive | Loaded | Scope | Token Cost | Best For |
|---|---|---|---|---|
| `AGENTS.md` | Every session start | Project | Full content, always | Project conventions, architecture overview, critical constraints |
| `instructions` (config) | Every session start | Project | Full content, always | External contributing guides, shared rule files from other tools |
| Skills | On demand (name + description at startup, full content when invoked) | Project or global | Content only when loaded | Domain workflows, language conventions, deployment routines, testing guides |
| Subagents | On delegation | Clean context per invocation | Summary only (1K-2K tokens) | Isolated tasks needing special tools, long-running operations, parallel research |
| Plugins | On enable | Plugin namespace | Cumulative (all components) | Shareable packages, marketplace distribution, cross-project reuse |
| MCP servers | On config load | Per-server tools | Tool definitions + response tokens | Live data access, external API integration, database queries, browser automation |
| Hooks | On lifecycle event | Per-event shell | Event + execution overhead | Automation (lint on save, notify on deploy), enforcement (block dangerous patterns) |
| Monitors | On session start (interactive only) | Per-monitor stream | Continuous notification tokens | Log watching, build status monitoring, long-running process observation |
| Permission rules | On tool invocation | Per-tool/per-pattern | Negligible | Security boundaries, access control, blast radius reduction |

### AGENTS.md

Put in `AGENTS.md`:

- Project structure overview — language, framework, directory layout
- Critical must-follow conventions — code style, error handling patterns, naming rules
- Build, test and run commands
- Architectural decisions and rationale
- Security-sensitive constraints — "never commit secrets", "always validate input"
- Links or pointers to key documentation

Do not put in `AGENTS.md`:

- Lengthy reference tables (API docs, command lists, framework guides)
- Rarely-needed workflows (deploy to production, database migration steps)
- Instructions for tasks only relevant to specific subdirectories
- Verbose examples that consume tokens every session

Keep `AGENTS.md` under 100-150 lines. If it grows beyond that, move sections into skills.

### Instructions (Config)

Use the `instructions` array in `opencode.json` for:

- Rule files shared across multiple tools (e.g. `.cursor/rules/*.md` for Cursor compatibility)
- External CONTRIBUTING.md or GOVERNANCE.md from upstream repos
- Remote URLs pointing to organizational standards (with 5-second timeout) (https://opencode.ai/docs/config/)
- Glob patterns for monorepo packages (`packages/*/AGENTS.md`) (https://opencode.ai/docs/rules/)

Do not use instructions for:

- Instructions that should load only on demand (use skills)
- Content better expressed as tool permissions (use permission rules)
- Personal preferences that vary per developer (use global config or skills)

### Skills

Put in a skill:

- Domain-specific workflows — deploy, release, database migration, code review checklist
- Language or framework conventions — React patterns, Rust idioms, Python testing style
- Integration guides — API usage, SDK conventions, vendor-specific tooling
- Repetitive but infrequent tasks the user might ask for
- Instructions that benefit from tool auto-approval (`allowed-tools`) (https://code.claude.com/docs/en/skills)
- Any instruction too long for `AGENTS.md`

Do not put in a skill:

- Content that should apply to every session (put in `AGENTS.md`)
- One-time instructions that lose meaning after execution
- Security-sensitive commands that should not auto-execute
- Content better expressed as a subagent prompt (when isolation or special tools needed)

A good rule of thumb: if you find yourself writing `/deploy` into the chat more than once a week, make it a skill. If you use a set of instructions exactly once per project setup, put them in `AGENTS.md` or skip them entirely.

### Subagents

Create a subagent when:

- The task needs a different model — use Haiku for cheap exploration, Opus for hard reasoning (https://code.claude.com/docs/en/sub-agents)
- The task needs different tools — restrict to read-only, grant MCP access, deny Write/Edit
- The task benefits from isolation — clean context prevents pollution of the main session
- The task is long-running — use `background: true` so it runs without blocking
- The task is parallelizable — spawn multiple agents for independent investigations
- The task is dangerous — use `isolation: worktree` for a throwaway git copy (https://code.claude.com/docs/en/sub-agents)

Do not create a subagent for:

- Tasks simpler than a single Read + Grep cycle (just let the main agent handle it)
- Tasks that require ongoing awareness of the full conversation history
- Tasks where delegation overhead exceeds the work itself

Name subagents for routing, not marketing. The `description` field is how Claude decides when to delegate — write it as routing guidance, not promotional copy (https://code.claude.com/docs/en/sub-agents). For example, "Reviews Rust code for safety and idiomatic patterns" is better than "Expert Rust reviewer with years of experience".

### Plugins

Package into a plugin when:

- You need to share configuration across a team or organization
- You want versioned releases with update notifications
- You are distributing through a marketplace
- The same skills or agents need to be available across multiple projects
- You need bundled executables in `bin/` (https://code.claude.com/docs/en/plugins-reference)

Keep as standalone configuration (`.opencode/`) when:

- The configuration is personal or project-specific
- You are experimenting before packaging
- You want short, unnamespaced skill names like `/deploy` instead of `/my-plugin:deploy`
- You need hooks, MCP servers or `permissionMode` on agents (plugin agents cannot use these) (https://code.claude.com/docs/en/plugins-reference)

The recommended workflow: start with standalone `.opencode/` for fast iteration, then convert to a plugin when you are ready to share (https://code.claude.com/docs/en/plugins-reference).

### MCP Servers

Connect an MCP server when:

- The agent needs live data — database queries, API calls, file system access
- The integration has a defined tool contract — reusable across sessions and agents
- External state changes and the agent needs current information
- You want to gate access with permission rules

Do not use MCP for:

- Static reference data better loaded as instructions or skills
- Operations achievable with built-in tools (Read, Glob, Grep, Bash)
- One-off scripts better expressed as Bash commands

Scope MCP servers at the right level (https://code.claude.com/docs/en/mcp):
- `.mcp.json` (project) — team-shared servers committed to version control
- `~/.claude.json` per-project entry (local) — personal servers for one project
- `~/.claude.json` top-level (user) — servers available in all projects
- Plugin `.mcp.json` — servers bundled with a distributable plugin

### Hooks

Use hooks for:

- Automation — run linter on file edit, notify on deploy completion
- Enforcement — block writes to sensitive files, require commit message format
- Observability — log tool usage, send telemetry to monitoring

Do not use hooks for:

- Complex workflows better expressed as skills or agents
- Operations requiring user interaction (hooks run unattended)
- Anything that should survive session restarts (use MCP servers or monitors instead)

Hooks run with the user's local privileges and receive event JSON on stdin (https://code.claude.com/docs/en/plugins-reference). Use them sparingly — every hook adds latency to tool execution.

### Permission Rules

Configure permission rules for:

- Security boundaries — deny destructive bash commands, block MCP write tools
- Workflow optimization — allow frequent safe commands (Bash(npm run *), Edit(*.test.ts))
- Blast radius reduction — restrict agents to their intended scope

Permission modes arranged from most to least restrictive (https://code.claude.com/docs/en/permissions):

| Mode | Behavior |
|---|---|
| `plan` | Read-only exploration |
| `default` | Prompt on first use of each tool |
| `acceptEdits` | Auto-accept file edits + common commands |
| `auto` | Background safety classifier (research preview) |
| `dontAsk` | Auto-deny unless pre-approved |
| `bypassPermissions` | Skip all prompts — container/VM only |

### Putting It All Together: A Worked Example

A team building a Rust web service might organize their context engineering like this:

```
project-root/
├── AGENTS.md                          # 80 lines: project structure, Rust conventions, build commands
├── opencode.json                      # Config: permissions, MCP, agent definitions
├── .opencode/
│   ├── skills/
│   │   ├── deploy/                    # /deploy: build, test, deploy to staging
│   │   │   └── SKILL.md
│   │   └── code-review/               # Auto-invoked on PR review requests
│   │       └── SKILL.md
│   ├── agents/
│   │   ├── db-explorer.md             # Read-only agent with postgres MCP access
│   │   └── cargo-audit.md             # Background agent for dependency scanning
│   └── commands/
│       └── release.md                 # /release: cut a new crate release
└── .mcp.json                          # Shared MCP: postgres, cargo-audit
```

- `AGENTS.md` covers what the agent needs every session — project layout, how to build and test, critical Rust idioms
- The deploy and code-review skills load only when their domain task is detected
- The db-explorer subagent gets its own Haiku model and postgres MCP — the main agent never sees database credentials
- The release command is a simple slash command for a procedurally-boring task
- MCP servers are project-scoped so the whole team shares them

---

## Design Patterns

### Just-in-Time Context Retrieval

Instead of loading all potentially relevant context upfront, maintain lightweight identifiers (file paths, query terms, MCP tool names) and dynamically load data only when needed (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). This mirrors human cognition — external organization plus indexing, not memorization.

Claude Code and OpenCode implement this naturally: `AGENTS.md` provides upfront orientation, then the agent uses `Glob`, `Grep`, `Read` and tool calls to fetch specific information on demand (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). A hybrid strategy works best: retrieve some data upfront for speed, leave autonomous exploration at the agent's discretion.

### Context Compaction

When the context window nears its limit, older conversation history is summarized into a compact form. The compaction should preserve (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):
- Architectural decisions and their rationale
- Unresolved bugs and their status
- Implementation details still in progress
- High-level summaries of completed work

Discard redundant tool outputs, resolved sub-tasks and verbose logs. In Claude Code, compaction can be triggered manually with `/compact` or `/summarize` (https://opencode.ai).

```yaml
# In opencode.json
compaction: auto       # automatic when nearing limit
# or
compaction: prune      # prune older messages
# or
compaction: reserved   # treat as reserved token buffer
```

### Structured Note-Taking (Agentic Memory)

The agent writes structured notes to a persistent file outside the context window, then re-reads them when needed (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). This is distinct from compaction — notes are deliberate knowledge artifacts rather than compressed conversation history.

```markdown
# .opencode/memory/architecture.md

## Decisions
- 2026-06-14: Chose PostgreSQL over MySQL for JSONB support.
  Rationale: Flexible schema for event sourcing.
  Alternatives considered: MySQL 8 JSON, MongoDB.

## Active Context
- Implementing the payment webhook handler (src/webhooks/payment.rs)
- Blocked on: webhook signature verification library decision
```

This pattern is supported via the `memory` field in subagent definitions, which accepts `user`, `project` or `local` scope for cross-session persistence (https://code.claude.com/docs/en/sub-agents).

### Sub-Agent Architecture

Delegating focused subtasks to specialized subagents keeps the main context window lean and prevents context pollution (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (https://code.claude.com/docs/en/sub-agents). Each subagent gets a clean context with only the tools and instructions it needs, and returns a condensed summary.

```json
{
  "agent": {
    "db-schema-explorer": {
      "description": "Explores database schemas and relationships",
      "prompt": "Use the postgres MCP server to describe the schema for the given tables.",
      "tools": ["Read", "Glob"],
      "mcpServers": { "postgres": true },
      "model": "haiku"
    },
    "code-reviewer": {
      "description": "Reviews pull request diffs for correctness and style",
      "prompt": "Review the diff for bugs, security issues and style problems.",
      "tools": ["Read", "Glob", "Grep"],
      "model": "sonnet",
      "isolation": "worktree"
    }
  }
}
```

Chain subagents for multi-step workflows where each agent's output feeds the next. Run parallel subagents for independent investigations. Use background subagents (`background: true`) for long-running tasks — they auto-deny permission prompts (https://code.claude.com/docs/en/sub-agents).

### Skills as Modular Context

Since `AGENTS.md` loads every session and consumes attention budget from turn one, defer detailed domain knowledge to skills that load only when the task requires them (https://code.claude.com/docs/en/skills). This is especially valuable for:

- Deployment workflows (load only when the user asks to deploy)
- Language-specific conventions (load only when working in that language)
- Testing frameworks (load only when writing or running tests)
- API integration guides (load only when the relevant tool is invoked)

```markdown
---
name: deploy
description: Deploy the application to staging or production
disable-model-invocation: true
user-invocable: true
context: fork
---

# Deploy Workflow

1. Run `cargo test` and confirm all tests pass
2. Build the release binary with `cargo build --release`
3. Copy binary to the deployment server via SCP
4. Run `systemctl restart my-service` on the server
5. Verify health endpoint returns 200
```

### Tool Design Principles

Tools must be self-contained, robust and unambiguous (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). If a human engineer cannot definitively say which tool should be used for a given task, an AI agent cannot be expected to do better (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

- Each tool should have a single, clear responsibility
- Tool descriptions must describe what the tool does and when to use it
- Parameters should have descriptive names and types
- Limit the total number of available tools — bloat forces the model to waste turns deciding

### Layered Documentation Strategy

Combine the `llms.txt` standard with MCP for a two-tier context system (../mcp/). The `llms.txt` file at a project's root provides a concise, LLM-friendly summary with links to detailed resources. MCP servers provide live tool access to the same systems:

- `llms.txt` — orientation, summaries, key links (lightweight, always available)
- `llms-full.txt` — comprehensive documentation (loaded on demand)
- MCP tools — live query, mutation and data access (gated by permissions)

### Inverted Configuration

The most intuitive approach is to pack everything into `AGENTS.md` — project context, language conventions, deployment instructions, API references. The inverted pattern flips this: `AGENTS.md` is the smallest file in your configuration. It contains only what the agent needs every single turn: project identity, critical constraints (never commit secrets, never mutate production), and build commands. Everything else — domain workflows, language conventions, deployment routines — lives in skills that load on demand.

A team that trimmed their `AGENTS.md` from 300 lines to 40 and migrated the remainder into skills saw token usage drop by roughly half and reported faster response times on routine tasks. The mechanism is straightforward: every token in `AGENTS.md` consumes attention budget on every turn, while skill tokens only enter context when the relevant task is detected.

### Subagent Sandbox

Subagents are typically framed as tools for parallelism or delegation. A distinct pattern uses them as security boundaries. Define a subagent with `disallowedTools: [Write, Edit, Bash]`, assign a cheaper model like Haiku, and grant it MCP access to production observability systems. The result is a read-only investigator that cannot modify state under any circumstances.

This pattern is particularly useful for on-call incident triage. A subagent can query production logs, inspect metrics and return a diagnosis without any risk of filesystem mutation or configuration drift. The permission boundary is machine-enforced by the tool layer, not dependent on prompt instructions.

### Forked Skill Isolation

Skills that are not forked execute their instructions in the main context, and those instructions persist until compaction removes them or the session ends. For skills with side effects — deployments, database migrations, API mutations — this pollution is undesirable. The `context: fork` field runs the skill in an isolated subagent context. Skill instructions enter context, execute and vanish. The main session retains only the result summary.

A deploy skill configured with `context: fork` is the canonical example. Its build steps, server addresses and rollback procedures consume zero tokens after completion, unlike an unforked skill whose instructions linger and compete for attention budget on subsequent turns.

### Prohibitive Constraints

Positive instructions — do this, follow that convention — are heuristics the model may or may not follow depending on context. Prohibitive constraints — never do this — function as unconditional rules that the model treats with higher priority. A single "Never commit secrets or credentials" in `AGENTS.md` is more reliably followed than fifty lines describing ideal coding practices.

This maps to the permission system for machine enforcement: `bash(rm -rf *)` and `mcp__production__*` denials in `opencode.json` backstop prompt-level prohibitions with tool-level blocks.

### Agentic Memory Journaling

Instead of maintaining documentation manually, the agent writes structured notes to a persistent file at session milestones — architectural decisions, unresolved bugs, rationale for technical choices. On the next session, the agent reads these notes as part of its initialization. Over several sessions the agent effectively builds its own institutional memory.

This extends the structured note-taking pattern with a lifecycle: journal on session end, rehydrate on session start. The `memory` field on subagents (`user`, `project` or `local` scope) provides the persistence layer, and a skill or hook can trigger the write step automatically.

### MCP as Contract Interface

Natural language instructions contain ambiguity. MCP tool definitions are exact — typed parameters, clear schemas, defined return types. The pattern is to expose project-specific operations (build, deploy, database schema introspection) as MCP tools rather than describing them in prose.

A `query(sql: string, params: object[])` MCP tool with a defined schema cannot be misinterpreted the way "query the database carefully" can. This shifts context engineering from prose-based instructions to interface-based contracts, making agent behavior more predictable and easier to audit across sessions.

### Permission Configuration as Deployable Policy

Interactive permission prompts are the default, but the pattern scales poorly across a team. Treating the `permission` block in `opencode.json` as a machine-enforceable security policy — version-controlled, reviewed in PRs, deployed with the project — transforms onboarding from verbal knowledge transfer to artifact distribution.

```
edit: "allow"
bash(npm run *): "allow"
bash(curl *): "deny"
mcp__production__*: "deny"
```

New team members clone the repo and inherit the policy. No tribal knowledge required.

### Two-Phase Compaction

Compaction alone is lossy — it summarizes conversation history but does not extract architectural decisions or rationale. The two-phase pattern runs compaction to free context window space, then immediately has the agent write structured notes capturing what a future session should know. The compacted summary preserves short-term continuity; the notes provide long-term memory across sessions.

---

## Design Considerations & Caveats

### Context Rot and the Lost-in-the-Middle Problem

As context grows, the model's recall accuracy degrades — especially for information in the middle of the window (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (https://sourcegraph.com/blog/context-engineering). Highest-signal material must go at the beginning or end, not the middle. This means:
- Place the most critical instructions at the start of `AGENTS.md`
- Put tool definitions early in the system prompt
- Avoid burying important context in long conversation history
- Compaction should prioritize preserving early and late positions

### Tool Bloat

Too many tools degrade performance (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (../mcp/). Every additional tool increases the model's decision space, and verbose tool responses consume tokens quickly. Give the agent too many tools and it gets overwhelmed, leading to slower response times and more hallucinated tool calls. Give it too few and it lacks the capability to do the job (../mcp/).

Audit your tool set regularly. Remove unused MCP servers. Scope tools to subagents rather than making everything available to the main agent.

### Permission Security

Permission rules are enforced by Claude Code and OpenCode at the tool level, not by the model — prompt instructions alone cannot reliably prevent the model from accessing tools (https://code.claude.com/docs/en/permissions). Use the permission system, not prompt engineering, for security boundaries.

Precedence follows deny-first: a matching deny rule blocks a tool even if an allow rule also matches (https://code.claude.com/docs/en/permissions). For MCP permissions, prefer `allowedTools` with wildcards over `bypassPermissions` mode:

```json
{
  "permission": {
    "mcp__postgres__query": "deny",
    "mcp__postgres__*": "ask"
  }
}
```

### Bash Command Pattern Fragility

Pattern matching on Bash command arguments is unreliable (https://code.claude.com/docs/en/permissions). For example, `Bash(curl http://github.com *)` will not catch variations like `curl -X GET https://github.com/...` or `curl --url "http://github.com/..."`. Do not rely on Bash argument patterns for security — use tool-level denials and MCP scoping instead.

### Compaction Trade-Offs

Automatic compaction is lossy. Summarized context loses detail, and incorrect summaries can lead the agent astray (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Key trade-offs:
- Compacting too aggressively discards important nuance
- Compacting too rarely degrades performance from context rot
- The compaction summary itself occupies tokens
- Re-attached skills after compaction are budgeted at 5K tokens each, with a combined 25K token budget for all re-attached skills (https://code.claude.com/docs/en/skills)

Use manual compaction (`/compact`) when you know what should be preserved. Use automatic compaction for routine maintenance.

### Stale Retrieval

Vector indexes and cached context go stale. Embeddings not refreshed poison the agent with outdated information (https://sourcegraph.com/blog/context-engineering). In a Kubernetes monorepo study, MCP-based retrieval achieved file recall of 0.277 versus 0.127 without MCP, and an F1@5 of 0.262 versus 0.099 — but this assumes fresh indexes (https://sourcegraph.com/blog/context-engineering).

For project context, prefer live queries (Glob, Grep, Read, MCP tools) over cached embeddings when freshness matters. Use caching primarily for reference data that changes infrequently.

### Skills Lifecycle Surprises

Skills content enters the conversation once and stays until compaction removes it (https://code.claude.com/docs/en/skills). This means skills are best for standing instructions that apply for the duration of a task, not for one-time steps. If a skill configures a tool or changes state, consider whether the effect should persist after the skill completes.

The `context: fork` field mitigates this by running the skill in an isolated subagent — its effects never reach the main context (https://code.claude.com/docs/en/skills). Use this for skills with side effects like deploys, commits or API mutations.

---

## Things One Might Miss

### AGENTS.md vs CLAUDE.md Precedence

`AGENTS.md` is the canonical rules file. `CLAUDE.md` is loaded only as a fallback when no `AGENTS.md` exists (https://opencode.ai/docs/rules/). If both files exist in the same project, `CLAUDE.md` is silently ignored. The global search path follows the same priority: `~/.config/opencode/AGENTS.md` before `~/.claude/CLAUDE.md`. Claude Code skills are loaded from `~/.claude/skills/` as a fallback when no OpenCode skills directory exists.

### .opencode Directory Naming

The `.opencode/` directory uses plural subdirectory names: `agents/`, `commands/`, `modes/`, `plugins/`, `skills/`, `tools/`, `themes/` (https://opencode.ai/docs/config/). Singular names are accepted for backwards compatibility but the plural form is canonical. Mixing both in the same project works but is confusing.

### MCP Scoping Rules

Project-scoped MCP servers in `.mcp.json` require user approval on first clone — you cannot silently add a server that runs arbitrary code on a collaborator's machine (https://code.claude.com/docs/en/mcp). Managed MCP (`managed-mcp.json`) bypasses this by deploying a fixed server set that users cannot modify. When using managed settings, `allowManagedMcpServersOnly: true` makes the allowlist authoritative and blocks all other servers.

### Plugin Agent Restrictions

Plugin-shipped agents cannot use `hooks`, `mcpServers` or `permissionMode` fields for security reasons (https://code.claude.com/docs/en/plugins-reference). If you need those capabilities, copy the agent to `.opencode/agents/` or `~/.config/opencode/agents/` instead of shipping it from a plugin.

### The `!` Shell Injection in Skills

Skills support dynamic context injection via `` !`command` `` — a shell command that runs before the skill content is sent to the model, with its output replacing the placeholder (https://code.claude.com/docs/en/skills). This is powerful but dangerous in shared skills:

```markdown
---
name: deploy
---

# Deploy
Run: !`git log --oneline -3`
Current branch: !`git branch --show-current`
```

Skills with shell injection can be disabled globally with `disableSkillShellExecution: true` in managed settings. Prefer `$ARGUMENTS` or named arguments for user-provided input over shell commands.

### Variable Substitution in Configuration

OpenCode and Claude Code support variable substitution in configuration files (https://opencode.ai/docs/config/) (https://code.claude.com/docs/en/plugins-reference):
- `{env:VARIABLE_NAME}` — environment variable at runtime
- `{file:path/to/file}` — file content at startup
- `${CLAUDE_PLUGIN_ROOT}` — absolute path to installed plugin version
- `${CLAUDE_PLUGIN_DATA}` — persistent data directory that survives plugin updates
- `${CLAUDE_PROJECT_DIR}` — project root directory
- `${user_config.KEY}` — plugin user configuration values

These are evaluated at different points in the lifecycle. Env vars and `{file:...}` are resolved at config load time. Plugin variables are resolved when the plugin initializes. Understanding this distinction matters when debugging path issues in MCP servers or hooks.

### Hooks Run with User Privileges

Hooks execute shell commands with the user's local privileges (https://code.claude.com/docs/en/plugins-reference). A shared plugin that defines hooks should make its side effects clear and keep commands auditable. Hook commands receive event JSON on stdin and can extract fields with `jq` or similar tools:

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix"
        }
      ]
    }
  ]
}
```

### Background Monitor Implications

Background monitors (`monitors/monitors.json`) run unsandboxed at the same trust level as hooks (https://code.claude.com/docs/en/plugins-reference). They run only in interactive CLI sessions and are skipped when the Monitor tool is unavailable. Each line written to stdout by the monitor command is delivered to Claude as a notification — verbose monitors waste tokens and distract the agent.

### Precedence of Config Merge (Not Replace)

Configuration files are merged, not replaced. A project `opencode.json` that omits the `mcp` key does not clear MCP servers defined in global config — they remain active (https://opencode.ai/docs/config/). To disable a global MCP server from a project config, you must explicitly set it to `false` or `null`. This is a common source of confusion when debugging why an unexpected tool is available.

---

## References

- [IBM — What Is Context Engineering?](https://www.ibm.com/think/topics/context-engineering)
- [Sourcegraph — Context Engineering: A Practical Guide for AI Agents (2026)](https://sourcegraph.com/blog/context-engineering)
- [Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OpenCode — Rules (AGENTS.md)](https://opencode.ai/docs/rules/)
- [OpenCode — Configuration](https://opencode.ai/docs/config/)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code — Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code — MCP Integration](https://code.claude.com/docs/en/mcp)
- [Claude Code — Permissions](https://code.claude.com/docs/en/permissions)
- [OpenCode — Website](https://opencode.ai)
- [MCP Blog Post (this site)](../mcp/)
