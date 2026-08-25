## AI and Context Engineering Usage by Persona and Stage

This matrix maps every persona to the software development phases from the [lifecycle section](#the-software-development-lifecycle) and describes how they apply AI and context engineering in each. The underlying concepts — context windows, knowledge bases, skills, agents, prompts and evals — come from the [Context Engineering](/blog/ai/context-engineering/) post.

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

- <a id="po-ph1"></a>**Phase 1 — Requirements (O):** writes user stories and acceptance criteria with AI assistance, following spec-driven development practices; context comes from domain rules in the knowledge base.
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
- <a id="sdet-ph4"></a>**Phase 4 — Testing (O):** runs eval and regression suites in CI and applies eval frameworks (for example OpenAI Evals: https://github.com/openai/evals) to guard non-deterministic features.
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

## Personas and Operating Modes

The matrix codes (O, R, C, A) describe involvement, but AI-DLC adds a second dimension: how much autonomy each persona grants the AI. Mapping the codes to the operating modes from the [AI-DLC section](#ai-assisted-software-development-and-the-ai-dlc) gives a rough pattern:

| Mode | Personas (by dominant involvement) | Why |
|---|---|---|
| HITL — approve before it advances | Enterprise Architect, Security Architect, GRC, DPO, AppSec, Release Manager | These personas own the A cells and the release gates. The agent must pause, present evidence and wait for a decision at every checkpoint |
| OHOTL — observe and redirect | PM, PO, BA, Solution Architect, Data Architect, Tech Lead, UX Researcher, UX Designer, QA, SRE, Support Engineer | These personas review judgement-heavy output: requirements, designs, UX, test strategy and incidents. They want real-time visibility and the power to intervene without blocking everything |
| AHOTL — autonomous within gates | SWE, SDET, Data Engineer, Database Administrator, ML/AI Engineer, DevOps, Cloud Engineer | These personas produce and maintain mechanical, verifiable work. Precise completion criteria and quality gates let the agent iterate without hand-holding, and the human reviews the result |

Two things matter here. First, the mode is a property of the work and its risk, not of the persona: a Software Engineer writing authentication is HITL, while the same engineer refactoring a well-tested utility is AHOTL. Second, autonomy is earned — teams move work from HITL to AHOTL only as requirements stabilise, quality gates prove themselves and trust is earned, which is exactly the escalation rule from the [AI-DLC section](#ai-assisted-software-development-and-the-ai-dlc).

