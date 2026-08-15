+++
date = '2026-08-12T12:01:00+10:00'
draft = false
title = 'Fintech Personas at Telly'
tags = ['Fintech','Telly','Personas','Roles']
summary = "Placeholder for roles and contributions of Fintech personas at Telly."
+++

## Introduction

This post outlines the roles and contributions of each persona in Telly's Fintech domain with context around Engineering and AI. It builds on related posts on this site — [Context Engineering](/blog/ai/context-engineering/), [Spec-Driven Development With AI](/blog/ai/spec-driven-development/) and [Testing LLM Outputs: Evals for Models, Agents, and Skills](/blog/ai/evals/) — and references them where their concepts apply.

## The Software Development Lifecycle: From Idea to Production and Beyond

This section walks through the complete set of steps any software product goes through, from the first idea to production and beyond, following industry-standard practices from classic textbooks such as *Software Engineering* (Sommerville, 10th ed, 2016), *Software Engineering: A Practitioner's Approach* (Pressman and Maxim, 9th ed, 2020) and ISO/IEC/IEEE 12207:2017 (software life cycle processes). Teams rarely follow these phases in strict order — most modern teams iterate and overlap them — but the sequence is a reliable reference model for what must happen.

### Phase 0: Discovery and Idea

**What happens here:** validate that the problem is real, that people will use the solution and that building it makes business sense.

- Define the problem and the target user: who it is for, what problem it solves and why now.
- Validate demand before building. *The Lean Startup* (Ries, 2011) recommends the build-measure-learn loop and a minimal viable product (MVP) to test assumptions with real users early.
- Run a feasibility study: technical, financial, timeline and, in fintech, regulatory and compliance.
- Decide build vs buy vs borrow. Choose the technology only after the problem is understood — avoid following hype cycles.
- Define success criteria and the business case; secure stakeholder alignment.

**Deliverables:** problem statement, business case, MVP scope, success metrics.

**References:** *The Lean Startup* (Ries, 2011); *The Mythical Man-Month* (Brooks, 1975); PMBOK Guide (PMI, 7th ed, 2021).

### Phase 1: Requirements Engineering

**What happens here:** capture what the system must do and how well it must do it.

- Elicit requirements from stakeholders through interviews, workshops, observation and document analysis (Sommerville, 2016).
- Analyse and prioritise. Functional requirements define what the system does; non-functional requirements (quality attributes) define performance, security, availability, scalability and usability.
- Specify the requirements. Agile teams write user stories with acceptance criteria and follow the INVEST model (Wake, 2003). Regulated environments keep a formal software requirements specification (SRS) with traceability.
- Validate and sign off, especially for compliance- and safety-relevant requirements.
- Manage change: requirements evolve; track them in a product backlog or a requirements management tool.

**Deliverables:** product backlog or SRS, acceptance criteria, Definition of Ready and Definition of Done.

**References:** ISO/IEC/IEEE 29148 (requirements engineering); *Software Engineering* (Sommerville, 2016); the Scrum Guide (Schwaber and Sutherland).

### Phase 2: Architecture and Design

**What happens here:** decide how the system is structured before writing code.

- Choose the architecture that fits the problem: layered, microservices, event-driven, serverless and so on. *Designing Data-Intensive Applications* (Kleppmann, 2017) is the standard reference for data-centric architectures.
- Model the domain with Domain-Driven Design: ubiquitous language, bounded contexts, aggregates (Evans, 2003).
- Design at two levels: high-level architecture (components, integrations, data flow, security boundaries) and low-level design (modules, interfaces, algorithms and patterns from *Design Patterns*, Gamma et al, 1994).
- Define the data model and API contracts before implementation.
- Record decisions as Architecture Decision Records (ADRs) so future teams know why things are the way they are.
- Design for failure: circuit breakers, retries with backoff, timeouts, queues and graceful degradation (*Release It!*, Nygard, 2007).

**Deliverables:** architecture design document, ADRs, data model, API specifications, security architecture.

**References:** *Designing Data-Intensive Applications* (Kleppmann, 2017); *Clean Architecture* (Martin, 2017); *Domain-Driven Design* (Evans, 2003); *Design Patterns* (Gamma et al, 1994); *Release It!* (Nygard, 2007).

### Phase 3: Development (Construction)

**What happens here:** turn the design into working, tested code.

- Set up version control (Git) and agree a branching strategy. Trunk-based development is the standard recommendation for teams doing continuous delivery.
- Follow coding standards enforced by linting and static analysis. *Code Complete* (McConnell, 2004) and *Clean Code* (Martin, 2008) are the classic references for construction practices.
- Write tests alongside code, test-first where it fits: test-driven development (Beck, 2003).
- Review every change: pull requests, code review, pair or mob programming for complex work.
- Integrate continuously: commit small, integrate frequently, keep the build green (Fowler, 2006).
- Keep the code healthy: refactor in small steps (Fowler, 1999) and avoid premature optimisation.

**Deliverables:** source code, unit tests, review records, CI build.

**References:** *Code Complete* (McConnell, 2004); *Clean Code* (Martin, 2008); *Test-Driven Development: By Example* (Beck, 2003); *Refactoring* (Fowler, 1999); *The Pragmatic Programmer* (Hunt and Thomas, 1999).

