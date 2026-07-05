+++
date = '2025-07-02T10:25:00+10:00'
draft = false
title = 'Testing LLM Outputs: Evals for Models, Agents, and Skills'
tags = ['Claude', 'LLM', 'Testing', 'Evals', 'Agents']
summary = "LLM outputs are non-deterministic, which breaks the assumptions most of our testing tooling is built on. This document covers how to actually test model outputs, agent trajectories, and Claude Code-style skills — the layers of evaluation, the current 2026 tool landscape, and a working CI harness you can copy."
+++

## Part 1: Why This Is a Different Testing Problem

* Traditional software testing rests on one assumption: same input, same output. `assertEqual(f(x), y)` works because `f` is deterministic. The moment you put an LLM in the loop, that assumption breaks. 
* Ask Claude the same question twice, at the same temperature, and you can get two answers that are both "correct" but not identical — different wording, different tool-call order, different length. 
* Ask an agent to complete a multi-step task and you get a **trajectory**, not a single output: a chain of reasoning, tool calls and intermediate states that can diverge wildly between runs while still arriving at a valid result.
* You're not testing for equality anymore (`unittest`/`pytest` in their classic form) — you're testing for **membership in an acceptable set**, scored probabilistically. That reframing is what "evals" are.

Three things compound the problem:

1. **Stochasticity is layered.** 
   - Stochasticity is the quality of lacking a predictable pattern, where outcomes are governed by probability rather than deterministic rules.
   - The model call is non-deterministic, and if you use another LLM to *grade* the output (LLM-as-judge), the grader is non-deterministic too. Stack enough randomness and your test suite becomes noise unless you control for it.
2. **Agents multiply the surface area.** 
   - A single-turn LLM call has one input and one output to score. 
   - An agent has N tool calls, each of which can fail, retry, hallucinate a tool name or call the right tool with the wrong arguments — and two completely different trajectories can both be "correct."
3. **"Correct" is often a spectrum, not a boolean.** 
   - A summary can be accurate but too long. A generated skill can succeed but use twice the tokens it needed to. You need scored metrics, not pass/fail, for most of what matters.

## Part 2: The Layers of LLM Output Testing

No single technique covers everything. In practice you build a pyramid, and the shape of that pyramid matters more than any individual tool you pick.

### Layer 1 — Deterministic / Structural Checks (cheapest, do these first)

Anything that *can* be checked without another model call, should be. These are fast, free, and have zero grader-side noise:

- Output parses as valid JSON / matches a schema
- Required fields are present and correctly typed
- Code compiles / lints / passes type checks
- The agent called the tool it was supposed to call, with the arguments it was supposed to pass
- Output length within bounds
- No banned strings (secrets, PII patterns, forbidden phrases)
- Regex / substring matches for known-good or known-bad patterns
- Latency and token-cost thresholds

If you can express the check as code, express it as code. This layer should be the majority of your suite — most current guidance from teams running this in production puts deterministic checks at roughly 60% of the total eval set, with model-graded checks and human review filling the rest.

Tools that implement this:

- **`pytest` / `unittest`** — housing all deterministic checks in a standard CI runner alongside your regular test suite; zero infra overhead.
- **`jsonschema` / `pydantic`** — validate that parsed JSON has the expected fields and types; catches missing keys, wrong types, extra fields the model invented.
- **`mypy` / `pyright` / `ruff`** — run on any code the model generates (scripts, SQL, config files); catches syntax errors and type mismatches before the code executes.
- **`toolcallcheck`** — mocks an MCP server and asserts that the agent called the expected tools with the expected arguments in the expected order; runs fully offline, no model call.
- **`hypothesis`** — generates edge-case inputs to feed the model and asserts structural properties hold across all of them; catches inputs that trigger malformed output.
- **`deepeval` (`TaskCompletionMetric`)** — agent-specific metric that scores whether each tool call in a trajectory was structurally correct (right tool, right args) without needing a judge model.
- **Plain `assert` + regex** — cheapest of all: check no secrets/PII in output, output length in bounds, known-good patterns present, known-bad patterns absent.

### Layer 2 — Model-Graded Evaluation (LLM-as-judge)

For anything semantic — correctness against a rubric, tone, faithfulness to source material, whether a response actually answers the question — you use another LLM call to score the output. The pattern:

```
grader_prompt = f"""
You are grading an AI-generated answer against a rubric.

Question: {question}
Reference answer: {reference}
Model output: {output}

Score 1-5 on each of:
- Factual accuracy
- Completeness
- Adherence to the requested format

Return only JSON: {{"accuracy": int, "completeness": int, "format": int, "reasoning": str}}
"""
```

Things that make this reliable instead of vibes-based:

- **Use a rubric, not a vague instruction.** "Is this good?" is a bad judge prompt. "Score against these five specific criteria" is a good one.
- **Calibrate the judge against human labels.** Periodically have a human score a sample and check the judge agrees. If it doesn't, fix the rubric before trusting the automated score.
- **Watch for judge biases**: position bias (favoring the first option in a comparison), length bias (favoring longer answers), self-preference bias (a model judge favoring outputs from its own family). Randomize order, control for length, and occasionally cross-check with a different model as judge.
- **Never let this be your only signal.** Model-graded evals add noise on top of the agent's own noise. Deterministic checks are your ground truth; LLM-as-judge fills the gap deterministic checks can't reach.

Tools that implement this:

- **`deepeval` (`GEval`, `FaithfulnessMetric`, `HallucinationMetric`, `AnswerRelevancyMetric`)** — pre-built model-graded scorers that call an LLM judge internally and return a numeric score you can assert against; no need to write your own judge prompt for common patterns.
- **`promptfoo`** — runs model outputs through comparison-based scoring or adversarial test cases; strongest for catching regressions when swapping prompts or models, with built-in red-teaming vectors.
- **`braintrust`** — custom sandboxed Python scorers where you define the judge logic (call any model, run any calculation); scores are wired into CI gates and regression dashboards automatically.
- **`langsmith`** — annotation queues let humans review model-graded scores and correct them; closed-loop feedback refines the judge prompt over time.
- **`langfuse`** — model-as-judge evaluation built into the tracing platform; useful when you already use Langfuse for production monitoring and want eval without a second service.
- **`ragas`** — faithfulness, answer relevancy, and context precision metrics specifically for RAG pipelines; uses LLM calls internally but scoped to the retrieval-grounded evaluation domain.

G-Eval (chain-of-thought-based scoring with a scoring function) is the most common pattern for structuring judge prompts well — it asks the judge to reason step by step against explicit criteria before emitting a score, which measurably improves judge-human agreement over a bare "rate 1-5" prompt.

### Layer 3 — Property-Based / Invariant Testing

Instead of checking a specific output, check properties that must hold across *all* outputs regardless of variance:

- The agent never calls a destructive action (delete, deploy, send) without an explicit confirmation step
- Idempotency: calling the same tool twice with the same arguments doesn't double-charge, double-send, or duplicate a record
- No response exceeds a hard token/length ceiling
- Every generated SQL query is read-only when the task doesn't require writes
- A generated skill never writes outside its declared working directory

This is where a lot of practical agent *safety* testing actually lives — you're not testing quality, you're testing that the guardrails hold no matter what path the agent takes to get there.

Tools that implement this:

- **`hypothesis`** — property-based testing framework; you declare invariants ("output never contains X") and it generates inputs to try to violate them, including edge cases you wouldn't think to write manually.
- **`toolcallcheck`** — assert structural constraints on tool calls (e.g. "never call the delete tool" or "always pass a confirmation flag"); fails the test if the agent's trajectory violates the constraint, regardless of output content.
- **Custom `PreToolUse` / `PermissionDenied` hooks** — in `claude-code` or `opencode`, these hooks fire before every tool call and can block it deterministically — you enforce invariants at the agent runtime level, not just in tests.
- **`pytest` with invariant fixtures** — write a fixture that runs post-test (e.g. `yield` + assert pattern); every test in the suite automatically checks the invariant without duplicating the assertion.
- **`deepeval` (`BiasMetric`, `ToxicityMetric`)** — model-graded safety metrics that score output against fairness and toxicity rubrics; useful when the invariant is semantic rather than structural.
- **`promptfoo` red-teaming suite** — 500+ adversarial input vectors that probe whether your invariant holds under malicious or unusual inputs; automated probing, not manual test writing.

### Layer 4 — Golden Datasets and Regression Tracking

Curate a representative set of real inputs — ideally pulled from actual usage rather than invented — and snapshot how your system scores against them over time. You're not asserting exact output equality; you're asserting the **eval score on that set doesn't regress** when you change a prompt, swap a model version, or edit a skill definition.

