+++
date = '2026-08-25T09:05:00+10:00'
draft = false
title = 'Software Development Personas at Telly'
tags = ['Fintech','Telly','Personas','Roles']
summary = "Every Fintech persona at Telly, mapped across the SDLC."
+++

## Introduction

This post is part two of a series on software engineering in Telly's fintech domain. It outlines the roles and contributions of each persona in the delivery organisation; companion posts cover the [lifecycle](/blog/ai/fintech/software-development-lifecycle/) they work within and the [AI-DLC](/blog/ai/fintech/ai-dlc/) practices reshaping it.

## Software Development Personas at Telly


The personas below are the standard roles found in modern software development organisations, the exact titles and boundaries differ between teams. In reality one person may often wear several hats.

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
