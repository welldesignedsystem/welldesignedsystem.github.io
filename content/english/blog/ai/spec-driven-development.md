+++
date = '2026-07-02T06:00:00+10:00'
draft = false
title = 'Spec-Driven Development With AI: A 2026 Methodology Guide'
tags = ['SDD', 'Spec-Driven Development', 'AI', 'Software Engineering', 'Methodology', 'Agentic', 'Spec-First']
summary = 'Spec-Driven Development (SDD) is a 2026 software engineering workflow where structured specifications become the source of truth and AI agents derive implementation, tests and documentation from them.'
+++

## What Is Spec-Driven Development?

Spec-Driven Development (SDD) is a software engineering workflow where a written, structured specification becomes the source of truth for what you are building, and AI coding agents derive the implementation, tests and documentation from that spec. You describe the what and the why in detail before any code gets generated. The spec is not throwaway documentation — it is an executable artifact that drives the entire development loop.

The practice emerged as teams realised that prompting AI without structure produced unpredictable results. SDD replaces "prompt-and-pray" with a planning-first approach that gives agents clearer boundaries, review points and acceptance criteria.

## The Problem SDD Solves

When a developer tells an AI agent "build me a file upload feature," the AI must guess: what format? what permissions model? what size limits? Cloud storage or local? Compression? The result is non-deterministic output that requires iterative correction. Each correction adds context the AI lacked at the start.

SDD addresses this by separating planning from implementation. Before any code is written, the spec captures:

- The goal (who it is for, what problem it solves)
- Requirements (functional and non-functional)
- Constraints (technology, performance, security)
- Acceptance criteria (specific, copy-pasteable checks)

The agent implements against the spec. You review against the spec. No vibes, no guessing, no prompt-and-pray.

## The SDD Loop

The spec-driven development loop follows a consistent structure:

1. **Specify** — Write a detailed specification of what to build, describing user outcomes, acceptance criteria and constraints
2. **Plan** — Derive a technical plan from the spec plus the project's constitution: data models, interfaces, contracts, migration steps
3. **Task** — Break the plan into implementation tasks
4. **Implement** — AI agents generate code task by task against the spec
5. **Verify** — Review output against the acceptance criteria defined in the spec

At each phase, humans review and refine before proceeding, maintaining alignment between intent and implementation. Mature tooling now typically inserts two extra gates into this loop — a clarification pass to resolve ambiguity before planning, and a consistency check across spec/plan/tasks before implementation starts — since these were the two places teams found the largest gap between what was written and what agents actually built.

## Three Levels of Specification Rigor

Recent SDD writing commonly distinguishes three levels of rigor:

### Spec-First

The spec is written before implementation but is not the maintained source of truth. Code may deviate from the spec as implementation progresses. Suitable for prototypes, exploratory work and small features.

### Spec-Anchored

The spec serves as the authoritative reference throughout development. Changes in implementation are reflected back into the spec. Suitable for team projects, API development and features with clear acceptance criteria.

### Spec-as-Source

The specification is the maintained artifact and code is regenerated from it. Developers never edit generated code — they edit specs and regenerate. This is the most rigorous level, best suited for regulated environments, enterprise systems and long-lived projects. It's worth noting that as of mid-2026 this is still the least-adopted tier in practice — even tools built around this idea (see Tessl, below) have mostly shipped spec-anchored workflows so far, with true regeneration remaining aspirational.

## Tooling Ecosystem

Several tools have emerged to support SDD workflows. Each shares the common insight that separating planning from implementation allows agents to focus on execution within defined boundaries.

### GitHub Spec Kit

An open-source GitHub toolkit for spec-driven AI development. Its core workflow uses explicit agent commands:

- `/speckit.constitution` — Creates project principles and development guidelines
- `/speckit.specify` — Defines what to build in terms of requirements and user stories
- `/speckit.clarify` — Surfaces and resolves ambiguities in the spec before planning
- `/speckit.plan` — Creates a technical implementation plan
- `/speckit.checklist` — Generates quality checklists that validate requirements completeness and clarity
- `/speckit.tasks` — Breaks the plan into actionable tasks
- `/speckit.analyze` — Runs a cross-artifact consistency check across spec, plan and tasks before implementation begins
- `/speckit.implement` — Executes the tasks against the plan
- `/speckit.converge` — After implementation, checks the codebase against the planned work and appends tasks for anything still missing

The lean path for quick experiments is `specify → plan → tasks → implement`; production features are expected to run the full sequence including `clarify`, `checklist` and `analyze`. At each phase, humans review and refine before proceeding.

### Amazon Kiro

