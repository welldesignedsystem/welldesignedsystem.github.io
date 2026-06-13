+++
date = '2025-06-13T12:00:00+10:00'
draft = false
title = 'Commando Strategies — Rapid Action Force Playbook'
tags = ['Strategy', 'Teamwork', 'Leadership', 'Agility', 'Operations']
summary = "A field-tested playbook drawn from the world's best special operations teams, adapted for software teams, startups and any environment demanding speed under uncertainty."
+++

## Why Commandos?

The world's best commando teams — Navy SEALs (US), SAS (UK), Para (SF) (India), MARCOS (India), Sayeret Matkal (Israel), KSK (Germany) — operate in environments defined by uncertainty, limited information, high stakes and extreme time pressure. Their survival depends on speed, precision and adaptability.

Software teams face the same conditions: ambiguous requirements, changing markets, production incidents and technical debt compounding by the day. The difference is that a commando team's playbook is battle-tested over decades. Borrowing it gives you a shortcut to high-performance execution.

What follows is not a tribute to military culture. It is a distillation of operational principles that transfer directly to any team that needs to move fast without breaking things.

---

## The Playbook

### 1. The OODA Loop — Speed Through Constant Reassessment

**Origin:** USAF Colonel John Boyd — adopted by Navy SEALs (US), Para (SF) (India), and virtually every modern special operations unit.

The OODA loop (Observe, Orient, Decide, Act) is the foundation of all rapid-action decision-making. The team that completes the loop fastest wins.

| Phase | Commando | Software |
|-------|----------|----------|
| **Observe** | Recon, intel feed, spotter report | Monitoring, logs, user feedback, metrics |
| **Orient** | Map terrain, assess threats, check ROE | Triage severity, assess blast radius, check runbook |
| **Decide** | Commander designates target + method | Assign DRI, choose mitigation strategy (rollback, feature flag, hotfix) |
| **Act** | Execute breach / assault / extract | Deploy fix, toggle flag, revert commit |

**Applicable law / principle:** *Pareto Principle (80/20 Rule)* — 80% of incident impact is resolved in the first 20% of the OODA cycle. Obsessing over a perfect decision in Orient wastes time. Act fast, then re-observe.

**Application:** During an incident, do not spend 20 minutes diagnosing. Observe (what changed?), Orient (find the last good state), Decide (rollback or hotfix?), Act (do it). The entire loop should take minutes, not hours.

---

### 2. Mission Command — Commander's Intent over Micromanagement

**Origin:** German *Auftragstaktik* doctrine — adopted by SAS (UK), Para (SF) (India), and modern special forces worldwide.

**Indian equivalent:** Para (SF) operates on the same principle — battalion command sets the strategic objective, patrol leaders decide tactical execution. This is why Indian SF units can operate deep behind enemy lines with minimal communication.

Commando teams operate on **mission command**: leadership communicates the *intent* and the *why*, then leaves execution to the team on the ground. No one in the middle of a firefight has time to call back for approval.

**Applicable law / principle:** *Conway's Law* — system design mirrors the communication structure. If your approval chain is six levels deep, your response time will match.

**Software application:**

- Every task gets a clear **commander's intent**: "Fix checkout latency — we're losing conversions. Target is p95 under 200ms. You choose the approach."
- The team member owns *how*; leadership owns *what* and *why*.
- If you need approval for implementation details mid-sprint, you do not have mission command. You have bureaucracy.

---

### 3. Redundancy and Cross-Training (No Single Point of Failure)

**Origin:** Universal principle across all special forces. SAS (UK) pioneered the 4-man patrol where each operator cross-trains in at least one secondary role. **Para (SF) (India)** trains every operator on multiple weapon systems and communication protocols.

A commando team does not have irreplaceable members. If the breacher goes down, the assaulter picks up the breaching charge.

**Applicable law / principle:** *Murphy's Law* — anything that can go wrong will. If only one person knows how to deploy, that person *will* be on leave when production goes down. *Designed redundancy* is the only defence against *inevitable failure*.

**Software application:**

| Area | Failure Mode | Cross-Training |
|------|-------------|----------------|
| Code ownership | Bus factor | Rotate code review assignments, pair programming |
| Infrastructure | Only one person knows the deploy pipeline | Infrastructure as code, documented runbooks, rotation |
| Domain knowledge | One SME holds tribal knowledge | Internal talks, documentation sprints, shadowing |
| On-call | Single responder burns out | Rotation with structured handoff, secondary escalations |

**Rule of thumb:** If a team member's absence would block a deploy, that knowledge is not yet shared well enough.

---

