+++
date = '2026-06-15T12:00:00+10:00'
draft = false
title = 'Context Engineering'
tags = ['Context Engineering', 'Claude Code', 'Coding Agent', 'Design Patterns', 'LLM']
summary = "Design patterns, best practices and caveats for engineering context in AI coding agents with Claude Code."
+++

## What Is Context Engineering

- The practice of deliberately designing, structuring and optimizing context provided to an LLM to produce more accurate, reliable outputs (https://www.ibm.com/think/topics/context-engineering)
- Natural progression of prompt engineering — the tell is whether improvements come from rewording or rewiring (https://sourcegraph.com/blog/context-engineering)
- Prompt engineering: writing LLM instructions. Context engineering: managing entire context state — system prompts, tools, MCP, data sources, conversation history (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Every token depletes the model's limited attention budget. As context grows, recall accuracy decreases = context rot (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Guiding principle: smallest possible set of high-signal tokens that maximize likelihood of desired outcome (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## How Coding Agents Consume Context (Claude Code)

### CLAUDE.md — Per-Session Foundation

- Loaded at every session start, injected directly into system prompt
- Every token competes for attention on every user turn
- Anthropic guidance: for every line ask "would the agent make a mistake without this?" If not, delete it (https://docs.anthropic.com/en/docs/claude-code/overview)
- Monorepos: `CLAUDE.md` cascades — root level + subdirectory level both load
- Separate `CLAUDE.local.md` exists for local-only instructions (gitignored, not shared)

```
# CLAUDE.md
## Project Overview
Rust monorepo, Cargo workspaces. Core crates: core/, api/, cli/.

## Conventions
- thiserror for error types, follow Rust API Guidelines
- Always run `cargo test` before committing
```

### Path-Filtered Rules (.claude/rules/*.md)

- Middle ground between CLAUDE.md (always loaded) and skills (user/model invoked)
- Loads only when file path patterns match
- Uses `paths` glob in frontmatter to control activation

```
.claude/rules/
  python-testing.md    # Applies when working with test files
  database.md          # Applies when touching SQL or schema files
```

### Skills — On-Demand Workflows

- Reusable instruction sets in `~/.claude/skills/<name>/SKILL.md` (global) or `.claude/skills/<name>/SKILL.md` (project)
- Progressive disclosure: agent loads name + description at startup, full content only when task detected (https://code.claude.com/docs/en/skills)
- Keep under 500 lines — move reference material to supporting files (https://code.claude.com/docs/en/skills)
- Frontmatter controls:
  - `disable-model-invocation: true` — manual-only (deploys, side effects)
  - `user-invocable: false` — model can invoke, hidden from slash menu
  - `allowed-tools` — auto-approve tools while skill is active
  - `context: fork` — run in isolated subagent, instructions vanish after completion

```markdown
---
name: deploy
description: Deploy to staging or production
disable-model-invocation: true
context: fork
---
```

### Subagents

- Run in own context window with custom prompt, tool access, permissions, model (https://code.claude.com/docs/en/sub-agents)
- Only result summary returns to parent (typically 1K-2K tokens)
- Built-in: Explore (Haiku, read-only), Plan (inherits, read-only), General-purpose (all tools)
- Defined in `.claude/agents/` or `~/.claude/agents/`
- Key frontmatter: `permissionMode`, `skills` (preload), `memory` (cross-session), `isolation: worktree`, `background: true`

```markdown
---
name: db-explorer
description: Explores database schemas using MCP
model: haiku
disallowedTools: Write, Edit, Bash
---
```

### MCP Servers (Model Context Protocol)

- Connect agent to external systems — databases, browsers, APIs, file systems (https://code.claude.com/docs/en/mcp)
- In VS Code: added via `claude mcp add` in terminal, managed via `/mcp` in chat panel
- Scoping: `.mcp.json` (project, shared), `~/.claude/settings.json` (user, all projects), plugin `.mcp.json` (bundled)
- Use `allowedTools` with wildcards (`mcp__server__*`) for permissions — narrower than `bypassPermissions` (https://code.claude.com/docs/en/permissions)

### Hooks

- Shell commands that fire automatically on lifecycle events (https://code.claude.com/docs/en/plugins-reference)
- Defined in `.claude/settings.json` or `~/.claude/settings.json`
- Events: PreToolUse, PostToolUse, SessionStart, Stop, PreCompact, PostCompact
- Run with user's local privileges, receive event JSON on stdin
- Use sparingly — every hook adds latency

```json
{ "PostToolUse": [{ "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "npm run lint:fix" }] }] }
```

### Plugins

- Package skills, agents, hooks, MCP servers, executables into shareable bundles (https://code.claude.com/docs/en/plugins-reference)
- In VS Code: managed through graphical `/plugins` interface
- Common mistake: putting skills/agents/hooks inside `.claude-plugin/` — only `plugin.json` goes there

### VS Code Extension Settings

- Under `claudeCode.*` namespace in VS Code settings (https://code.claude.com/docs/en/vs-code)
- Key settings: `initialPermissionMode`, `useTerminal`, `preferredLocation`, `respectGitIgnore`, `allowDangerouslySkipPermissions`
- Extension and CLI share config files and conversation history
- Some features are CLI-only: `!` bash shortcut, tab completion, `claude mcp add`

### Configuration Layering (later overrides earlier)

1. Managed settings (org defaults)
2. `~/.claude/settings.json` (user global)
3. `.claude/settings.json` (project)
4. `.claude/settings.local.json` (project-local, not committed)
5. VS Code extension settings (`claudeCode.*`)
6. CLI flags and env vars

**Config is merged, not replaced** — omitting a key inherits it from lower layers. Must explicitly set to `false`/`null` to disable.

---

## What Goes Where: Choosing the Right Primitive

| Primitive | Loaded | Token Cost | Best For |
|-----------|--------|------------|----------|
| CLAUDE.md | Every session | Full content, always | Project conventions, critical constraints, build commands |
| Rules (.claude/rules/) | On path match | Content only when matched | Deep domain knowledge, path-specific conventions |
| Skills | On demand | Content only when loaded | Domain workflows, deploy, testing guides |
| Subagents | On delegation | Summary only (1K-2K tokens) | Isolated tasks, parallel research, dangerous operations |
| Plugins | On enable | Cumulative | Shareable packages, cross-project reuse |
| MCP servers | On config load | Tool defs + responses | Live data access, external API integration |
| Hooks | On lifecycle event | Event + execution overhead | Automation, enforcement, observability |
| Permission rules | On tool invocation | Negligible | Security boundaries, blast radius reduction |

### CLAUDE.md — Do's and Don'ts

**Put in:**
- Project structure, language, framework
- Critical conventions — error handling, naming, style
- Exact build/test/run commands agent would guess wrong
- Architectural decisions and rationale
- Security constraints ("never commit secrets")
- "Stuck record" — mistakes the team has actually made

**Leave out:**
- Lengthy reference tables, API docs, framework guides
- Rarely-needed workflows (infrequent deploys, migrations)
- Instructions for specific subdirectories only
- Verbose examples

**Keep under 100-150 lines.** Anthropic's own CLAUDE.md fits one screen.

### Skills — Do's and Don'ts

**Put in:** domain workflows, language conventions, integration guides, repetitive tasks, anything too long for CLAUDE.md, tasks needing tool auto-approval

**Leave out:** every-session content (put in CLAUDE.md), one-time instructions, security-sensitive auto-execution, content better as subagent prompt

**Rule of thumb:** if you describe the same workflow more than once a week, make it a skill.

### Subagents — When to Create

**Create when:**
- Task needs different model (Haiku for cheap exploration, Opus for hard reasoning)
- Task needs restricted tools (read-only, MCP only, no Write/Edit)
- Task benefits from isolation (clean context, no pollution)
- Task is long-running (`background: true`)
- Task is parallelizable (spawn multiple)
- Task is dangerous (`isolation: worktree`)

**Don't create for:** simple Read+Grep cycles, tasks needing full conversation history, cases where delegation overhead exceeds the work.

**Name for routing, not marketing** — description is how Claude decides to delegate.

### MCP Servers — When to Connect

**Use when:** agent needs live data, integration has defined tool contract, external state changes, need permission gating.

**Don't use for:** static reference data (load as instructions), built-in tool operations (Read, Grep, Bash), one-off scripts.

### Worked Example — Rust Web Service

```
project-root/
├── CLAUDE.md                    # 60 lines: layout, build, test, conventions
├── .claude/
│   ├── settings.json            # Permissions, MCP, hooks
│   ├── rules/postgres.md        # SQL schema conventions (applies to .sql/.rs)
│   ├── skills/deploy/SKILL.md   # /deploy: build, test, deploy
│   ├── skills/code-review/      # Auto-invoked on PRs
│   └── agents/db-explorer.md    # Read-only, Haiku, postgres MCP
└── .mcp.json                    # Shared MCP: postgres, cargo-audit
```

- CLAUDE.md: session essentials only
- Postgres rule: path-filtered to database code
- Skills: deploy + code-review load on demand
- DB explorer subagent: isolated, Haiku, never touches filesystem
- MCP: project-scoped, shared by team
- Permission mode: `acceptEdits` in VS Code settings

---

## Design Patterns

### Just-in-Time Context Retrieval

- Maintain lightweight identifiers (file paths, queries, MCP tool names) — fetch data only when needed
- Mirrors human cognition: external organization + indexing, not memorization (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- CLAUDE.md = upfront orientation. Agent uses reads, searches, tool calls on demand
- VS Code extension: @-mentions provide direct file context channel
- Hybrid strategy: retrieve some data upfront (speed) + autonomous exploration (depth)

### Context Compaction

- When context window nears limit, older history is summarized (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- **Preserve:** architectural decisions + rationale, unresolved bugs + status, in-progress implementation details, completed work summaries
- **Discard:** redundant tool outputs, resolved sub-tasks, verbose logs
- Manual trigger: `/compact`
- Automatic: runs when nearing limit

### Structured Note-Taking (Agentic Memory)

- Agent writes structured notes to persistent file outside context window, re-reads when needed (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Distinct from compaction: deliberate knowledge artifacts vs compressed conversation history
- Supported via `memory` field on subagents: `user`, `project`, `local` scope (https://code.claude.com/docs/en/sub-agents)

```
.claude/memory/architecture.md
  ## Decisions
  - 2026-06-14: Chose PostgreSQL over MySQL for JSONB support.
    Rationale: Flexible schema for event sourcing.

  ## Active Context
  - Implementing payment webhook handler (src/webhooks/payment.rs)
  - Blocked on: webhook signature verification library
```

### Sub-Agent Architecture

- Delegate focused subtasks to specialized subagents — keeps main context lean, prevents pollution (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Each subagent: clean context, specific tools, condensed summary returned
- Chain subagents: output feeds next
- Parallel subagents: independent investigations
- Background subagents: `background: true`, auto-deny permission prompts (https://code.claude.com/docs/en/sub-agents)

### Progressive Disclosure vs Just-in-Time Retrieval

These two terms are often conflated but describe different scopes.

**Just-in-time retrieval** (broad pattern): defer loading any context — files, data, search results, tool output — until the agent actually needs it. Applies to everything the agent does: reading a source file only when it needs to understand a function, querying an API only when it needs live data, running a search only when it needs to find something.

**Progressive disclosure** (specific implementation of JIT): defer loading instruction content based on an initial metadata scan. The agent loads skill names and descriptions at startup (cheap), but waits to load the full skill body until a matching task is detected (https://code.claude.com/docs/en/skills). The agent knows the skill exists and what it does, but the 200 lines of instruction text don't enter context until actually needed.

The distinction matters because they have different costs:
- JIT for data (files, APIs) costs a tool invocation round-trip — generally worthwhile
- Progressive disclosure for instructions costs nothing until triggered — strictly better than loading everything upfront
- You can have JIT without progressive disclosure (reading a file on demand), but progressive disclosure is always a form of JIT applied to the instruction layer

Progressively disclosed skills are Claude Code's answer to the "single responsibility" principle for context: each domain gets its own block of instructions that only loads when relevant, rather than one monolithic CLAUDE.md that pays the token cost on every turn.

### Skills as Modular Context

- CLAUDE.md loads every session and consumes attention budget from turn one
- Defer detailed knowledge to skills that load only when task requires (https://code.claude.com/docs/en/skills)
- Especially valuable for: deployment, language conventions, testing, API guides

### Tool Design Principles

- Tools must be self-contained, robust, unambiguous (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- If a human can't definitively choose the right tool, the agent can't either (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Single responsibility per tool. Clear descriptions. Typed parameters
- Limit total available tools — bloat forces model to waste turns deciding

### Layered Documentation Strategy

- Combine `llms.txt` with MCP for two-tier context system (../mcp/)
- `llms.txt`: orientation, summaries, key links (lightweight, always available)
- `llms-full.txt`: comprehensive docs (loaded on demand)
- MCP tools: live query, mutation, data access (gated by permissions)

### Inverted Configuration

- Intuition: pack everything into CLAUDE.md
- Pattern: CLAUDE.md is the **smallest** file — only what's needed every turn
- Everything else → skills (load on demand)
- Team trimmed CLAUDE.md from 300 to 40 lines → ~50% token drop on routine tasks
- Every token in CLAUDE.md competes on every turn. Skill tokens only enter when relevant

### Subagent Sandbox

- Subagents as security boundaries, not just parallelism
- `disallowedTools: Write, Edit, Bash` + Haiku model + MCP to production observability
- Result: read-only investigator that literally cannot modify state
- Machine-enforced by tool layer, not prompt instructions
- Use case: on-call incident triage — query logs, inspect metrics, return diagnosis

### Forked Skill Isolation

- Unforked skills: instructions persist in main context until compaction or session end
- `context: fork`: runs in isolated subagent, instructions vanish after execution
- Main session retains only result summary — zero token overhead after completion
- Use for: deploys, database migrations, API mutations — anything with side effects

### Prohibitive Constraints

- Positive instructions ("do this") = heuristics, may or may not be followed
- Prohibitive constraints ("never do this") = unconditional rules, higher priority
- "Never commit secrets" in CLAUDE.md > 50 lines of "how to write good code"
- Self-writing technique: when Claude makes a mistake → "Update CLAUDE.md so you never do this again" — results are "creepily accurate" (https://docs.anthropic.com/en/docs/claude-code/overview)
- Combine with permission system for machine enforcement

### Agentic Memory Journaling

- Agent writes structured notes at session milestones (decisions, bugs, rationale)
- Next session: reads notes during initialization
- Over several sessions: agent builds its own institutional memory
- Lifecycle: journal on session end, rehydrate on session start
- `memory` field on subagents provides persistence layer

### MCP as Contract Interface

- Natural language = ambiguous. MCP tool definitions = exact (typed params, clear schemas, defined return types) (../mcp/)
- Expose project operations as MCP tools rather than describing in prose
- `query(sql: string, params: object[])` cannot be misinterpreted like "query the database carefully"
- Shifts context engineering from prose → interface-based contracts
- More predictable, easier to audit across sessions

### Permission Configuration as Deployable Policy

- Interactive prompts don't scale across teams
- Permission block in `.claude/settings.json` = machine-enforceable security policy
- Version-controlled, reviewed in PRs, deployed with project
- New team members clone repo and inherit policy — no tribal knowledge

```json
{ "permissions": { "allow": ["Read", "Edit", "Bash(git *)", "Bash(npm run *)"] } }
```

### Two-Phase Compaction

- Compaction alone = lossy — summarizes history but doesn't extract decisions or rationale
- Phase 1: run compaction to free context window
- Phase 2: agent writes structured notes capturing what future session needs to know
- Compacted summary = short-term continuity. Notes = long-term memory across sessions

---

## Design Considerations & Caveats

### Context Rot and Lost-in-the-Middle

- As context grows, recall accuracy degrades — especially for middle of window (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Critical instructions → start of CLAUDE.md
- Tool definitions → early in system prompt
- Don't bury important context in long conversation history
- Compaction: preserve early and late positions

### Tool Bloat

- Too many tools → model overwhelmed, slower responses, more hallucinated calls (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Too few tools → agent lacks capability
- Audit regularly. Remove unused MCP servers. Scope tools to subagents

### Permission Security

- Permission rules enforced by tool layer, not model — prompt instructions alone can't prevent tool access (https://code.claude.com/docs/en/permissions)
- Deny-first precedence: matching deny blocks even if allow also matches
- VS Code: mode controlled via `claudeCode.initialPermissionMode`, toggled per-session

### Bash Command Pattern Fragility

- Pattern matching on Bash command arguments is unreliable (https://code.claude.com/docs/en/permissions)
- `Bash(curl http://github.com *)` won't catch `curl -X GET https://github.com/...`
- Don't rely on Bash patterns for security — use tool-level denials and MCP scoping

### Compaction Trade-Offs

- Automatic compaction is lossy — incorrect summaries mislead agent (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Too aggressive: discards nuance. Too conservative: context rot
- Compaction summary itself consumes tokens
- Re-attached skills after compaction: 5K tokens each, combined 25K budget (https://code.claude.com/docs/en/skills)
- Manual compaction (`/compact`) when you know what to preserve

### Stale Retrieval

- Vector indexes and cached context go stale — outdated info poisons agent (https://sourcegraph.com/blog/context-engineering)
- Kubernetes monorepo study: MCP retrieval file recall 0.277 vs 0.127 without MCP, F1@5 0.262 vs 0.099 — assumes fresh indexes (https://sourcegraph.com/blog/context-engineering)
- Prefer live queries (reads, grep, MCP) over cached embeddings when freshness matters

### Skills Lifecycle Surprises

- Skill content enters conversation once and stays until compaction removes it (https://code.claude.com/docs/en/skills)
- Skills are for standing instructions (duration of task), not one-time steps
- `context: fork` prevents pollution — use for deploys, commits, API mutations

### CLI-Only Features in VS Code

- VS Code extension panel lacks: `!` bash shortcut, tab completion, `claude mcp add` (https://code.claude.com/docs/en/vs-code)
- Workaround: run `claude` in integrated terminal instead of extension panel
- Extension and CLI share config files and conversation history — seamless switching

---

## Things One Might Miss

### The Built-in IDE MCP Server

- VS Code extension runs a local MCP server the CLI connects to automatically (https://code.claude.com/docs/en/vs-code)
- Named `ide`, hidden from `/mcp`, nothing to configure
- Exposes two tools: `mcp__ide__getDiagnostics` (VS Code errors/warnings, read-only) and `mcp__ide__executeCode` (Jupyter, requires confirmation)
- Binds to 127.0.0.1 random port, fresh auth token per extension activation

### CLAUDE.md Cascading in Monorepos

- Root `CLAUDE.md` + subdirectory `CLAUDE.md` both load when working in subdirectory
- Different from rules (path-filtered). Cascading is directory-based
- Be deliberate about what goes at each level

### @-mention as Context Channel

- In VS Code: `@filename` attaches file context to prompt
- Extension sees your editor selection automatically — indicated in prompt box footer
- `Alt+K`: inserts @-mention with file path + line range
- Different from CLI where context is via `--file` flags or conversation history

### Plugin Agent Restrictions

- Plugin agents can't use `hooks`, `mcpServers`, `permissionMode` (https://code.claude.com/docs/en/plugins-reference)
- If needed: copy agent to `.claude/agents/` or `~/.claude/agents/`

### Variable Substitution Timing

- `{env:VARIABLE}` at runtime. `{file:path}` at config load
- `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}` / `${CLAUDE_PROJECT_DIR}` at plugin init (https://code.claude.com/docs/en/plugins-reference)
- `${user_config.KEY}` at plugin user config
- Different evaluation times matter for debugging path issues in MCP/hooks

### Config Merge (Not Replace) Gotcha

- Omitting `mcpServers` in project config inherits from global config
- Must explicitly `false` or `null` to disable
- Common source of "why is this tool available?" confusion

### CLI-Only: `!` Bash Shortcut

- Start message with `!` to run shell command inline — output added as tool result
- Not available in VS Code extension panel
- Use integrated terminal if you need it

### Self-Writing CLAUDE.md

- Most powerful pattern: when Claude makes a mistake, tell it "Update CLAUDE.md"
- Claude writes its own rules — described as "creepily accurate" (https://docs.anthropic.com/en/docs/claude-code/overview)
- Compound effect over time: CLAUDE.md captures actual failure modes, not idealized conventions

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