An IDE-native tool that guides users through requirements, design and task creation stages before implementation. Kiro specs generate three core files: `requirements.md` (using EARS — Easy Approach to Requirements Syntax — for testable, structured acceptance criteria), `design.md` and `tasks.md`. Kiro can also run independent tasks concurrently by building a dependency graph from the task list and grouping independent tasks into execution "waves." Kiro also offers a Quick Plan mode that generates all three artifacts in one pass without approval gates for well-understood features, and a bugfix-spec variant using `bugfix.md` for structured root-cause analysis.

Kiro reached general availability in March 2026, built on Code OSS and running on Claude via Amazon Bedrock. It's editor-locked in a way Spec Kit is not: native support covers VS Code-based environments and, via the Agent Client Protocol, JetBrains; there's no native Visual Studio or Eclipse path.

The explicit staging reduces the chance that the AI guesses requirements that were never specified. It also creates a useful audit trail: requirements, acceptance criteria, design decisions and implementation tasks are all visible artifacts.

### BMAD-METHOD

An open-source (MIT), agent-persona-based framework — "Breakthrough Method for Agile AI-Driven Development" — that combines SDD with a simulated agile team. Rather than a single agent working through spec/plan/tasks, BMAD assigns the work to 12+ specialized personas (Analyst, PM, Architect, Dev, QA, UX and others), each responsible for a phase of the lifecycle, coordinated through structured, often YAML-defined workflows. It splits work into an "Upstream" (thinking: brainstorming, requirements, architecture) and "Downstream" (building: implementation, testing) phase, and adjusts planning depth automatically based on project scale — a bug fix triggers a lighter flow than a new enterprise system.

By mid-2026 BMAD is one of the most widely adopted tools in this space by GitHub star count (roughly 49,000 stars and 5,700 forks as of June 2026, up from 37,000 in February), and installs via `npx bmad-method install` into Claude Code, Cursor, or Codex CLI. It's free with no paywalled tiers. The trade-off reported by adopters is a steeper learning curve and slower time-to-first-PR on small tasks compared to leaner tools like OpenSpec, since the multi-persona structure adds ceremony that isn't worth it for quick changes.

### Tessl

Tessl originally positioned itself squarely as the spec-as-source bet: specs become the maintained artifact and implementation is generated from them. That framing has shifted. On January 29, 2026, Tessl repositioned around "Skills on Tessl" and now describes itself primarily as an Agent Enablement Platform, with a registry of 10,000+ "usage specs" for open-source libraries — effectively a package manager for agent context that helps agents avoid hallucinating unfamiliar APIs. What you can actually install and use today (`tessl install tessl-labs/spec-driven-development`) is closer to a spec-first workflow with an approval checkpoint than true spec-as-source regeneration; the more ambitious "Tessl Framework" aimed at full spec-as-source has been in private beta for close to a year and hasn't reached general availability. This is promising as a direction, but it is also the least mature part of the ecosystem and should be evaluated carefully before using it for production systems.

### cc-sdd

A name shared by more than one Claude Code-focused command set, so it's worth being specific about which one you mean. The more established `gotalab/cc-sdd` installs Agent Skills across eight coding agents (Claude Code, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, Antigravity) and is notable for an explicit philosophical choice: it treats **code**, not the spec, as the source of truth — specs describe contract boundaries between parts of the system rather than acting as a master document the agent must obey. A separate `rhuss/cc-sdd` project instead builds directly on top of GitHub Spec Kit's `/speckit.*` commands, adding process-discipline extras like git worktree isolation and trait-based quality gates. Any AI coding agent can consume specs from either — they are just markdown — but the orchestration philosophy differs meaningfully between the two, which matters if you're picking one to standardise on.

### OpenSpec

A lightweight open-source option: a spec-driven workflow you can drop into an existing repo without adopting a new IDE or CLI-heavy ceremony. It separates `openspec/specs/` (the current source of truth) from `openspec/changes/` (proposed modifications), where each change is a self-contained folder of `proposal.md`, `design.md`, `tasks.md` and delta specs marking requirements as ADDED, MODIFIED or REMOVED. This delta model — tracking change proposals as diffs against current specs — maps closely onto how teams actually evolve systems, and is explicitly positioned as brownfield-first, in contrast to Spec Kit and Kiro which lean more toward greenfield use.

### amux

A board-based orchestration platform for running multiple AI coding agents in parallel, rather than an SDD methodology tool itself — it's the layer that lets specs written in tools like the above actually get executed by a fleet of agents at once. amux provides a SQLite-backed kanban board with atomic task claiming (so two agents can't grab the same task), git worktree isolation per agent, a self-healing watchdog that auto-restarts or auto-compacts context on crashes, and a REST API agents can use to discover peers, message each other and claim board items without a human in the loop. The rule of thumb: if two tasks touch different files, they can run in parallel; if they touch the same file, they must be sequential.