### 4. The After-Action Review — Feedback Loops That Stick

**Origin:** US Army-developed AAR format — used by Delta Force (US), NSG (India), SAS (UK), and all modern special forces after every mission.

**Indian equivalent:** NSG Black Cats run structured post-operation debriefs after every counter-terrorism mission. The AAR is non-negotiable regardless of outcome — success or failure, you debrief.

After every operation, commando teams run an **After-Action Review (AAR)**. Not a blame session — a structured debrief that produces concrete changes.

Three questions:
1. **What was supposed to happen?** (Plan)
2. **What actually happened?** (Reality)
3. **What will we do differently next time?** (Improvement)

**Applicable law / principle:** *Goodhart's Law* — "When a measure becomes a target, it ceases to be a good measure." If your AAR is graded only on uptime, teams will hide near-misses. Keep the AAR blameless or lose the signal.

**Software application:** Run an AAR after every incident, every sprint, every major release. Keep it blameless. The output must be *actionable* — specific process changes, runbook updates, or tooling improvements — not generic "communicate better" resolutions.

---

### 5. Gear Specialisation — Right Tool, Right Moment

**Origin:** SAS (UK) is known for this philosophy — operators personally select their weapons and equipment based on mission profile. **MARCOS (India)** follows the same approach: maritime ops use different gear than jungle warfare, even though the same operators perform both.

Commandos select their gear for the specific mission. They do not bring a breaching shotgun to a reconnaissance op. They also train on their gear until it is muscle memory — there is no learning during the mission.

