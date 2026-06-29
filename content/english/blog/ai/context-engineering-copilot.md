+++
date = '2026-06-26T12:00:00+10:00'
draft = false
title = 'Context Engineering for GitHub Copilot'
tags = ['Context Engineering', 'GitHub Copilot', 'Coding Agent', 'Design Patterns', 'LLM', 'DevTools']
summary = "Everything about Copilot context primitives in one place per concept. No repetition, just signal."
+++

Why this matters: every token you load costs attention _and_ money. Models lose recall as context grows (context rot), and Copilot now burns AI Credits ($0.01/credit) on every token in every turn.

---

**Would copying the same sentence 10 times into copilot-instructions.md help?**

What drives real learning (for both humans and models) is seeing the same concept from different angles. A prohibition, a positive alternative, a concrete example, a counter example, a counter intuitive example (Galileo said a canon ball made of iron and a feather fell at the same speed, if it weren't for air resistance) anything — each activates a different mental pathway.
This is what develops real knowledge. For the model, even which training phase - this triggers different regions of its training distribution where the same rule was encoded in different contexts.

The pattern that _actually_ works for models is **multifaceted encoding**.

Occam's razor is a logical principle stating that when faced with competing explanations for the same event, the simplest one is usually the correct one. if you hear gallops think horses not zebras - that's why good doctors dont give antibiotic.

---

## Always on Custom instruction.

It's always on - Loaded into every session, every single time whether you use the session for single message or many.

**The three tiers of always-on:**

- **Organization** — GitHub.com org settings. Covers all members on Chat, code review, cloud agent.
- **Personal** — Your GitHub.com profile. Follows you everywhere.
- **Repository** — `.github/copilot-instructions.md` (also `AGENTS.md` or `CLAUDE.md`). Applies to all files in all surfaces — VS Code, JetBrains, GitHub.com, coding agent.

**The character trap.** Copilot code review silently ignores everything beyond a certain number of chars (I dont know what it is here but usually 4000). Doesn't warn you. Keep repo instructions under 200-300 lines. A crisp 200-liner _always_ beats a bloated 800-liner anyway — less context rot, fewer tokens burned. It's set at a platform level.

**Put in:** tech stack, exact build/test/run commands, security rules (parameterize SQL, no secrets), cross-cutting conventions (error handling, logging), architectural decisions with rationale, recurring mistakes the team has actually made.

**Leave out:** language-specific rules (use `.instructions.md`), conventions your linter already enforces, external URLs (Copilot can't fetch them), verbose examples.

**Cost reality.** Under usage-based billing, a 500-line `copilot-instructions.md` loaded on every turn across long sessions adds up fast. Routine session with 50 turns × 500 lines × cached token discount ≈ still significant. Trim or pay.

**Self-writing.** When Copilot makes a mistake, tell it "Extract an instruction from this so you never do it again." Compound effect — your instructions capture real failure modes, not idealized wishes.

**`/init`** auto-generates `copilot-instructions.md` from your codebase. Run it once, then prune hard.

**Portability.** `AGENTS.md` is an open standard supported by Copilot, Claude Code, Cursor, Devin, Gemini CLI, opencode. Use it if you want cross-tool. `copilot-instructions.md` is Copilot-only. Both work in Copilot. Pick one — don't maintain both.

**CLAUDE.md** also works in Copilot. VS Code and JetBrains detect it automatically. One file, both tools. Enable/disable via `chat.useClaudeMdFile`.

**Config layering** (later overrides earlier):

1. Organization instructions (GitHub.com)
2. Personal instructions (GitHub.com profile)
3. Repository instructions (`copilot-instructions.md` / `AGENTS.md` / `CLAUDE.md`)
4. Path-specific instructions (`.instructions.md`)
5. Prompt files, agents, skills (on-demand)
6. Your chat prompt — highest priority

**Config merges, not replaces.** Omit MCP servers in your project config and you inherit the global ones. Must explicitly disable.

---

## Path-Specific Instructions (.instructions.md)

In `.github/instructions/`. Only load when Copilot touches matching files. Not progressively disclosed — full content enters context on match.

```yaml
---
applyTo: "**/*.py"
---
# Python Conventions
- Use type hints for all signatures
- Follow PEP 8
- Docstrings on public functions
```

- Config: **full content on path match**. A 400-liner for `**/*.py` costs 400 tokens every time you touch Python.
- If both repo instructions and path-specific instructions apply, both are used. **Behavior on conflict is non-deterministic.** Don't write contradictory rules.
- Best for: language/framework conventions, subdirectory-specific rules, anything that only applies to part of your codebase.
- Token cost: zero when you're working outside the matching paths — so put your Python rules in Python rules, not in `copilot-instructions.md`.

---

## Prompt Files (.prompt.md)

In `.github/prompts/`. Zero-cost until you invoke via `/name`. Task-specific templates with variables.

```yaml
---
name: explain-code
description: "Explain code with examples"
agent: agent
---
Explain this: ${input:code:Paste your code here}
```

Key details:

- **IDE only.** VS Code and JetBrains. Not GitHub.com chat or the coding agent.
- `${input:varName:placeholder}` — pauses and prompts for values at invocation time.
- `/create-prompt` generates them from chat.
- Best for: workflows you run less than once a week. More frequent? Make a skill.

---

## Custom Agents (.agent.md)

Specialized agent personas with their own tool access, model preferences, and context isolation.

**Local agents** (`.agent.md` in VS Code / JetBrains): support `handoffs` for chaining. Each handoff gets a **clean context window** — zero conversation history pollution from the caller. `send: false` runs as isolated subagent (returns only the final result). `send: true` appends the full interaction as a message in the parent conversation.

**Cloud agents** (`.github/agents/` or `agents/` at repo root): fully autonomous — edits files, creates commits, opens PRs. Always work through branches. No `handoffs` support (ignored if present). Selected at `github.com/copilot/agents`.

Best for: role-specific workflows (docs specialist, code reviewer), restricted tool access (read-only agents, MCP-only agents), multi-step chains (planner → implementer → reviewer).

Create agents when you need to enforce a security boundary through tool restrictions rather than prompt instructions. A docs agent with `tools: ["read", "search", "edit"]` literally cannot run `bash`.

---

## Agent Skills (SKILL.md)

The most credit-efficient context primitive. **Progressive disclosure**: ~100 tokens at startup (name + description), full body only on intent match.

```yaml
---
name: write-migration
description: Generates a database migration file
user-invocable: true
disable-model-invocation: false
---
```

- Place in `.github/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, or `~/.copilot/skills/<name>/SKILL.md`.
- **Directory name must match `name` field** or it silently fails to load.
- Full content stays in context until compacted. Skills are standing instructions for a task, not one-time steps.
- No `${input:varName}` support — use prompt files for dynamic input.
- `gh skill preview` before installing. Skills can contain prompt injections.
- Best for: domain knowledge >200 lines that shouldn't pollute context every session. Migration patterns, PR review checklists, deployment guides.

| Storage approach                      | Startup cost           | Per-task cost                |
| ------------------------------------- | ---------------------- | ---------------------------- |
| `copilot-instructions.md` (500 lines) | 500 tokens, every turn | Same                         |
| `.instructions.md` (300 lines)        | 0 (on path match: 300) | 300 tokens                   |
| Skill (400 lines)                     | ~100 tokens            | 400 tokens only when matched |

---

## MCP Servers (.vscode/mcp.json)

Connect agents to external systems — databases, browsers, APIs. Tool definitions cost 50-200 tokens each. A 10-tool server eats ~500-2,000 tokens just in definitions before doing any work.

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

- **CLI tools over MCP for simple stuff.** `gh`, `git`, `npm`, `curl` have zero per-tool listing overhead. MCP only when you need structured tool contracts.
- **Auto-approve** now supported at server and tool level in VS Code and JetBrains.
- **Admin allowlists** — org admins can restrict which MCP servers connect.
- **Workspace-scoped.** Committed to version control. Review MCP configs in PRs.
- Referenced in agent `tools` as `server-name/*`.
- Secrets via `${input:varName}` — never hardcode.

---

## Hooks (.github/hooks/\*.json)

The only way to **enforce** rather than **suggest**. Shell commands on lifecycle events.

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [{ "type": "command", "bash": "./scripts/security-check.sh" }]
  }
}
```

- Events: `userPromptSubmitted`, `preToolUse`, `postToolUse`, `errorOccurred`.
- "Don't run `rm -rf`" in instructions = suggestion. A `preToolUse` hook returning `deny` = enforcement.
- **Hooks run with full VS Code privileges.** Review them like production code.
- **Bash pattern matching is fragile.** Don't rely on `Bash(curl http://github.com *)` for security — it misses `curl -X GET https://github.com/...`. Use tool-level denials and MCP scoping instead.
- Public preview in JetBrains (March 2026), already GA in VS Code.

---

## Context Shortcuts: `#`, `@`, `/`

| Prefix | Purpose                 | Examples                                        |
| ------ | ----------------------- | ----------------------------------------------- |
| `/`    | Commands + prompt files | `/explain`, `/fix`, `/tests`, `/your-prompt`    |
| `#`    | Attach context          | `#file`, `#codebase`, `#selection`, `#editor`   |
| `@`    | Specialist agents       | `@workspace`, `@vscode`, `@terminal`, `@github` |

`#codebase` does semantic search across your workspace — Copilot decides relevance. `#file` attaches specific files with known token cost. Use `#codebase` for discovery, `#file` when you know what's needed and want to control spend.

Combine them: `@workspace using patterns in #file:src/api/auth.ts, /fix #selection`

---

## Newer Primitives (June 2026)

- **Copilot Memory** — Automatically learns repo patterns across sessions. Managed by Copilot, not editable. Use for what Copilot discovers; use instructions for what you define.
- **Copilot Spaces** (formerly Knowledge Bases) — Curated topic-specific knowledge. Accessed via GitHub MCP server. Costs AI Credits on access.
- **Copilot Automations** — Cloud agent on a schedule or event (issue triage, security alerts, nightly review). Per-run agent cost.
- **Desktop App + Canvas** — Collaborative workspace outside the IDE. Supports **Agent Merge** (orchestrating multiple agents toward one goal) and autonomous code review.
- **Agent Plugins** — Prepackaged bundles from marketplaces. Plugin agents can't use `hooks`, `mcpServers` or `permissionMode`. Need those? Copy the agent to `.github/agents/` instead.
- **Copilot Memory** — Repository-derived, managed by Copilot. Different from instructions: it's what Copilot _learns_, not what you _tell_ it. Stable conventions → instructions. Discovered patterns → Memory.

---

## 3 Patterns That Cross Primitives

**Security boundaries via tool restriction.** Instructions are advisory. Tool arrays are mechanical. A documentation agent with `tools: ["read", "search", "edit"]` cannot run bash regardless of what its prompt says. Cloud agents with `mcp-servers` in frontmatter get scoped external access. Hooks with `preToolUse` denials are the nuclear option.

**Handoff chains for context isolation.** Planner agent → implementer agent → reviewer agent. Each handoff starts with a clean context — no conversation history, no loaded files, no accumulated context rot. The sub-agent only receives the handoff prompt plus its own system instructions. Your main session stays lean.

**Self-writing instructions.** The meta-pattern: when the agent gets something wrong, say "Extract an instruction from this." The agent writes its own constraint. Over time, your instruction files converge on what the agent _actually_ gets wrong, not what you _imagine_ it might get wrong.

---

## One Big Fact to Remember

**Skills are the only primitive with progressive disclosure.** At startup: ~100 tokens. Full body only on intent match. Everything else — `copilot-instructions.md`, `.instructions.md`, MCP tool defs — loads fully or not at all. If you have deep domain knowledge that doesn't belong in every session, skills are the most credit-efficient and attention-efficient way to deliver it. Under usage-based billing, this isn't just clever — it's cheaper.

Cut your `copilot-instructions.md` in half. Put the rest in skills or `.instructions.md`. Watch your credit burn drop and your output quality rise.

---

## References

- [GitHub Copilot Customization Library](https://docs.github.com/en/copilot/tutorials/customization-library)
- [VS Code Copilot Customization](https://code.visualstudio.com/docs/copilot/customization/overview)
- [AGENTS.md Open Standard](https://agents.md/)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Hooks Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [About GitHub Copilot Memory](https://docs.github.com/en/copilot/concepts/memory)
- [Usage-Based Billing](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals)
- [Context Engineering for Claude Code (this site)](../context-engineering/)
- [MCP Blog Post (this site)](../mcp/)
