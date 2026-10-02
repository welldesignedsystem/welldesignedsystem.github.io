+++
date = '2026-09-30T12:00:00+10:00'
draft = false
title = 'AI-DLC: AI-Driven Development Life Cycle'
tags = ['AI-DLC', 'AI', 'Agentic', 'Software Engineering', 'Methodology', 'AWS', 'Workflow']
summary = 'AI-DLC (AI-Driven Development Life Cycle) is a methodology and deterministic engine that turns AI coding assistants into structured, auditable software-delivery workflows from one harness-neutral core.'
+++

## Introduction

AI-DLC is presented as a workflow framework for AI-assisted software delivery. Its stated goal is to separate the execution path, governance rules and audit trail from the chat transcript so work can be resumed, reviewed and explained without reconstructing the whole conversation.

- **Repository:** [github.com/awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)
- **Documentation:** [awslabs.github.io/aidlc-workflows](https://awslabs.github.io/aidlc-workflows/)

## The Problem It Solves

Imagine asking a coding agent to "add OAuth login". You often get working code quickly. The harder part is answering the follow-up questions: why is the token TTL set to 15 minutes, who approved the refresh flow, which requirement did that change satisfy, what did the agent decide on its own, and how can anyone reconstruct how that result came about during an audit? In practice, the answer is often a long scrollback through chat history. (The OAuth details here are a hypothetical illustration, not an example from the AI-DLC docs.)

The core problem is not that an agent produces code quickly. It is that the process often lives in a conversation that is hard to verify, resume or review. When a task is represented mainly as chat turns, decisions that exist only in the transcript are hard to recover later.

### Seven ways a chat-only workflow fails

**1. Context is volatile.** Model sessions often compact earlier turns when the context window fills. The result is that the chat history is not always a reliable source of truth for long-running work. Projects that rely on chat history alone can lose continuity between the request, the implementation and the review. AI-DLC addresses that by describing a persisted intent state and recovery mechanisms that are stored outside the live conversational thread.

**2. The route is improvised.** Without a declared path, the agent may decide the next step differently from run to run. That can make the workflow feel inconsistent, especially when the same request needs a different amount of requirements analysis, design or verification depending on the context that survived into the session.

**3. Rules are prose, and prose is not enforcement.** A rule in an instructions file is still a recommendation unless it is enforced in a process. If the rule is important enough to fail a release, it needs to be represented in a form the system can evaluate and track. This is one of the main reasons AI-DLC treats governance as structured data rather than only as a prompt.

**4. Gates made of good intentions do not hold.** "Please run the tests before you say you are done" is useful guidance, but it is still easy to skip under time pressure. A gate is more reliable when the workflow enforces ordering and records the reason for a transition or an exception.

**5. Review arrives late, from the wrong vantage.** A reviewer often sees the finished diff after the author has already made many small design decisions inside the same context. That can make review more about explaining the work than checking it from a fresh vantage point.

**6. Nothing answers "why".** If the process exists only in chat history, later reconstruction depends on inference. An audit trail or a durable state file makes it easier to explain not just what changed, but why it changed and which work item it belonged to.

**7. Narrow specialists create handoffs.** When each discipline is owned by a separate agent, context can easily be lost at the seams between stages. A workflow that keeps more context across phases can reduce that churn, even if it still needs specialists for specific tasks.

The point is not that prompts are useless. It is that a workflow often needs explicit routing, state and checks so that the process can survive the limitations of a conversational interface.

## What Is AI-DLC

AI-DLC (AI-Driven Development Life Cycle) is a methodology from AWS for structuring AI-assisted software development into repeatable, traceable phases. Humans decide and approve while the AI plans and executes. The open-source `awslabs/aidlc-workflows` repository implements it from one harness-neutral core that runs natively in Claude Code, Kiro CLI, Kiro IDE, Codex CLI, Cursor, opencode, and GitHub Copilot. You start a workflow with a single command, such as `/aidlc Build a REST API for inventory management`.

A deterministic engine decides what happens next, moving through 33 stages across five phases: **Initialization, Ideation, Inception, Construction, and Operation**. Workflow profiles and depth levels adapt the path to the size of the work, **so a bug fix does not get the same ceremony as a new service**. **Fourteen agents** (11 domain experts, 2 reviewers, and a composer) carry out the stages. You approve the result at each approval gate, and progress and decisions are recorded in persistent state and an audit trail.

### AI-DLC: Phases, Stages, and Agents

AI-DLC has 5 phases, 33 stages, and 14 agents (11 domain experts, 2 reviewers, and 1 composer).

Which stages actually run depends on the scope you choose.

##### The 5 phases

| # | Phase | Stages | Purpose |
|---|---|---|---|
| 0 | Initialization | 0.1–0.3 | Bootstrap the workspace (automatic, no approval gates) |
| 1 | Ideation | 1.1–1.7 | Validate the initiative: intent, feasibility, scope, team, approval |
| 2 | Inception | 2.1–2.9 | Elaborate requirements, design, and delivery plan |
| 3 | Construction | 3.1–3.7 | Design, implement, and test in reviewable slices |
| 4 | Operation | 4.1–4.7 | Deploy and operate, with a feedback loop back to Ideation |

##### The 33 stages

| # | Stage | Lead | Runs | Artifacts |
|---|---|---|---|---|
| 0.1 | [Workspace Scaffold](#ref-0-1) | orchestrator | Always | - `scaffold-report.md` |
| 0.2 | [Workspace Detection](#ref-0-2) | orchestrator | Always | - `workspace-findings.md`<br>- updated `aidlc-state.md` |
| 0.3 | [State Initialization](#ref-0-3) | orchestrator | Always | - `state-init-summary.md`<br>- populated `aidlc-state.md` |
| 1.1 | [Intent Capture & Framing](#ref-1-1) | aidlc-product-agent | Always | - `intent-capture-questions.md`<br>- `intent-statement.md`<br>- `stakeholder-map.md` |
| 1.2 | [Market Research](#ref-1-2) | aidlc-product-agent | Conditional | - `competitive-analysis.md`<br>- `build-vs-buy.md` |
| 1.3 | [Feasibility & Constraints](#ref-1-3) | aidlc-architect-agent | Conditional | - `feasibility-assessment.md`<br>- `constraint-register.md`<br>- `raid-log.md` |
| 1.4 | [Scope Definition](#ref-1-4) | aidlc-product-agent | Always | - `scope-document.md`<br>- `intent-backlog.md` |
| 1.5 | [Team Formation](#ref-1-5) | aidlc-delivery-agent | Conditional | - `team-assessment.md`<br>- `mob-composition.md` |
| 1.6 | [Rough Mockups](#ref-1-6) | aidlc-design-agent | Conditional | - `wireframes.md`<br>- `user-flow.md` |
| 1.7 | [Approval & Handoff](#ref-1-7) | aidlc-delivery-agent | Always | - `initiative-brief.md`<br>- `decision-log.md` |
| 2.1 | [Reverse Engineering](#ref-2-1) | aidlc-developer-agent (then aidlc-architect-agent) | Brownfield projects | 9 files to `aidlc/spaces/<space>/codekb/<repo>/`:<br>- `business-overview.md`<br>- `architecture.md`<br>- `code-structure.md`<br>- `api-documentation.md`<br>- `component-inventory.md`<br>- `technology-stack.md`<br>- `dependencies.md`<br>- `code-quality-assessment.md`<br>- `reverse-engineering-timestamp.md` |
| 2.2 | [Practices Discovery](#ref-2-2) | aidlc-pipeline-deploy-agent | Conditional | - `team-practices.md`<br>- `discovered-rules.md`<br>- `evidence.md`<br>- `practices-discovery-timestamp.md`<br>- promoted to `memory/team.md` and `project.md` |
| 2.3 | [Requirements Analysis](#ref-2-3) | aidlc-product-agent | Always | - `requirements.md` |
| 2.4 | [User Stories](#ref-2-4) | aidlc-product-agent | User-facing features | - `stories.md`<br>- `personas.md`<br>- `user-stories-assessment.md`<br>- `traceability.json` |
| 2.5 | [Refined Mockups](#ref-2-5) | aidlc-design-agent | UI projects | - `mockups.md`<br>- `interaction-spec.md`<br>- `design-system-mapping.md`<br>- `accessibility-checklist.md` |
| 2.6 | [Domain Design](#ref-2-6) | aidlc-architect-agent | Per execution plan | - `components.md`<br>- `decisions.md` (ADR log)<br>- `traceability.json` |
| 2.7 | [Units Generation](#ref-2-7) | aidlc-architect-agent | Always | - `unit-of-work.md`<br>- `unit-of-work-dependency.md`<br>- `unit-of-work-story-map.md`<br>- `traceability.json` |
| 2.8 | [Contract Design](#ref-2-8) | aidlc-architect-agent | Conditional | - `contract-summary.md` |
| 2.9 | [Delivery Planning](#ref-2-9) | aidlc-delivery-agent | Always | - `bolt-plan.md`<br>- `team-allocation.md`<br>- `risk-and-sequencing-rationale.md`<br>- `external-dependency-map.md` |
| 3.1 | [Functional Design](#ref-3-1) | aidlc-architect-agent | Per Unit (conditional) | - `entities.md`<br>- `rules.md`<br>- `functional-spec.md`<br>- `traceability.json` |
| 3.2 | [NFR Requirements](#ref-3-2) | aidlc-architect-agent | Per Unit (conditional) | - `security-requirements.md`<br>- `performance-requirements.md`<br>- `scalability-requirements.md`<br>- `reliability-requirements.md`<br>- `observability-requirements.md`<br>- `tech-stack-decisions.md`<br>- `traceability.json` |
| 3.3 | [NFR Design](#ref-3-3) | aidlc-architect-agent | Per Unit (conditional) | - `security-design.md`<br>- `performance-design.md`<br>- `scalability-design.md`<br>- `reliability-design.md`<br>- `observability-design.md`<br>- `logical-components.md`<br>- `traceability.json` |
| 3.4 | [Infrastructure Design](#ref-3-4) | aidlc-aws-platform-agent | Per Unit (conditional) | - `infrastructure-specification.md`<br>- `monitoring-design.md`<br>- `cicd-pipeline.md` |
| 3.5 | [Code Generation](#ref-3-5) | aidlc-developer-agent | Per Unit (always) | - `code-generation-plan.md`<br>- `code-generation-questions.md`<br>- `unit-test-instructions.md`<br>- `code-summary.md`<br>- `traceability.json`<br>- `source-manifest.json`<br>- application code to the workspace repos |
| 3.6 | [Build and Test](#ref-3-6) | aidlc-quality-agent | Always, once at end | - `build-instructions.md`<br>- `test-results.md` |
| 3.7 | [CI Pipeline](#ref-3-7) | aidlc-pipeline-deploy-agent | Conditional, once at end | - `ci-config.md`<br>- `quality-gates.md` |
| 4.1 | [Deployment Pipeline](#ref-4-1) | aidlc-pipeline-deploy-agent | Conditional | - `cd-config.md`<br>- `deployment-strategy.md`<br>- `rollback-runbook.md` |
| 4.2 | [Environment Provisioning](#ref-4-2) | aidlc-aws-platform-agent | Conditional | - `environment-inventory.md`<br>- `validation-report.md` |
| 4.3 | [Deployment Execution](#ref-4-3) | aidlc-pipeline-deploy-agent | Conditional | - `deployment-log.md`<br>- `smoke-test-results.md` |
| 4.4 | [Observability Setup](#ref-4-4) | aidlc-operations-agent | Conditional | - `dashboards.md`<br>- `alarms.md`<br>- `slo-config.md` |
| 4.5 | [Incident Response](#ref-4-5) | aidlc-operations-agent | Conditional | - `runbooks.md`<br>- `incident-plan.md`<br>- `escalation-matrix.md` |
| 4.6 | [Performance Validation](#ref-4-6) | aidlc-quality-agent | Conditional | - `load-test-plan.md`<br>- `nfr-validation-matrix.md` |
| 4.7 | [Feedback & Optimization](#ref-4-7) | aidlc-operations-agent | Conditional | - `slo-report.md`<br>- `cost-analysis.md`<br>- `feedback-loop.md` |

Every stage that collects input also writes its `{stage}-questions.md` beside its artifacts (e.g. `intent-capture-questions.md`), and every executed stage keeps a `memory.md` diary when the learnings ritual is on. Construction stages 3.1–3.5 repeat per unit of work, writing under `construction/{unit-name}/`, and per-unit artifacts are pruned to the unit's kind (`service`, `spec`, `ui`, `packaging`, or `library`). Reverse Engineering's 9 files are the only stage artifacts that land outside the record dir, in the per-repo CodeKB.

##### The 14 agents

###### 11 domain experts

| # | Agent | Domain |
|---|---|---|
| 1 | `aidlc-product-agent` | Requirements, scope, user stories, market research |
| 2 | `aidlc-design-agent` | UX/UI, wireframes, interaction design, accessibility |
| 3 | `aidlc-delivery-agent` | Team formation, capacity planning, delivery sequencing |
| 4 | `aidlc-architect-agent` | Application design, domain modelling, NFRs, decomposition |
| 5 | `aidlc-aws-platform-agent` | AWS infrastructure, IaC, FinOps, environment provisioning |
| 6 | `aidlc-compliance-agent` | GRC, regulatory mapping, data classification, risk |
| 7 | `aidlc-devsecops-agent` | Threat modelling, security pipeline, secure design review |
| 8 | `aidlc-developer-agent` | Code generation, reverse engineering, implementation guidance |
| 9 | `aidlc-quality-agent` | Test strategy, acceptance criteria, performance validation |
| 10 | `aidlc-pipeline-deploy-agent` | CI/CD pipelines, deployment strategy, release execution |
| 11 | `aidlc-operations-agent` | Observability, incident response, feedback loops |

###### 2 reviewer agents

| Agent | Reviews |
|---|---|
| `aidlc-product-lead-agent` | Requirements, user stories, and UX/mockup artifacts |
| `aidlc-architecture-reviewer-agent` | Technical design artifacts, including domain design, units generation, functional design, NFR requirements, NFR design, infrastructure design, and code generation |

###### 1 composer agent

| Agent | Role |
|---|---|
| `aidlc-composer-agent` | Proposes tailored stage plans and reshapes pending stages |

##### The 33 stages by lead agent

Each stage sits inside its phase box, is filled with its lead agent's colour, and labels it with the lead agent's ID in square brackets beneath the stage name. The arrows chain the 33 stages in run order; a scope executes a subset of this chain in the same numbered order — skipped stages are left out of that run, not reordered.

```mermaid
flowchart TD
    subgraph INIT["Phase 0 — Initialization"]
        direction LR
        S01["0.1<br/>Workspace Scaffold<br/><sub>[orchestrator]</sub>"]:::orchestrator
        S02["0.2<br/>Workspace Detection<br/><sub>[orchestrator]</sub>"]:::orchestrator
        S03["0.3<br/>State Initialization<br/><sub>[orchestrator]</sub>"]:::orchestrator
        S01 --> S02 --> S03
    end
    subgraph IDEA["Phase 1 — Ideation"]
        direction LR
        S11["1.1<br/>Intent Capture & Framing<br/><sub>[aidlc-product-agent]</sub>"]:::product
        S12["1.2<br/>Market Research<br/><sub>[aidlc-product-agent]</sub>"]:::product
        S13["1.3<br/>Feasibility & Constraints<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S14["1.4<br/>Scope Definition<br/><sub>[aidlc-product-agent]</sub>"]:::product
        S15["1.5<br/>Team Formation<br/><sub>[aidlc-delivery-agent]</sub>"]:::delivery
        S16["1.6<br/>Rough Mockups<br/><sub>[aidlc-design-agent]</sub>"]:::design
        S17["1.7<br/>Approval & Handoff<br/><sub>[aidlc-delivery-agent]</sub>"]:::delivery
        S11 --> S12 --> S13 --> S14 --> S15 --> S16 --> S17
    end
    subgraph INCP["Phase 2 — Inception"]
        direction LR
        S21["2.1<br/>Reverse Engineering<br/><sub>[aidlc-developer-agent]</sub>"]:::developer
        S22["2.2<br/>Practices Discovery<br/><sub>[aidlc-pipeline-deploy-agent]</sub>"]:::pipelinedeploy
        S23["2.3<br/>Requirements Analysis<br/><sub>[aidlc-product-agent]</sub>"]:::product
        S24["2.4<br/>User Stories<br/><sub>[aidlc-product-agent]</sub>"]:::product
        S25["2.5<br/>Refined Mockups<br/><sub>[aidlc-design-agent]</sub>"]:::design
        S26["2.6<br/>Domain Design<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S27["2.7<br/>Units Generation<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S28["2.8<br/>Contract Design<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S29["2.9<br/>Delivery Planning<br/><sub>[aidlc-delivery-agent]</sub>"]:::delivery
        S21 --> S22 --> S23 --> S24 --> S25 --> S26 --> S27 --> S28 --> S29
    end
    subgraph CONS["Phase 3 — Construction"]
        direction LR
        S31["3.1<br/>Functional Design<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S32["3.2<br/>NFR Requirements<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S33["3.3<br/>NFR Design<br/><sub>[aidlc-architect-agent]</sub>"]:::architect
        S34["3.4<br/>Infrastructure Design<br/><sub>[aidlc-aws-platform-agent]</sub>"]:::awsplatform
        S35["3.5<br/>Code Generation<br/><sub>[aidlc-developer-agent]</sub>"]:::developer
        S36["3.6<br/>Build and Test<br/><sub>[aidlc-quality-agent]</sub>"]:::quality
        S37["3.7<br/>CI Pipeline<br/><sub>[aidlc-pipeline-deploy-agent]</sub>"]:::pipelinedeploy
        S31 --> S32 --> S33 --> S34 --> S35 --> S36 --> S37
    end
    subgraph OPER["Phase 4 — Operation"]
        direction LR
        S41["4.1<br/>Deployment Pipeline<br/><sub>[aidlc-pipeline-deploy-agent]</sub>"]:::pipelinedeploy
        S42["4.2<br/>Environment Provisioning<br/><sub>[aidlc-aws-platform-agent]</sub>"]:::awsplatform
        S43["4.3<br/>Deployment Execution<br/><sub>[aidlc-pipeline-deploy-agent]</sub>"]:::pipelinedeploy
        S44["4.4<br/>Observability Setup<br/><sub>[aidlc-operations-agent]</sub>"]:::operations
        S45["4.5<br/>Incident Response<br/><sub>[aidlc-operations-agent]</sub>"]:::operations
        S46["4.6<br/>Performance Validation<br/><sub>[aidlc-quality-agent]</sub>"]:::quality
        S47["4.7<br/>Feedback & Optimization<br/><sub>[aidlc-operations-agent]</sub>"]:::operations
        S41 --> S42 --> S43 --> S44 --> S45 --> S46 --> S47
    end

    VG1{{"Verification Gate 1"}}
    VG2{{"Verification Gate 2"}}
    VG3{{"Verification Gate 3"}}

    S03 -.->|auto-proceeds| S11
    S17 --> VG1
    VG1 --> S21
    S29 --> VG2
    VG2 --> S31
    S37 --> VG3
    VG3 --> S41
    S47 -.->|feedback loop| S11

    classDef orchestrator fill:#9e9e9e,stroke:#616161,color:#000,stroke-width:1px
    classDef product fill:#2196f3,stroke:#1565c0,color:#fff,stroke-width:1px
    classDef architect fill:#9c27b0,stroke:#6a1b9a,color:#fff,stroke-width:1px
    classDef delivery fill:#ff9800,stroke:#e65100,color:#000,stroke-width:1px
    classDef design fill:#e91e63,stroke:#ad1457,color:#fff,stroke-width:1px
    classDef developer fill:#4caf50,stroke:#2e7d32,color:#fff,stroke-width:1px
    classDef pipelinedeploy fill:#00bcd4,stroke:#00838f,color:#000,stroke-width:1px
    classDef quality fill:#ffc107,stroke:#f9a825,color:#000,stroke-width:1px
    classDef awsplatform fill:#f44336,stroke:#c62828,color:#fff,stroke-width:1px
    classDef operations fill:#795548,stroke:#4e342e,color:#fff,stroke-width:1px

    style VG1 fill:#ef9a9a,stroke:#c62828,color:#000
    style VG2 fill:#ef9a9a,stroke:#c62828,color:#000
    style VG3 fill:#ef9a9a,stroke:#c62828,color:#000
    style INIT fill:#f3f5f7,stroke:#9c27b0
    style IDEA fill:#f3f5f7,stroke:#4caf50
    style INCP fill:#f3f5f7,stroke:#2196f3
    style CONS fill:#f3f5f7,stroke:#ff9800
    style OPER fill:#f3f5f7,stroke:#e91e63
```

##### Stage reference

What each stage does in detail, with the same numbering as the table above. Stages run in this order within a phase; whether a specific stage runs depends on the scope and the conditions below.

###### Phase 0 — Initialization

<a id="ref-0-1"></a>
**0.1 Workspace Scaffold** 
— runs deterministically inside:
  - `aidlc-utility` is the deterministic CLI behind the engine: it performs rule-based mutations like intent creation, state, scope, doctor and recompose — no LLM, no agent prose, so the same arguments always produce the same files. In a harness it runs as `<harness-dir>/tools/aidlc-utility.ts`.
  - `intent-create` is the sub command that creates an intent: it creates the record directory, appends the registry row, sets the active-intent cursor and runs all three Initialization stages (0.1, 0.2, 0.3) in one call, usually under a second. It is auto-invoked on your first `/aidlc "<what to build>"` or `/aidlc-init`; you do not type it.
- A phase the scope excludes gets no folder, so the record never implies work that was planned and skipped.
- Idempotent: creates what is missing, skips what exists. No approval gate; auto-proceeds.
- Per-stage folders are not created here — a stage's folder appears when the stage first writes an artifact. No git work happens in this stage.

The record tree that results for a scope that runs every phase looks like this:

```text
intents/260930-checkout-api/   ← one record directory per piece of work: `aidlc/spaces/<space>/intents/<YYMMDD>-<label>/`
├── aidlc-state.md       ← the state file stage 0.3 writes
├── initialization/      ← created; stages 0.1-0.3 always run
├── ideation/            ← created only if the scope runs >= 1 Ideation stage
├── inception/           ← same rule
├── construction/        ← same rule
├── operation/           ← same rule
├── verification/        ← always, scope-independent
└── audit/               ← committed event shards, written as stages run
```

`intents/260930-checkout-api/` abbreviates the full path `aidlc/spaces/<space>/intents/<YYMMDD>-<label>/`. A stage folder like `ideation/intent-capture/` only appears once that stage writes its first artifact.

<a id="ref-0-2"></a>
**0.2 Workspace Detection** — runs deterministically inside `aidlc-utility init`.

- Deterministic scanner classifies the workspace as brownfield or greenfield from signal files: source code, framework config, package manifests, source directories, parseable `.gitmodules`.
- Scans top-level files plus known source directories and skips the harness directories, `aidlc/`, `node_modules/`, `.git/`, `dist/`, `build/` and similar.
- When no top-level signal fires, a nested fallback walks container directories up to three levels below the root and re-applies the same signals, so `services/api/src/main.py` still counts as brownfield.
- Records the detected languages, frameworks and build system into the state file.
- If it finds uninitialized submodules it relays an advisory telling you to run `git submodule update --init --recursive` because reverse engineering needs the code on disk. It never runs git itself.
- No approval gate; auto-proceeds.

<a id="ref-0-3"></a>
**0.3 State Initialization** — runs deterministically inside `aidlc-utility init`.

- Overwrites `<record>/aidlc-state.md` with a fully populated version generated from the compiled stage graph and the scope grid: project description, project type, workspace state, start date, scope configuration, and progress checkboxes for every stage.
- Determines routing by project type: brownfield starts Inception with reverse-engineering, greenfield starts with requirements-analysis and marks reverse-engineering as skip.
- Writes `Stages to Execute` and `Stages to Skip` per scope plus project type. If invoked from `--init` it stops at "workspace initialized"; if invoked from a workflow start it moves to the first post-initialization stage.
- No approval gate; auto-proceeds.

###### Phase 1 — Ideation

<a id="ref-1-1"></a>
**1.1 Intent Capture & Framing** — the first stage of every workflow. Runs inline with the `aidlc-product-agent` as lead and the architect as support.

- Permitted sources are strict: the original description, confirmed `[Q<n>]` answers, the workflow-selected scope, and registered memory rules. Every substantive claim carries an inline source tag; nothing is invented.
- Content inside a `<document>...</document>` block is treated as untrusted data, not instructions.
- Writes `intent-statement.md` (problem, customer, success metrics, trigger, scope signal) and `stakeholder-map.md`. Any unresolved field is labelled `Unknown (open question)` or `[assumption]`, never silently filled.
- The `aidlc-product-lead-agent` reviews the artifacts.

<a id="ref-1-2"></a>
**1.2 Market Research** — conditional. Runs when the initiative has external market positioning or build-vs-buy considerations. Skipped for internal tools, bug fixes and refactors.

- Produces `competitive-analysis.md`, `market-trends.md` and `build-vs-buy.md` from confirmed answers only.

<a id="ref-1-3"></a>
**1.3 Feasibility & Constraints** — conditional. Runs when there are integration constraints, regulatory requirements or significant technical uncertainty; skipped for trivial changes with no technical risk.

- The architect leads with the AWS platform and compliance agents as support.
- Produces `feasibility-assessment.md`, `constraint-register.md` and `raid-log.md`.

<a id="ref-1-4"></a>
**1.4 Scope Definition** — always, inline, product lead with delivery support.

- Defines the scope boundary and the prioritized backlog as `scope.md` and `intent-backlog.md`.
- Validates scope against the timeline and runs contradiction analysis on the answers.

<a id="ref-1-5"></a>
**1.5 Team Formation** — conditional. Runs when team composition, capacity or mob planning is relevant; skipped for solo or small-team projects.

- Produces `team-assessment.md`, `skill-matrix.md` and `mob-composition.md`, with a gap analysis between required and available skills.

<a id="ref-1-6"></a>
**1.6 Rough Mockups** — conditional. Runs when user-facing UI is part of the initiative; for API/backend work the design agent produces system interaction diagrams instead. Skipped for non-UI, API-only or infrastructure-only initiatives.

- Produces `wireframes.md` and `user-flow.md`, and runs contradiction analysis between UX expectations and scope constraints.

<a id="ref-1-7"></a>
**1.7 Approval & Handoff** — always, inline, delivery lead with product support. The Ideation approval gate.

- Compiles every Ideation artifact into the initiative brief and writes `decision-log.md`, a record of all decisions made during the phase.
- Presents the brief for approval; approving it hands off to Inception.

###### Phase 2 — Inception

<a id="ref-2-1"></a>
**2.1 Reverse Engineering** — conditional, brownfield only.

- Runs as a two-link pipeline: the developer scans the codebase and returns structured results, then the architect synthesizes the 9 artifacts (`business-overview.md`, `architecture.md`, `code-structure.md`, `api-documentation.md`, `component-inventory.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `reverse-engineering-timestamp.md`).
- Writes to the space-level store `aidlc/spaces/<space>/codekb/<repo>/`, shared across intents, not into the intent record.
- A freshness guard checks the existing store first: the human chooses reuse, full rescan or focused merge per repository.
- Multi-repo intents run one complete chain per registered repository.

<a id="ref-2-2"></a>
**2.2 Practices Discovery** — conditional, runs as a hub-and-spoke ensemble with the pipeline-deploy agent leading and quality, developer and devsecops inspecting the draft independently.

- Brownfield discovers practices from evidence plus reverse-engineering artifacts; greenfield elicits them via structured questions using `org.md` defaults.
- Affirmed practices are promoted into the space's method at `memory/`; the rest stay out.

<a id="ref-2-3"></a>
**2.3 Requirements Analysis** — always, inline, product lead.

- Elaborates `requirements.md` to a depth that scales with project complexity.

<a id="ref-2-4"></a>
**2.4 User Stories** — conditional, runs as a mob with the product agent leading and design, developer and quality contributing in parallel.

- Runs when user-facing features, multiple personas, complex business logic or cross-team work is involved; skipped for pure refactoring, isolated bug fixes, infrastructure-only changes and developer tooling.
- Produces `stories.md` and `personas.md`.

<a id="ref-2-5"></a>
**2.5 Refined Mockups** — conditional, inline, design lead with product support.

- Runs when user-facing UI exists and rough mockups were produced in Ideation. Classic scope skips rough mockups by design, so when the wireframe inputs are absent the stage designs from the user stories and requirements directly.
- Produces hi-fi mockups, `interaction-spec.md`, `design-system-mapping.md` and `accessibility-checklist.md`.

<a id="ref-2-6"></a>
**2.6 Domain Design** — conditional, inline, architect lead.

- Runs when new components or logical building blocks are needed; skipped when changes only modify existing components.
- Produces `components.md` and `decisions.md` (ADR-style records). It does not decide deployment topology — monolith, microservices or serverless is Units Generation's call.

<a id="ref-2-7"></a>
**2.7 Units Generation** — always, inline, architect lead with delivery support.

- Produces `unit-of-work.md`, the dependency DAG and the story map that Delivery Planning consumes for sequencing.
- When the skeleton check is enabled, the first unit in DAG order is shaped as the smallest working integrated slice so it can be approved against a real command before later units start.
- In the compiled scope grid, 2.7 and 2.9 travel together — both execute or both skip per scope.

<a id="ref-2-8"></a>
**2.8 Contract Design** — conditional, inline, architect lead with AWS platform support.

- Runs when the system has a formal contract to pin down: an inter-unit boundary where more than one unit must integrate, or a unit that exposes an API consumed outside the system. Skipped only for a single self-contained unit.
- Runs once per workflow, not per unit: it maps the whole set of boundaries at once using the dependency DAG from Units Generation.
- Produces `contract-summary.md`.

<a id="ref-2-9"></a>
**2.9 Delivery Planning** — always, inline, delivery lead with architect support. The capstone Inception stage.

- Produces `bolt-plan.md`, team allocation, sequencing rationale and an external dependency map, using the affirmed practices from Practices Discovery.

###### Phase 3 — Construction

<a id="ref-3-1"></a>
**3.1 Functional Design** — conditional, runs once per unit in DAG order, architect lead with developer support.

- Runs when new data models, complex business logic or business rules need design; skipped for simple logic changes with no new business logic.
- Produces `entities.md`, `rules.md` and `functional-spec.md` at design level — not implementation-ready code.

<a id="ref-3-2"></a>
**3.2 NFR Requirements** — conditional, runs once per unit, architect lead with devsecops, compliance and quality support.

- Runs when performance, security, scalability, reliability or observability requirements are needed, or a tech-stack selection is needed; skipped when none remain and the stack is determined.
- Collects the requirement categories through structured questions and returns control to the orchestrator.

<a id="ref-3-3"></a>
**3.3 NFR Design** — conditional, runs once per unit, architect lead.

- Designs the patterns behind the NFR categories (`performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `observability-design.md`, `logical-components.md`).
- Skipped when NFR Requirements was skipped.

<a id="ref-3-4"></a>
**3.4 Infrastructure Design** — conditional, runs once per unit, AWS platform lead with devsecops and compliance support.

- Runs when infrastructure services need mapping or cloud resources are needed; skipped when there are no infrastructure changes and infrastructure is already defined.
- Produces `infrastructure-specification.md`, `monitoring-design.md` and `cicd-pipeline.md` as design, not completed IaC.

<a id="ref-3-5"></a>
**3.5 Code Generation** — always, runs once per unit, developer lead, dispatched as a subagent.

- Produces `code-generation-plan.md`, `unit-test-instructions.md` and `code-summary.md`.
- Contract coverage floors from design are inputs, not suggestions: the stage never lowers or disables a defined target.

<a id="ref-3-6"></a>
**3.6 Build and Test** — always, runs once after every per-unit stage finishes, quality lead with devsecops support.

- Produces build instructions, integration, performance and security test instructions, `build-test-results.md` and cross-unit traceability.

<a id="ref-3-7"></a>
**3.7 CI Pipeline** — conditional, runs once at the end, pipeline-deploy lead.

- Runs when the CI pipeline needs creation or significant modification; skipped if CI already exists and is adequate.
- Produces `ci-config.md` and `quality-gates.md`. Incremental scopes like `infra` skip code generation and build-and-test, so the pipeline stages are based on the workspace's existing build and test setup.

###### Phase 4 — Operation

<a id="ref-4-1"></a>
**4.1 Deployment Pipeline** — conditional, pipeline-deploy lead.

- Runs when the CD pipeline needs creation or significant modification. Produces `cd-config.md`, `deployment-strategy.md` and `rollback-runbook.md`.

<a id="ref-4-2"></a>
**4.2 Environment Provisioning** — conditional, AWS platform lead with devsecops and compliance support.

- Provisions or validates target AWS environments using the Infrastructure Design outputs. Produces `environment-inventory.md` and `validation-report.md`.

<a id="ref-4-3"></a>
**4.3 Deployment Execution** — conditional, pipeline-deploy lead with developer support.

- Runs after the pipeline and environment are ready. Produces `deployment-log.md`, `smoke-test-results.md` and `health-check-report.md`.

<a id="ref-4-4"></a>
**4.4 Observability Setup** — conditional, operations lead.

- Configures dashboards, alarms, SLO configuration, log queries, tracing and anomaly configuration. When express scope skipped NFR design and infrastructure design, the minimum observable surface is derived from the approved artifacts.

<a id="ref-4-5"></a>
**4.5 Incident Response** — conditional, operations lead.

- Produces an SSM Automation runbook library, an incident response plan integrated with AWS Incident Manager and an escalation matrix.

<a id="ref-4-6"></a>
**4.6 Performance Validation** — conditional, quality lead.

- Designs a load test plan, executes performance tests against production-like environments and validates NFR performance targets using CloudWatch and X-Ray evidence. Produces the `nfr-validation-matrix.md`.

<a id="ref-4-7"></a>
**4.7 Feedback & Optimization** — conditional, operations lead with AWS platform support.

- Runs when ongoing monitoring and optimization are needed. Produces an SLO report, an AWS Cost Explorer cost analysis, an AWS Config drift report and the feedback-loop document that opens the next Ideation intent.

### Methodology plus a deterministic engine

The framework is presented as two connected halves.

The **methodology** is the declarative layer: stage definitions, agent personas, workflow scopes, rules, sensors and knowledge references. In project terms, this is the part that is meant to be readable, reviewable and versioned.

The **engine** is the runtime layer that decides the next transition based on state and the current stage graph. The project describes it as emitting a validated directive rather than leaving route selection to model prose alone.

The **conductor** is the thin orchestration layer that interprets that directive, keeps the stage diary and surfaces approval points to a human. The separation is meant to keep routing, state and enforcement outside the agent's improvisational behavior.

### One core, many harnesses

The same core runs natively in Claude Code, Kiro CLI, Kiro IDE, Codex CLI, Cursor, opencode and GitHub Copilot. One installation serves all of them; `aidlc config --harness <name>` writes the configuration for the one you use.

That split exists because harnesses genuinely disagree about how agents, hooks and rules are declared. Each one gets its own native shell — `.claude/`, `.kiro/`, `.github/`, `.opencode/` and so on — carrying subagents, the `/aidlc` command and hook wiring in that harness's own idiom, while the engine tree ships unchanged at `.aidlc/` and the method is read through whatever mechanism the harness provides, whether that is an `@`-import line in `AGENTS.md` or an `instructions` glob. You invoke it as `/aidlc`, except on Codex CLI where it is `$aidlc`.

### Execution is hybrid, and it is instrumented

Not every stage deserves a subagent. Stages that need a human — a clarifying question, an approval gate — run inline, in conversation, where a person can answer. Stages that produce a well-defined artifact run as autonomous subagents and return structured summaries. The framework decides which, per stage, and the distinction is why a gate still feels like a gate.

Everything around that is instrumented rather than trusted: hooks emit audit events and validate state before compaction, fences refuse out-of-order transitions outright, and the append-only trail records 107 event types. Corrections feed back the other way too — when a human overrules the agent, that correction can be promoted into a persistent rule in the team's own method, scoped at org, team, project, phase or stage level, so the framework gets stricter rather than merely longer.

What emerges is not autonomy or a chat window. It is a delivery process whose route, rules, checks and refusals are all things you can read, diff and hold someone to.

## Lifecycle: 5 Phases and 33 Stages

The lifecycle is the framework's spine. Five phases run in order, holding 33 stages between them, and every stage has one job, one lead agent and a declared set of artifacts on disk. Three phase boundaries are protected by verification gates, one auto-proceeds, and the last closes a feedback loop. Nothing in the sequence is decided at conversation time — the route was compiled before you asked for anything.

```mermaid
graph LR
    Z["Initialization<br/>3 stages"] -->|"auto-proceeds"| I["Ideation<br/>7 stages"]
    I --> VG1{{"Verification Gate 1"}}
    VG1 --> N["Inception<br/>9 stages"]
    N --> VG2{{"Verification Gate 2"}}
    VG2 --> C["Construction<br/>7 stages"]
    C --> VG3{{"Verification Gate 3"}}
    VG3 --> O["Operation<br/>7 stages"]
    O -.->|"feedback loop"| I

    style Z fill:#f3e5f5,stroke:#9c27b0,color:#000
    style I fill:#e8f5e9,stroke:#4caf50,color:#000
    style N fill:#e3f2fd,stroke:#2196f3,color:#000
    style C fill:#fff3e0,stroke:#ff9800,color:#000
    style O fill:#fce4ec,stroke:#e91e63,color:#000
    style VG1 fill:#ef9a9a,stroke:#c62828,color:#000
    style VG2 fill:#ef9a9a,stroke:#c62828,color:#000
    style VG3 fill:#ef9a9a,stroke:#c62828,color:#000
```

### Phase 0 — Initialization

Purpose: bootstrap the workspace. Scaffold the record directory, scan the codebase and initialise state. All three stages run automatically inside a single deterministic tool call — no subagent, no prompt, no approval gate.

| #   | Stage                | Lead         | Key artifacts                         |
| --- | -------------------- | ------------ | ------------------------------------- |
| 0.1 | Workspace Scaffold   | orchestrator | The first intent's record directory   |
| 0.2 | Workspace Detection  | orchestrator | Detected languages, frameworks, build |
| 0.3 | State Initialization | orchestrator | `aidlc-state.md`, `audit/` shards     |

Stage 0.3 is also where the brownfield-or-greenfield verdict is recorded, and that single fact determines whether the next phase opens with reverse engineering.

### Phase 1 — Ideation

Purpose: decide whether this is worth doing and what it is. Stages 1.1, 1.4 and 1.7 always run; the rest are conditional on scope, so a bug fix skips market research while a greenfield feature does not.

| #   | Stage                     | Lead      | Key artifacts                               |
| --- | ------------------------- | --------- | ------------------------------------------- |
| 1.1 | Intent Capture & Framing  | product   | Intent statement, stakeholder map           |
| 1.2 | Market Research           | product   | Competitive analysis, build-vs-buy          |
| 1.3 | Feasibility & Constraints | architect | Feasibility assessment, constraint register |
| 1.4 | Scope Definition          | product   | Scope definition, intent backlog            |
| 1.5 | Team Formation            | delivery  | Team assessment, mob composition plan       |
| 1.6 | Rough Mockups             | design    | Wireframes, user flows, concept deck        |
| 1.7 | Approval & Handoff        | delivery  | Initiative brief, decision log              |

### Phase 2 — Inception

Purpose: elaborate that decision into something buildable. This is the longest phase and the one where existing code gets read properly, which is why it carries the most interesting execution topologies.

| #   | Stage                 | Lead            | Key artifacts                                                         |
| --- | --------------------- | --------------- | --------------------------------------------------------------------- |
| 2.1 | Reverse Engineering   | developer       | 9 artefacts: architecture, component inventory, data flow, risks      |
| 2.2 | Practices Discovery   | pipeline-deploy | `team-practices.md`, promoted to the space's `memory/` on affirmation |
| 2.3 | Requirements Analysis | product         | `requirements.md`                                                     |
| 2.4 | User Stories          | product         | `stories.md`, `personas.md`                                           |
| 2.5 | Refined Mockups       | design          | Hi-fi mockups, interaction spec                                       |
| 2.6 | Domain Design         | architect       | `components.md`, `decisions.md` (ADRs)                                |
| 2.7 | Units Generation      | architect       | `unit-of-work.md`, the dependency DAG, story map                      |
| 2.8 | Contract Design       | architect       | `contract-summary.md`                                                 |
| 2.9 | Delivery Planning     | delivery        | `bolt-plan.md`, team allocation, sequencing rationale                 |

Three stages here do not run like ordinary stages, and the difference is the point. Reverse Engineering is a **two-link pipeline** — a developer scans the code, an architect synthesises and writes — and multi-repo work needs one complete chain per repository before it can be approved. Practices Discovery is a **hub-and-spoke**: the lead drafts, quality, developer and devsecops inspect the draft independently without seeing each other's comments, a human closes the gaps, and only affirmed practices are promoted into the space's method. User Stories run as a **mob**, with design, developer and quality contributing in parallel.

### Phase 3 — Construction

Purpose: build, in reviewable slices. Stages 3.1 to 3.5 run once per unit of work in dependency order; 3.6 and 3.7 run a single time after every unit has converged.

| #   | Stage                 | Lead            | Key artifacts                                   |
| --- | --------------------- | --------------- | ----------------------------------------------- |
| 3.1 | Functional Design     | architect       | `entities.md`, `rules.md`, `functional-spec.md` |
| 3.2 | NFR Requirements      | architect       | Performance, security, scalability NFRs         |
| 3.3 | NFR Design            | architect       | NFR design specifications                       |
| 3.4 | Infrastructure Design | aws-platform    | Infrastructure specs, IaC designs               |
| 3.5 | Code Generation       | developer       | Application code and its documentation          |
| 3.6 | Build and Test        | quality         | Test results, quality report                    |
| 3.7 | CI Pipeline           | pipeline-deploy | CI configuration, quality gates                 |

The ordering is unit-major and serial by default: each unit finishes its design stages and code generation before the next begins, following the DAG from 2.7. The first unit in that DAG is a deliberately small working slice, and you approve it against a real end-to-end command before later units start — a design review passing is not a skeleton running. Parallel execution is available as dependency-ready batches, but the skeleton checkpoint still comes first.

### Phase 4 — Operation

Purpose: ship it and keep it. Every stage here is conditional, because a library, an internal tool and a customer-facing service have very different operational needs.

| #   | Stage                    | Lead            | Key artifacts                                    |
| --- | ------------------------ | --------------- | ------------------------------------------------ |
| 4.1 | Deployment Pipeline      | pipeline-deploy | CD config, deployment strategy, rollback runbook |
| 4.2 | Environment Provisioning | aws-platform    | Environment inventory, validation report         |
| 4.3 | Deployment Execution     | pipeline-deploy | Deployment log, smoke tests, health checks       |
| 4.4 | Observability Setup      | operations      | Dashboards, alarms, SLO configuration            |
| 4.5 | Incident Response        | operations      | SSM runbooks, incident plan, escalation matrix   |
| 4.6 | Performance Validation   | quality         | Load test results, NFR validation matrix         |
| 4.7 | Feedback & Optimization  | operations      | SLO report, cost analysis, feedback loop doc     |

Stage 4.7 is where the loop closes. Its findings feed back into Ideation as a new intent, which is how a framework that treats delivery as a lifecycle stays one: the thing you learn operating the system becomes the next piece of work.

## Agents

AI-DLC ships 14 agents: **11 domain experts, 2 reviewers and 1 adaptive composer**. The domain experts are the product, design, delivery, architect, AWS platform, compliance, DevSecOps, developer, quality, pipeline-deploy and operations agents. Each stage names one lead agent, which you can see in the lifecycle tables above.

The two reviewers are review-only agents, so the agent that wrote an artifact is not the one judging it. That addresses the "review arrives late, from the wrong vantage" failure described earlier. The adaptive composer builds a custom execute-or-skip plan for work that no stock profile fits (the `/aidlc compose "<task>"` command).

Each agent is a persona with domain expertise, a tool profile and a model or operating context, defined in files you can read and change. The docs include a deep-dive page for every agent.

## Workflow Profiles

Not every task needs all 33 stages. AI-DLC ships **11 workflow profiles** (called scopes in the engine) that decide which stages run for a given intent. They cover features, bug fixes, infrastructure, security, proofs of concept, enterprise delivery and other common work. The stage counts below come from the compiled scope grid.

| Profile    | Stages that run |
| ---------- | --------------- |
| `poc`      | 8 of 33         |
| `bugfix`   | 9 of 33         |
| `classic`  | 18 of 33        |
| `mvp`      | 23 of 33        |
| `workshop` | 26 of 33        |
| `feature`  | 33 of 33        |
| `enterprise` | 33 of 33      |

Other profiles include `express` and `security-patch`. The Workflow Profiles guide in the docs describes the full set. You can name a profile (`/aidlc bugfix`) or let AI-DLC infer one from your description. It then prints the route and the number of approval gates and waits for your confirmation before anything runs.

## What Harness Engineering Actually Means

A **harness** is the interface layer that runs the same workflow on different agent environments, such as Claude Code, Kiro CLI, Kiro IDE, Codex CLI, Cursor, opencode and GitHub Copilot. The project describes the workflow itself as consistent across those environments, while the shell and configuration details differ.

**Harness engineering** is the work of shaping how the workflow behaves for a team: which stages exist, which artifacts they produce, who leads them, which rules apply and how verification is enforced. The project presents this as a configuration and process design task rather than a pure prompt-writing exercise.

A useful mental model is that **stages define what work happens and agents define who performs it**. A stage is a unit of work with inputs, outputs and a lead. An agent is a persona with domain expertise, a tool profile and a model or operating context. The workflow can then be adjusted by changing scopes and rules without redefining the entire job in natural language each time.

Everything you shape hangs off five things:

- **Stages** — the units of work and the nodes in the workflow graph.
- **Agents** — the personas assigned to those stages.
- **Scopes** — which stages run for a given type of work.
- **Rules** — decisions that persist across workflows.
- **Sensors** — checks bound to stages or gates that can be advisory or blocking.

Two additional levers sit alongside these. **Knowledge** is the background context the agents load before work. **Depth** affects how much detail a stage produces, not which stages are selected.

This is where workflow design becomes more than prompt engineering. A prompt is a request. A stage file, a rule set or a gate is a durable process input. That distinction matters when the work must be resumed, audited or operated under explicit controls.

## Harness Support

AI-DLC runs natively in seven harnesses. Minimum versions below are from the repository README.

| Harness                        | Configure                         | Invoke   | Minimum version                 |
| ------------------------------ | --------------------------------- | -------- | ------------------------------- |
| Claude Code                    | `aidlc config --harness claude`   | `/aidlc` | —                               |
| Kiro CLI                       | `aidlc config --harness kiro`     | `/aidlc` | Kiro CLI 2.6 or later           |
| Kiro IDE                       | `aidlc config --harness kiro-ide` | `/aidlc` | Kiro IDE 1.x / Kiro CLI v3      |
| Codex CLI                      | `aidlc config --harness codex`    | `$aidlc` | 0.145.0 or later                |
| Cursor (IDE and CLI)           | `aidlc config --harness cursor`   | `/aidlc` | —                               |
| opencode                       | `aidlc config --harness opencode` | `/aidlc` | 1.17 or later                   |
| GitHub Copilot (CLI + VS Code) | `aidlc config --harness copilot`  | `/aidlc` | CLI 1.0.74 / VS Code 1.130      |

## Repository Layout

The repository separates hand-authored source from generated output:

- `core/` — the hand-authored, harness-neutral methodology and engine (including `core/tools/`, the engine and authoring tools)
- `harness/<name>/` — thin, harness-specific manifests and integrations
- `plugins/<name>/` — optional AI-DLC plugins (the repo ships an example, `test-pro`)
- `scripts/` — packaging, binary, installer and release tooling
- `tests/` — smoke, unit, integration and end-to-end tests
- `docs/` — user, harness-engineering and developer documentation
- `dist/` and `dist-release/` — generated, ignored local outputs

The rule is simple: edit `core/` or `harness/<name>/`, never the generated `dist*` output.

## Getting Started

Installation is one command, and it deliberately does not ask you to install a language runtime first. On macOS, Linux or WSL:

```bash
curl -fsSL https://github.com/awslabs/aidlc-workflows/releases/latest/download/install.sh | sh
```

On Windows PowerShell, `irm https://github.com/awslabs/aidlc-workflows/releases/latest/download/install.ps1 | iex` does the same and registers the binary directory in your user `PATH`. The installer drops a checksum-verified `aidlc` command plus a version-matched runtime for every supported harness. Bun and Node.js are not required. If you cannot install a native executable, the fallback is to install Bun, download the `aidlc-copy-runtime-X.Y.Z.tar.gz` release asset and copy its `runtime/<harness>/` directory into your project by hand — that path needs no native binary at all.

Then configure the project, from its root:

```bash
aidlc config --harness claude    # or kiro, kiro-ide, codex, cursor, opencode, copilot
aidlc doctor                     # health check
```

`aidlc config` writes that harness's native shell into the project and records the engine tree at `.aidlc/`. Model provider setup stays where it belongs — with your harness — because shipped configuration preserves the provider and model you already chose. The README currently recommends Claude Opus 4.8 as the model, though the methodology itself is provider-independent.

Finally, open the harness in that project and describe the work:

```text
/aidlc Build a REST API for inventory management
```

On Codex CLI the same command is `$aidlc`. In Kiro IDE you pick **aidlc** in the chat panel's agent picker first. From that prompt AI-DLC selects a workflow profile from your description, asks for any decision it cannot infer, and stops at approval gates before moving on. Bare `/aidlc` with no description resumes the active workflow instead of starting a new one.

## Commands

Everything after that happens through `/aidlc` in your harness, so the command surface is grouped here by what you are trying to do rather than listed exhaustively. The complete reference is `docs/guide/12-cli-commands.md`.

### Starting and steering a run

| Goal                                  | Command                                           |
| ------------------------------------- | ------------------------------------------------- |
| Start with an explicit scope          | `/aidlc <scope>`                                  |
| Start and let the scope be inferred   | `/aidlc <description>`                            |
| Force a tailored execute-or-skip plan | `/aidlc compose "<task>"`                         |
| Resume the active workflow            | `/aidlc`                                          |
| Pause at a clean stage boundary       | `/aidlc park`                                     |
| Jump to a stage or a phase            | `/aidlc --stage <slug>` · `/aidlc --phase <name>` |
| Run one stage without advancing       | `/aidlc --stage <slug> --single`                  |

### Navigating workspaces

| Goal                                 | Command                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| List or switch intents               | `/aidlc intent [name]`                                    |
| Retire an intent without deleting it | `/aidlc intent archive <name>`                            |
| List or switch spaces                | `/aidlc space [name]`                                     |
| Create a space from the baseline     | `/aidlc space-create <name>`                              |
| Read-only status                     | `/aidlc --status`                                         |
| Team Construction board              | `/aidlc team-board`                                       |
| Claim, publish and land a unit       | `/aidlc unit claim` · `publish` · `pin` · `gate` · `land` |

### Documents and knowledge

| Goal                                        | Command                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Index your own documents and read them back | `/aidlc knowledge onboard` · `sync` · `list` · `show <id>` · `associate <id> --intent <slug>` |

### Tuning this run

| Goal                                               | Command                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Change scope, depth, test strategy or review class | `/aidlc --scope` · `--depth` · `--test-strategy` · `--review`          |
| Read or change a workflow setting                  | `/aidlc config get <key>` · `config set <key> <value>` · `config list` |
| Health check                                       | `/aidlc --doctor`                                                      |
| Shareable diagnostic report                        | `/aidlc --doctor --export`                                             |

### Outside the session

These are native binaries rather than slash commands, and they run in a terminal rather than in your harness.

| Goal                                    | Command                                            |
| --------------------------------------- | -------------------------------------------------- |
| Reproduce a declared multi-repo set     | `aidlc system workspace-sync [--force]`            |
| Drive Construction approvals and swarms | `aidlc engine bolt …` · `aidlc engine swarm …`     |
| Recover or purge set-aside worktrees    | `aidlc engine worktree restore` · `purge`          |
| Pin the engine version for a project    | commit `.aidlc-version`, then `aidlc config --pin` |

## Development

If you want to contribute or build from source, the toolchain is Bun-based. Install dependencies and generate every harness:

```bash
bun install --frozen-lockfile
bun scripts/package.ts
```

Useful commands:

```bash
bun scripts/package.ts <name>     # generate one harness
bun scripts/package.ts --check    # determinism guard
bun tests/run-tests.ts --ci       # smoke, unit, and integration
bun tests/run-tests.ts --release  # full release acceptance
```

Remember to edit `core/` or `harness/<name>/`, never generated `dist*` output. See the Contributing Guide in the docs for the full workflow.

## Takeaways

- Chat history is a weak system of record. AI-DLC moves the process into persisted state, artifacts and an audit trail so work survives compaction and handoffs.
- The route is compiled data, not improvisation: 5 phases, 33 stages, and profiles that choose which ones run. You see the route and the number of approval gates before anything starts.
- Human approval gates and a 107-event audit trail make decisions attributable and reviewable.
- Corrections can be promoted into persistent rules, so the framework gets stricter over time.
- One harness-neutral core runs in seven harnesses, so you are not locked into a single tool.
- The honest claim is workflow continuity, not conversational continuity. You can always resume and re-read every artifact, but the nuance of a discussion that never reached a file is gone.
- Generative AI can make mistakes, so review generated output and costs before acting on them.

## References

- [AI-DLC Workflows repository](https://github.com/awslabs/aidlc-workflows)
- [AI-DLC Workflows documentation](https://awslabs.github.io/aidlc-workflows/)
- [AWS AI-DLC blog post](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)
- [AI-DLC Method Definition Paper](https://prod.d13rzhkk8cj2z0.amplifyapp.com/)