The discipline that matters here: **score your current production system before setting an acceptance bar.** Don't invent a target in a vacuum — measure the baseline, then gate merges on "no regression below baseline" rather than an arbitrary absolute number. E.g. *"tool-selection success: current baseline 88%, acceptance bar 95%, anything below baseline blocks deploy."*

Tools that implement this:

**`deepeval` (`Dataset`)**
- **What it does:** curate input-output pairs as a typed `LLMTestCase` dataset and run evals against the whole set as a batch. Includes synthetic data generation from your existing docs to expand coverage without manual curation. Built-in scorers cover G-Eval, hallucination, faithfulness, answer relevancy, and 50+ others.
- **Best for:** staying in pytest, CI gating without external infra, teams that want synthetic coverage without writing every test case by hand.
- **Downside:** built-in scorers are opinionated — non-standard checks are harder to wire in. No dashboard or historical tracking beyond CI logs.

**`promptfoo`**
- **What it does:** YAML-defined test case datasets with expected outputs or rubric criteria. Built-in regression comparison across runs shows you score deltas for every prompt or model change — run from the terminal, see "model A: 0.91, model B: 0.85" before you commit. Strongest open-source red-teaming suite (500+ adversarial input vectors).
- **Best for:** prompt iteration, model comparison, adversarial testing.
- **Downside:** no database, no web UI, no cross-run history tracked by default. Results live in local JSON — regression tracking across weeks is manual unless you build a wrapper.

**`braintrust`**
- **What it does:** dataset-first eval platform. Every eval run is recorded and automatically linked to the git commit that triggered it. Web dashboards flag any score drop compared to the previous commit or baseline — you don't diff JSON files by hand. Custom sandboxed Python scorers let you call any model or run any calculation as the judge.
- **Best for:** teams that need persistent eval history, commit-linked dashboards, and CI gating at scale.
- **Downside:** requires a platform account and setup. Heavier than a local pytest script. Overkill for a solo developer running evals once a week.

**`langsmith`**
- **What it does:** dataset management with versioning and comparison views. If you're already tracing production traffic through LangSmith, those traces auto-become eval datasets — you're not writing test cases from scratch. Side-by-side score breakdowns across model versions, prompt variants, or dataset revisions in the web UI.
- **Best for:** teams already on LangChain/LangGraph who don't want a second platform.
- **Downside:** locked into the LangChain ecosystem. Platform pricing can get expensive at scale. Not worth adopting LangChain just for the eval layer.

**`pytest-snapshot`**
- **What it does:** golden-file plugin for pytest. Captures exact outputs as snapshot files and asserts they haven't changed — on failure it shows a diff so you can review and accept the change.
- **Best for:** structural outputs (configs, schemas, generated code) where byte-for-byte equality is meaningful.
- **Downside:** only works for deterministic structural output. Useless for semantic evaluation — asserting exact output equality on LLM responses defeats the whole purpose of non-deterministic scoring.

**Custom YAML gates**
- **What it does:** define your baseline and acceptance threshold in a version-controlled YAML file checked into the repo. A one-page CI script checks "does the current score stay above the saved baseline?" before every merge. No platform dependency, works with any eval scorer.
- **Best for:** minimal setups where the discipline of "nothing below our measured baseline merges" is the goal — the baba-yaga companion repo does exactly this with `eval-baseline.json` in git and `--gate` in CI.
- **Downside:** no web UI, no dashboards, no cross-team visibility. You build the runner yourself — but the total surface fits in a single file.

### Concrete Example: The `baba-yaga` Golden Dataset

