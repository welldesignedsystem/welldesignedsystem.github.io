+++
date = '2026-06-15T12:00:00+10:00'
draft = false
title = 'Context Engineering'
tags = ['Context Engineering', 'Claude Code', 'Coding Agent', 'Design Patterns', 'LLM']
summary = "Design patterns, best practices and caveats for engineering context in AI coding agents with Claude Code."
+++

## What Is Context Engineering

Context engineering is the practice of deliberately designing, structuring and optimizing the context provided to a large language model to produce more accurate, reliable and relevant outputs (https://www.ibm.com/think/topics/context-engineering). It is the natural progression of prompt engineering — the clearest tell that you have crossed from one discipline into the other is whether your improvements come from rewording or from rewiring (https://sourcegraph.com/blog/context-engineering).

Where prompt engineering focuses on writing and organizing LLM instructions, context engineering manages the entire context state: system prompts, tool definitions, MCP connections, external data sources, conversation history, and the interplay between them (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Every token that enters the context window depletes the model's limited attention budget, and as context grows, recall accuracy decreases — a phenomenon known as context rot (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

The guiding principle: find the smallest possible set of high-signal tokens that maximize the likelihood of your desired outcome (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

---

## How Coding Agents Consume Context

Modern coding agents like Claude Code — whether running in VS Code's extension panel or in the terminal — construct their context from several distinct layers. Each layer has a different lifecycle, token cost and invocation model.

### CLAUDE.md: The Per-Session Foundation

`CLAUDE.md` at the project root is loaded at every session start. Its content is injected directly into the system prompt — every token it contains competes for attention on every user turn (https://docs.anthropic.com/en/docs/claude-code/overview).

```markdown
# CLAUDE.md

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

Anthropic's own guidance: keep it short. For every line, ask "would the agent make a mistake without this?" If not, delete it (https://docs.anthropic.com/en/docs/claude-code/overview).

Additional instruction files can be referenced via the `instructions` field in Claude Code settings, supporting glob patterns and remote URLs:

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

In monorepos, `CLAUDE.md` cascades: a `CLAUDE.md` at the root and another at `services/billing/CLAUDE.md` both load when working in the billing directory.

### Path-Filtered Rules

Rules in `.claude/rules/*.md` provide deep domain knowledge that loads only when file patterns match (https://code.claude.com/docs/en/skills). This is the middle ground between `CLAUDE.md` (always loaded) and skills (user or model invoked).

```
.claude/
└── rules/
    ├── python-testing.md     # Applies when working with test files
    └── database.md           # Applies when touching SQL or schema files
```

Each rule file can specify a `paths` glob in its frontmatter to control when it activates. This prevents irrelevant instructions from consuming attention budget.

### Skills: On-Demand Workflows

Skills are reusable instruction sets stored as `SKILL.md` files in `~/.claude/skills/<name>/` (global) or `.claude/skills/<name>/` (project). Unlike `CLAUDE.md` which loads every session, skills use progressive disclosure — the agent loads only names and descriptions at startup, then fetches full content when a relevant task is detected (https://code.claude.com/docs/en/skills).

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

Subagents run in their own context window with custom system prompts, specific tool access and independent permissions (https://code.claude.com/docs/en/sub-agents). Only the result summary (typically 1K-2K tokens) returns to the parent context.

Built-in subagents include:

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| Explore | Haiku | Read-only | Codebase search, file discovery |
| Plan | Inherits | Read-only | Codebase research for planning |
| General-purpose | Inherits | All tools | Complex multi-step tasks |

Custom subagents are defined in `.claude/agents/` or `~/.claude/agents/`:

```markdown
---
name: db-schema-explorer
description: Explores database schemas and relationships using MCP
model: haiku
disallowedTools: Write, Edit, Bash
---

Explore the database schema for the requested tables using the postgres MCP server.
Return table names, column types, indexes and foreign key relationships.
```

Key frontmatter fields include `permissionMode` (`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`), `skills` for preloading skill content at startup, `memory` for cross-session persistence (`user`, `project`, `local`), and `isolation: worktree` for running in an isolated git worktree copy (https://code.claude.com/docs/en/sub-agents).

### MCP Servers

MCP (Model Context Protocol) servers connect coding agents to external systems — databases, browsers, APIs, file systems. Each server exposes tools, resources and prompts that the agent can use (https://code.claude.com/docs/en/mcp).

In VS Code, MCP servers are added via the CLI (`claude mcp add` in the integrated terminal) and managed through the `/mcp` command in the chat panel (https://code.claude.com/docs/en/vs-code).

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

MCP servers can be scoped at three levels: `local` (per-project entry in `~/.claude/settings.json`), `project` (`.mcp.json` in project root, shared via version control), or `user` (`~/.claude/settings.json` top-level, available across all projects) (https://code.claude.com/docs/en/mcp). Use `allowedTools` with wildcards (`mcp__server__*`) for MCP permissions — this is narrower than `bypassPermissions` and more secure (https://code.claude.com/docs/en/permissions).

### Hooks

Hooks run shell commands automatically before or after Claude Code actions (https://code.claude.com/docs/en/plugins-reference). They are defined in `~/.claude/settings.json` or `.claude/settings.json`:

```json
{
  "hooks": {
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
}
```

Common hook events include `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `PreCompact`, and `PostCompact`. Hooks run with the user's local privileges and receive event JSON on stdin. Use them sparingly — every hook adds latency.

### Plugins

Plugins package skills, agents, hooks, MCP servers and executables into shareable bundles (https://code.claude.com/docs/en/plugins-reference). In VS Code, plugins are managed through the graphical `/plugins` interface. The extension and CLI share the same plugin system — plugins configured in one are available in the other.

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Manifest (name, description, version)
├── skills/                  # Skills as <name>/SKILL.md directories
├── agents/                  # Custom agent definitions
├── hooks/
│   └── hooks.json           # Event handlers
├── bin/                     # Executables added to Bash tool PATH
└── .mcp.json                # MCP server configs
```

A common mistake: putting `skills/`, `agents/` or `hooks/` inside `.claude-plugin/`. Only `plugin.json` goes in that directory — all other component directories must be at the plugin root (https://code.claude.com/docs/en/plugins-reference).

### VS Code Extension Settings

The VS Code extension adds its own layer of configuration under the `claudeCode.*` settings namespace (https://code.claude.com/docs/en/vs-code):

| Setting | Default | Purpose |
|---------|---------|---------|
| `initialPermissionMode` | `default` | Approval mode for new conversations |
| `useTerminal` | `false` | Use CLI-style terminal instead of graphical panel |
| `preferredLocation` | `panel` | Where the Claude panel opens |
| `respectGitIgnore` | `true` | Exclude `.gitignore` patterns from searches |
| `allowDangerouslySkipPermissions` | `false` | Enable bypass mode (sandbox only) |

These are set through VS Code's Settings UI (`Cmd+,`) under Extensions → Claude Code, or in `.vscode/settings.json` for project-scoped overrides.

### Configuration Layering

Claude Code configuration is merged from multiple sources, with later sources overriding earlier ones for conflicting keys:

1. Managed settings (organizational defaults)
2. `~/.claude/settings.json` (user global)
3. `.claude/settings.json` (project)
4. `.claude/settings.local.json` (project-local, not committed)
5. VS Code extension settings (`claudeCode.*`)
6. Command-line flags and environment variables

The `.claude/` directory uses plural subdirectory names: `agents/`, `skills/`, `rules/`. Singular names are accepted for backwards compatibility.

---

## What Goes Where: Choosing the Right Primitive

The most common source of confusion in context engineering is knowing which primitive to use for which job. Each layer has a different lifecycle, scope, token cost and invocation model.

### Decision Matrix

| Primitive | Loaded | Scope | Token Cost | Best For |
|---|---|---|---|---|
| `CLAUDE.md` | Every session start | Project | Full content, always | Project conventions, architecture overview, critical constraints |
| Rules (`.claude/rules/`) | When path matches | Project | Content only when matched | Deep domain knowledge, path-specific conventions |
| Skills | On demand (name + description at startup, content when invoked) | User or project | Content only when loaded | Domain workflows, deployment routines, testing guides |
| Subagents | On delegation | Clean context per invocation | Summary only (1K-2K tokens) | Isolated tasks needing special tools, long-running operations, parallel research |
| Plugins | On enable | Plugin namespace | Cumulative (all components) | Shareable packages, marketplace distribution, cross-project reuse |
| MCP servers | On config load | Per-server tools | Tool definitions + response tokens | Live data access, external API integration, database queries, browser automation |
| Hooks | On lifecycle event | Per-event shell | Event + execution overhead | Automation (lint on save), enforcement (block dangerous patterns) |
| Permission rules | On tool invocation | Per-tool/per-pattern | Negligible | Security boundaries, access control, blast radius reduction |

### CLAUDE.md

Put in `CLAUDE.md`:

- Project structure overview — language, framework, directory layout
- Critical must-follow conventions — code style, error handling patterns, naming rules
- Exact build, test and run commands the agent would otherwise guess wrong
- Architectural decisions and rationale
- Security-sensitive constraints — "never commit secrets", "always validate input"
- "Stuck record" items — mistakes the team has made before

Do not put in `CLAUDE.md`:

- Lengthy reference tables (API docs, command lists, framework guides)
- Rarely-needed workflows (deploy to production, database migration steps)
- Instructions for tasks only relevant to specific subdirectories
- Verbose examples that consume tokens every session

Keep `CLAUDE.md` under 100-150 lines. If it grows beyond that, move sections into skills or rules. Anthropic's own `CLAUDE.md` for the Claude Code repository is famously terse — it fits in a single screen.

### Skills

Put in a skill:

- Domain-specific workflows — deploy, release, database migration, code review checklist
- Language or framework conventions — React patterns, Rust idioms, Python testing style
- Integration guides — API usage, SDK conventions, vendor-specific tooling
- Repetitive but infrequent tasks the user might ask for
- Instructions that benefit from tool auto-approval (`allowed-tools`) (https://code.claude.com/docs/en/skills)
- Any instruction too long for `CLAUDE.md`

Do not put in a skill:

- Content that should apply to every session (put in `CLAUDE.md`)
- One-time instructions that lose meaning after execution
- Security-sensitive commands that should not auto-execute
- Content better expressed as a subagent prompt (when isolation or special tools needed)

A good rule of thumb: if you find yourself describing the same workflow more than once a week, make it a skill.

### Subagents

Create a subagent when:

- The task needs a different model — use Haiku for cheap exploration, Opus for hard reasoning (https://code.claude.com/docs/en/sub-agents)
- The task needs different tools — restrict to read-only, grant MCP access, deny Write/Edit
- The task benefits from isolation — clean context prevents pollution of the main session
- The task is long-running — use `background: true` so it runs without blocking
- The task is parallelizable — spawn multiple agents for independent investigations
- The task is dangerous — use `isolation: worktree` for a throwaway git copy (https://code.claude.com/docs/en/sub-agents)

Do not create a subagent for tasks simpler than a single Read + Grep cycle, tasks that require ongoing awareness of the full conversation history, or tasks where delegation overhead exceeds the work itself.

Name subagents for routing, not marketing. The `description` field is how Claude decides when to delegate — write it as routing guidance, not promotional copy (https://code.claude.com/docs/en/sub-agents).

### MCP Servers

Connect an MCP server when:

- The agent needs live data — database queries, API calls, file system access
- The integration has a defined tool contract — reusable across sessions and agents
- External state changes and the agent needs current information
- You want to gate access with permission rules

Do not use MCP for static reference data better loaded as instructions or skills, operations achievable with built-in tools (Read, Glob, Grep, Bash), or one-off scripts better expressed as Bash commands.

Scope MCP servers at the right level (https://code.claude.com/docs/en/mcp):
- `.mcp.json` (project) — team-shared servers committed to version control
- `~/.claude/settings.json` per-project entry (local) — personal servers for one project
- `~/.claude/settings.json` top-level (user) — servers available in all projects
- Plugin `.mcp.json` — servers bundled with a distributable plugin

### Hooks

Use hooks for automation (run linter on file edit), enforcement (block writes to sensitive files), and observability (log tool usage). Do not use hooks for complex workflows better expressed as skills or agents, or anything that should survive session restarts (use MCP servers instead).

### Permission Rules

Configure permission modes for security boundaries and workflow optimization:

| Mode | Behavior |
|---|---|
| `plan` | Read-only exploration |
| `default` | Prompt on first use of each tool |
| `acceptEdits` | Auto-accept file edits + common commands |
| `auto` | Background safety classifier (research preview) |
| `dontAsk` | Auto-deny unless pre-approved |
| `bypassPermissions` | Skip all prompts — container/VM only (https://code.claude.com/docs/en/permissions) |

In VS Code, the permission mode is set via `claudeCode.initialPermissionMode` in settings or toggled through the prompt box mode indicator. The `allowDangerouslySkipPermissions` setting must be enabled to expose the `bypassPermissions` option.

### Putting It All Together: A Worked Example

A team building a Rust web service might organize their context engineering like this:

```
project-root/
├── CLAUDE.md                          # 60 lines: project structure, Rust conventions, build commands
├── .claude/
│   ├── settings.json                  # Permissions, MCP, hook config
│   ├── rules/
│   │   └── postgres.md                # Schema conventions, query patterns (applies to .sql/.rs)
│   ├── skills/
│   │   ├── deploy/                    # /deploy: build, test, deploy to staging
│   │   │   └── SKILL.md
│   │   └── code-review/               # Auto-invoked on PR review requests
│   │       └── SKILL.md
│   └── agents/
│       └── db-explorer.md             # Read-only agent with postgres MCP access
└── .mcp.json                          # Shared MCP: postgres, cargo-audit
```

- `CLAUDE.md` covers what the agent needs every session — project layout, how to build and test, critical Rust idioms
- The postgres rule applies only when touching SQL schema files or database code
- The deploy and code-review skills load only when their domain task is detected
- The db-explorer subagent gets its own Haiku model and postgres MCP — the main agent never sees database credentials
- MCP servers are project-scoped so the whole team shares them
- Permission mode is set to `acceptEdits` in VS Code settings so routine edits flow without prompting

---

## Design Patterns

### Just-in-Time Context Retrieval

Instead of loading all potentially relevant context upfront, maintain lightweight identifiers (file paths, query terms, MCP tool names) and dynamically load data only when needed (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). This mirrors human cognition — external organization plus indexing, not memorization.

Claude Code implements this naturally: `CLAUDE.md` provides upfront orientation, then the agent uses file reads, glob searches and tool calls to fetch specific information on demand. In the VS Code extension, @-mentions provide a direct channel for attaching file context to prompts (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). A hybrid strategy works best: retrieve some data upfront for speed, leave autonomous exploration at the agent's discretion.

### Context Compaction

When the context window nears its limit, older conversation history is summarized into a compact form. The compaction should preserve (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):
- Architectural decisions and their rationale
- Unresolved bugs and their status
- Implementation details still in progress
- High-level summaries of completed work

Discard redundant tool outputs, resolved sub-tasks and verbose logs. Compaction runs automatically in Claude Code and can be triggered manually with `/compact`.

### Structured Note-Taking (Agentic Memory)

The agent writes structured notes to a persistent file outside the context window, then re-reads them when needed (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). This is distinct from compaction — notes are deliberate knowledge artifacts rather than compressed conversation history.

```markdown
# .claude/memory/architecture.md

## Decisions
- 2026-06-14: Chose PostgreSQL over MySQL for JSONB support.
  Rationale: Flexible schema for event sourcing.
  Alternatives considered: MySQL 8 JSON, MongoDB.

## Active Context
- Implementing the payment webhook handler (src/webhooks/payment.rs)
- Blocked on: webhook signature verification library decision
```

This is supported via the `memory` field in subagent definitions, which accepts `user`, `project` or `local` scope for cross-session persistence (https://code.claude.com/docs/en/sub-agents).

### Sub-Agent Architecture

Delegating focused subtasks to specialized subagents keeps the main context window lean and prevents context pollution (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (https://code.claude.com/docs/en/sub-agents). Each subagent gets a clean context with only the tools and instructions it needs, and returns a condensed summary.

```markdown
---
name: db-schema-explorer
description: Explores database schemas and relationships using MCP
model: haiku
disallowedTools: Write, Edit, Bash
---

Use the postgres MCP server to describe the schema for the given tables.
```

Chain subagents for multi-step workflows where each agent's output feeds the next. Run parallel subagents for independent investigations. Use background subagents for long-running tasks — they auto-deny permission prompts (https://code.claude.com/docs/en/sub-agents).

### Skills as Modular Context

Since `CLAUDE.md` loads every session and consumes attention budget from turn one, defer detailed domain knowledge to skills that load only when the task requires them (https://code.claude.com/docs/en/skills). This is especially valuable for deployment workflows, language-specific conventions, testing frameworks, and API integration guides.

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

The most intuitive approach is to pack everything into `CLAUDE.md`. The inverted pattern flips this: `CLAUDE.md` is the smallest file in your configuration. It contains only what the agent needs every single turn: project identity, critical constraints, and build commands. Everything else — domain workflows, language conventions, deployment routines — lives in skills that load on demand.

A team that trimmed their `CLAUDE.md` from 300 lines to 40 and migrated the remainder into skills saw token usage drop by roughly half on routine tasks. Every token in `CLAUDE.md` consumes attention budget on every turn, while skill tokens only enter context when the relevant task is detected.

### Subagent Sandbox

Subagents are typically framed as tools for parallelism or delegation. A distinct pattern uses them as security boundaries. Define a subagent with `disallowedTools: Write, Edit, Bash`, assign a cheaper model like Haiku, and grant it MCP access to production observability systems. The result is a read-only investigator that cannot modify state under any circumstances.

This pattern is particularly useful for on-call incident triage. A subagent can query production logs, inspect metrics and return a diagnosis without any risk of filesystem mutation or configuration drift. The permission boundary is machine-enforced by the tool layer, not dependent on prompt instructions.

### Forked Skill Isolation

Skills that are not forked execute their instructions in the main context, and those instructions persist until compaction removes them or the session ends. For skills with side effects — deployments, database migrations, API mutations — this pollution is undesirable. The `context: fork` field runs the skill in an isolated subagent context. Skill instructions enter context, execute and vanish. The main session retains only the result summary.

A deploy skill configured with `context: fork` is the canonical example. Its build steps, server addresses and rollback procedures consume zero tokens after completion, unlike an unforked skill whose instructions linger and compete for attention budget on subsequent turns.

### Prohibitive Constraints

Positive instructions — do this, follow that convention — are heuristics the model may or may not follow depending on context. Prohibitive constraints — never do this — function as unconditional rules that the model treats with higher priority. A single "Never commit secrets or credentials" in `CLAUDE.md` is more reliably followed than fifty lines describing ideal coding practices.

A powerful technique: when Claude makes a mistake, tell it "Update `CLAUDE.md` so you never make this mistake again." The resulting self-authored rules are often more precise than anything a human would write — Boris Cherny of Anthropic describes these as "creepily accurate" (https://docs.anthropic.com/en/docs/claude-code/overview).

### Agentic Memory Journaling

Instead of maintaining documentation manually, the agent writes structured notes to a persistent file at session milestones — architectural decisions, unresolved bugs, rationale for technical choices. On the next session, the agent reads these notes as part of its initialization. Over several sessions the agent effectively builds its own institutional memory.

This extends the structured note-taking pattern with a lifecycle: journal on session end, rehydrate on session start. The `memory` field on subagents (`user`, `project` or `local` scope) provides the persistence layer, and a skill or hook can trigger the write step automatically.

### MCP as Contract Interface

Natural language instructions contain ambiguity. MCP tool definitions are exact — typed parameters, clear schemas, defined return types. The pattern is to expose project-specific operations (build, deploy, database schema introspection) as MCP tools rather than describing them in prose.

A `query(sql: string, params: object[])` MCP tool with a defined schema cannot be misinterpreted the way "query the database carefully" can. This shifts context engineering from prose-based instructions to interface-based contracts, making agent behavior more predictable and easier to audit across sessions.

### Permission Configuration as Deployable Policy

Interactive permission prompts are the default, but the pattern scales poorly across a team. Treating the permission block in `.claude/settings.json` as a machine-enforceable security policy — version-controlled, reviewed in PRs, deployed with the project — transforms onboarding from verbal knowledge transfer to artifact distribution.

```json
{
  "permissions": {
    "allow": ["Read", "Edit", "Bash(git *)", "Bash(npm run *)"]
  }
}
```

New team members clone the repo and inherit the policy. No tribal knowledge required.

### Two-Phase Compaction

Compaction alone is lossy — it summarizes conversation history but does not extract architectural decisions or rationale. The two-phase pattern runs compaction to free context window space, then immediately has the agent write structured notes capturing what a future session should know. The compacted summary preserves short-term continuity; the notes provide long-term memory across sessions.

---

## Design Considerations & Caveats

### Context Rot and the Lost-in-the-Middle Problem

As context grows, the model's recall accuracy degrades — especially for information in the middle of the window (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (https://sourcegraph.com/blog/context-engineering). Highest-signal material must go at the beginning or end, not the middle. This means:
- Place the most critical instructions at the start of `CLAUDE.md`
- Put tool definitions early in the system prompt
- Avoid burying important context in long conversation history
- Compaction should prioritize preserving early and late positions

### Tool Bloat

Too many tools degrade performance (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (../mcp/). Every additional tool increases the model's decision space, and verbose tool responses consume tokens quickly. Give the agent too many tools and it gets overwhelmed, leading to slower response times and more hallucinated tool calls. Give it too few and it lacks the capability to do the job.

Audit your tool set regularly. Remove unused MCP servers. Scope tools to subagents rather than making everything available to the main agent.

### Permission Security

Permission rules are enforced by Claude Code at the tool level, not by the model — prompt instructions alone cannot reliably prevent the model from accessing tools (https://code.claude.com/docs/en/permissions). Use the permission system, not prompt engineering, for security boundaries.

Precedence follows deny-first: a matching deny rule blocks a tool even if an allow rule also matches. In VS Code, the permission mode is controlled through `claudeCode.initialPermissionMode` and can be toggled per-session through the prompt box mode indicator.

### Bash Command Pattern Fragility

Pattern matching on Bash command arguments is unreliable (https://code.claude.com/docs/en/permissions). For example, a rule matching `curl http://github.com` will not catch variations like `curl -X GET https://github.com/...`. Do not rely on Bash argument patterns for security — use tool-level denials and MCP scoping instead.

### Compaction Trade-Offs

Automatic compaction is lossy. Summarized context loses detail, and incorrect summaries can lead the agent astray (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Key trade-offs:
- Compacting too aggressively discards important nuance
- Compacting too rarely degrades performance from context rot
- The compaction summary itself occupies tokens
- Re-attached skills after compaction are budgeted at 5K tokens each, with a combined 25K token budget for all re-attached skills (https://code.claude.com/docs/en/skills)

Use manual compaction (`/compact`) when you know what should be preserved. Use automatic compaction for routine maintenance.

### Stale Retrieval

Vector indexes and cached context go stale. Embeddings not refreshed poison the agent with outdated information (https://sourcegraph.com/blog/context-engineering). In a Kubernetes monorepo study, MCP-based retrieval achieved file recall of 0.277 versus 0.127 without MCP, and an F1@5 of 0.262 versus 0.099 — but this assumes fresh indexes (https://sourcegraph.com/blog/context-engineering).

For project context, prefer live queries (file reads, grep, MCP tools) over cached embeddings when freshness matters. Use caching primarily for reference data that changes infrequently.

### Skills Lifecycle Surprises

Skills content enters the conversation once and stays until compaction removes it (https://code.claude.com/docs/en/skills). This means skills are best for standing instructions that apply for the duration of a task, not for one-time steps. If a skill configures a tool or changes state, consider whether the effect should persist after the skill completes.

The `context: fork` field mitigates this by running the skill in an isolated subagent — its effects never reach the main context (https://code.claude.com/docs/en/skills). Use this for skills with side effects like deploys, commits or API mutations.

### CLI-Only Features in VS Code Workflows

Some Claude Code features are only available in the terminal CLI, not in the VS Code extension panel (https://code.claude.com/docs/en/vs-code). Notably: the `!` bash shortcut for inline shell execution and tab completion for file paths. If you need these, run `claude` in VS Code's integrated terminal instead of using the extension panel. The extension and CLI share the same configuration files and conversation history, so switching between them is seamless.

---

## Things One Might Miss

### The Built-in IDE MCP Server

When the VS Code extension is active, it runs a local MCP server that the CLI connects to automatically (https://code.claude.com/docs/en/vs-code). This server enables diff viewing in VS Code's native diff viewer, selection-aware @-mentions, and Jupyter notebook code execution. The server is named `ide` and is hidden from `/mcp` because there is nothing to configure, but organizations using `PreToolUse` hooks to allowlist MCP tools need to know it exists. It exposes `mcp__ide__getDiagnostics` (read-only, returns VS Code diagnostic errors/warnings) and `mcp__ide__executeCode` (writes, runs Python in Jupyter, always requires confirmation).

### CLAUDE.md Cascading in Monorepos

In monorepos, `CLAUDE.md` cascades across directory boundaries. A `CLAUDE.md` at the root and another at `services/billing/CLAUDE.md` both load when working in the billing directory. This is different from rules — rules are path-filtered, while `CLAUDE.md` cascading is directory-based. Be deliberate about what goes in each level.

### The @-mention as Context Channel

In the VS Code extension, @-mentions are the primary mechanism for attaching file context to prompts (https://code.claude.com/docs/en/vs-code). When you type `@` followed by a file or folder name, Claude reads that content and can answer questions or make changes. The extension also sees your current editor selection automatically — the prompt box footer shows how many lines are selected. Press `Alt+K` to insert an @-mention with the file path and line range. This is subtly different from the terminal CLI, where context is typically provided through `--file` flags or conversation history.

### Plugin Agents Have Restrictions

Plugin-shipped agents cannot use `hooks`, `mcpServers` or `permissionMode` fields for security reasons (https://code.claude.com/docs/en/plugins-reference). If you need those capabilities, copy the agent to `.claude/agents/` or `~/.claude/agents/` instead of shipping it from a plugin.

### Variable Substitution in Configuration

Claude Code supports variable substitution in configuration files:
- `{env:VARIABLE_NAME}` — environment variable at runtime
- `{file:path/to/file}` — file content at startup
- `${CLAUDE_PLUGIN_ROOT}` — absolute path to installed plugin version
- `${CLAUDE_PLUGIN_DATA}` — persistent data directory that survives plugin updates
- `${CLAUDE_PROJECT_DIR}` — project root directory
- `${user_config.KEY}` — plugin user configuration values

These are evaluated at different points in the lifecycle. Env vars and `{file:...}` are resolved at config load time. Plugin variables are resolved when the plugin initializes. Understanding this distinction matters when debugging path issues in MCP servers or hooks.

### Precedence of Config Merge (Not Replace)

Configuration files are merged, not replaced. A project `.claude/settings.json` that omits the `mcpServers` key inherits MCP servers from `~/.claude/settings.json`. To disable a global MCP server from a project config, you must explicitly set it to `false` or `null`. This is a common source of confusion when debugging why an unexpected tool is available.

### The `!` Bash Shortcut Is CLI-Only

In the terminal CLI, you can start a message with `!` to run a shell command inline — the output is added to the conversation as a tool result. This feature is not available in the VS Code extension panel (https://code.claude.com/docs/en/vs-code). If you need it, run `claude` in the integrated terminal instead.

### The Forgotten CLAUDE.local.md

Claude Code also loads `CLAUDE.local.md` if it exists — this file is intended for local-only instructions that should not be committed to version control (typically added to `.gitignore`). This is useful for personal workflow preferences, local environment paths, or experimental instructions that should not affect teammates.

### Self-Writing CLAUDE.md

The most powerful pattern is often the simplest: when Claude makes a mistake, tell it to update `CLAUDE.md` to prevent the same mistake in the future. Anthropic reports that Claude is "creepily accurate" at writing these self-authored rules (https://docs.anthropic.com/en/docs/claude-code/overview). The compound effect of this habit over time produces a `CLAUDE.md` that captures the team's actual failure modes rather than idealized conventions.

---

## References

- [IBM — What Is Context Engineering?](https://www.ibm.com/think/topics/context-engineering)
- [Sourcegraph — Context Engineering: A Practical Guide for AI Agents (2026)](https://sourcegraph.com/blog/context-engineering)
- [Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Code — Overview](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Claude Code — VS Code Extension](https://code.claude.com/docs/en/vs-code)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code — Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code — MCP Integration](https://code.claude.com/docs/en/mcp)
- [Claude Code — Permissions](https://code.claude.com/docs/en/permissions)
- [Claude Code — Settings](https://code.claude.com/docs/en/settings)
- [MCP Blog Post (this site)](../mcp/)
