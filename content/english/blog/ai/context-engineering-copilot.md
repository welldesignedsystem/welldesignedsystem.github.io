+++
date = '2026-06-26T12:00:00+10:00'
draft = false
title = 'Context Engineering for GitHub Copilot'
tags = ['Context Engineering', 'GitHub Copilot', 'Coding Agent', 'Design Patterns', 'LLM', 'DevTools']
summary = "Design patterns, best practices and caveats for engineering context in AI coding agents with GitHub Copilot."
+++

## What Is Context Engineering

- The practice of deliberately designing, structuring and optimizing context provided to an LLM to produce more accurate, reliable outputs.
- It's the natural next level of prompt engineering.
- While prompt engineering writes LLM instructions, context engineering manages entire context state — system prompts, tools, MCP, data sources, conversation history.
- Models have a limited attention span and every token depletes the attention budget.
- As context grows, recall accuracy decreases — this is also called **Context Rot**.
- Guiding principle: smallest possible set of high-signal tokens that maximize the likelihood of the desired outcome.
- **Cost implication (June 2026):** With Copilot now on usage-based billing, every token loaded into context has a direct monetary cost. Context engineering is no longer just about quality — it's also about spend. A bloated `copilot-instructions.md` loaded on every turn costs real credits. The guiding principle above is now both a quality and a cost imperative.

---

## How Coding Agents Consume Context (GitHub Copilot)

Copilot has a fundamentally different context architecture from Claude Code. Instead of a monolithic per-session file loaded upfront, Copilot layers context from multiple sources — some always-on, some path-filtered, some on-demand — that are merged before every prompt.

### Custom Instructions — Always-On Foundation

Copilot supports three tiers of always-on custom instructions:

| Tier             | Scope                         | Configuration                                                  | Where it works  |
| ---------------- | ----------------------------- | -------------------------------------------------------------- | --------------- |
| **Organization** | All org members on GitHub.com | GitHub.com org settings (GA since April 2026)                  | GitHub.com chat, code review, cloud agent |
| **Personal**     | Individual user               | GitHub.com profile → Personal instructions                     | GitHub.com chat |
| **Repository**   | All files in the repo         | `.github/copilot-instructions.md`, `AGENTS.md`, or `CLAUDE.md` | All surfaces    |

**Organization-wide instructions** became generally available in April 2026. Admins can now set default instructions that apply across all repositories in the org — covering Copilot Chat on GitHub.com, Copilot code review, and the cloud agent.

**Repository-wide instructions** (`.github/copilot-instructions.md`) are the most important for most teams — they apply to every file in every chat interaction and work across VS Code, JetBrains, GitHub.com chat and the coding agent. Keep them under ~1,000 lines (ideally 200–300) since they're loaded on every turn and consume AI Credits on every interaction.

**When to use:**

- Project structure, tech stack and build/test commands
- Universal security requirements (parameterize SQL, no secrets in code)
- Cross-cutting conventions (error handling, logging, naming)
- Documentation standards

**When NOT to use:**

- Language- or directory-specific rules (use path-specific `.instructions.md`)
- One-off tasks (use prompt files)
- Conditional rules that don't apply everywhere

### Path-Specific Instructions (`.instructions.md`)

Placed in `.github/instructions/` (or custom locations configured via `chat.instructionsFilesLocations`) with an `applyTo` frontmatter glob:

```markdown
---
applyTo: "**/*.py"
---

# Python Conventions

- Use type hints for all function signatures
- Follow PEP 8
- Write docstrings for public functions
```

- Instructions only activate when Copilot works with matching files — `/init` or unrelated files do not load them.
- Load full contents into context when matched (not progressively disclosed).
- Multiple patterns separated by commas.
- If both a path-specific file and `copilot-instructions.md` apply to the same file, both are used — avoid contradictory instructions.

### Prompt Files (`.prompt.md`)

Reusable, on-demand task prompts in `.github/prompts/`. Invoked via `/filename` in chat. Unlike instructions, they only run when explicitly invoked:

```markdown
---
name: explain-code
description: "Generate a clear code explanation with examples"
agent: agent
---

Explain the following code: ${input:code:Paste your code here}
```

- **Supported in:** VS Code, Visual Studio, JetBrains (not GitHub.com chat).
- **Frontmatter fields:** `name`, `description`, `agent` (`ask`/`agent`/`plan`/custom agent name), `model`, `tools`, `argument-hint`.
- **Dynamic variables:** `${input:varName:placeholder}` syntax pauses and prompts for values.
- **Generation:** `/create-prompt` in chat.

### Custom Agents (`.agent.md`)

Specialized agent personas with defined scope, tools and model preferences. Two flavors:

**VS Code / JetBrains local agents** (`.agent.md` in configured locations):

```yaml
---
name: docs-specialist
description: Focused on README and documentation files
tools: ["read", "search", "edit"]
model: ["Claude Opus 4.5", "GPT-5.2"]
handoffs:
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
---
```

Custom agents, sub-agents, and plan agent are now generally available in JetBrains IDEs as of March 2026.

**GitHub.com cloud agents** (`.github/agents/*.agent.md`, must be on default branch):

- Fully autonomous: edits files, creates commits, opens PRs.
- Supports `mcp-servers` frontmatter but not `handoffs` or `argument-hint`.
- Max body length: 30,000 characters.
- Selected at `github.com/copilot/agents`.

### Agent Skills (`SKILL.md`)

Reusable capability files that teach compatible tools how to perform a specific task. Standardized format across Copilot, Claude Code and other agents. Native SKILL.md support landed in GitHub Copilot's agent mode in April 2026.

```markdown
---
name: write-migration
description: Generates a database migration file following project conventions
user-invocable: true
disable-model-invocation: false
---
```