refer: [`scripts/golden_eval.py`](https://github.com/welldesignedsystem/baba-yaga/blob/main/scripts/golden_eval.py). It defines a golden dataset of 4 cases (capital lookup, list comprehension with invariants, JSON output validation), scores each with deterministic checks (substring match, word-count bound, JSON parse), runs 3 samples per case, and gates against a checked-in `eval-baseline.json`:

```bash
$ uv run python scripts/golden_eval.py --baseline

  capital-france                mean=1.000  stdev=0.000
  capital-japan                 mean=1.000  stdev=0.000
  python-list-comprehension     mean=0.833  stdev=0.289
  json-output                   mean=1.000  stdev=0.000

Saved baseline to eval-baseline.json
```

After a change, `--gate` compares against the baseline and fails CI if any score regressed. The full source is in the repo — this pattern runs with zero dependencies beyond `uv` and an API key, no separate eval platform required.

### Layer 5 — Statistical Sampling

A single run tells you almost nothing at temperature > 0. Run each test case N times (5–20 is typical) and look at the **distribution** of scores, not one output:

- Report pass-rate ("87% of runs satisfied the rubric") instead of pass/fail
- Track variance, not just mean — a task with 90% mean but huge variance is riskier than 85% with low variance
- This matters disproportionately for agents, since errors compound across turns — a 95%-reliable single tool call becomes a 60%-reliable five-step trajectory (0.95⁵ ≈ 0.77, and it gets worse fast as steps increase and per-step reliability drops)

Tools that implement this:

- **`pytest` + `statistics`** — wrap any test in a parametrized loop over N seeds and aggregate scores with the built-in `statistics` module (mean, stdev, pass-rate); no extra dependency, works in any CI as shown in Part 6.
- **`deepeval`** — confidence intervals and statistical significance reporting built into its metrics; when you run N times it reports the distribution, not just the average, and can gate on the lower bound of the confidence interval.
- **`hypothesis`** — controls sample counts and random seeds as part of its property-based testing engine; useful when you want to combine invariant testing with sampling (e.g. "run this invariant 20 times across different random seeds").
- **`pytest-repeat`** — minimal plugin that re-runs a test N times; good for quick iteration before moving to a more structured sampling approach.
- **`promptfoo`** — `repeat: N` in the test config runs each case N times and aggregates pass-rates, latencies, and scores across runs in the output report.
- **Custom CI gates** — scripts that compare pass-rate distributions between the feature branch and main; block if the lower bound of the confidence interval drops below the baseline, regardless of the mean.

### Layer 6 — Human-in-the-Loop

No rubric anticipates every edge case. Sample production traffic (5–10% is a common starting point) for manual review, and feed disagreements between human and judge scores back into refining the rubric. This is also where you catch the failure modes that are only obvious to a domain expert — a technically well-formed answer that's subtly wrong in a way no automated check would flag.

Tools that implement this:

- **`langsmith`** — annotation queues for collecting human feedback at the trace or thread level; reviewers score individual LLM calls or entire agent runs, and disagreement with the automated judge feeds back into rubric refinement.
- **`braintrust`** — human annotation UI with reviewer assignment and audit trails; scores from reviewers are automatically compared against model-graded scores, and dashboards surface the disagreement rate so you know which rubrics need fixing.
- **`langfuse`** — manual scoring workflows where a human can annotate traces after the fact; integrated with the same UI used for production monitoring, so reviewers see the full context of the agent run.
- **`label-studio`** — general-purpose annotation platform; configure any custom review pipeline (e.g. "review 10% of outputs flagged as low-confidence by the automated judge") with your own scoring rubric UI.
- **`arize-phoenix`** — production trace sampling (e.g. 5% of all agent runs) surfaced for human-in-the-loop scoring; uses OpenTelemetry so sampling config works across any instrumented stack without platform-specific wiring.

### Enterprise Minimal Tool Set

If you need to cover all 6 layers in an enterprise setting with the smallest surface area, this is the practical minimum:

| Tool | Role |
|---|---|
| **pytest** | Test runner, deterministic checks, invariant fixtures, sampling loops |
| **DeepEval** | Built-in metrics (hallucination, faithfulness, G-Eval, answer relevancy), golden dataset management, synthetic data generation from your docs |
| **Promptfoo** | Prompt/model comparison, adversarial red-teaming (500+ attack vectors) — run before any model version change in production |
| **Braintrust** | Platform: persisted eval history linked to git commits, regression dashboards, CI gates, human annotation queues |
| **hypothesis** | Property-based testing — generates edge-case inputs to probe guardrails and invariants |

Five tools cover the full pyramid. pytest + hypothesis + DeepEval + Promptfoo are all open-source. Braintrust is the only paid platform — and you can defer it early on by checking baseline JSON into git (as `baba-yaga` does), adding it when you need historical dashboards and team-wide visibility.

## Part 3: Evaluating Agents Specifically — Trajectory, Not Just Output

Agent evaluation is a strictly harder problem than single-call LLM evaluation, because the thing you're scoring isn't a string — it's a **trajectory**: the full sequence of reasoning steps, tool calls, and intermediate states. LangChain's framing is a useful mental model here: scoring only the final answer is like grading an exam by the final grade alone; trajectory evaluation is grading by the working shown at every step.

What trajectory evaluation actually checks:

- **Tool selection correctness** — did it call the right tool for the sub-task, not just *a* tool
- **Argument correctness** — right tool, wrong arguments still fails
- **Step efficiency** — did it take 3 steps or 11 to do the same job (token cost and latency both suffer from wandering)
- **Recovery behavior** — when a tool call fails, does the agent retry sensibly, fall back, or ask the user, versus looping or hallucinating a workaround
- **Path validity** — two different trajectories can both be correct (there's rarely one "right" path), so scoring needs to allow for legitimate divergence rather than exact-path matching

Frameworks like `agentevals` (LangChain's ecosystem) and Strands Evals read traces natively if you're already building on those frameworks — check what your agent framework ships before adding a separate dependency, since many now include a first-party eval subpackage.

## Part 4: Testing Claude Code Skills Specifically

Skills are a narrower, more testable case than open-ended agents, because a skill has a declared contract: given this trigger condition, it should read this SKILL.md, follow this procedure, and produce this class of output. That contract is exactly what you eval against.

A practical skill-testing checklist:

1. **Trigger accuracy** — does the skill activate on the inputs it should, and *not* activate on inputs it shouldn't (false positives are as costly as false negatives — an overtriggered skill burns context and can derail an otherwise fine response)
2. **Procedure adherence** — did the model actually follow the steps documented in the skill, or ignore them and improvise
3. **Output contract** — if the skill promises a specific file type, directory location, or format, verify that mechanically (file exists, correct extension, correct location, opens without error)
4. **Boundary respect** — a skill that touches the filesystem should never write outside its declared scope; test this as a hard invariant, not a soft check
5. **Token efficiency** — skills that reference other files or run multi-step procedures should be checked for whether they're pulling in more context than the task needs

For skills, deterministic checks carry even more of the weight than in general agent testing, because the contract is narrower and more mechanically verifiable — "did it produce a valid .docx with a table of contents" is a much cheaper and more reliable check than asking a judge model "is this a good Word document."

## Part 5: The 2026 Tool Landscape

The open-source evaluation ecosystem has matured quickly, and a fairly clear division of labor has emerged. The pattern most engineering-led teams converge on: **one lightweight framework for CI/CD gating, paired with one platform for production tracing, human annotation, and regression dashboards.** Running just one or the other tends to leave a gap.

| Tool | Type | Best for | Notes |
|---|---|---|---|
| **Promptfoo** | OSS CLI, YAML-driven | Model/prompt comparison, red-teaming | Strongest open-source red-teaming suite (500+ adversarial vectors); acquired into OpenAI's Frontier infrastructure in March 2026, OSS package stays Apache 2.0 |
| **DeepEval** | OSS, Python/pytest-native | CI-gated evals with typed metrics | 50+ built-in metrics (G-Eval, hallucination, faithfulness, contextual recall); agent-specific metrics for tool correctness and task completion; synthetic dataset generation from your own docs |
| **RAGAS** | OSS, Python | RAG pipeline scoring specifically | Research-backed retrieval + generation metrics; narrower scope than DeepEval/Promptfoo by design |
| **Braintrust** | Platform (OSS scorer lib + hosted) | Full lifecycle: tracing → eval → CI gates → dashboards | Dataset-first, model-agnostic; sandboxed custom Python scorers; strongest option when you need eval scores wired into actual release gating, not just local test runs |
| **LangSmith** | Platform | Annotation workflows, production monitoring for LangChain-based agents | Tightest fit if you're already on LangChain/LangGraph |
| **Arize Phoenix** | OSS, OpenTelemetry-native | Teams already instrumented with OTel who want tracing + eval in one open-core stack | Best portability story since it rides on standard OTel traces |
| **OpenAI Evals** | OSS, registry-based | Reproducible, benchmark-style evals | Closest analog to running a published academic benchmark against your own system |
| **Langfuse** | OSS + managed cloud | Self-hostable tracing/eval | Self-hosting adds infra overhead; eval depth is lighter than the full platforms above |

Practical pairing that shows up repeatedly across current guidance: **DeepEval for CI-gated, pytest-style evals** + **Braintrust or LangSmith for production traceability, human annotation, and regression dashboards**. For a Python/`uv`-first, terminal-centric workflow, DeepEval is the lower-friction starting point since it drops straight into an existing pytest suite and CI pipeline without standing up a separate service.

## Part 6: A Working CI Harness

### Deterministic layer with pytest + DeepEval

```python
# test_skill_output.py
import json
from deepeval import assert_test
from deepeval.metrics import GEval, TaskCompletionMetric
from deepeval.test_case import LLMTestCase

def test_pdf_report_generates_valid_file(tmp_path):
    """Deterministic check — no LLM call needed."""
    result = run_skill("generate-compliance-report", output_dir=tmp_path)
    output_file = tmp_path / "report.pdf"

    assert output_file.exists()
    assert output_file.stat().st_size > 1024          # not an empty/broken PDF
    assert result.tool_calls_used <= 6                 # step-efficiency bound
    assert "delete" not in [c.tool_name for c in result.tool_calls]  # invariant

def test_summary_accuracy_llm_judge():
    """Model-graded layer — used only where deterministic checks can't reach."""
    test_case = LLMTestCase(
        input="Summarize the Q2 anomaly detection findings.",
        actual_output=run_skill("summarize-report").text,
        expected_output=REFERENCE_SUMMARY,
    )
    correctness = GEval(
        name="Correctness",
        criteria="Does the summary accurately reflect the reference without inventing figures?",
        evaluation_params=["input", "actual_output", "expected_output"],
        threshold=0.8,
    )
    assert_test(test_case, [correctness])
```

Run it exactly like any other suite: `uv run pytest test_skill_output.py -v`. Wire it into CI so any PR touching a skill definition or prompt re-runs the suite; a failed eval blocks the merge, same as a failed unit test.

### Sampling for non-determinism

```python
def run_with_sampling(task_fn, n=10, threshold=0.85):
    """Run N times, report pass-rate instead of a single pass/fail."""
    results = [task_fn() for _ in range(n)]
    pass_rate = sum(r.passed for r in results) / n
    return {
        "pass_rate": pass_rate,
        "gate_passed": pass_rate >= threshold,
        "variance": statistics.stdev([r.score for r in results]),
    }
```

### Regression gating against a baseline, not an arbitrary number

```yaml
# ci-eval-gate.yaml
gates:
  - name: tool-selection-accuracy
    baseline: 0.88      # measured from current production, not guessed
    acceptance: 0.95
    block_on: below_baseline   # don't merge if this PR regresses the baseline
  - name: hallucination-rate
    baseline: 0.03
    acceptance: 0.02
    block_on: below_baseline
```

## Part 7: Common Pitfalls

- **Trusting a single run.** Non-determinism means one green test tells you almost nothing about reliability. Sample.
- **Using LLM-as-judge as your only signal.** It's a second stochastic system layered on the first. Anchor with deterministic checks wherever the check *can* be deterministic.
- **Setting acceptance bars without a baseline.** An arbitrary "95% accuracy" target means nothing if you never measured what production is doing today.
- **Grading final output only, for agents.** A trajectory that hallucinates a tool call halfway through and then "recovers" to a correct-looking answer is not a healthy trajectory even if the final string passes. Score the path.
- **Not controlling judge bias.** Position bias and length bias are well-documented and easy to accidentally bake into a comparison-style judge prompt. Randomize ordering; don't reward verbosity by default.
- **Skipping human review entirely.** Automated evals catch what the rubric anticipated. They don't catch what it didn't.
- **Ignoring cost compounding in agents.** Per-step reliability multiplies across a trajectory — a system that looks fine on single-tool-call benchmarks can degrade sharply once chained into a 5–10 step agent.

## Part 8: Putting It Together

A reasonable target mix, consistent with what's converged across current practice: **roughly 60% deterministic checks, 30% model-graded (LLM-as-judge), 10% human-in-the-loop**, running on every PR that touches prompts, skills, or agent logic, gated against a measured baseline rather than an invented threshold.

The uncomfortable truth is that you can't fully eliminate the non-determinism — you're not trying to. You're building enough layered signal that when something does drift, you catch it before it ships, and when you can't automate the judgment call, you know exactly which 10% needs a human to actually look at it.
