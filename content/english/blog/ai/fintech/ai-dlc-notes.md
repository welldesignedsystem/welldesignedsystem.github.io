+++
date = '2021-09-01T09:10:00+10:00'
draft = false
title = 'AI-DLC Notes: Trends and the Autonomy Spectrum'
tags = ['AI-DLC','Agentic AI','Fintech','Process']
summary = "Where AI-DLC and the spectrum of AI development autonomy are heading."
+++

A sneakpeak into how AI will be an enabler for every roles helping people focus on judgement, decision and problem solving.

In order to understand that we have to able to see the trend of the industry and where things are headed atleast in the near future.

### Introduction

1. Credentials to predict future of roles few pattern of roles 
2. Videos and blogs 
3. Trend among Managers who understand AI well.

### Good News and Bad News 

Today's roles — Product Owner, Scrum Master, Developer, QA and SRE — are all **built around a traditional SDLC designed** for human-driven, long-running processes. Waterfall, Agile and Scrum assume iteration are expensive: 
- lot of handoffs between roles
- documents thrown at each other to transfer context
- approval gates and cadence rituals like standups, sprints and story points. 

Retrofitting AI as an assistant only constrains it and reinforces the old inefficiencies. So the roles designed for that cadence, and the SDLC they serve, may not scale. 

- People worried if AI will take their jobs. 
- Chatgpt has made AI more intuitive and accessible to those who can use it.

**Why SDLC may not scale with AI**

- **Cadence collapse.** Sprints and story points assume human-speed iteration; AI iterates in minutes or hours, rendering the rituals obsolete ("Reimagine Rather Than Retrofit", Bushido).
- **Phase economics invert.** Sequential phases existed because rework was expensive; with AI, try-fail-adjust is nearly free, so approval gates become friction, not quality control ("Embrace the Collapsing SDLC", Bushido).
- **Retrofitting constrains the AI.** Assistant-style adoption limits what AI can do and preserves outdated inefficiencies (AWS blog).
- **Ad-hoc use does not scale.** No backpressure, no completion criteria, no operating-mode selection and context lost between sessions ("Why AI-DLC Over Ad-Hoc AI Assistance", Bushido).
- **Handoff overhead dominates.** Each role-to-role handoff loses context; with AI the artifact is the design, so boundaries that existed to manage handoffs become redundant ("Everyone Becomes a Builder", Bushido).

### The AI-DLC Workflow

The workflow combines the three phases, the adaptive workflow stages, the operating modes and the quality-gate loop. Dashed edges are conditional stages; solid edges are mandatory. **Green nodes** are mandatory stages (always run); **yellow nodes** are conditional stages (run only when complexity warrants).

**Hat responsibilities**

Think of these as the roles the AI or team plays at different moments in the workflow. They are not strict job titles; they are responsibilities that help keep planning, design, delivery, review and security separate.

- **[Planner]**
  - Defines the goal and clarifies what is still unknown
  - Breaks the work into smaller Units and turns the goal into clear completion criteria
  - Chooses priorities, dependencies, operating mode and the next step to take
  - Tracks assumptions, open questions, risks and blockers
  - Updates the plan when new evidence or review feedback changes the direction
  - Source: Bushido Collective, "The Hat System — [Planner]", AI-DLC. https://ai-dlc.dev/docs/hats#planner

- **[Designer]**
  - Turns the requirement into a workable design for the system, data, interfaces or user experience
  - Defines the structure, boundaries and flow of the solution
  - Compares options and makes trade-offs explicit
  - Specifies important quality constraints such as usability, accessibility and reliability when needed
  - Produces a design the Builder can implement and the Reviewer can check
  - Source: Bushido Collective, "The Hat System — [Designer]", AI-DLC. https://ai-dlc.dev/docs/hats#designer

- **[Builder]**
  - Implements the agreed plan in small steps
  - Writes or updates code, tests, infrastructure and supporting artifacts
  - Uses tests, linting, type checks and security checks as feedback while building
  - Documents progress, decisions and blockers as work moves forward
  - Keeps iterating until the criteria are met or a human decision is needed
  - Source: Bushido Collective, "The Hat System — [Builder]", AI-DLC. https://ai-dlc.dev/docs/hats#builder

- **[Reviewer]**
  - Checks whether the result actually meets the stated completion criteria
  - Reviews correctness, maintainability, security, edge cases and operational readiness
  - Verifies the relevant tests, quality gates and evidence before approving work
  - Identifies defects with clear, actionable feedback
  - Approves the work or requests changes with a reasoned explanation
  - Source: Bushido Collective, "The Hat System — [Reviewer]", AI-DLC. https://ai-dlc.dev/docs/hats#reviewer