- **Progressive disclosure:** Only `name`/`description` loaded at startup (~100 tokens). Full body loaded only when task detected.
- **File location:** `.github/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, or `.agents/skills/<name>/SKILL.md`.
- **Also global:** `~/.copilot/skills/<name>/SKILL.md`.
- **`gh skill` CLI:** Use `gh skill` (GitHub CLI 2.90.0+) to discover, install, update and publish skills from GitHub repositories. Provenance metadata is written into the SKILL.md frontmatter on install, enabling `gh skill update` to track upstream changes. Always use `gh skill preview` to inspect a skill before installing — skills can contain prompt injections or malicious scripts.

### AGENTS.md — Portable Project Guidance

Plain Markdown (no frontmatter) at the repo root. Open standard stewarded by the Agentic AI Foundation. Acts as a README for coding agents — build steps, test commands, conventions. Supported by Copilot, Claude Code, Cursor, Devin, Gemini CLI, opencode and many others. JetBrains IDE added the ability to auto-generate an initial `AGENTS.md` via the **Generate Agent Instructions** action.

Conflict resolution: the closest `AGENTS.md` to the file being edited takes precedence.

### Copilot Memory

Copilot can now deduce and store useful information about a repository. This memory is used by Copilot cloud agent and Copilot code review to improve the quality of their output when working in that repository over time — without requiring you to re-state context on every task. Memory is managed separately from instruction files.

### MCP Servers (`.vscode/mcp.json`)

Model Context Protocol servers connect the agent to external systems — databases, browsers, APIs, file systems. Configured in `.vscode/mcp.json`:

```json
{
  "servers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

- Referenced in agent `tools` arrays as `server-name/*`.
- Secrets via `${input:varName}` — never hardcoded.
- Workspace-scoped, shareable via version control.
- **MCP auto-approve:** VS Code and JetBrains now support auto-approve for MCP at both server and tool level, reducing manual approval interruptions during agent sessions.
- **Admin allowlists:** MCP server usage in Visual Studio respects allowlist policies set through GitHub. Admins can restrict which MCP servers their organization can connect to.
- **Token cost:** Each MCP server adds tool definitions to the system prompt (~50–200 tokens per tool, ~500–2,000 for a typical 10-tool server). Prefer CLI tools (`gh`, `git`, `npm`) where possible — they have zero per-tool listing overhead.

### Hooks (`.github/hooks/*.json`)

Deterministic shell commands that fire on lifecycle events — the only way to _enforce_ rather than _suggest_ behavior. Agent hooks are now in public preview for JetBrains IDEs (March 2026), in addition to VS Code.

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./scripts/security-check.sh"
      }
    ]
  }
}
```

**Supported lifecycle events:** `userPromptSubmitted`, `preToolUse`, `postToolUse`, `errorOccurred`.

Key distinction from instructions: "Don't run dangerous commands" in a `.instructions.md` file is guidance. Returning `deny` from a `preToolUse` hook is enforcement — it fires every time, regardless of how the agent was prompted.

### Copilot Automations

Copilot cloud agent can now run automatically, on a schedule or in response to repository events (such as an issue being opened). This enables hands-off workflows — e.g., automatically triaging new issues, generating fixes for security alerts, or running a nightly code review pass.

### Copilot Desktop App and Canvas

GitHub announced a dedicated Copilot desktop application with a collaborative workspace called **Canvas**, where developers can brainstorm, refine requirements, generate plans, and iterate on projects alongside AI — outside the constraints of the IDE. Canvas also introduces **Agent Merge**, which enables orchestrating multiple agents toward a combined goal, and autonomous code review features.

### Agent Plugins

Prepackaged bundles of skills, agents, hooks and MCP servers installable from marketplaces. Shared format between VS Code, Copilot CLI and Claude Code. Discover via `@agentPlugins` in the Extensions view, or install directly via `copilot plugin install <plugin-name>@awesome-copilot`.

### Copilot Spaces (formerly Knowledge Bases)

Control _what Copilot knows_ for a specific topic — repositories, files, issues, PRs, free-text content. Unlike instructions that shape _how_ Copilot behaves, Spaces control the knowledge base. Accessed via the GitHub MCP server in agent mode. Note: Spaces interactions consume AI Credits under the June 2026 billing model.

### Configuration Layering (later overrides earlier)

1. Organization custom instructions (GitHub.com — GA April 2026)
2. Personal custom instructions (GitHub.com profile)
3. Repository instructions (`.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`)
4. Path-specific instructions (`.instructions.md` files)
5. Prompt files, agents, skills (on-demand)
6. User's explicit chat prompt — highest priority

### Context Variables: `#`, `@`, `/`

Copilot Chat in VS Code uses three prefix mechanisms:

| Prefix  | Purpose                                 | Examples                                                                                    |
| ------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| **`/`** | Built-in commands + custom prompt files | `/explain`, `/fix`, `/tests`, `/doc`, `/your-prompt`                                        |
| **`#`** | Attach specific context                 | `#file`, `#codebase`, `#selection`, `#editor`, `#problems`, `#changes`, `#symbol`           |
| **`@`** | Specialist agents                       | `@workspace`, `@vscode`, `@terminal`, `@github`                                             |

Combine them: `@workspace using patterns in #file:src/api/auth.ts, /fix the issue in #selection`

### CLAUDE.md Compatibility

VS Code automatically detects `CLAUDE.md` and applies it as always-on instructions (similar to `AGENTS.md`). Enable/disable via `chat.useClaudeMdFile` setting. JetBrains also added CLAUDE.md support in March 2026.

---

## What Goes Where: Choosing the Right Primitive

| Primitive                 | Loaded             | Token Cost                       | Best For                                      |
| ------------------------- | ------------------ | -------------------------------- | --------------------------------------------- |
| `copilot-instructions.md` | Every session      | Full content, always (AI Credits consumed every turn) | Project conventions, security, build commands |
| `.instructions.md`        | On path match      | Full content when matched        | Language/framework-specific conventions       |
| Prompt files              | Manual invocation  | Content only when invoked        | One-off tasks, reusable templates             |
| Custom agents             | Manual selection   | Per-session                      | Complex multi-step workflows                  |
| Agent skills              | On intent match    | Name/description only at startup | Reusable capabilities, cost-efficient depth   |
| MCP servers               | On config load     | Tool defs + responses (per-tool overhead) | Live data access, API integration        |
| Hooks                     | On lifecycle event | Event + execution overhead       | Enforcement, automation                       |
| Copilot Spaces            | On reference       | Searched content (AI Credits)    | Task-specific knowledge                       |
| AGENTS.md                 | Per workspace      | Full content                     | Portable project guidance                     |
| Copilot Memory            | Automatic          | Managed by Copilot               | Persistent repo knowledge across sessions     |
| Automations               | Scheduled/event    | Per-run agent session cost       | Hands-off recurring tasks                     |

