+++
date = '2026-08-25T09:20:00+10:00'
draft = false
title = 'AI Skills and Tools by Phase'
tags = ['AI Skills','Evals','Agents','Fintech']
summary = "The AI execution stack mapped across the SDLC phases."
+++

## Introduction

This post is part five of a series on software engineering in Telly's fintech domain. It collects the AI capability stack a team needs, maps each skill to the lifecycle phase where it earns its keep and shows two open-source implementations of the ideas.

## AI Skills and Tools by Phase

**Note:** The placement of AI skills and tools across the SDLC is a work in progress. A dedicated matrix mapping each skill and tool to its optimal lifecycle phase is planned.

### The AI Execution Stack

To do work across the SDLC phases, a team needs a stack of AI capabilities. Context engineering is the foundation — it is what makes all other skills grounded rather than guessing — but it is not sufficient on its own. The full stack:

| AI Skill                            | What It Does                                                                                | Primary Phases                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Context engineering**             | What the model sees — memory, scoping, compression, selective loading                       | All phases (the backbone)                         |
| **Prompt engineering**              | How you ask — wording, examples, instruction hierarchy, formatting                          | All phases                                        |
| **Spec-driven development**         | Structured specs in → implementation, tests and docs out                                    | 1 (Requirements), 2 (Architecture)                |
| **Code and test generation**        | Creating artifacts — code, tests, infrastructure as code, pipelines                         | 3 (Development), 4 (Testing), 5 (Build & Release) |
| **Evaluation (evals)**              | Verifying non-deterministic output — golden datasets, model-graded metrics, CI gates        | 4 (Testing), 6 (Production)                       |
| **Adversarial analysis (grill me)** | Challenging assumptions, attacking edge cases, defending the business case                  | 0 (Discovery), 2 (Architecture review)            |
| **Retrieval and grounding**         | Pulling external knowledge into the context window — chunking, embeddings, re-ranking       | All phases (feeds context engineering)            |
| **Observability and analysis**      | Monitoring, anomaly detection, summarisation, cost governance                               | 6 (Production), 7 (Maintenance)                   |
| **Guardrails and safety**           | Prompt injection defence, hallucination mitigation, secrets handling, supply-chain scanning | All phases (cross-cutting)                        |

The context engineering repo feeds **spec-driven development** and **retrieval** directly. Those two are what make the other skills work — without structured specs, code generation is guessing; without retrieval, context engineering has nothing to load.

### Preliminary Skill-to-Phase Mapping

- **Grill Me (adversarial interrogation)** — Phase 0: Discovery. The highest value of challenging assumptions and defending the business case is before a single requirement is written. By Phase 1 you have already decided the problem is worth solving. Also applies during architecture review (Phase 2) and later review cycles.
- **Spec-driven development** — Phase 1: Requirements and Phase 2: Architecture. Agents derive user stories, acceptance criteria, solution designs and test cases from structured specifications stored in the context engineering repo.
- **Code and test generation** — Phase 3: Development. The most natural fit for autonomous and observed operating modes. Grounded by ADRs, design specs and domain knowledge from the context engineering repo.
- **Evals and quality gates** — Phase 4: Testing. Non-deterministic output needs non-deterministic testing: golden datasets, model-graded metrics, invariant checks and CI gates.
- **Retrieval and grounding** — All phases. The mechanism that pulls the right documents from the context engineering repo into the model's window for the current task.
- **Observability and cost governance** — Phase 6: Production. Monitoring model behaviour, prompt drift, evaluation regression and token spend.

### The 3D Matrix

The full framework is a three-dimensional matrix:

1. **SDLC Phases** (0–8) — when the work happens
2. **Personas** (29 roles) — who does it, with O/R/C/A involvement
3. **AI Skills** — how it gets done, with operating mode (HITL/OHOTL/AHOTL)

Each cell defines the persona's involvement, the AI skill applied, the document produced or consumed, and the quality gates that must pass before advancing. The context engineering repo is the physical manifestation of this matrix — organised by phase, owned by personas, populated by AI skills, validated by gates.

### Practical Implementations

Two open-source projects demonstrate what the third axis (AI Skills) looks like in practice:

**[obra/superpowers](https://github.com/obra/superpowers)** (82K+ stars) — a composable skills framework where skills trigger automatically based on context. Key skills map directly to our execution stack:

| Superpowers Skill              | Maps To                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| brainstorming                  | Adversarial analysis (grill me) — explores intent and requirements before implementation    |
| writing-plans                  | Spec-driven development — creates implementation plans before touching code                 |
| verification-before-completion | Evals / quality gates — requires running verification commands before claiming work is done |
| dispatching-parallel-agents    | Agent orchestration — subagent-driven development                                           |
| writing-skills                 | Skill authoring — creating new reusable skills                                              |

**[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** (87K+ stars) — production-grade engineering skills organised into a lifecycle: Plan → Build → Verify → Review → Ship. Encodes Google's engineering practices (Hyrum's Law, test pyramid, trunk-based development) as step-by-step agent workflows. Includes references (definition of done, testing patterns, security checklist, performance checklist, accessibility checklist, observability checklist) that function as quality gates, and a built-in evals framework.

Both frameworks treat skills as markdown-based process documentation — exactly the kind of content that would live in the context engineering repo. The difference is that superpowers emphasises automatic skill discovery and composition, while agent-skills emphasises structured lifecycle stages with verifiable exit criteria.

## References

**Online references:**

- obra (2025). _Superpowers: agentic skills framework and software development methodology_. github.com/obra/superpowers.
- Osmani, A. (2026). _Agent Skills: production-grade engineering skills for AI coding agents_. github.com/addyosmani/agent-skills.