- **[Red / Blue]**
  - **Red Team:** tries to break the design or implementation and looks for security flaws, bypasses and unsafe assumptions
  - **Blue Team:** fixes the confirmed problems and adds defensive controls and regression tests
  - Covers issues such as injection, auth bypass, privilege escalation, data exposure and insecure configuration
  - Keeps attack testing separate from remediation so the review stays objective
  - Re-tests the hardened result and records unresolved risks for human review
  - Source: Bushido Collective, "The Hat System — [Red Team] / [Blue Team]", AI-DLC. https://ai-dlc.dev/docs/hats#red-team

- **[Integrator]**
  - Checks that completed Units work correctly together across the full intent
  - Verifies APIs, contracts, data flow and cross-unit behaviour
  - Runs the final verification across the combined result
  - Confirms the work satisfies the end-to-end criteria for the whole task
  - Accepts the integrated result or sends the relevant Units back for rework
  - Source: Bushido Collective, "The Hat System — [Integrator]", AI-DLC. https://ai-dlc.dev/docs/hats#integrator

```mermaid
flowchart TD
    A["Business Intent <sub>[Planner]</sub>"] --> B{Workspace Detection}

    subgraph INC[Inception Phase — Mob Elaboration]
        B -->|Greenfield| D["Requirements Analysis <sub>[Planner]</sub>"]
        B -->|Brownfield| E["Reverse Engineering <sub>[Planner]</sub>"]
        D --> F["Workflow Planning <sub>[Planner]</sub>"]
        E --> F
        F -.-> G1["User Stories <sub>[Planner]</sub>"]
        F -.-> G2["Application Design <sub>[Designer]</sub>"]
        F -.-> G3["Units of Work Planning <sub>[Planner]</sub>"]
        F -.-> G4["Adversarial Spec Review <sub>[Red / Blue]</sub>"]
        G1 -.-> H["Units and Completion Criteria <sub>[Planner, Reviewer]</sub>"]
        G2 -.-> H
        G3 -.-> H
        G4 -.-> H
    end

    subgraph CON[Construction / Execution Phase]
        H --> I{Operating Mode}
        I -->|HITL| J1["Supervised Bolt <sub>[Builder]</sub>"]
        I -->|OHOTL| J2["Observed Bolt <sub>[Builder]</sub>"]
        I -->|AHOTL| J3["Autonomous Bolt <sub>[Builder]</sub>"]
        J1 --> K["Per-Unit Design <sub>[Designer]</sub>"]
        J2 --> K
        J3 --> K
        K --> M["Code Generation Planning <sub>[Planner, Builder]</sub>"]
        M --> N["Code Generation <sub>[Builder]</sub>"]
        N --> O["Build and Test<br><sub>unit · integration · performance · security · contract · e2e</sub><br><sub>[Builder, Reviewer]</sub>"]
        O --> P{"Quality Gates <sub>[Reviewer, Red / Blue, Integrator]</sub>"}
        P -->|Fail| Q["Backpressure: Feedback and Pass-Back <sub>[Planner, Reviewer]</sub>"]
        Q --> K
        P -->|Pass| R["Review and Integration <sub>[Reviewer, Integrator, Red / Blue]</sub>"]
    end

    subgraph OPS[Operations Phase]
        R --> S1["Deployment Automation <sub>[Red / Blue]</sub>"]
        S1 --> S2["Infrastructure as Code <sub>[Red / Blue]</sub>"]
        S2 --> S3["Monitoring and Observability <sub>[Reviewer]</sub>"]
        S3 --> S4["Production Readiness Validation <sub>[Reviewer, Red / Blue]</sub>"]
        S4 --> T["Persistent Context and Knowledge <sub>[Planner, Designer, Builder, Reviewer]</sub>"]
    end

    T --> B

    classDef green fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef yellow fill:#fff8e1,stroke:#ffc107,stroke-width:2px

    class A,B,D,E,F,M,N,O,P,R,S1,S2,S3,S4,T green
    class G1,G2,G3,G4,K yellow
```

#### Stage-by-stage breakdown

