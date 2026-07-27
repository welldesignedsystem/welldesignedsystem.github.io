+++
date = '2024-07-08T12:00:00+10:00'
draft = false
title = 'Context Engineering: Why AI Projects Fail and How We Approached It'
tags = ['Context Engineering', 'LLM', 'AI Agents', 'Preso']
summary = "80% of AI projects fail. Here's why context mismanagement is the root cause, and how we approached context engineering in practice."
+++

## Introduction
- Imagine few years ago one of your developers copy pasting a line of code from Stackoverflow without understanding it - that goes to production. You give access to AI and the same developer can push the entire domain full of code into production without understanding a single line of it. Yet solution is not to stop using AI.
- I will try to give a 30,000 ft view of how Fintech approached this problem without being a bottleneck.
- Since Last year there has been a lot of push from within Industry and Org to adopt AI tools and LLM models:
  - **Gartner Hype Cycle**: Its very much possible 
    - we are approaching the **Peak of Inflated Expectations**. When an organisation hits the **Trough of Disillusionment** they start questioning a lot of things:
    - ![Gartner Hype Cycle](../img/Hype-Cycle-General.png)
    - **Cost governance** — models are expensive, what is the ROI. 
  - **Quality control** — how do you measure and control quality - by now you must be knowing that LLM output is non-deterministic (same input can yield different output) and every team uses different tools, how do you measure success how do you consistently reproduce it, how do you not repeat failures?
  - **Reviewer scaling** — you can produce PRs at scale with AI, how do you get the revieweres to keep up?
  - **Measuring the new velocity** — how do you measure the new velocity AI enables? if you don't - Parkinson's Law takes over: work expands to fill the time available. So, if you don't recalibrate expectations, the work still takes the same time.
  - **Compounding stochasticity** - Stochasticity is the quality of lacking a predictable pattern, where outcomes are governed by probability rather than deterministic rules. Each agent layer adds variance. A 95%-reliable single step becomes 60% reliable across ten steps. 
  - **Skill discoverability** — The Company's prompt library has 200+ skills. Which 5 are relevant to your project? Without discoverability, the library is noise.
  - **Ambiguity** — A lot of inaccuracies are caused due to models making reasonable assumptions based on training data - to fill gaps introduced by engineers. Inaccurate content is almost always an ambiguity problem. How do you make context explicit?
  - **Standardisation at scale** — even if you solve quality, how do you get teams to speak the same language? Make skills reusable? Make success reproducible? That's not a prompt problem — it's a system design problem.
  - **Engineer competence gap** — you are going to enable hundreds of engineers to generate code they barely understand, at scale. How do you prevent the gap between generation speed and comprehension from becoming a liability?
  - **Rollback / incident response** — a bad context change or skill update breaks production. What's the rollback plan? How do you run incident response for AI-generated failures?
  - **The Planning Fallacy**: teams underestimated time, cost, and risk while overestimating the benefits.
  - I am in the industry for long enough and seen many examples: EJB, SOAP web services, Cloud Computing, Microservices, NoSQL, Big Data / Hadoop, Block Chain/Crypto
     - **Microservices** — decompose everything. Hit distributed system costs, consistency issues, latency, availability issues. 
     - Spring Framework Reality is **Thinker vs Doer** - the nice term to this is framework being **opinionated**.
     - **NoSQL** — "SQL is dead". ACID got replaced with Bascially Available Soft State Eventualy Consistent. Hit missing transactions. Settled on polyglot persistence.
 - Situation: Imagine a busy town where there are no motor vehicles and hence no road rules set. You want your people who have basic understanding of how car operates to start driving cars. 
 - Question is it this relevant to you: Answer is no, if you are not using AI.

## Part 1: What Is Context Engineering
- Prompt Engineering is **how you talk to AI** — wording, examples, formatting, tone.
- Context Engineering is the difference between **AI that is having to make guesses** and **AI that knows fully** how to do something.
- it involves **assembling a lot of things** in the **context window** or the **working memory**. 
- is it really Engineering? is it not writing a document - It's bit more complicated than that. 
- Engineering is the application of **scientific and mathematical principles** to design, build, analyze, and **maintain** **systems** and processes that solve practical problems.

### Just writing documents v/s Actual Engineering?

