+++
date = '2025-06-25T12:00:00+10:00'
draft = false
title = 'Reverse Engineering Principles'
tags = ['Reverse Engineering', 'Legacy Code', 'System Design', 'Architecture', 'AI Tools', 'Migration']
summary = "A practitioner's guide to reverse engineering existing systems — the principles, the techniques that prove accuracy, and how AI tools are changing the game."
+++

## Introduction

Reverse engineering an existing system is one of the hardest problems in software engineering. You inherit a codebase with no tests, no docs, and six authors who left three years ago. The system works — nobody knows quite how — and you're asked to extend it, migrate it, or prove it's correct.

This post covers the industrial canon on reverse engineering: the books, the principles, the techniques that actually prove you've understood something correctly. Then it looks at where AI tools fit in 2025 — what they're good at, where they still fail, and how to build an automated accuracy-measurement loop.

---

## Part 1: The Canon — Books That Define the Practice

A small set of books forms the bedrock. Every practitioner should know them.

### Working Effectively with Legacy Code (Feathers, 2004)

The foundational text. Feathers defines legacy code as _code without tests_ — a pragmatic framing that flips the problem from "understand the system" to "make the system testable so you can understand it safely." Core contributions:

- **Characterization tests** — write tests that capture current behavior before you change anything. These tests document what the system _actually does_, which may differ from what it _should do_. They become your regression suite.
- **Seams** — places where you can change behavior without editing the code in that place. Every seam is a tool: preprocessor seams, link seams, object seams, and the most practical, _override seams_ (subclass and override a method in a test).
- **The legacy code change algorithm** — a step-by-step procedure: identify change points, find test points, break dependencies, write characterization tests, make the change, and refactor.
- **Dependency breaking techniques** — 30+ specific mechanical refactorings (Extract Interface, Parameterize Constructor, Extract and Override Call) for when code is too tangled to test in-place.

### Refactoring: Improving the Design of Existing Code (Fowler, 2nd ed. 2018)

Fowler's catalog of refactorings is the vocabulary for changing code safely. For reverse engineering, the relevant parts are:

- **Refactoring as understanding** — Fowler explicitly frames refactoring as a discovery process: rename variables when you figure out what they mean, extract methods when you grok a block, move fields when you see the data boundary. Each refactoring encodes a unit of understanding.
- **Self-testing code** — refactoring requires tests. Fowler's "three strikes and you refactor" rule only works when you have a safety net.
- **Composing methods** — Extract Method, Inline Method, Split Temporary Variable, Replace Temp with Query. These are the mechanical moves that turn confusion into clarity as you understand what the code does.

### The Programmer's Brain (Hermans, 2021)

Hermans applies cognitive science to the problem of reading and understanding code. For reverse engineering, the key insights:

- **Cognitive load theory** — reading code exhausts working memory. You understand a 20-line function easily and a 200-line one poorly not because the 200-line function is necessarily more complex, but because your brain can't hold all the pieces at once. Strategies: trace execution on paper, draw state diagrams, use a debugger to reduce the load.
- **Chunking** — experts don't read code line by line. They recognize patterns (chunks) and reason about the chunk, not the lines. Building chunk libraries is how you get faster at understanding unknown systems.
- **Beacons** — distinctive code patterns that signal intent. A variable named `mutex` tells you concurrency is involved before you read the logic. Missing beacons (no naming signals) make code harder to understand even if it's structurally simple.
- **The two-stage model of code comprehension** — first you build a model of what the code does (a mental simulation), then you build a model of why it does it (intent, domain, constraints). Reverse engineering that stops at "what" without reaching "why" produces migration code that replicates bugs.

### Code Reading: The Open Source Perspective (Spinellis, 2003)

Spinellis treats reading code as a skill separable from writing it. His strategies are directly applicable to reverse engineering:

- **Top-down reading** — start with the big picture (documentation, file structure, build system, interfaces), then drill into specifics. The opposite of how most developers read code (bottom-up from the bug).
- **Bottom-up reading** — start from a specific function and build understanding outward through call graphs.
- **Systematic reading techniques** — checklist-based reading, perspective-based reading (read as a tester, as a maintainer, as a security auditor), stepwise abstraction.
- **Tools for code reading** — ctags, cscope, grep, graphers (call graph, inheritance graph, dependency graph). The principles are timeless even if the tools evolve.

### Software Architecture: The Hard Parts (Ford, Richards, Sadalage, 2022)

Not about reverse engineering directly, but about _making decisions_ when there is no perfect answer — which is the position you're always in when reverse engineering a system. Relevant contributions:

- **The trade-off analysis** — every architecture decision has trade-offs. Reverse engineering must surface the trade-offs the original authors made (knowingly or not) before you evaluate whether to change them.
- **Architecture quantifiability** — how to measure properties of an existing architecture (coupling, cohesion, scalability) and compare them to alternatives. Relevant when deciding whether to migrate.
- **Evolutionary architecture** — the idea that architecture is not a upfront design but an ongoing process. Reverse engineering is the first step of evolutionary architecture in an existing system.

---

## Part 2: Principles of Reverse Engineering

### Principle 1: Understand Before You Change

The most violated principle in the industry. Every "quick fix" that made things worse started from an incomplete understanding. Feathers' legacy code change algorithm enforces this: write a characterization test before touching the code. If you can't write a test, you don't understand the behavior well enough to change it safely.

### Principle 2: Prove Understanding Through Automated Checks

Understanding is not a feeling. It's a measurable property — you have understood a piece of code when you can write a test that captures its behavior and passes. Characterization tests, golden masters, and property-based invariants are the measurement instruments. Without them, "I understand this code" is a confidence statement backed by no evidence.

### Principle 3: Follow the Dependency Structure

Always map dependencies before drilling into details. The dependency graph of a system reveals its natural decomposition, the hidden coupling, and the seams where you can insert tests or new behavior. Tools like `depcruise` (JavaScript), `jdeps` (Java), or `gvpr`-based graph analysis are worth running before you read a single line of business logic.

### Principle 4: Seek Intent, Not Just Mechanics

A compiler can tell you what code _does_. It can't tell you what the author _meant_. Reverse engineering that reproduces behavior without capturing intent replicates bugs, preserves accidental complexity, and produces a new system that's equally hard to understand. The question to keep asking: why does this work this way?

### Principle 5: Prefer Observation Over Static Analysis

Call graphs and type hierarchies tell you what _can_ happen. Production traces, logs, and debugger sessions tell you what _does_ happen. The gap between the two is where most misunderstandings live. W. Richard Stevens' TCP/IP Illustrated approach — observe the system in action before reasoning about its design — applies to codebases as much as protocols.

---

## Part 3: Proven Ways to Prove Accuracy

These techniques produce verifiable evidence that your understanding matches the system. They are the backbone of any trustworthy reverse engineering effort.

### Characterization Tests (Feathers)

The single most effective technique. Write a test that calls a function with a specific input, records the output, and asserts that future runs produce the same output. You don't need to know if the output is _correct_ — only that you capture what the system _currently does_. Once captured, you can reason about whether that behavior is correct.

```
# A characterization test for a pricing function
def test_pricing_captures_current_behavior():
    result = calculate_price(quantity=10, discount_code="SUMMER")
    # This assertion captures current behavior, not necessarily correct behavior
    assert result == 147.50
```

The act of writing characterization tests forces you to understand every path through the code. If you can't write one, you've found a dependency that needs breaking.

### Golden Master (Approval Testing)

For functions that produce complex output (HTML, PDF, reports), serialize the output to a file and commit it to the project as the "golden master." Changes to the output show up as diffs in the golden master, which you review to determine if they're intentional.

Tools like `pytest-snapshot`, `approvaltests`, or Jest snapshots implement this pattern. The discipline is: never accept a golden master diff you haven't manually verified.

### Property-Based Testing

Instead of asserting specific outputs, assert invariants that must hold for every input. This is the most powerful technique for confirming you understand the semantic constraints of a system.

```
# Property: the pricing function never returns a negative total
@given(st.floats(min_value=1, max_value=1000), st.text())
def test_price_is_non_negative(quantity, discount_code):
    result = calculate_price(quantity=quantity, discount_code=discount_code)
    assert result.total >= 0
```

Hypothesis (Python), QuickCheck (Haskell/Erlang), and jqwik (Java) are the standard tools. Property-based tests find edge cases that characterization tests miss — and in doing so, reveal the boundaries of your understanding.

### Dep Graph Analysis with Structural Validation

Generate a dependency graph from the codebase and validate it against your mental model. If you think module A depends on B but the graph shows A depending on C through B, your understanding is wrong at the structural level.

Tools: `depcruise`, `pyright --dependencies`, `jdeps`, `pahole` for C struct analysis. Run them before and after any change to verify the dependency structure hasn't shifted unexpectedly.

### Trace Analysis

Instrument the production system (or a staging mirror) and collect real execution traces. Compare the actual execution paths against expected behavior from documentation or interviews.