### Phase 4: Testing and Quality Assurance

**What happens here:** verify the software works, and keep proving it as it changes.

- Follow the test pyramid: many fast unit tests, fewer integration tests and a small number of end-to-end tests (Cohn, 2009).
- Test at the standard levels from the ISTQB syllabus: component (unit), integration, system and acceptance testing.
- Automate regression tests and run them in CI on every change.
- Add non-functional testing: performance and load, security (OWASP Top 10 and OWASP ASVS), accessibility and usability.
- Use behaviour-driven development for shared understanding: Gherkin scenarios written before the code (North, 2006).
- Enforce quality gates before merge: code review approval, coverage thresholds, lint rules and passing tests.

**Deliverables:** automated test suites, test reports, quality metrics.

**References:** ISTQB Foundation syllabus; *Succeeding with Agile* (Cohn, 2009); *Introducing BDD* (North, 2006); OWASP Top 10 and OWASP ASVS.

### Phase 5: Build, Continuous Integration and Release (CI/CD)

**What happens here:** make the path to production fast, automated and safe.

- Build and test every commit in a CI pipeline; produce immutable, versioned artifacts. Keep build, release and run separate (Twelve-Factor App, Wiggins, 2011).
- Promote the same artifact through environments: development, test or staging, then production. Keep environments as close to production as possible (dev/prod parity).
- Automate deployment with release pipelines so software is always in a deployable state (*Continuous Delivery*, Humble and Farley, 2010).
- Use safe deployment patterns: rolling, blue-green or canary, with feature flags to decouple deploy from release.
- Gate every release on automated checks: tests, static analysis, security scanning, compliance checks and health checks after deployment.

**Deliverables:** CI/CD pipeline, release automation, deployment runbooks.

**References:** *Continuous Delivery* (Humble and Farley, 2010); *Continuous Integration* (Fowler, 2006); *The DevOps Handbook* (Kim, Humble, Debois and Willis, 2016); Twelve-Factor App (Wiggins, 2011).

### Phase 6: Production Operations and Reliability

**What happens here:** run the system reliably, safely and economically once it is live.

- Define reliability targets: service level indicators (SLIs), service level objectives (SLOs) and error budgets (*Site Reliability Engineering*, Beyer et al, 2016).
- Implement observability: metrics, structured logs, distributed tracing, dashboards and alerting.
- Set up on-call and incident management: detection, response, escalation and communication. ITIL 4 defines incident and problem management as standard practices.
- Run blameless postmortems after every significant incident.
- Plan capacity, backups, restore drills and disaster recovery.
- Control cost: track cloud spend, rightsize resources and automate scaling.
- Harden production security: vulnerability scanning, patching and regular access reviews.
- Optionally run chaos experiments to prove failure handling works (*Principles of Chaos Engineering*, 2017).

**Deliverables:** SLOs, runbooks, incident response plan, monitoring and alerting, capacity plan, disaster recovery plan.

**References:** *Site Reliability Engineering* (Beyer et al, 2016); *The Site Reliability Workbook* (2018); *ITIL 4 Foundation* (AXELOS, 2019); *Principles of Chaos Engineering* (2017).

### Phase 7: Maintenance and Evolution

**What happens here:** keep the system alive, correct and competitive after launch.

- Classify and manage maintenance work: corrective (fixing defects), adaptive (new platforms, regulations or compliance), perfective (new features and improvements) and preventive (refactoring and technical debt reduction) — IEEE 1219.
- Manage technical debt explicitly: track it, pay it down in small steps and use automated tests as a safety net (*Refactoring*, Fowler, 1999; *Working Effectively with Legacy Code*, Feathers, 2004).
- Release on a regular cadence with regression protection from the automated test suite.
- Feed production telemetry back into requirements, design and testing.
- Improve continuously using the DORA four key metrics: deployment frequency, lead time for changes, change failure rate and time to restore service (*Accelerate*, Forsgren, Humble and Kim, 2018).
- Plan dependency and platform upgrades; never let versions drift so far that migration becomes a project in itself.

**Deliverables:** maintenance backlog, release cadence, technical debt register, improvement roadmap.

**References:** IEEE 1219 (software maintenance); *Refactoring* (Fowler, 1999); *Working Effectively with Legacy Code* (Feathers, 2004); *Accelerate* (Forsgren et al, 2018); CMMI-DEV for process maturity.

### Phase 8: Retirement (Sunset)

**What happens here:** take the system out of service cleanly and responsibly.

- Decide when to retire: when the cost of running exceeds the value delivered, or a replacement exists.
- Plan the exit: data migration or archival, decommissioning integrations, winding down third-party contracts and cleaning up DNS and certificates.
- Communicate the plan to users and stakeholders well in advance.
- Keep required records and audit trails, especially in regulated fintech environments.
- Shut down in stages with a rollback path if the replacement underperforms.

**Deliverables:** retirement plan, data archival or migration, final closeout report.

**References:** ISO/IEC/IEEE 12207 (retirement process); PMBOK Guide (project closure).

### Cross-Cutting Practices

These apply across every phase above.