**Applicable law / principle:** *Law of the Instrument (Maslow's Hammer)* — "If all you have is a hammer, everything looks like a nail." If your organisation knows only one tech stack, every problem gets force-fitted into it. Specialisation means knowing *when* to use each tool, not knowing only one.

**Software application:**

- Choose the tool for the problem, not the resume. Do not default to Kubernetes for a 3-person startup or Postgres for time-series metrics.
- Invest in tooling proficiency before the crisis. Chaos engineering drills, game days and incident simulations build the muscle memory that makes calm, fast responses possible.
- Standardise where it matters, vary where it does not. Every commando unit has standard comms gear but mission-specific weapons. Every software team should have a standard CI/CD pipeline but project-specific architecture choices.

---

### 6. Schnellzeit (Speed of Execution) — The Bias Toward Action

**Origin:** German KSK (*Kommando Spezialkräfte*). *Schnellzeit* is the ability to execute faster than the enemy can react — achieved through preparation, not adrenaline.

**Indian equivalent:** NSG's "Black Cat" commandos are trained for 30-second room-clearance drills. The speed comes from rehearsing the same entry sequence hundreds of times until it is automatic — exactly what incident playbooks should achieve.

Speed is not recklessness; speed is the product of preparation, clarity and trust.

**Applicable law / principle:** *Hofstadter's Law* — "It always takes longer than you expect, even when you take into account Hofstadter's Law." The antidote is preparation: rehearse the routine responses so that the common case is instant, leaving brain cycles for the unexpected.

**Software application:**

- **Deploy frequency is a health metric.** If you cannot deploy on-demand, your speed of execution is zero.
- **Shorten every feedback loop.** Code review within hours, not days. Test feedback in seconds, not minutes. Incident alert to response in minutes.
- **Pre-authorise the routine.** Teams should not need permission for standard deploys, routine dependency updates, or scaling changes. Save approvals for high-risk decisions.

---

### 7. The Four-Box Method — Rapid Decision Under Pressure

**Origin:** Derived from Eisenhower's Urgent/Important matrix — adapted by US Army Rangers and **Para (SF) (India)** for tactical decision-making under fire.

Commandos use a simple decision framework when time is short:

| | Known | Unknown |
|--|-------|---------|
| **Urgent** | Execute plan | Improvise + fallback |
| **Not urgent** | Delegate / schedule | Investigate + prepare |

**Applicable law / principle:** *Occam's Razor* — the simplest explanation is most likely. In the Unknown/Urgent cell, do not imagine complex root causes before ruling out the obvious (misconfigurations, deployments, expired certs).

**Software application:** When an incident hits, classify it immediately:
- **Known + Urgent** — Run the playbook, no thinking required.
- **Unknown + Urgent** — Fall back to safe state (rollback, feature flag off, redirect traffic), then investigate.
- **Known + Not urgent** — Schedule in the backlog.
- **Unknown + Not urgent** — Investigate in a spike, write a runbook, prepare for next time.

---

### 8. Small Teams, Big Autonomy

**Origin:** SAS (UK) pioneered the 4-man patrol concept. **Para (SF) (India)** mirrors this — a standard SF patrol is 4–6 operators. Every member is cross-trained, trusted and expected to act independently.

**Indian parallel:** India's *Ghatak* platoons (specialist assault platoons within regular infantry battalions) are structured as independent 8–10 person units with their own fire support and communication capability — a mini autonomous team.

Commando teams are small by design — typically 4–12 operators. Every member is a force multiplier. There is no room for passengers.

**Applicable law / principle:** *Dunbar's Number* — humans maintain stable relationships with about 150 people. Team cohesion breaks past ~12. Keep teams small enough that every member genuinely knows every other's strengths and weaknesses.

**Software application:**

- **Two-pizza rule** (Jeff Bezos): If a team cannot be fed with two pizzas, it is too large. Break it apart.
- **End-to-end ownership**: Each team owns a full capability (not a layer). The commando team does not call in a separate logistics unit mid-mission; your API team should not need another team to deploy their service.
- **High bar, high trust**: Hire slowly, vet carefully, then trust fully. Micromanagement is the opposite of rapid action.

---

### 9. The Pre-Mortem — Anticipate Failure Before It Happens

**Origin:** Developed by cognitive psychologist Gary Klein — adopted by US Navy SEALs and Israeli **Sayeret Matkal**. Israeli special forces are known for obsessive back-briefing: every operator voices what could go wrong before the mission, no matter how unlikely.

**Indian equivalent:** Para (SF) conducts *Op Orders* (Operation Orders) where every section commander must identify risks and propose contingencies. Silence is not consent — if you did not speak up in the briefing, you own the outcome.

Special forces run **back-briefs** and **rehearsals** where every operator voices what could go wrong. This is not pessimism — it is preparation.

**Applicable law / principle:** *Chesterton's Fence* — do not remove something unless you understand why it was put there. The pre-mortem asks the reverse: "Assume this *will* break. What broke it?" That question reveals hidden dependencies you would not discover otherwise.

**Software application:** Before a major deploy or feature launch, gather the team and ask: *"Assume it is six months from now and this project failed catastrophically. What went wrong?"*

List every failure mode, then address the top three before proceeding. Common answers: missing rollback plan, overlooked dependency, untested failure path, capacity under-estimated.

---

### 10. After-Action Breathing — Recovery Is Part of Execution

**Origin:** Navy SEALs (US) explicitly train recovery cycles between high-intensity operations. Sayeret Matkal (Israel) and MARCOS (India) follow the same rhythm: operate, recover, debrief, train, operate again.

**Indian parallel:** MARCOS training includes structured rest periods between gruelling 72-hour survival exercises — the recovery is part of the curriculum, not an afterthought.

Commandos do not run continuous operations indefinitely. After a high-intensity mission, there is structured recovery: rest, resupply, AAR, retraining.

**Applicable law / principle:** *Second Law of Thermodynamics (Entropy)* — systems naturally decay into disorder. Without recovery cycles, your team's cognitive order decays into burnout, sloppy decisions and technical debt. Recovery is the work of maintaining order.

**Software application:**
- After an incident, protect the team from immediate new work. Give recovery time.
- After a crunch period, schedule a low-intensity sprint for cleanup, debt reduction and tooling improvements.
- Burnout is not a badge of honour — it is operational failure. A burned-out team cannot react to anything.

---

## Quick Reference

| # | Principle | Origin / Force | Applicable Law / Principle |
|---|-----------|----------------|---------------------------|
| 1 | OODA Loop | US Air Force (Boyd), adopted by Navy SEALs, Para (SF) | Pareto Principle (80/20) |
| 2 | Mission Command | German *Auftragstaktik*, SAS, Para (SF) | Conway's Law |
| 3 | Cross-Training | Universal — SAS, Para (SF), MARCOS | Murphy's Law |
| 4 | After-Action Review | US Army, Delta Force, NSG | Goodhart's Law |
| 5 | Gear Specialisation | SAS, MARCOS | Law of the Instrument (Maslow's Hammer) |
| 6 | Schnellzeit | German KSK, NSG | Hofstadter's Law |
| 7 | Four-Box Method | US Army Rangers, Para (SF) | Occam's Razor |
| 8 | Small Teams | SAS 4-man patrol, Para (SF), Ghatak | Dunbar's Number |
| 9 | Pre-Mortem | US Navy SEALs, Sayeret Matkal, Para (SF) | Chesterton's Fence |
| 10 | Recovery | Navy SEALs, Sayeret Matkal, MARCOS | Second Law of Thermodynamics (Entropy) |