For distributed systems: distributed tracing with OpenTelemetry, trace aggregation in Jaeger or Honeycomb, and flame graphs for performance-critical paths. For single-process systems: strace, DTrace, or language-level profilers.

The Insight: traces frequently reveal behavior that nobody documents — error recovery paths, retry logic, fallback behaviors, and the asynchronous cleanup that keeps the system running despite apparent crashes.

### Behavioral Delta Analysis

When migrating a system, run the old and new implementations side-by-side on production traffic and compare outputs. This is the strongest possible evidence that your reverse-engineered understanding is complete.

Platforms like Diffy (Twitter's open-source differential testing proxy) or custom event-stream comparison pipelines do this at scale. Each output match increases confidence; each mismatch reveals an edge case your understanding missed.

---

## Part 4: Strategies for Reverse Engineering

### The Strangler Fig Pattern

From a brownfield architecture perspective, the Strangler Fig is the migration pattern — but as a reverse engineering strategy, it's even more powerful. Instead of analyzing the entire system upfront, route a fraction of production traffic to a new implementation built from a partial understanding. The mismatches (errors, differences in output) tell you exactly which parts of your understanding are incomplete. Each mismatch is a discovery opportunity.

The approach inverts the usual "understand everything, then build" order: **build a little, learn from the differences, refine the understanding, build more.**

### Event Storming for Existing Systems

Event Storming is typically used for greenfield domain modeling, but it works as a reverse engineering tool when applied retroactively. Gather the team (or interview stakeholders individually if no team exists) and walk through the events the system produces. Each event is a probe into the system's actual behavior. Label each event: "we know how this event is produced," "we think it's produced this way," or "we have no idea."

The result is a map of understanding with explicit uncertainty markers. It's the first whiteboard drawing that actually describes what the system does instead of what someone once intended it to do.

### Walking Skeleton Migration

Reverse engineer the smallest end-to-end path through the system — a single request that touches every major component — and recreate it in the new implementation. This forces you to discover every integration point, every data format, every error mode that a "just look at the code" approach would miss.

Once the walking skeleton works, each subsequent path you migrate fills in details. The skeleton is the truth standard: if your understanding doesn't produce a working end-to-end trace, it's wrong.

### The Four-Phase Code Archeology

This combines multiple techniques into a repeatable process:

1. **Surface survey** — directory structure, build system, dependency graph, CI pipeline, deployment topology. No code reading yet. Output: maps of the system at every boundary.
2. **Trace excavation** — pick one end-to-end flow (user login, report generation, payment processing). Follow it through every layer with a debugger or trace. Document every step, every data transformation, every error path encountered. Output: a detailed flow document for one path.
3. **Characterization campaign** — write characterization tests for every function touched by the trace. Don't move to the next flow until the current one is covered. Output: a test suite that captures current behavior for the excavated paths.
4. **Synthesis** — identify patterns across flows: recurring data transforms, error handling strategies, concurrency models, caching invalidation schemes. Output: a architecture description grounded in observed behavior, not documentation.

Each cycle of four phases deepens coverage. Stop when the characterization tests pass consistently and the synthesis document accurately predicts how untraced flows work.

---

## Part 5: Where AI Tools Fit in 2025

AI tools — specifically LLMs — have changed what's practical in reverse engineering. But they haven't eliminated the need for the principles above. The key is knowing what they're good at and where they still fail.

### What LLMs Are Good At

**Summarization at scale.** Give an LLM a 500-line file with no comments and ask it to describe what the code does. The result won't be perfect, but it will be directionally correct more often than not, and it costs seconds instead of hours. This is useful for the surface survey phase: you get a first-pass description of every module before deciding where to dig deeper.

**Dependency discovery from prose.** When your codebase has comments, commit messages, or README files — even outdated ones — an LLM can extract relationships from them faster than a human can. Ask "what external systems does this code depend on?" and the model can find evidence scattered across config files, import statements, and comments.

**Generating characterization tests.** Give an LLM a function and ask for a characterization test. The quality varies, but the generated tests often form a useful starting point — especially for functions with well-defined input/output shapes. You still need to run them and verify they capture real behavior.

**Architecture diagram generation.** Tools like `claude-code` can read a directory of source code and produce a Mermaid or PlantUML diagram of the module structure. These are first drafts — they miss cross-cutting concerns and runtime dependencies — but they give you a starting point for the surface survey.

**Explaining non-obvious patterns.** Some code doesn't make sense until you know the library it uses, the framework it targets, or the protocol it implements. LLMs are good at recognizing these patterns from training data and explaining what the code is doing in a way the code alone doesn't reveal.

### Where LLMs Still Fail

**Inventing plausible false relationships.** The biggest risk. An LLM will confidently describe a dependency or a data flow that doesn't exist, and the description will be coherent enough that you believe it. Every AI-generated analysis must be verified against code or traces.

**Missing runtime behavior.** Static analysis — human or AI — cannot discover behavior that only emerges at runtime: race conditions, retry loops, timeout interactions, external system failures. These are the parts that most need trace-based observation.

**Hallucinating intent.** The most dangerous failure. An LLM will produce a convincing explanation of _why_ code was written a certain way — and that explanation may be wrong, plausible, and perfectly aligned with what you expect to hear. The confidence with which LLMs explain intent masks the fact that they're making it up. Intent can only be inferred from evidence: commit messages, PR discussions, issue tracker history, stakeholder interviews.

**Equally bad across all code.** An LLM doesn't distinguish between well-structured code it can analyze easily and spaghetti code that requires deep understanding. It produces plausible-sounding output for both. The correlation between output quality and actual understanding is weak, which means you can't trust the AI's own confidence signal.

### The Practical Workflow

The effective approach combines AI speed with human verification anchored in the accuracy techniques from Part 3:

1. **Use AI for the surface survey.** Ask an LLM to describe the directory structure, the dependency graph, and the high-level architecture. Put the results on a whiteboard (digital or physical). Don't trust any of it — but use it as a starting hypothesis.
2. **Verify with traces and tests.** For every claim the AI made about a specific flow, write a characterization test or collect a trace that confirms or refutes it. Each confirmed claim is a unit of verified understanding.
3. **Use AI to generate test scaffolding.** Let the AI write the first draft of characterization tests, golden master fixtures, or property-based test skeletons. You review, run, and validate them. This saves time without sacrificing accuracy.
4. **Explain mismatches with AI assistance.** When a trace reveals behavior the AI missed, ask the LLM to explain the gap. Sometimes it recognizes the pattern once the evidence is in context and can help you interpret it.
5. **Synthesize with AI, verify with humans.** Use the LLM to draft the architecture synthesis document from your verified notes. Then review and edit it against your actual evidence. The AI generates the structure; you fill in and validate the content.

---

## Part 6: Automation — Closing the Accuracy Loop

The goal of automation in reverse engineering is not to replace understanding but to make it measurable and continuous. You want a feedback loop where every change or deployment tells you whether your current understanding is still correct.

### The Accuracy Score

Define a quantitative measure of understanding for each module:

- **Characterization coverage** — percentage of public functions with characterization tests
- **Trace coverage** — percentage of documented flows with production traces confirming the path
- **Structural model accuracy** — overlap between the AI-generated dependency graph and the verified dependency graph
- **Prediction accuracy** — when the team predicts how a flow works, how often does the actual trace match the prediction?

Track these over time. The goal is not 100% — some modules aren't worth fully understanding. The goal is to know, for each module, how confident you are.

### The CI-Integrated Knowledge Base

Store verified understanding in a structured, version-controlled format:

```yaml
# knowledge/payment-flow.yaml
flow: payment-processing
verified_by:
  - characterization_test: test_capture_authorized_payments
  - trace: prod-trace-2025-06-20
  - stakeholder: alice@company.com (engineering lead)
dependencies:
  - payment-gateway (external, Stripe API v2023-08)
  - fraud-detection (internal, ml-service:8080)
error_paths:
  - timeout: 30s -> retry up to 3 times -> dead letter queue
  - card_declined: log event, return 402, do not retry
```

This knowledge base is checked into the repository alongside the code. CI runs a validation job that checks: do the characterization tests still pass? Does the trace log still match the documented path? Has a dependency changed?

When a change breaks the documented understanding, CI flags it. The team must either update the knowledge base (understanding has been refined) or fix the change (the code has drifted from the known behavior).

### The AI-Based Regeneration Loop

On a weekly or monthly cadence:

1. AI re-analyses the codebase and generates updated documentation, dependency graphs, and architecture descriptions
2. The automated validation suite runs: characterization tests, property-based checks, golden master comparisons
3. Scores are computed against the current knowledge base
4. Drops in score trigger a review — something has changed that the AI detected but the knowledge base doesn't reflect

This loop surfaces drift early. A drop in the structural model accuracy score means the code has changed in a way that the verified understanding doesn't match. You investigate, update the knowledge base, and the score recovers.

### Measuring ROI

Track three metrics:

- **Time to understanding** — how long does a new team member (or AI agent) take to reach a verified accuracy score of 0.8 on a given module? Track this before and after the knowledge base is established.
- **Change confidence** — how many changes to a module bypass the accuracy checks (e.g. the developer didn't update the knowledge base or write characterization tests)? Lower is better.
- **Defect rate from changes** — do changes to well-characterized modules have a lower defect rate than changes to poorly-characterized ones? If not, the accuracy measures aren't measuring the right things.

---

## Part 7: Putting It Together — A Worked Example

Consider a legacy payment processing service, undocumented, 15,000 lines of Python, no tests, one original author who left. You need to add support for a new payment provider.

### Phase 1: Surface Survey (AI-assisted)

Feed the codebase directory to an LLM. It returns:

```
Modules found:
- gateway/ (Stripe integration, REST client)
- handlers/ (request processing, validation)
- models/ (data objects, ORM definitions)
- queue/ (job processing, retry logic)
- utils/ (formatting, logging, encryption)

Dependencies:
- Stripe API (external)
- PostgreSQL (internal, order database)
- Redis (internal, job queue + cache)
```

You don't trust this yet, but it gives you a map to start with. You check it against `depcruise` output and confirm the module structure is correct. The external dependency list matches what the import statements show.

### Phase 2: Trace Excavation

Pick one flow: the current payment flow with Stripe. Run it in production (or staging) with tracing enabled. Document every step:

1. `handlers/payment.py:process_payment()` receives the request
2. Validates with `models/payment.py:validate()`
3. Encrypts card data with `utils/crypto.py`
4. Calls `gateway/stripe.py:charge()`
5. On success: writes to `order_transactions` table
6. On timeout: enqueues job to `queue/retry.py`, which retries up to 3 times with exponential backoff
7. On card decline: logs with `utils/logger.py`, returns error immediately — no retry

The trace reveals behavior the AI missed: the retry queue has a dead-letter mechanism that was never documented. You update the knowledge base.

### Phase 3: Characterization Campaign

For every function in the payment flow, write characterization tests:

```python
def test_charge_captures_stripe_behavior():
    """Characterization test for gateway/stripe.py:charge"""
    result = charge(
        amount=5000,
        currency="usd",
        source="tok_visa",
    )
    assert result.status == "succeeded"
    assert result.charge_id.startswith("ch_")

def test_charge_with_invalid_card():
    result = charge(
        amount=5000,
        currency="usd",
        source="tok_chargeDeclined",
    )
    assert result.status == "failed"
    assert "card_declined" in result.failure_code
```

You discover two edge cases the trace didn't cover: what happens when Stripe returns a 500 (retry with exponential backoff) and what happens when the Redis queue is down (synchronous fallback to PostgreSQL). Each edge case becomes a new characterization test.

### Phase 4: AI-Assisted Provider Integration

Now that the behavior is characterized, you ask the AI to generate the new provider implementation:

Prompt: "Using the verified characterization tests for the Stripe gateway module as the behavioral contract, implement a similar module for Braintree. The tests must pass with the same assertions."

The AI generates a first draft. The characterization tests catch the mismatches — you run them and see that the error-handling patterns don't match (the Braintree integration returns error codes differently). You iterate. The tests tell you when you're done, not a human review.

### Result

The new provider takes one day to integrate instead of two weeks. The characterization tests become the regression suite for both providers. The knowledge base, checked into the repo, means any future developer can understand the payment flow from a single source of truth that is automatically validated by CI.

---

## References

- Feathers, M. (2004). _Working Effectively with Legacy Code_. Prentice Hall.
- Fowler, M. (2018). _Refactoring: Improving the Design of Existing Code_ (2nd ed.). Addison-Wesley.
- Hermans, F. (2021). _The Programmer's Brain_. Manning.
- Spinellis, D. (2003). _Code Reading: The Open Source Perspective_. Addison-Wesley.
- Ford, N., Richards, M., Sadalage, P. (2022). _Software Architecture: The Hard Parts_. O'Reilly.
- Beck, K. (2002). _Test-Driven Development: By Example_. Addison-Wesley.
- Fowler, M. (2004). StranglerFigApplication — martinfowler.com
- Feathers, M. — "The Deep Synergy Between Testability and Good Design" (talk)
- Brandolini, A. (2013). _Introducing EventStorming_. Leanpub.
- Diffy — Twitter's open-source differential testing proxy (now archived)