- **Process framework:** agile (Scrum, Kanban, extreme programming) for most product work; plan-driven (waterfall) where requirements are fixed and heavily regulated; hybrid models in between. Agile Manifesto (2001).
- **Ceremonies and cadence:** sprint planning, daily standup, review and retrospective (the Scrum Guide). Retrospectives drive continuous improvement.
- **Estimation:** story points and planning poker based on Wideband Delphi (Boehm, 1981), relative sizing and T-shirt sizing.
- **Quality and compliance gates:** security reviews, audit trails and traceability from requirement to production change. Fintech adds mandatory gates: ISO/IEC 27001, PCI DSS, SOC 2 and GDPR.
- **Governance:** change management and incident management follow ITIL 4; release boards for high-risk environments.

### Summary: The Full Set of Steps

| Phase | Key Activities | Key Deliverable | Key Reference |
|---|---|---|---|
| 0. Discovery | Problem definition, feasibility, MVP validation | Business case, success metrics | *The Lean Startup* (Ries, 2011) |
| 1. Requirements | Elicitation, analysis, specification | Backlog or SRS, acceptance criteria | ISO/IEC/IEEE 29148 |
| 2. Architecture and design | Domain modelling, architecture, data and API design | Design docs, ADRs | *Domain-Driven Design* (Evans, 2003) |
| 3. Development | Coding, code review, continuous integration | Source code, unit tests | *Code Complete* (McConnell, 2004) |
| 4. Testing | Test pyramid, automated regression, non-functional testing | Test suites, reports | ISTQB / *Succeeding with Agile* (Cohn, 2009) |
| 5. Build and release | CI/CD, deployment automation, safe release patterns | Release pipeline, runbooks | *Continuous Delivery* (Humble and Farley, 2010) |
| 6. Production | SLOs, observability, incident management, DR | SLOs, runbooks, DR plan | *Site Reliability Engineering* (2016) |
| 7. Maintenance and evolution | Defect fixing, features, tech debt, improvement | Release cadence, debt register | IEEE 1219 / *Accelerate* (2018) |
| 8. Retirement | Decommissioning, data archival, communication | Retirement plan | ISO/IEC/IEEE 12207 |

## Software Development Personas at Telly

The personas below are the standard roles found in modern software development organisations, mapped to the lifecycle phases in the previous section. They are deliberately generic — not Telly's internal org chart — because the exact titles and boundaries differ between teams. In practice one person often wears several hats, especially in small squads, and some roles exist at platform level while others are embedded in delivery squads.

### Product and Delivery

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| Product Manager (PM) | Discovery, Requirements, Maintenance | Owns the product vision, roadmap and prioritisation; defines success metrics and the MVP scope (Phases 0-1, 7). |
| Product Owner (PO) | Requirements, Development | The agile counterpart of the PM inside a squad: owns the backlog, writes and prioritises user stories and accepts work against the Definition of Done (Phases 1, 3). |
| Business Analyst (BA) | Discovery, Requirements | Elicits and analyses requirements, models the domain, documents acceptance criteria and translates between business and engineering language (Phases 0-1). |
| Delivery Manager / Project Manager | All phases | Owns the plan, timeline, budget, risk and stakeholder communication. In agile organisations this becomes a facilitation role rather than a controller role. |
| Scrum Master / Agile Coach | All phases | Guards the process, removes impediments, runs ceremonies and retrospectives and coaches the team on agile practice. |
| Engineering Manager | All phases | Line-manages engineers, owns career growth, hiring and team health; pairs with the Tech Lead on technical decisions. |

### Design and Research

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| UX Researcher | Discovery, Testing, Maintenance | Runs user interviews, usability tests and data analysis to validate problems and solutions before and after the build (Phases 0, 4, 7). |
| UX Designer | Discovery, Development | Designs flows, information architecture and interaction patterns; produces prototypes for testing (Phases 0-1, 3). |
| UI / Visual Designer | Development | Turns interaction designs into the visual system: components, tokens and design systems (Phase 3). |
| Accessibility Specialist | Requirements, Testing | Ensures products meet accessibility standards such as WCAG; reviews designs and tests for accessibility (Phases 1, 4). |

### Architecture

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| Enterprise Architect | Discovery, Requirements, Maintenance | Aligns solutions with the enterprise strategy and standards; owns cross-system integration and technology standards (Phases 0-2, 7). |
| Solution Architect | Design, Production | Owns the end-to-end solution design for a product: architecture, data, integrations, security and non-functional requirements (Phases 2, 6). |
| Data / Platform Architect | Design, Maintenance | Designs data models, pipelines and the platform foundations shared across squads (Phases 2, 5-7). |

### Engineering

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| Tech Lead | Design, Development, Maintenance | Sets the technical direction for the squad, reviews designs and code, mentors engineers and owns technical quality (Phases 2-3, 7). |
| Software Engineer | Development, Maintenance | Writes and reviews code, writes unit and integration tests and participates in continuous integration; owns codebase health (Phases 3, 7). |
| Frontend / Backend / Full-stack Engineer | Development | Specialised engineering tracks for user interfaces, services and APIs, or both (Phase 3). |
| Data Engineer | Development, Maintenance | Builds and maintains data pipelines, warehouses and data quality controls (Phases 3, 7). |
| ML / AI Engineer | Discovery, Development, Production | Builds and operates ML and LLM features: data, training, evals, prompts, model serving and monitoring (Phases 0, 3, 6). |
| Database Administrator | Development, Production, Maintenance | Owns database performance, migrations, backups and access controls (Phases 3, 6-7). |