##### Business Intent
  - can be any - **business problem, high-level goal, feature or technical outcome**
  - Key difference from a traditional Epic: an Epic describes _what_ to build (a solution the team already understands); by the time you discuss Epic you have full scope, stories, acceptance criteria and dependencies. **Epic focuses on decomposition**
  - an Intent only describes the _why_ part - outcome you are going get AI to clarify and build. You purposfully make the Intent  ambiguous — it is deliberately vague so the **AI discovers scope through questions** rather than executing a pre-baked plan. **Intent focuses on discovery**
  - There is no one replacement for Epic. AI-DLC distributes that across the repository: 
    - **Intent holds purpose**, **Unit decomposition holds scope**, **the Unit DAG holds dependencies**, **Knowledge Artifacts hold domain context**
  - Example: 
    - Provide accurate, real-time balance visibility and control for telecom customers.
    - I want to migrate a legacy system Flexy into microservice.
    - Reduce API latency by 50% for this endpoint.
    - Costing looks wrong in the current system. Help fix it without breaking the existing calculation.
  - References
    - [Matt Pocock's Grill me skill](https://www.aihero.dev/skills-grill-me)
    - [Matt Pocoks whole Playlist](https://www.youtube.com/watch?v=gaDdrDdczO4&list=PLH-fZ_5p3Lrc&index=1)
    - [Einstellung effect](https://en.wikipedia.org/wiki/Einstellung_effect) the AI's training corpus is its mental set 
      - **AI question bias risk**: . If the AI's questions frame the solution space toward familiar patterns, the answers will be too. For greenfield projects this risk is highest — no existing codebase, no Knowledge Artifacts, nothing domain-specific to ground the AI's questions
  - The defence: context engineering (loading domain-specific knowledge into the window) and human oversight (the team validates or corrects)
    - [Socratic Questioning or Guided Discovery](https://en.wikipedia.org/wiki/Socratic_questioning)

##### Workspace Detection
  - The workflow branches on whether the project is greenfield or brownfield — (talking to aws folks part...).
  - **Templates**: Empty scaffolds the knowledge layer exists but enforces thought pattern/direction across Fintech.
  - **Knowledge bootstrap**: the AI reads the codebase and produces structured knowledge (architecture, module boundaries, data flow, conventions) with confidence ratings

  - **Greenfield**
    - A greenfield project is a project that starts from scratch with no existing product, codebase, infrastructure, or legacy system to preserve.
    - Opportunity to start Top Down approach from Day 1. **Understand** else **Counter productive.**
    - **The "greenfield gap"**: before Mob Elaboration there is nothing between the Intent and the Units — the decomposition only exists after the AI asks questions and the team validates
  - **Brownfield** 
    - We have teams with 
      - Full Documentation
      - No Documentation 
      - Outdated/incorrect documentation 💀
    - Skills to convert code into a well defined template driven document using concepts like Abstract Syntax Tree, Queryable Knowledge Graph.
 - References
   - [Greenfield Gap](https://ai-dlc.dev/paper#lifecycle-entry-points)

##### Workflow Planning
  - The AI decides which stages apply based on complexity — this is what makes the workflow _adaptive_ rather than linear
  - A one-line bug fix skips planning and goes straight to code generation; a complex feature runs the full chain (User Stories → Application Design → Units of Work Planning → Adversarial Spec Review)
  - Encodes the mandatory-versus-conditional split: the AI assesses the request's shape and selects which stages to execute
  - **Three properties that make this work** (per AWS): adaptive decisioning (conforms to the problem's shape), transparent checkpoints (human approvals at every gate), end-to-end traceability (every artifact and decision is logged)

##### User Stories (conditional)
  - Skipped for well-understood tasks (e.g. "context engg compliant", "simple task like adding an end point") where the intent is self-explanatory for other cases where features are complex complex or the scope needs to be broken down into testable, reviewable chunks
  - The AI proposes stories; the team validates or corrects — the conversation _is_ the artifact

##### Application Design (conditional)
  - Architecture, domain model and interface decisions — only when the work touches specilised or complex architecture e.g. 
    - Specialised Application Design Decisions like a combination of decomposition strategy based e.g. after you have functionally decomposed a system you want to partition a specific function.
    - The test suite, not the architecture document, becomes the source of truth
 
 ##### Adversarial Spec Review (conditional)
  - this stage pushes the team to defend the design before build work starts. 
  - interrogates the proposed plan
  - hidden assumptions and weak spots 
  - we introduced this - it's basically challenging the specs before anything is built — **cost of fixing a bug quickly increases as it goes further in any lifecycle**.
  - **Fresh eyes principle**: a different model or clean session reviews the output, not the same model that generated it. 
    - Claude Code can spawn subagents; 
    - Cursor/Copilot/VS Code can open a new chat or use a different model. 
    - CI/CD integration is the most portable approach

##### Units of Work Planning (conditional)
  - Decomposes the intent into Units, each with a chosen operating mode (HITL, OHOTL, AHOTL) and completion criteria
  - **A Unit is the unit of autonomy, not just the unit of scope** — it determines how much human oversight the work requires.
  - **Epic v/s Unit**
    - In traditional agile, an Epic is big (spans multiple features, teams, repos and sprints). 
    - A Unit is feature-scoped: a focused piece of work within a single Intent
  - The scope shrinks because AI handles the decomposition that traditionally required human planning — backlog grooming, Epic writing, story splitting
  - The AI-managed part of AI-DLC _is_ this decomposition work, which is why Unit replaces Epic at a smaller granularity

##### Units and Completion Criteria
  - The validated output of Inception: precise, verifiable conditions per Unit that gate autonomy
  - **"Precision enables autonomy"**: "Make auth better" v/s "users can reset passwords, reset tokens expire after 15 minutes, all auth endpoints have tests and the security scan has no critical findings" gives the agent a target it can iterate toward
  - **Agile v/s AIDLC**
    - **Definition of Done**, is a Agile/Scrum concept - shared checklist e.g. DoD says "code is reviewed"; 
    - **Completion Criteria** - Completion Criteria say exactly what must be true for each **Unit**
      - **Forward-looking idea:** evidence-backed completion verification — the gate produces a human-reviewable proof document (per-criterion scores, justification, line-level references) rather than a bare pass/fail, making the gate's verdict inspectable and auditable

##### Operating Mode selection
  - Bolt is an execution of a slice of work. 
  - Each Bolt runs depending on the work's shape and risk — **a deliberate choice per Unit** is made here.
  - HITL = Human-in-the-loop
    - the AI does work with direct human approval or guidance at key points used when requirements are unclear, risk is high, or the task is novel 
  - OHOTL = Observed human-over-the-loop
    - the AI works mostly autonomously, but a human watches and can intervene if it drifts used for moderate-risk, somewhat familiar work where oversight is useful but not constant
  - AHOTL = Autonomous human-over-the-loop
    - Here is the real power of what we do.
    - the AI works independently within defined bounds, with humans checking afterwards or only when exceptions arise. 
    - Used when your the task is well-understood and the context is created well enough to let the agent iterate without constant input.

##### Per-Unit Design (conditional)
  - Design stages that run only when a Unit warrants them — conditional on the Unit's complexity and risk profile
  - For simple Units (e.g. CRUD endpoints, documentation updates) this stage is skipped entirely
  - For complex Units (e.g. implement a specific algorithmic scaling, architecture changes) this produces the per-unit design before code generation begins
  - **Community implementation breaks this into four conditional sub-stages:** 
    - **Functional Design** (unit-level architecture, interface contracts, data models)
    - **NFR Requirements** (performance targets, security constraints, scalability needs)
    - **NFR Design** (caching strategy, auth patterns, capacity planning) 
    - **Infrastructure Design** (Terraform modules, CloudFormation, container definitions). Each runs only when the Unit's complexity warrants it
  - Reads the domain design from Inception as input — Construction does not invent the domain model, it realises it

##### Code Generation Planning
  - The agent lays out the implementation plan before writing any code — **think before you build**
  - The agent decides: file structure, module boundaries, data flow, interface contracts, test strategy
  - The plan is reviewed before execution begins, catching structural issues before code exists

##### Code Generation
  - AI implements code and supporting artifacts, unit by unit — the [Builder] hat is the primary executor
  - Multiple Units can run in parallel through Mob Execution: collocated teams each own a Unit, exchange integration specifications (API contracts, event schemas) and coordinate cross-unit concerns at human checkpoints
  - AI collapses the designer-to-developer handoff — the artifact _is_ the design — so every discipline builds through the same loop

##### Build and Test
  - Six test types run against the implementation: 
    - unit
    - integration
    - performance
    - security
    - contract 
    - end-to-end
  - The test suite is the source of truth — not the architecture document, not the design spec
  - TDD workflow: write failing tests before implementation; BDD-style extends this to acceptance tests written before implementation
  - **"You cannot improve what you do not measure"** — the test suite is the measurement instrument

##### Quality Gates
  - Harness-enforced checks (tests, lint, types) that block progress until all pass — **the agent cannot advance, hand off or declare work complete otherwise**
  - **"The agent cannot rationalise its way around a failing hook"** — qualitatively different from asking AI to "run the tests"
  - Four properties make enforcement robust:
    1. **Auto-detection during elaboration** — the discovery skill inspects repository tooling (`package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`) and proposes gate commands, which the team confirms
    2. **Additive merge with a ratchet** — confirmed gates are saved to the Intent's frontmatter; builders may add unit-specific gates during construction, but gates are add-only. Removing a gate triggers a request-changes decision. **Quality standards can only move forward**
    3. **Scoped enforcement** — only building hats (builder, implementer, refactorer) are gate-enforced; planner, reviewer and designer hats skip silently (a failing test should not block a mid-review objective)
    4. **Loop prevention** — a `stop_hook_active` flag lets a subagent that has already been blocked once stop on its second attempt, preventing deadlock in nested scenarios
  - Gates are frontmatter-driven — they live in the Unit's configuration, not scattered across CI scripts

##### Backpressure: Feedback and Pass-Back (fail)
  - Failing gates push work back through design, code generation and testing until it converges — **the inner feedback loop**
  - This is not "go fix it" — the agent receives structured feedback (which gate failed, what was expected, what was observed) and iterates
  - The loop continues until all gates pass or the agent escalates to human review
  - **Backward flow becomes normal rather than exceptional** — a later pass discovering a constraint that invalidates an earlier assumption sends work back without anyone declaring failure
  - High churn (many iterations per Bolt) usually means poorly written completion criteria — the measurement feedback loop

##### Review and Integration (pass)
  - Passing work is reviewed, integrated across Units and checked for cross-unit coherence
  - **Review is not a rubber stamp** — the [Reviewer] hat verifies completion criteria, checks diff quality and confirms the Unit meets its declared success conditions
  - Cross-unit integration: when multiple Units run in parallel, this stage catches conflicts, duplicate logic, inconsistent interfaces and broken contracts between Units
  - The [Red Team] hat can be activated here for adversarial code review — probing for spec violations, security issues, edge cases and anti-patterns before the work moves to Operations
  - High-confidence mechanical fixes apply automatically; everything else goes back to the team

##### Deployment Automation (Operations)
  - Production deployment pipelines, rollback procedures and release orchestration — operational work is **file-based**, not runbook-based
  - Three operation types (each lives as a spec in `.ai-dlc/{intent}/operations/`):
    - **Scheduled** — cron-driven tasks (secret rotation, cache warming, log rotation)
    - **Reactive** — trigger-driven responses (rollback on error-rate spikes, alert on threshold breach)
    - **Process** — human-cadence routines (quarterly security reviews, compliance audits)
  - Agent-owned scripts execute autonomously within boundaries; human-owned checklists are tracked by the agent
  - Each intent ships a **Deployment Unit** bundling code artifacts, configuration, infrastructure definitions and validation suites with automated rollback procedures

##### Infrastructure as Code (Operations)
  - Infrastructure definitions, configuration management and environment provisioning managed through version-controlled specs
  - IaC lives alongside application code — the same git repository, the same review process, the same quality gates
  - Enables reproducible environments: the same spec produces dev, staging and production environments
  - Infrastructure changes go through the same Construction pipeline as application code — plan, implement, test, gate, review

##### Monitoring and Observability (Operations)
  - Monitoring setup, alerting, logging and observability configuration to track production behaviour and surface issues
  - **The virtuous loop**: monitoring feeds back into the coding agent's context and informs future Inception cycles — production behaviour becomes input for the next Intent
  - Example: an error-rate spike detected by monitoring triggers a reactive Operation (automatic rollback) and simultaneously feeds context into the next Inception cycle so the root cause is addressed in the next Bolt
  - Observability data becomes part of the Persistent Context — future sessions know what happened in production

##### Production Readiness Validation (Operations)
  - Pre-deployment checks confirming the system meets SLOs, runbooks are in place and rollback is ready before release
  - **The boundary gate between Construction and Operations** — validates the integrated codebase, not individual Units
  - Checks: architecture-to-code-to-tests alignment, all code traces to design, test coverage meets acceptance criteria
  - Runbooks, rollback readiness and SLO conformance are verified — the system is not released until these are confirmed
  - For regulated domains (fintech): auditable checkpoints at requirements sign-off, design approval, code review and release approval, with autonomous work permitted between them

##### Persistent Context and Knowledge
  - Plans, requirements, design artifacts and operational knowledge stored in the repo feed the next Inception cycle — **the outer feedback loop**
  - **"Artifacts are memory"**: intents, unit progress and decisions persist as committed files so the context window can be reset without losing ground truth. The community implementation treats `/clear` as a feature, not a bug
  - Five memory providers the agent can query:

    | Layer          | Location                   | Speed   | Purpose                                          |
    | -------------- | -------------------------- | ------- | ------------------------------------------------ |
    | Rules          | Project rule files         | Instant | Conventions, patterns, constraints               |
    | Session        | Working files, scratchpads | Fast    | Current task context and progress                |
    | Project        | Git history, codebase      | Indexed | What was tried and what worked                   |
    | Organisational | Connected systems via MCP  | Query   | Institutional knowledge: tickets, ADRs, runbooks |
    | Runtime        | Monitoring systems         | Query   | Production behaviour and incidents               |

  - **Context economy warning**: model performance degrades once the window passes ~40–60% utilisation (the "dumb zone"). Material buried mid-context receives less attention than whatever sits at the edges. Countermeasures: monitor context budget with alerts, extract static reference material into companion files, inject prior-bolt learnings lazily at point of use, scope context per role (the reviewer hat sees the diff and completion criteria, never the full elaboration history)
  - **[The 19-agent trap](https://paddo.dev/blog/the-19-agent-trap/)**: scaffolding one agent per job title (mirroring the org chart) loses context at every handoff. Complex swarms consistently underperform simple loops with rich relevant context. Personas succeed when they bundle review and oversight hats around one build loop, not when they spawn a dedicated agent per role
  - Completion announcements: an intent declares its announcement channels in frontmatter and the completed artifacts generate changelog entries, release notes, social posts or blog drafts — closing the gap between code-complete and users knowing about it

#### AI-DLC Persona-to-Hat Mapping

The AI-DLC personas below can wear one or more hats depending on the work being performed. The mapping combines the implementation's domain agents, reviewer agents and adaptive workflow composer with common Scrum and delivery roles.

| Persona                                               | Hat mapping                                                |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| Product Owner / Product Manager / Business Analyst    | [Planner], [Reviewer], [Red / Blue]                        |
| UX / Product Designer                                 | [Designer], [Builder], [Reviewer]                          |
| Scrum Master / Delivery Manager / Engineering Manager | [Planner], [Integrator], [Reviewer]                        |
| Solutions Architect / Technical Architect             | [Planner], [Designer], [Builder], [Reviewer], [Integrator] |
| AWS Platform Engineer                                 | [Designer], [Builder], [Reviewer]                          |
| Compliance Specialist                                 | [Planner], [Reviewer], [Red / Blue]                        |
| DevSecOps Engineer                                    | [Builder], [Reviewer], [Red / Blue]                        |
| Developer / Scrum Team Developer                      | [Planner], [Builder], [Reviewer]                           |
| QA Engineer / Tester                                  | [Builder], [Reviewer], [Red / Blue]                        |
| Pipeline and Deployment Engineer                      | [Builder], [Integrator], [Reviewer]                        |
| SRE / Operations Engineer                             | [Builder], [Reviewer], [Integrator]                        |
| Stakeholder                                           | [Planner], [Reviewer]                                      |
| Product Lead Reviewer                                 | [Reviewer]                                                 |
| Architecture Reviewer                                 | [Reviewer]                                                 |
| Adaptive Workflow Composer                            | [Planner], [Integrator]                                    |

#### Persona Evolution: Old Role → New Role → What to Learn

Each traditional persona from the mapping above, its AI-DLC replacement and the AI skills to learn to stay competitive and contribute correctly. The skill list is grounded in 2026 agent-engineering literature: prompt engineering alone is no longer sufficient — the leverage moved to context engineering, evals and orchestration.

| Old persona | New role | What to learn in AI to contribute |
| ----------- | -------- | --------------------------- |
| Product Owner / PM / Business Analyst | **Intent Owner, not Epic owner.** Writes a deliberately vague Intent that describes only the _why_ and owns the outcome. Decomposition is no longer pre-baked: the AI discovers scope through questions, so the Epic → stories → acceptance-criteria stack is replaced by an Intent, Units and completion criteria | Problem shaping — turn a vague goal into a questionable Intent, then validate the scope the AI proposes back; define completion criteria as measurable, verifiable conditions, not stories; write _why_ context well, never a pre-baked solution |
| UX / Product Designer | **Designer across Inception and Construction.** Turns the requirement into a workable design for system, data, interfaces or UX in Inception, and produces per-Unit designs in Construction. The artifact _is_ the design — the designer-to-developer handoff disappears | Structured outputs and tool calling; express designs as testable artifacts and acceptance criteria; run visual gates that diff a reference image against the implementation via a vision model; LLM-as-judge for design quality |
| Scrum Master / Delivery Manager | **Workflow Composer.** Replaces sprint ceremonies with adaptive decisioning: picks which conditional stages (User Stories, Application Design, Adversarial Spec Review, Units of Work Planning) apply and selects the per-Unit operating mode (HITL / OHOTL / AHOTL) | Agent orchestration patterns (planner-executor, coordinator-specialist, parallel merge, ReAct loops); human-in-the-loop design (draft → approve → execute); pick operating modes by risk per Unit; read agent traces; keep approvals human at every gate |
| Solutions / Technical Architect | **Designer + Knowledge curator.** Owns the domain model and architecture boundaries that Construction realises — Construction does not invent the domain, it implements it. Maintains Persistent Context so knowledge survives context resets | Context engineering at scale — token budgets, compaction, ordering, the memory layers table; retrieval design (chunking, embeddings, hybrid search, vector stores); MCP to connect knowledge sources; know when retrieval beats a bigger model |
| AWS Platform Engineer | **Operations-as-Code + IaC owner.** Owns file-based operations specs (scheduled, reactive, process), infrastructure definitions and the bundled Deployment Unit (code, config, infra, validation) that ships with each Intent | Build MCP servers and clean tool/function-calling schemas; sandboxed execution (E2B, Modal) with least-privilege tool permissioning; agent observability (LangFuse, LangSmith, Phoenix); cost and latency control — model routing, prompt caching, token budgets |
| Compliance Specialist | **Audit checkpoint keeper.** Defines auditable checkpoints (requirements sign-off, design approval, code review, release approval) with autonomous work permitted between them, and records unresolved risks for human review | AI governance and risk frameworks (NIST AI RMF, EU AI Act); audit trails from eval provenance and full LLM interaction logging; guardrail models (Llama Guard, ShieldGemma, Prompt Guard); bias and robustness evals; human-review proof documents |
| DevSecOps Engineer | **Red / Blue + gate curator.** Probes design and implementation adversarially (injection, auth bypass, privilege escalation, data exposure, insecure config) and keeps attack testing separate from remediation so reviews stay objective | OWASP GenAI Top 10 — LLM01 prompt injection (direct, indirect, multimodal) and LLM06 excessive agency; scanners (garak, Giskard); guardrail deployment (input, output and action screening); the dual-LLM privileged/quarantined pattern; least privilege for tools and MCP servers; human approval for destructive actions |
| Developer | **Builder.** Implements the agreed plan in small steps — code, tests, infrastructure — and iterates against gate feedback instead of human nudges. Writing the failing test first becomes the primary deliverable | Coding agents (Claude Code, Cursor) and tool use; structured outputs and function calling; one orchestration framework deeply (LangGraph or Claude Agent SDK); treat evals as the new unit tests (promptfoo, DeepEval); read traces to debug agent loops; manage the context budget |
| QA / Tester | **Gate Curator.** Writes completion criteria that gate autonomy and owns the add-only, ratcheted quality gates. Adopts the forward-looking idea: per-criterion scores, justification and line-level references instead of a bare pass/fail | LLM evals as the new test suite — golden datasets, offline vs online evals, LLM-as-judge calibration (measure judge agreement against human labels); regression gates in CI; the guardrails vs monitors vs evals distinction; error-analysis discipline; tools: promptfoo, DeepEval, Ragas, LangSmith |
| Pipeline and Deployment Engineer | **Deployment Automation owner.** Builds scheduled, reactive and process operation types with automated rollback and release orchestration; agent-owned scripts run autonomously within defined boundaries | CI/CD quality gates for AI — eval suites that block merges; pin model and prompt versions; canary model deploys and instant rollback; prompt caching and token cost ceilings; regress against model-upgrade candidates before forced migrations |
| SRE / Operations Engineer | **Observability steward.** Configures monitoring, alerting and logging and closes the virtuous loop: production behaviour feeds the next Inception and lands in Persistent Context and the Runtime memory layer | LLM observability and trace-level eval (LangSmith, LangFuse, Phoenix, Helicone); online evals on live traffic — user signals (thumbs, abandonment, clarification loops); SLOs for cost and p99 latency; wire alerting into reactive operations (auto-rollback on error-rate spikes) |
| Stakeholder | **Gate approver.** Steers via transparent checkpoints and evidence-backed proof documents instead of status meetings and progress reports | Read an eval proof document — per-criterion scores, justification, line-level references; distinguish bare pass/fail from evidence-backed verdicts; basic LLM risk literacy (hallucination, prompt injection, runaway cost) |
| Product Lead Reviewer | **Reviewer, full-time.** Verifies completion criteria, checks diff quality and confirms the Unit meets its declared success conditions — review is not a rubber stamp | Eval design literacy to spot weak acceptance criteria; know LLM failure modes (context rot, hallucination, tool misuse); adversarial fresh-eyes review — separate model, clean session or CI; verify evidence rather than vibes |
| Architecture Reviewer | **Reviewer + Red / Blue on designs.** Interrogates the proposed design before build work starts — hidden assumptions and weak spots — because the cost of fixing a bug rises the further it travels the lifecycle | Threat-model AI systems — every data path into the context window is an injection surface; OWASP GenAI; adversarial spec review before code generation; review sandboxing and dual-LLM designs; cost-of-change reasoning |
| Adaptive Workflow Composer | **Planner / Integrator that keeps the pipeline adaptive.** Assesses the request's shape, selects which stages apply and coordinates cross-Unit integration, contracts and the Unit dependency DAG | Agent orchestration — when a single agent suffices, when to split and parallelize; dynamic task graphs and state management; checkpoint and iteration-cap design; guardrail design (loop limits, token budgets); eval-driven gates |

### Notes

- The phrase "this single decision determines how all of Inception proceeds" refers to the company's internal workflow branching: greenfield skips Reverse Engineering while brownfield runs it first. The remaining Inception stages are common to both paths.
- The composite hat labels in the workflow diagram are intentional and remain unchanged.

### References

- Raja SP, _AI-Driven Development Life Cycle_, AWS DevOps Blog, 31 Jul 2025. https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/
- Bushido Collective, _AI-DLC 2026_, Jan 2026. https://ai-dlc.dev/paper
- Bushido Collective, _The Hat System_, AI-DLC Docs. https://ai-dlc.dev/docs/hats
- AWS AI-DLC Method Definition. https://prod.d13rzhkk8cj2z0.amplifyapp.com/aidlc.pdf
- awslabs/aidlc-workflows, _Phases and Stages_. https://awslabs.github.io/aidlc-workflows/guide/04-phases-and-stages/

AI skills research:

- Anthropic, _Effective context engineering for AI agents_, Sep 2025. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- _Context engineering vs prompt engineering: the real difference_, ProductOS, Aug 2026. https://productos.dev/blog/context-engineering-vs-prompt-engineering
- _How to Become an AI Agent Engineer in 2026 (Skills, Salary & Roadmap)_, SkillsCouter. https://skillscouter.com/how-to-become-an-ai-agent-engineer/
- _How to Become an AI Agent Developer: The 2026 Roadmap_, AgenticCareers. https://agenticcareers.co/blog/how-to-become-ai-agent-developer-2026
- _The Agentic AI Engineer Roadmap for 2026: Skills Stack and Order_, Medium, Jun 2026. https://medium.com/data-science-collective/the-agentic-ai-engineer-roadmap-for-2026-skills-stack-and-order-fc1dfa17948d
- Martin Holovsky, _Rules 01 — Evals: the centerpiece of LLM engineering_, SOTA Skills. https://github.com/martinholovsky/sota-skills/blob/main/skills/sota-llm-engineering/rules/01-evals.md
- LangWatch, _LLM Evaluations Explained: Experiments, Monitors, Guardrails_. https://langwatch.ai/blog/llm-evaluations-explained-experiments-online-evaluations-guardrails-and-when-to-use-each-in-2026
- Arize, _LLM evaluation: methods, metrics, RAG & agent evals guide_. https://arize.com/resources/llm-evaluation/
- Anthropic, _Building effective agents_. https://www.anthropic.com/research/building-effective-agents
- OWASP, _LLM01:2025 Prompt Injection_, Gen AI Security Project. https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- OWASP, _LLM Prompt Injection Prevention Cheat Sheet_. https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- OWASP, _Secure Agent Playbook: Prompt Injection Testing_. https://owasp.org/secure-agent-playbook/plugins/ai-security-skills/plays/prompt-injection-testing.html
- _2026/LLM01_PromptInjection.md_, GenAI-Security-Project. https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/LLM01_PromptInjection.md
