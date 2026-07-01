+++
date = '2026-07-02T06:00:00+10:00'
draft = false
title = 'Spec-Driven Development With AI: A 2026 Methodology Guide'
tags = ['SDD', 'Spec-Driven Development', 'AI', 'Software Engineering', 'Methodology', 'Agentic', 'Spec-First']
summary = 'Spec-Driven Development (SDD) is a 2026 software engineering workflow where structured specifications become the source of truth and AI agents derive implementation, tests and documentation from them.'
+++

## What Is Spec-Driven Development?

Spec-Driven Development (SDD) is a software engineering workflow where a written, structured specification becomes the source of truth for what you are building, and AI coding agents derive the implementation, tests and documentation from that spec. You describe the what and the why in detail before any code gets generated. The spec is not throwaway documentation — it is an executable artifact that drives the entire development loop.

As Martin Fowler's colleague Birgitta Böckeler described it on martinfowler.com: "Spec-driven development means writing a 'spec' before writing code with AI." The practice emerged as teams realised that prompting AI without structure produced unpredictable results. SDD replaces "prompt-and-pray" with a planning-first approach that produces predictable output.

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

At each phase, humans review and refine before proceeding, maintaining alignment between intent and implementation.

## Three Levels of Specification Rigor

A paper presented at the 2026 Conference on AI Coding Assistants identifies three levels of SDD rigor, with clear guidance on when each applies:

### Spec-First

The spec is written before implementation but is not the maintained source of truth. Code may deviate from the spec as implementation progresses. Suitable for prototypes, exploratory work and small features.

### Spec-Anchored

The spec serves as the authoritative reference throughout development. Changes in implementation are reflected back into the spec. Suitable for team projects, API development and features with clear acceptance criteria.

### Spec-as-Source

The specification is the maintained artifact and code is regenerated from it. Developers never edit generated code — they edit specs and regenerate. This is the most rigorous level, best suited for regulated environments, enterprise systems and long-lived projects.

## Tooling Ecosystem

Several tools have emerged to support SDD workflows. Each shares the common insight that separating planning from implementation allows agents to focus on execution within defined boundaries.

### GitHub Spec Kit

An open-source toolkit providing commands for spec-driven AI development. The workflow follows four explicit phases:

- `/specify` — Generates a detailed spec from a prompt
- `/plan` — Creates technical architecture
- `/tasks` — Breaks the plan into implementation tasks
- Implementation — Generates code task by task

At each phase, humans review and refine before proceeding.

### Amazon Kiro

An IDE-native tool that guides users through requirements, design and task creation stages before any code generation begins. Kiro emphasises structured requirements capture and iterative refinement, ensuring AI has clear context before attempting implementation. The explicit staging prevents the AI from guessing at requirements that were never specified.

As noted on sdd.sh, AWS backing Kiro is significant for enterprise adoption. A Kiro spec is, by design, an audit trail: requirements, acceptance criteria and the gap between what was specified and what was implemented are all explicit and version-controlled.

### Tessl

Tessl takes the most radical approach: spec-as-source, where the specification is the maintained artifact and code is regenerated from it. Tessl represents the emerging vision of "specs as the new source code," where developers never edit generated code — they edit specs and regenerate.

### cc-sdd

A Claude Code command set that implements spec-driven workflows directly in the terminal. Any AI coding agent can consume specs — they are just markdown. The orchestration layer — how agents discover, claim and report on specs — is where tools differ.

### OpenSpec

A lightweight open-source option: a spec-driven workflow you can drop into an existing repo without adopting a new IDE or CLI-heavy ceremony. It tracks change proposals as diffs against current specs, which maps onto how teams actually evolve systems.

### amux

A board-based orchestration platform with parallel agent execution. For running multiple agents in parallel, amux provides atomic task claiming and isolated worktrees. The rule: if two tasks touch different files, they can run in parallel. If they touch the same file, they must be sequential.

## Acceptance Criteria Are the Key

Acceptance criteria are the most important part of a spec. They are what make review objective instead of subjective, and what let agents self-verify. Good acceptance criteria should be specific commands, tests or checks that prove the implementation is correct. They should be copy-pasteable. If you cannot write a concrete acceptance criterion, the requirement is too vague.

## Why SDD Matters for Parallel AI Agents

A single large spec can often be split into multiple parallel tasks. Without specs, each agent needs a human babysitter during implementation. With specs, agents are autonomous — they have everything they need to work independently. This is the difference between running one agent interactively and running ten agents overnight. Specs are what make the jump to parallel execution possible.

## Industry Adoption

By mid-2026, SDD had moved from an emerging practice to an established methodology:

- Agentic Conf Hamburg 2026 accepted a session titled "Beyond the Vibes: Lessons from Using Spec-Driven Development Frameworks for Agentic Coding"
- Anthropic's 2026 Agentic Coding Trends Report framed the shift from AI-as-assistant to AI-as-engineer as the central trend of the year, with SDD as the methodology that makes that shift tractable
- The McKinsey/QuantumBlack agentic workflows piece from February 2026 concluded that the biggest barrier to agentic adoption in enterprises is governance — and a spec is, by design, an audit trail
- The role of the spec writer is becoming a real job title: developers who spend most of their time writing and refining specs rather than writing code

## References

- Apoorv Gupta, Microsoft — "Spec-Driven Development: A Spec-First Approach to AI-Native Engineering" (June 2026), developer.microsoft.com
- Birgitta Böckeler, Thoughtworks — "Understanding Spec-Driven Development: Kiro, spec-kit, and Tessl" (October 2025), martinfowler.com
- "Spec-Driven Development: From Code to Contract in the Age of AI Coding Assistants" — OpenReview (2026)
- Florent Clairambault — "SDD Is Eating Software Engineering" (April 2026), sdd.sh
- Momčilo Popov — "Spec-Driven Development (SDD): The Definitive 2026 Guide", thebcms.com
- amux.io — "Spec-Driven Development with AI Coding Agents: The Complete Guide (2026)"
- Levelop — "Spec-Driven Development in 2026: Complete Guide" (June 2026)