## Comparing the Tools

The tools above aren't interchangeable — they optimize for different things, and picking the wrong one for your context is the most common reason teams try SDD once and quietly go back to prompting. Note that amux is excluded from this comparison table on purpose: it's an execution layer for running multiple agents at once, not a competing SDD methodology, and it can sit underneath any of the others.

| Tool | Rigor level | Agent / IDE lock-in | Setup overhead | Parallel execution | Best for | Maturity (mid-2026) |
|---|---|---|---|---|---|---|
| **GitHub Spec Kit** | Spec-anchored | None — works with 30+ agents (Claude Code, Copilot, Cursor, Gemini, etc.) | Medium — Python CLI, `.specify/` scaffold, 5–8 slash commands per feature | Not built-in; pairs well with amux/worktrees | Teams that want a rigorous, agent-neutral process without picking a vendor | High — 93,000+ stars, actively maintained, closest thing to a de facto standard |
| **Amazon Kiro** | Spec-anchored | High — VS Code-based (Code OSS), JetBrains via ACP only, no Visual Studio/Eclipse | Low — IDE handles scaffolding automatically | Native — dependency-graph "waves" run independent tasks concurrently | Teams standardizing on AWS tooling who want specs enforced by the IDE itself, not by discipline | High — GA since March 2026, backed by AWS, but real production friction (2,800+ open GitHub issues) |
| **BMAD-METHOD** | Spec-anchored, agile-flavored | None — installs into Claude Code, Cursor, Codex CLI | High — 12+ agent personas, YAML workflows, steeper learning curve | Not the focus — persona handoffs are sequential by design | Teams that want an AI-simulated agile team (PM/Architect/Dev/QA) rather than a single agent following a spec | Very high adoption by star count (~49K), but slower time-to-first-PR reported for small tasks |
| **Tessl** | Aspires to spec-as-source; ships spec-first today | Low — MCP-compatible | Low for the Registry (`tessl install`); the Framework is still private beta | Not a focus | Reducing library/API hallucination via the usage-spec Registry; not yet a full SDD replacement | Repositioning (Jan 2026 pivot to "Agent Enablement Platform") — the most ambitious tier isn't shipped |
| **cc-sdd** (gotalab) | Spec-anchored, code-as-truth | None — 8 agents supported | Low — `npx cc-sdd@latest` | Via subagents, not native to the tool | Teams who want spec *contracts* between components without treating the spec as the master document | Moderate, actively developed |
| **OpenSpec** | Spec-anchored, brownfield-first | None — 20+ tools via slash commands or plain-language requests | Very low — `openspec init`, no Python, ~5 minutes | Supported via git worktrees + subagents (documented pattern) | Existing codebases, incremental feature work, teams that found Spec Kit too heavyweight | Growing fast, 1.0 shipped Jan 2026, explicitly positioned against Spec Kit's rigidity |

A few things the table doesn't fully capture:

- **Spec Kit vs. OpenSpec** is the comparison most teams actually need to make, since both are agent-neutral and free. Spec Kit's phase gates (constitution → specify → clarify → plan → checklist → tasks → analyze → implement → converge) are more thorough but heavier; OpenSpec's delta-based model (`proposal → specs → design → tasks → implement`, no rigid gates) is lighter and was explicitly built for changing existing systems rather than greenfield builds. Spec Kit is stronger for 0→1; OpenSpec is stronger for 1→n.
- **Kiro vs. everything else** is really an IDE-lock-in decision, not a methodology decision — you're choosing whether you want the spec discipline enforced by the editor or self-imposed via CLI/slash commands.
- **BMAD** solves a different problem than the others: it's less "keep the agent aligned to a spec" and more "simulate a small team with role separation." If your context-loss problem is really a lack of role separation (the agent conflates product decisions with implementation decisions), BMAD addresses that directly in a way Spec Kit and OpenSpec don't.
- **Tessl's Registry** (not the Framework) is worth using regardless of which methodology tool you pick — it's solving a narrower, orthogonal problem (agents hallucinating library APIs), not competing with Spec Kit/Kiro/OpenSpec/BMAD for the planning workflow itself.

## Which Tool Should You Actually Use?

For most teams adopting SDD for the first time in 2026, **OpenSpec is the best starting point**, with GitHub Spec Kit as the natural upgrade once the team outgrows it.

The reasoning:

- **Lowest cost of trying it.** No Python toolchain, no new IDE, five-minute `openspec init`. You can pilot it on a single feature this week without a team-wide tooling decision.
- **Brownfield-first matters more than it sounds.** Most real engineering work is modifying existing systems, not greenfield builds — and OpenSpec's delta-spec model (`openspec/specs/` as current truth, `openspec/changes/` as proposed diffs) maps directly onto how teams actually review and merge change, unlike tools built around a single upfront constitution-and-build flow.
- **No lock-in risk.** It works across 20+ agents through slash commands or plain language, so switching from Claude Code to something else later doesn't strand your specs.
- **It fails gracefully.** Because it doesn't enforce rigid phase gates, a team that finds the full ceremony isn't paying off can dial it back without abandoning the tool entirely — which is a real risk with heavier frameworks.

**When to reach for something else instead:**
- If your team is standardizing on AWS and mostly lives in VS Code already, **Kiro** gives you the same rigor with less process to self-enforce — the IDE does it for you, at the cost of editor lock-in.
- If your actual pain point is that a single agent conflates product, architecture and implementation decisions in one context window, **BMAD-METHOD** is worth the steeper learning curve — role separation is its whole point.
- If you need the most battle-tested, widest-agent-support option and don't mind more ceremony, **GitHub Spec Kit** is the safer long-term bet for larger or more regulated teams, precisely because it's the most complete implementation of the full SDD loop including consistency checks (`/speckit.analyze`) and post-implementation gap detection (`/speckit.converge`).
- Skip **Tessl's Framework** and **spec-as-source** generally for now unless you're doing narrow, well-defined code generation (API stubs from OpenAPI, embedded code from models) — the general-purpose version of this idea isn't production-ready yet.

## Acceptance Criteria Are the Key

Acceptance criteria are the most important part of a spec. They are what make review objective instead of subjective, and what let agents self-verify. Good acceptance criteria should be specific commands, tests or checks that prove the implementation is correct. They should be copy-pasteable. If you cannot write a concrete acceptance criterion, the requirement is too vague.

A structured notation worth knowing here is EARS (Easy Approach to Requirements Syntax), used natively by Kiro and increasingly elsewhere: requirements are written as `WHEN [condition/event] THE SYSTEM SHALL [expected behavior]`. This forces edge cases and failure modes into the open rather than leaving them implicit.

## Why SDD Matters for Parallel AI Agents

A single large spec can often be split into multiple parallel tasks. Without specs, each agent needs a human babysitter during implementation. With specs, agents are autonomous — they have everything they need to work independently. This is the difference between running one agent interactively and running ten agents overnight. Specs are what make the jump to parallel execution possible — and tools like amux are what make running that many agents at once operationally manageable rather than a stack of unattended terminal windows.

## Adoption Signals

By mid-2026, SDD is better described as an emerging methodology with strong tooling momentum, not a settled industry standard.

- GitHub Spec Kit provides a public, open-source workflow and CLI around SDD, and works across 30+ AI coding agents without forcing a specific one
- BMAD-METHOD has grown faster by star count than any other tool in this list, suggesting the persona/agile framing resonates with a large segment of the audience even though it isn't the most "orthodox" SDD implementation
- Kiro exposes spec workflows natively in an IDE and supports requirements, design and task artifacts, though its editor lock-in (VS Code-based, no Visual Studio/Eclipse path) is a real adoption constraint for JetBrains- or Visual Studio-heavy teams
- Research and practitioner writing increasingly frame specs as a way to reduce ambiguity, govern agent output and manage spec-code drift
- Teams experimenting with parallel agents need explicit specs because independent agents require shared context and objective completion criteria
- At least one major player (Tessl) has partially pivoted away from the spec-as-source framing toward agent context/skills distribution, which is a signal that the most rigorous tier of SDD is proving harder to productize than the spec-first and spec-anchored tiers

The trend is real, but the language should stay measured. SDD is not yet as standardised as Agile, Scrum or test-driven development.

## What This Post Should Not Overclaim

SDD is valuable, but it does not guarantee correct software by itself. A weak spec produces weak implementation. A spec can also drift from code unless the team enforces traceability, review and update rules. For production systems, SDD should be paired with tests, security checks, code review, observability and human accountability.

## References

- GitHub — [Spec Kit](https://github.com/github/spec-kit)
- Kiro — [Specs documentation](https://kiro.dev/docs/specs/)
- BMAD-METHOD — [GitHub repository](https://github.com/bmad-code-org/BMAD-METHOD)
- OpenSpec — [Documentation](https://openspec.dev/)
- Tessl — [Spec-Driven Development docs](https://docs.tessl.io/use/spec-driven-development-with-tessl)
- amux — [Documentation](https://amux.io/)
- Deepak Babu Piskala — "Spec-Driven Development: From Code to Contract in the Age of AI Coding Assistants" (2026)
- Pardis Taghavi and Santosh Bhavani — "Spec Kit Agents: Context-Grounded Agentic Workflows" (2026)