| Element | [Prompt Engineering](https://www.engineering.com/is-prompt-engineering-really-engineering/) | Context Engineering |
|---|---|---|
| Scientific principles | Empirical trial-and-error, no formal theory | follows Cognitive science memory taxonomy, attention mechanism research, context rot studies,  Working, Episodic, Semantic, Procedural Memory |
| Mathematical principles | No quantifiable design constraints | Compounding stochasticity (0.95^10 = 0.60), token budget math, eval scoring |
| Design | Crafting individual instructions | Memory architecture (WESP), implementation layers, tiered hierarchy |
| Build | Writing prompts | Knowledge bases, agent configs, MCP servers, eval frameworks, hooks |
| Analyze | Manual testing | Token consumption metrics, eval scores, failure mode analysis |
| Maintain | No maintenance cycle | Confluence sync, version/release strategy, feedback loops, regression gates |
| Systems | Single artifact, no state | Multi-layered memory with isolation boundaries, tool scoping, retrieval pipelines |
| Processes | No process framework | AI-DLC gating, review workflows, quality baselines, rollback procedures |

### Implementation Layers

- They are the different sources of context an AI system uses.
- Each layer has a different purpose: fixed rules, retrieved knowledge, recent conversation, or live tool output.
- They help the system decide what to keep in the prompt and what to fetch on demand.
- They reduce errors by avoiding overload, stale context, or irrelevant information.
- They make context engineering systematic instead of just writing one big prompt.


### Context Components

| Component | Layer | Description |
|-----------|-------|--------------|
| Prompt files (.prompt.md) | Static | Versioned prompt templates stored in repo, loaded on demand |
| Instructions | Static | System prompts, rules, and guidelines that define behavior |
| Schemas | Static | Structured formats for data exchange and validation |
| Plugins | Static | Extensions adding functionality to the system, configured ahead of time |
| Retrieved documents (RAG) | Dynamic | Documents fetched based on the current query or task |
| User input | Dynamic | Task description, follow-ups, and clarifications supplied mid-session |
| Skills | Procedural | Bundled instructions, lazy-loaded on demand when a task matches |
| Agents / subagents | Scoped | Isolated context windows with specific tool access for particular tasks |
| MCP tool definitions | Scoped | Available tools/servers, scoped per task to control token budget |
| Tool outputs | Runtime | Results returned from tool calls in the current session |
| Hooks | Runtime | Pre/post tool call enforcers that machine-enforce invariants |
| Conversational history | Episodic | Session-specific conversation state (what happened in this session) |
| Knowledge Base | Semantic | Long-term knowledge: designs, specs, ADRs, domain rules |
| Workflows / procedures | Procedural | How-to knowledge: step-by-step processes, decision trees |

Context engineering involves loading from different data dynamically, in the right order, at the right size, with irrelevant stuff filtered out. Context engineering addresses all of these by managing the entire state. Remember the state is like your attention span - you don't want to put too little (it will make assumptions) or too much (context rot in other words the answer is buried somewhere in the haystack) it will not fetch the relevant information.

## Part 2: Why LLM-Based AI Projects Fail

- **The Magic Demo Problem** — a POC proves the technology works in a sandbox. It does not prove the system works at scale with real data, real volume, real adversaries, and real edge cases. Every prompt library story follows the same arc: a clean demo → production collapse → rule explosion → context bloat → cost spike → abandonment.
- Amazon's "bias for action"/"two way door" is useful for disproving something: it tells you what can fail early. But success in a POC does not prove the result will hold at scale. In AI, a clean demo tells you nothing about production.
- Review-time quality perception is decoupled from production outcomes — code looks good, passes review, then breaks in production. 
- The root cause is consistent: agents lack architectural and domain context, and human review cannot scale to catch what the agent did not know. 
- Context engineering is the only intervention that addresses the root cause rather than the symptom.

### Governing Principles:

- **Context completeness** — when a prompt lacks full context, the model fills the gaps with assumptions drawn from its training data, not from your codebase, domain, or requirements. Those assumptions are reasonable in isolation but wrong in practice. Context engineering treats completeness as a first-class property: every piece of information the model needs to produce a correct answer must be explicitly in the window, not implied.
- **Systems design** — producing code at scale demands the same rigor as any software system: strong fundamentals, unambiguous specifications, well-chosen design patterns, and a clear architecture. Context must be complete, disambiguated and structured with the same discipline as the code it generates.
- **Testable outcomes** — you can measure token consumption, eval scores, regression gates. You can A/B test context configurations and gate merges when scores drop ([see eval layer](../ai-outputs-eval/)).
- **Compounding stochasticity** — every agent layer introduces non-determinism: sampling variance, context boundaries, tool selection entropy. Stack three layers and the output distribution widens dramatically. A layered Pyramid approach - the mix explicitly acknowledges you can't fully eliminate non-determinism, but the pyramid's shape (wide/cheap base, narrow/expensive tip) compresses it into a manageable band. ~60% deterministic, 30% model-graded, 10% human-in-the-loop 
- **Scope boundaries** — prompt engineering should be restricted to cases where the session already has enough context to accommodate the prompt. If the prompt needs to retrieve, compose, or disambiguate context before it can be answered, that is context engineering's responsibility. The boundary is simple: can the model answer this correctly with nothing but the prompt, or does it need additional context loaded first?
- **Context sizing** — every token depletes the model's attention budget. Context engineering decides how much context to load, when, and in what order — not by guesswork, but by measuring token consumption and eval scores per configuration. Too little context and the model lacks information; too much and relevant signals drown in noise.
- **Context isolation** — when multiple agents, skills, or tools share a session, their context must be kept separate. A fraud detection agent should not inherit context from a collections agent. Context engineering provides isolation boundaries — subagents with clean windows, scoped tool availability, and structured handoffs that prevent cross-contamination ([Anthropic, Sep 2025](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).
- **Progressive disclosure** — not all context belongs in the window at once. The right pattern is to load coarse context first (role, goals, constraints), then reveal finer-grained context on demand as the agent navigates toward a specific task. Skills, MCP tools, and retrieval-augmented prompts are the mechanism; deciding the order and granularity is the engineering ([Karpathy, 2025](https://x.com/karpathy/status/1937902205765607626)).