### Repository Instructions — Do's and Don'ts

**Put in:**

- Project overview and tech stack
- Build/test/run commands
- Universal security requirements
- Cross-cutting coding conventions
- Project structure
- Available scripts and MCP servers

**Leave out:**

- Language-specific rules (use path-specific `.instructions.md`)
- Rarely-needed workflows (use prompt files or skills)
- Instructions for specific subdirectories (use path-specific files)
- Rules already enforced by linters/formatters
- External URLs (Copilot can't fetch them — copy content inline)

**Keep under 200–300 lines.** The 4,000-character limit for code review means anything beyond that is silently ignored for PR reviews. Under usage-based billing, every line also costs credits on every turn — brevity is now both a quality and a cost concern.

### Path-Specific Instructions — Do's and Don'ts

**Put in:** language-specific naming/style conventions, framework patterns, technology-specific security, unique rules for parts of the codebase.

**Leave out:** universal conventions (put in `copilot-instructions.md`), rules enforced by linters.

### Prompt Files — When to Create

- Code explanations, README generation, onboarding plans
- Tasks needing user input (`${input:varName}`)
- Workflows you run less than once a week (if more frequent, make a skill)
- When you need to specify `agent`, `model` or `tools` per-task

### Custom Agents — When to Create

- Role-specific workflows (documentation specialist, code reviewer, bug fixer)
- Tasks needing restricted tool access (read-only agents)
- Multi-step workflows with handoffs between agents
- When `handoffs` can chain planning → implementation → review

### Skills — When to Create

- Domain knowledge shared across sessions (migration patterns, PR review checklist)
- Capabilities that should auto-invoke based on intent
- When progressive loading matters — keep 200+ lines out of context until needed
- Under usage-based billing, skills are the most credit-efficient way to deliver deep, task-specific instructions: only ~100 tokens until invoked

### Hooks — When to Create

- Security enforcement (block `rm -rf`, `DROP TABLE`, writes to production config)
- Compliance and auditing (log every tool call)
- Code quality gates (auto-format after every edit)
- Approval workflows (auto-allow safe ops, require human for sensitive ones)

---

## Design Patterns

### Path-Filtered Context Separation

Split concerns across files by directory/extension — `copilot-instructions.md` for universal rules, `.instructions.md` for domain-specific ones, `SKILL.md` for reusable capabilities. Each file has a narrow scope and only enters context when relevant.

### Layered Instruction Strategy

- **Level 1:** `copilot-instructions.md` — fast orientation, always available
- **Level 2:** `.instructions.md` files — context on path match
- **Level 3:** Skills + MCP — on-demand depth

### Progressive Capability Loading

Skills are the only Copilot primitive with true progressive disclosure. At startup, only `name`/`description` (~100 tokens) load. Full content loads only on intent match. Under token-based billing, this is the most credit-efficient pattern for deep domain knowledge. Use skills for any domain knowledge too large for instruction files.

### Custom Agent as Security Boundary

Define agents with minimal tool arrays — a documentation agent needs `read`, `search`, `edit` but not `bash`. Cloud agents can use `mcp-servers` frontmatter for scoped external access. Machine-enforced by tool layer, not prompt instructions.

### Handoff Chains

Use custom agent `handoffs` to chain specialized agents — e.g., planner → implementer → reviewer. Each agent has a clean context with focused tools.

### Permission Configuration as Deployable Policy

Hook-based enforcement is version-controlled, reviewed in PRs and deployed with the project. New team members inherit the policy — no tribal knowledge required.

### Two-Tier Knowledge (Spaces + MCP)

- Spaces: curated knowledge for task-specific grounding (feature specs, design docs)
- MCP: live query access to external systems (APIs, databases)
- Both accessed via the GitHub MCP server in agent mode

### Separate Planning from Execution

The official library demonstrates this pattern: an Implementation Planner agent that only reads the codebase and produces a plan, then hands off to a separate implementing agent. Each agent has a clear scope and tool set.

### Token-Aware Context Design (New — June 2026)

With usage-based billing now active, context decisions are also cost decisions. Practical rules of thumb:

- Stable content (system prompt, custom instructions, tool definitions) benefits from cache reuse — the same tokens cost ~10% on repeated turns within a session.
- A 500-line `copilot-instructions.md` loaded 50+ times per session compounds quickly; trim ruthlessly.
- Agent mode burns credits proportional to the context it loads — use `#file` references to scope it to the files that matter, not the whole repo.
- Skills are the cheapest way to carry deep instructions: ~100 tokens at startup, full body only when matched.
- Prefer CLI tools (`gh`, `git`, `npm`, `curl`) over MCP servers for simple operations — CLI has zero per-tool listing overhead.

---

## Design Considerations & Caveats

### Context Rot and Lost-in-the-Middle

- Repository instructions are prepended to every prompt — keep them at the top of instruction files.
- Path-specific instructions load full content when matched — keep them under ~1,000 lines.
- Skills are the only primitive with progressive loading — use them for anything over ~200 lines.

### Code Review 4,000-Character Limit

Copilot code review only reads the first 4,000 characters of any instruction file. Instructions beyond this limit are ignored entirely for PR reviews. Note also that Copilot code review now runs on GitHub Actions and consumes both AI Credits and Actions minutes — design review instructions to be compact. (Does not apply to Copilot Chat or the coding agent.)

### Conflicting Instructions

When a path-specific `.instructions.md` and `copilot-instructions.md` both apply to the same file, both are used. Copilot's behavior when instructions conflict is non-deterministic. Design complementary, not contradictory, instructions.

### Stale Instructions

Repository instructions go stale as dependencies change — update them when you upgrade frameworks or drop libraries. Copilot generates code against whatever rules it has, not whatever is currently correct.

### Skill Lifecycle Surprises

- Skill full content loads once and stays in context until compacted.
- Skills are for standing instructions (duration of task), not one-time steps.
- No `context: fork` equivalent in Copilot skills (unlike Claude Code).
- Skills don't support `${input:varName}` variables — use prompt files for dynamic input.

### Prompt Files Are IDE-Only

Prompt files work in VS Code, Visual Studio and JetBrains only. They do not work on GitHub.com chat or with the coding agent. For cross-surface automation, use skills or agents instead.

### MCP Scoping

`.vscode/mcp.json` is workspace-scoped. Cloud agents can define their own `mcp-servers` in frontmatter. Committed to version control — review MCP server configurations in PRs. Org admins can enforce allowlists restricting which MCP servers can be connected.

### Hooks Execute with Full Privileges

Hooks run with the same permissions as VS Code. Review hook configurations carefully — especially `preToolUse` hooks from shared repositories. Validate input JSON as untrusted.

### Bash Command Pattern Fragility

Pattern matching on Bash command arguments in hook matchers is unreliable. Don't rely on Bash patterns for security — use tool-level denials and MCP scoping.

### Inline Suggestions Are Unaffected

Custom instructions do not apply to inline code suggestions (autocomplete). They apply to Copilot Chat interactions only. Inline completions also do not consume AI Credits — only chat, agent mode, code review, CLI and cloud agent sessions do.

### Spaces Repository Context Limitation

When using Spaces in your IDE, repository context and uploaded files are not supported. You get text content, GitHub files, issues, PRs and space instructions only.

### Usage-Based Billing and Agentic Workflows

As of June 1, 2026, all Copilot plans moved to AI Credits (1 credit = $0.01). Long agent sessions using frontier models and large context windows can consume credits quickly. Set spending limits in the Copilot billing dashboard, monitor the usage dashboard, and prefer smaller, focused context over broad exploration to stay within budget. Billing is proportional to tokens consumed across input, output and cached context.

---

## Things One Might Miss

### CLAUDE.md Works in Copilot Too

VS Code and JetBrains automatically detect `CLAUDE.md` and `CLAUDE.local.md` and apply them as always-on instructions. A single CLAUDE.md can serve both Claude Code and Copilot.

### AGENTS.md vs copilot-instructions.md

`AGENTS.md` is an open standard supported by many tools beyond Copilot (Claude Code, Cursor, Devin, Gemini CLI, opencode, etc.). `copilot-instructions.md` is Copilot-specific. Both work in Copilot. Use `AGENTS.md` if you want cross-tool portability.

### `#codebase` vs Manual File Attachments

`#codebase` triggers a semantic search across the entire workspace — Copilot autonomously decides relevance. `#file` attaches specific files. Use `#codebase` for broad questions and `#file` when you need precision (and want to control token cost).

### Built-in MCP Server (IDE)

VS Code runs a hidden IDE MCP server that the CLI connects to. Named `ide`, it exposes `mcp__ide__getDiagnostics` and `mcp__ide__executeCode`.

### Config Merge (Not Replace) Gotcha

Omitting `mcpServers` in project config inherits from global config. Must explicitly disable to remove. Common source of "why is this tool available?" confusion.

### `/init` Generates Instructions

Type `/init` in Copilot Chat to analyze the workspace and auto-generate a `.github/copilot-instructions.md`. The agent inventories the codebase and produces tailored instructions. You can also trigger this from the cloud agent panel on GitHub.com.

### Self-Writing Instructions

Mid-conversation, ask "Extract an instruction from this" to capture a correction as a project convention. Compound effect over time.

### `/memory` Command (JetBrains)

In JetBrains, use `/memory` in the chat to quickly open settings for agent instruction files — faster than navigating to settings manually.

### Diagnostics View

Right-click in the Chat view → **Diagnostics** to inspect all loaded instruction files and any errors. Common failures: wrong file location, `applyTo` mismatch, disabled settings.

### Cloud Agent Branch Isolation

Cloud agents always work through branches + PRs. They do not create branches automatically unless a tool explicitly does so. For autonomous PRs, use a cloud or background agent.

### Skills Must Match Directory Name

The `name` field in `SKILL.md` frontmatter must exactly match the parent directory name. Mismatched names cause silent load failures.

### Plugin Agents Can't Use Hooks or MCP

Plugin-sourced agents can't use `hooks`, `mcpServers` or `permissionMode`. If needed, copy the agent to `.github/agents/` or `~/.copilot/agents/`.

### Copilot Memory vs Instructions

Memory is repository-derived and managed by Copilot automatically. Instructions are author-defined and version-controlled. Use instructions for stable conventions; rely on Memory for Copilot to learn repository-specific patterns it discovers itself.

---

## References

- [GitHub Copilot Customization Library](https://docs.github.com/en/copilot/tutorials/customization-library)
- [VS Code Copilot Customization](https://code.visualstudio.com/docs/copilot/customization/overview)
- [GitHub Copilot Custom Instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions)
- [VS Code Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Agent Skills Specification](https://agentskills.io/specification)
- [AGENTS.md Open Standard](https://agents.md/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Copilot Spaces](https://docs.github.com/en/copilot/concepts/context/spaces)
- [Hooks Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [About GitHub Copilot Memory](https://docs.github.com/en/copilot/concepts/memory)
- [Copilot Automations](https://docs.github.com/en/copilot/how-tos/agents/copilot-on-github/automate-copilot)
- [Usage-Based Billing](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals)
- [GitHub Copilot Notes (this site)](../copilot/)
- [MCP Blog Post (this site)](../mcp/)
- [Context Engineering for Claude Code (this site)](../context-engineering/)