### Quality and Testing

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| QA Engineer / Test Analyst | Requirements, Testing | Designs the test strategy, writes test cases and performs exploratory and regression testing; guards release quality (Phases 1, 4). |
| Test Automation Engineer (SDET) | Development, Testing | Builds and maintains the automated test pyramid: unit frameworks, integration suites, end-to-end tests and performance tests (Phases 3-4). |

### Platform, DevOps and Operations

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| DevOps / Platform Engineer | Build and Release, Production | Builds and runs CI/CD pipelines, infrastructure as code, developer tooling and shared environments (Phases 5-6). |
| Site Reliability Engineer (SRE) | Production, Maintenance | Owns SLIs, SLOs and error budgets; drives reliability, runs incidents and plans capacity (Phases 6-7). |
| Release Manager | Build and Release | Owns the release calendar, change approvals and production deployment coordination (Phases 5-6). |
| Cloud / Infrastructure Engineer | Build and Release, Production | Owns cloud accounts, networking, compute and infrastructure security baselines (Phases 5-6). |
| Support Engineer (L1/L2/L3) | Production, Maintenance | Triages and resolves customer and system issues, escalates to engineering and feeds root causes back into the backlog (Phases 6-7). |

### Security and Compliance

| Persona | Primary Phases | Core Contribution |
|---|---|---|
| Application Security Engineer (AppSec) | Development, Build and Release, Production | Runs threat modelling, code and dependency scanning, SAST/DAST and security reviews (Phases 3-6). |
| Security Architect | Architecture, Production | Designs the security controls and guardrails across the solution (Phases 2, 6). |
| Compliance / Risk Analyst (GRC) | Requirements, Build and Release, Maintenance | Maps controls to regulations such as PCI DSS, SOC 2 and GDPR for fintech and telecom; audits and tracks evidence (Phases 1, 5-7). |
| Data Protection Officer (DPO) | Requirements, Maintenance | Owns data protection compliance, privacy impact assessments and breach handling (Phases 1, 7). |

### Personas Across the Lifecycle

| SDLC Phase | Owning Personas | Contributing Personas |
|---|---|---|
| 0. Discovery | PM, UX Researcher, BA, Enterprise Architect | Delivery Manager, Data Engineer |
| 1. Requirements | PO, BA, UX Designer, Accessibility Specialist | AppSec, GRC, DPO |
| 2. Architecture and design | Solution Architect, Tech Lead, Security Architect | Enterprise Architect, Data Architect, AppSec |
| 3. Development | Software Engineers, Tech Lead, Test Automation Engineer | PO, QA Engineer, Data Engineer |
| 4. Testing | QA Engineer, Test Automation Engineer | UX Researcher, Accessibility Specialist |
| 5. Build and release | DevOps / Platform Engineer, Release Manager | AppSec, GRC, Cloud Engineer |
| 6. Production | SRE, Support Engineer, Cloud / Infrastructure Engineer | Solution Architect, ML / AI Engineer |
| 7. Maintenance and evolution | Software Engineers, PM / PO, SRE | GRC, DPO, Data Engineer |
| 8. Retirement | Delivery Manager, Software Engineers | GRC, Compliance Analyst |

## AI and Context Engineering Usage by Persona and Stage

This matrix maps every persona to the software development phases from the lifecycle section and describes how they apply AI and context engineering in each. The underlying concepts — context windows, knowledge bases, skills, agents, prompts and evals — come from the [Context Engineering](/blog/ai/context-engineering/) post.

**Legend:** O = Owns the activity, R = Reviews, C = Contributes, A = Approves. Blank = not directly involved. Each code links to the description below.

### Matrix

