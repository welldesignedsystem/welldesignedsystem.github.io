+++
date = '2026-07-02T10:25:00+10:00'
draft = false
title = 'Testing LLM Outputs: Evals for Models, Agents, and Skills'
tags = ['Claude', 'LLM', 'Testing', 'Evals', 'Agents']
summary = "LLM outputs are non-deterministic, which breaks the assumptions most of our testing tooling is built on. This document covers how to actually test model outputs, agent trajectories, and Claude Code-style skills — the layers of evaluation, the current 2026 tool landscape, and a working CI harness you can copy."
+++

## Part 1: Why This Is a Different Testing Problem

Traditional software testing rests on one assumption: same input, same output. `assertEqual(f(x), y)` works because `f` is deterministic. The moment you put an LLM in the loop, that assumption breaks. Ask Claude the same question twice, at the same temperature, and you can get two answers that are both "correct" but not identical — different wording, different tool-call order, different length. Ask an agent to complete a multi-step task and you get a **trajectory**, not a single output: a chain of reasoning, tool calls, and intermediate states that can diverge wildly between runs while still arriving at a valid result.

This is the core reason `unittest`/`pytest` in their classic form don't map cleanly onto LLM outputs. You're not testing for equality anymore — you're testing for **membership in an acceptable set**, scored probabilistically. That reframing is what "evals" are.

Three things compound the problem:

1. **Stochasticity is layered.** The model call is non-deterministic, and if you use another LLM to *grade* the output (LLM-as-judge), the grader is non-deterministic too. Stack enough randomness and your test suite becomes noise unless you control for it.
2. **Agents multiply the surface area.** A single-turn LLM call has one input and one output to score. An agent has N tool calls, each of which can fail, retry, hallucinate a tool name, or call the right tool with the wrong arguments — and two completely different trajectories can both be "correct."
3. **"Correct" is often a spectrum, not a boolean.** A summary can be accurate but too long. A generated skill can succeed but use twice the tokens it needed to. You need scored metrics, not pass/fail, for most of what matters.

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

G-Eval (chain-of-thought-based scoring with a scoring function) is the most common pattern for structuring judge prompts well — it asks the judge to reason step by step against explicit criteria before emitting a score, which measurably improves judge-human agreement over a bare "rate 1-5" prompt.

### Layer 3 — Property-Based / Invariant Testing

Instead of checking a specific output, check properties that must hold across *all* outputs regardless of variance:

- The agent never calls a destructive action (delete, deploy, send) without an explicit confirmation step
- Idempotency: calling the same tool twice with the same arguments doesn't double-charge, double-send, or duplicate a record
- No response exceeds a hard token/length ceiling
- Every generated SQL query is read-only when the task doesn't require writes
- A generated skill never writes outside its declared working directory

This is where a lot of practical agent *safety* testing actually lives — you're not testing quality, you're testing that the guardrails hold no matter what path the agent takes to get there.

### Layer 4 — Golden Datasets and Regression Tracking

Curate a representative set of real inputs — ideally pulled from actual usage rather than invented — and snapshot how your system scores against them over time. You're not asserting exact output equality; you're asserting the **eval score on that set doesn't regress** when you change a prompt, swap a model version, or edit a skill definition.

The discipline that matters here: **score your current production system before setting an acceptance bar.** Don't invent a target in a vacuum — measure the baseline, then gate merges on "no regression below baseline" rather than an arbitrary absolute number. E.g. *"tool-selection success: current baseline 88%, acceptance bar 95%, anything below baseline blocks deploy."*

### Layer 5 — Statistical Sampling

A single run tells you almost nothing at temperature > 0. Run each test case N times (5–20 is typical) and look at the **distribution** of scores, not one output:

- Report pass-rate ("87% of runs satisfied the rubric") instead of pass/fail
- Track variance, not just mean — a task with 90% mean but huge variance is riskier than 85% with low variance
- This matters disproportionately for agents, since errors compound across turns — a 95%-reliable single tool call becomes a 60%-reliable five-step trajectory (0.95⁵ ≈ 0.77, and it gets worse fast as steps increase and per-step reliability drops)

### Layer 6 — Human-in-the-Loop

No rubric anticipates every edge case. Sample production traffic (5–10% is a common starting point) for manual review, and feed disagreements between human and judge scores back into refining the rubric. This is also where you catch the failure modes that are only obvious to a domain expert — a technically well-formed answer that's subtly wrong in a way no automated check would flag.

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