| Persona | 0. Discovery | 1. Requirements | 2. Architecture | 3. Development | 4. Testing | 5. Build & Release | 6. Production | 7. Maintenance | 8. Retirement |
|---|---|---|---|---|---|---|---|---|---|
| Product Manager (PM) | [O](#pm-ph0) | [O](#pm-ph1) |  | [R](#pm-ph3) | [R](#pm-ph4) | [R](#pm-ph5) | [R](#pm-ph6) | [O](#pm-ph7) | [A](#pm-ph8) |
| Product Owner (PO) |  | [O](#po-ph1) |  | [O](#po-ph3) | [C](#po-ph4) |  |  | [O](#po-ph7) |  |
| Business Analyst (BA) | [C](#ba-ph0) | [O](#ba-ph1) | [C](#ba-ph2) |  |  |  |  | [C](#ba-ph7) |  |
| Delivery Manager (DM) | [R](#dm-r) | [R](#dm-r) | [R](#dm-r) | [R](#dm-r) | [R](#dm-r) | [R](#dm-r) | [R](#dm-r) | [R](#dm-r) | [O](#dm-ph8) |
| Scrum Master (SM) | [R](#sm-all) | [R](#sm-all) |  | [R](#sm-all) | [R](#sm-all) | [R](#sm-all) | [R](#sm-all) | [R](#sm-all) |  |
| Engineering Manager (EM) |  |  |  | [R](#em-all) |  |  |  | [R](#em-all) |  |
| UX Researcher (UXR) | [O](#uxr-ph0) | [C](#uxr-ph1) |  |  | [O](#uxr-ph4) |  |  | [R](#uxr-ph7) |  |
| UX Designer (UXD) | [C](#uxd-ph0) | [O](#uxd-ph1) |  | [O](#uxd-ph3) | [C](#uxd-ph4) |  |  |  |  |
| UI / Visual Designer (UID) |  |  |  | [O](#uid-ph3) |  |  |  |  |  |
| Accessibility Specialist (A11y) |  | [C](#a11y-ph1) |  |  | [O](#a11y-ph4) |  |  |  |  |
| Enterprise Architect (EA) | [O](#ea-ph0) |  | [A](#ea-ph2) |  |  |  |  | [R](#ea-ph7) |  |
| Solution Architect (SA) |  |  | [O](#sa-ph2) |  |  |  | [R](#sa-ph6) | [R](#sa-ph7) |  |
| Data / Platform Architect (DA) |  |  | [O](#da-ph2) |  |  | [R](#da-ph5) |  | [R](#da-ph7) |  |
| Tech Lead (TL) |  |  | [O](#tl-ph2) | [O](#tl-ph3) | [R](#tl-ph4) | [R](#tl-ph5) |  | [O](#tl-ph7) |  |
| Software Engineer (SWE) |  |  |  | [O](#swe-ph3) | [C](#swe-ph4) | [C](#swe-ph5) |  | [O](#swe-ph7) |  |
| Data Engineer (DE) |  |  |  | [O](#de-ph3) |  |  |  | [R](#de-ph7) |  |
| ML / AI Engineer (ML) | [C](#ml-ph0) |  |  | [O](#ml-ph3) |  |  | [O](#ml-ph6) | [O](#ml-ph7) |  |
| Database Administrator (DBA) |  |  |  | [C](#dba-ph3) |  |  | [O](#dba-ph6) | [R](#dba-ph7) |  |
| QA Engineer (QA) |  | [C](#qa-ph1) |  |  | [O](#qa-ph4) |  |  | [C](#qa-ph7) |  |
| Test Automation Engineer (SDET) |  |  |  | [O](#sdet-ph3) | [O](#sdet-ph4) |  |  | [R](#sdet-ph7) |  |
| DevOps / Platform Engineer (DevOps) |  |  |  | [C](#devops-ph3) |  | [O](#devops-ph5) | [C](#devops-ph6) |  |  |
| Site Reliability Engineer (SRE) |  |  |  |  |  |  | [O](#sre-ph6) | [R](#sre-ph7) |  |
| Release Manager (RM) |  |  |  |  |  | [O](#rm-ph5) | [R](#rm-ph6) |  |  |
| Cloud / Infrastructure Engineer (Cloud) |  |  |  |  |  | [O](#cloud-ph5) | [R](#cloud-ph6) |  |  |
| Support Engineer (L1-L3) |  |  |  |  |  |  | [O](#sup-ph6) | [C](#sup-ph7) |  |
| AppSec Engineer (AppSec) |  |  |  | [C](#appsec-ph3) |  | [O](#appsec-ph5) | [R](#appsec-ph6) |  |  |
| Security Architect (SecArch) |  |  | [A](#secarch-ph2) |  |  |  | [R](#secarch-ph6) |  |  |
| GRC / Risk Analyst (GRC) |  | [O](#grc-ph1) |  |  |  | [A](#grc-ph5) |  | [O](#grc-ph7) |  |
| Data Protection Officer (DPO) |  | [A](#dpo-ph1) |  |  |  |  |  | [R](#dpo-ph7) |  |

### Detailed Descriptions

#### Product Manager (PM)

- <a id="pm-ph0"></a>**Phase 0 — Discovery (O):** uses AI to synthesise market research, build customer personas and draft the business case. Context engineering loads market data and customer signals into the agent so outputs stay grounded in evidence rather than model assumptions.
- <a id="pm-ph1"></a>**Phase 1 — Requirements (O):** uses AI to draft the roadmap and prioritise features by value, with context loaded from the OKR and roadmap knowledge base.
- <a id="pm-ph3"></a>**Phase 3 — Development (R):** reviews AI-generated sprint progress summaries to track delivery against plan without reading every ticket.
- <a id="pm-ph4"></a>**Phase 4 — Testing (R):** reviews AI-summarised test and eval results to confirm release readiness from a product view.
- <a id="pm-ph5"></a>**Phase 5 — Build & Release (R):** reviews AI-drafted release notes and impact summaries before sign-off.
- <a id="pm-ph6"></a>**Phase 6 — Production (R):** monitors AI-summarised customer-impact dashboards and incident digests.
- <a id="pm-ph7"></a>**Phase 7 — Maintenance (O):** plans the roadmap from production telemetry and customer feedback with AI; context engineering keeps the analysis tied to the knowledge base.
- <a id="pm-ph8"></a>**Phase 8 — Retirement (A):** approves the AI-drafted retirement plan built from usage, cost and risk data.

#### Product Owner (PO)

- <a id="po-ph1"></a>**Phase 1 — Requirements (O):** writes user stories and acceptance criteria with AI assistance, following [spec-driven development](/blog/ai/spec-driven-development/); context comes from domain rules in the knowledge base.
- <a id="po-ph3"></a>**Phase 3 — Development (O):** refines the backlog with AI and evaluates delivered features against the Definition of Done using domain context.
- <a id="po-ph4"></a>**Phase 4 — Testing (C):** contributes acceptance criteria that become eval cases in the automated test suite.
- <a id="po-ph7"></a>**Phase 7 — Maintenance (O):** prioritises the maintenance backlog from production defect data with AI.

#### Business Analyst (BA)

- <a id="ba-ph0"></a>**Phase 0 — Discovery (C):** uses AI to summarise interviews and workshop notes into a problem statement and scope.
- <a id="ba-ph1"></a>**Phase 1 — Requirements (O):** uses AI for requirements elicitation, gap analysis and domain modelling. Context engineering keeps regulatory and business rules in the window so requirements do not drift.
- <a id="ba-ph2"></a>**Phase 2 — Architecture (C):** feeds AI-drafted business rules and requirements to the design team.
- <a id="ba-ph7"></a>**Phase 7 — Maintenance (C):** uses AI to trace how requirement changes ripple across the existing backlog.

#### Delivery Manager / Project Manager (DM)

- <a id="dm-r"></a>**All phases (R):** uses AI to draft status reports, analyse risks and generate recovery plans. Context from the delivery knowledge base keeps reports grounded in real data.
- <a id="dm-ph8"></a>**Phase 8 — Retirement (O):** drafts the retirement plan — data archival, integration decommissioning and communication — with AI support.

#### Scrum Master / Agile Coach (SM)

- <a id="sm-all"></a>**All involved phases (R):** uses AI to analyse retrospective outcomes, track impediments and surface team-health signals from delivery data across the lifecycle.

#### Engineering Manager (EM)

- <a id="em-all"></a>**Phases 3 and 7 (R):** uses AI-assisted summaries of code metrics and delivery data to inform coaching and performance reviews.

#### UX Researcher (UXR)

- <a id="uxr-ph0"></a>**Phase 0 — Discovery (O):** uses AI to analyse interview transcripts and synthesise research into personas and opportunity maps. Context engineering keeps the research corpus in the window so themes are evidence-based.
- <a id="uxr-ph1"></a>**Phase 1 — Requirements (C):** contributes research insights into requirement definition.
- <a id="uxr-ph4"></a>**Phase 4 — Testing (O):** uses AI to analyse usability test recordings and behavioural data for the release.
- <a id="uxr-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed post-launch usage and feedback data.

#### UX Designer (UXD)

- <a id="uxd-ph0"></a>**Phase 0 — Discovery (C):** co-creates problem framing and early prototypes with AI support.
- <a id="uxd-ph1"></a>**Phase 1 — Requirements (O):** uses AI to draft user journeys and flows from requirements.
- <a id="uxd-ph3"></a>**Phase 3 — Development (O):** uses AI to generate UI variants and interaction patterns; context comes from the design-system knowledge base.
- <a id="uxd-ph4"></a>**Phase 4 — Testing (C):** supports usability testing with AI-generated test scenarios.

#### UI / Visual Designer (UID)

- <a id="uid-ph3"></a>**Phase 3 — Development (O):** uses AI for visual design generation and design-token maintenance; context from the brand and design-system knowledge base.

#### Accessibility Specialist (A11y)

- <a id="a11y-ph1"></a>**Phase 1 — Requirements (C):** uses AI checklists to review requirements and stories for accessibility coverage.
- <a id="a11y-ph4"></a>**Phase 4 — Testing (O):** runs AI-assisted accessibility audits and automated evaluation on the built product.

#### Enterprise Architect (EA)

- <a id="ea-ph0"></a>**Phase 0 — Discovery (O):** uses AI to scan the technology landscape and standards; context from the enterprise architecture knowledge base.
- <a id="ea-ph2"></a>**Phase 2 — Architecture (A):** approves AI-assisted architecture option analysis, with context from standards and strategy.
- <a id="ea-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed drift between the target and current architecture.

#### Solution Architect (SA)

- <a id="sa-ph2"></a>**Phase 2 — Architecture (O):** uses AI to draft solution designs and architecture decision records and to run trade-off analysis. This is core context engineering: the agent needs the domain knowledge base, existing designs and non-functional requirements in the window.
- <a id="sa-ph6"></a>**Phase 6 — Production (R):** reviews AI-analysed production telemetry against design assumptions.
- <a id="sa-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-drafted design impact assessments for maintenance changes.

#### Data / Platform Architect (DA)

- <a id="da-ph2"></a>**Phase 2 — Architecture (O):** uses AI to draft data models and pipeline designs; context from the data catalogue knowledge base.
- <a id="da-ph5"></a>**Phase 5 — Build & Release (R):** reviews AI-generated data quality reports in the release pipeline.
- <a id="da-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed schema and platform drift.

#### Tech Lead (TL)

- <a id="tl-ph2"></a>**Phase 2 — Architecture (O):** uses AI for technical design and interface contracts, grounding them in the knowledge base via context engineering.
- <a id="tl-ph3"></a>**Phase 3 — Development (O):** uses AI-assisted code review and enforces context engineering standards — skills, prompts and agent configs — for the squad.
- <a id="tl-ph4"></a>**Phase 4 — Testing (R):** reviews AI-analysed test coverage and eval results.
- <a id="tl-ph5"></a>**Phase 5 — Build & Release (R):** reviews AI-drafted release readiness and rollback assessments.
- <a id="tl-ph7"></a>**Phase 7 — Maintenance (O):** uses AI to analyse technical debt and plan refactoring from code and incident data.

#### Software Engineer (SWE)

- <a id="swe-ph3"></a>**Phase 3 — Development (O):** uses AI for coding, code generation and test writing. Context engineering is the difference between guessing and knowing: the agent needs specs, ADRs and the domain knowledge base in the window.
- <a id="swe-ph4"></a>**Phase 4 — Testing (C):** writes eval and regression tests alongside features.
- <a id="swe-ph5"></a>**Phase 5 — Build & Release (C):** contributes to CI fixes and pipeline tweaks.
- <a id="swe-ph7"></a>**Phase 7 — Maintenance (O):** uses AI-assisted refactoring and defect fixing with production context loaded from observability data.

#### Data Engineer (DE)

- <a id="de-ph3"></a>**Phase 3 — Development (O):** uses AI to write pipeline code and data-quality checks; context from the data model knowledge base.
- <a id="de-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed pipeline and data-quality drift.

#### ML / AI Engineer (ML)

- <a id="ml-ph0"></a>**Phase 0 — Discovery (C):** estimates feasibility of AI features from context engineering patterns and eval tooling.
- <a id="ml-ph3"></a>**Phase 3 — Development (O):** builds LLM features — prompts, retrieval, agents and evals. This persona is the context engineering specialist: context window design, retrieval pipelines, skills and eval gates.
- <a id="ml-ph6"></a>**Phase 6 — Production (O):** monitors model and prompt quality, drift and cost in production.
- <a id="ml-ph7"></a>**Phase 7 — Maintenance (O):** maintains eval regression suites and updates prompts and context as the domain evolves.

#### Database Administrator (DBA)

- <a id="dba-ph3"></a>**Phase 3 — Development (C):** uses AI-assisted SQL and migration script generation.
- <a id="dba-ph6"></a>**Phase 6 — Production (O):** uses AI to analyse performance telemetry and tune queries.
- <a id="dba-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed storage and performance trends.

#### QA Engineer (QA)

- <a id="qa-ph1"></a>**Phase 1 — Requirements (C):** uses AI to design test scenarios from requirements and acceptance criteria.
- <a id="qa-ph4"></a>**Phase 4 — Testing (O):** uses AI-assisted test case generation, exploratory testing and defect analysis; context from requirements and test data.
- <a id="qa-ph7"></a>**Phase 7 — Maintenance (C):** uses AI to analyse regression failures and update test coverage.

#### Test Automation Engineer (SDET)

- <a id="sdet-ph3"></a>**Phase 3 — Development (O):** uses AI to author and maintain automated tests across the test pyramid.
- <a id="sdet-ph4"></a>**Phase 4 — Testing (O):** runs eval and regression suites in CI and applies the [Testing LLM Outputs: Evals for Models, Agents, and Skills](/blog/ai/evals/) framework to guard non-deterministic features.
- <a id="sdet-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed flaky test and coverage trends.

#### DevOps / Platform Engineer (DevOps)

- <a id="devops-ph3"></a>**Phase 3 — Development (C):** builds AI-assisted developer tooling and local environments.
- <a id="devops-ph5"></a>**Phase 5 — Build & Release (O):** uses AI to author pipelines and infrastructure as code; context from the platform standards knowledge base.
- <a id="devops-ph6"></a>**Phase 6 — Production (C):** automates deployment telemetry and runs AI-drafted incident runbooks.

#### Site Reliability Engineer (SRE)

- <a id="sre-ph6"></a>**Phase 6 — Production (O):** uses AI for SLO and error budget analysis, anomaly detection, incident summarisation and blameless postmortems. Context from the runbook and incident knowledge base.
- <a id="sre-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed reliability trends and planned improvements.

#### Release Manager (RM)

- <a id="rm-ph5"></a>**Phase 5 — Build & Release (O):** uses AI for release planning, risk assessment and change summaries; context from the change history knowledge base.
- <a id="rm-ph6"></a>**Phase 6 — Production (R):** reviews AI-monitored deployment health during rollout windows.

#### Cloud / Infrastructure Engineer (Cloud)

- <a id="cloud-ph5"></a>**Phase 5 — Build & Release (O):** uses AI to generate infrastructure code and optimise cost; context from the cloud baseline knowledge base.
- <a id="cloud-ph6"></a>**Phase 6 — Production (R):** reviews AI-flagged capacity and cost anomalies.

#### Support Engineer (L1-L3)

- <a id="sup-ph6"></a>**Phase 6 — Production (O):** uses AI-assisted triage and semantic search over the knowledge base to resolve tickets faster; context engineering makes retrieval precise.
- <a id="sup-ph7"></a>**Phase 7 — Maintenance (C):** feeds AI-summarised incident learnings back into the backlog.

#### AppSec Engineer (AppSec)

- <a id="appsec-ph3"></a>**Phase 3 — Development (C):** uses AI for threat modelling and code-level security scanning during development.
- <a id="appsec-ph5"></a>**Phase 5 — Build & Release (O):** runs AI-assisted security gates in CI — SAST/DAST summarisation and dependency scanning.
- <a id="appsec-ph6"></a>**Phase 6 — Production (R):** reviews AI-analysed security events and vulnerability trends.

#### Security Architect (SecArch)

- <a id="secarch-ph2"></a>**Phase 2 — Architecture (A):** approves security design produced with AI-assisted threat modelling; context from the security standards knowledge base.
- <a id="secarch-ph6"></a>**Phase 6 — Production (R):** reviews AI-analysed security posture against the approved architecture.

#### GRC / Risk Analyst (GRC)

- <a id="grc-ph1"></a>**Phase 1 — Requirements (O):** uses AI to map controls to regulation (PCI DSS, SOC 2, GDPR) and analyse requirements for compliance gaps.
- <a id="grc-ph5"></a>**Phase 5 — Build & Release (A):** approves release compliance using AI-assisted audit evidence collection.
- <a id="grc-ph7"></a>**Phase 7 — Maintenance (O):** runs continuous compliance monitoring with AI-assisted control assessments.

#### Data Protection Officer (DPO)

- <a id="dpo-ph1"></a>**Phase 1 — Requirements (A):** approves AI-assisted privacy impact assessments and data inventory analysis.
- <a id="dpo-ph7"></a>**Phase 7 — Maintenance (R):** reviews AI-analysed data handling changes and breach learnings.

## References

**Books:**

- Beck, K. (1999). *Extreme Programming Explained*. Addison-Wesley.
- Beck, K. (2003). *Test-Driven Development: By Example*. Addison-Wesley.
- Beyer, B., Jones, C., Petoff, J. and Murphy, N. R. (eds) (2016). *Site Reliability Engineering*. O'Reilly.
- Boehm, B. (1981). *Software Engineering Economics*. Prentice Hall.
- Brooks, F. (1975). *The Mythical Man-Month*. Addison-Wesley.
- Cohn, M. (2009). *Succeeding with Agile*. Addison-Wesley.
- Evans, E. (2003). *Domain-Driven Design*. Addison-Wesley.
- Feathers, M. (2004). *Working Effectively with Legacy Code*. Prentice Hall.
- Forsgren, N., Humble, J. and Kim, G. (2018). *Accelerate*. IT Revolution Press.
- Fowler, M. (1999). *Refactoring*. Addison-Wesley.
- Gamma, E., Helm, R., Johnson, R. and Vlissides, J. (1994). *Design Patterns*. Addison-Wesley.
- Humble, J. and Farley, D. (2010). *Continuous Delivery*. Addison-Wesley.
- Hunt, A. and Thomas, D. (1999). *The Pragmatic Programmer*. Addison-Wesley.
- Kim, G., Humble, J., Debois, P. and Willis, J. (2016). *The DevOps Handbook*. IT Revolution Press.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly.
- Martin, R. C. (2008). *Clean Code*. Prentice Hall.
- Martin, R. C. (2017). *Clean Architecture*. Prentice Hall.
- McConnell, S. (2004). *Code Complete* (2nd ed). Microsoft Press.
- Nygard, M. T. (2007). *Release It!*. Pragmatic Bookshelf.
- PMI (2021). *PMBOK Guide* (7th ed). Project Management Institute.
- Pressman, R. and Maxim, B. (2020). *Software Engineering: A Practitioner's Approach* (9th ed). McGraw-Hill.
- Ries, E. (2011). *The Lean Startup*. Crown Business.
- Skelton, M. and Pais, M. (2019). *Team Topologies: Organizing Business and Technology Teams for Fast Flow*. IT Revolution Press.
- Sommerville, I. (2016). *Software Engineering* (10th ed). Pearson.
- Schwaber, K. and Sutherland, J. *The Scrum Guide*.

**Standards and frameworks:**

- ISO/IEC/IEEE 12207:2017. *Software life cycle processes*.
- ISO/IEC/IEEE 29148. *Requirements engineering*.
- IEEE 1219. *Software maintenance*.
- ISO/IEC 27001. *Information security management*.
- CMMI-DEV. *Capability Maturity Model Integration for Development*.
- ITIL 4 Foundation (AXELOS, 2019).
- ISTQB Certified Tester Foundation Level syllabus.
- OWASP Top 10 and OWASP Application Security Verification Standard (ASVS).
- PCI DSS, SOC 2 (AICPA) and GDPR (EU 2016/679).

**Online references:**

- Agile Manifesto (2001). agilemanifesto.org.
- Fowler, M. (2006). *Continuous Integration*. martinfowler.com.
- North, D. (2006). *Introducing BDD*.
- Wake, B. (2003). *INVEST in Good Stories, and SMART Tasks*.
- Wiggins, A. (2011). *Twelve-Factor App*. 12factor.net.
- *Principles of Chaos Engineering* (2017). principlesofchaos.org.



