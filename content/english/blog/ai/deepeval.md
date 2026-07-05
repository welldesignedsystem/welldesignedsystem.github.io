+++
date = '2026-07-06T10:00:00+10:00'
draft = false
title = 'DeepEval: CI-Gated Typed Metrics for LLM Outputs'
tags = ['DeepEval', 'Evals', 'LLM', 'Testing', 'CI', 'Python', 'Metrics']
summary = "DeepEval provides typed, built-in metrics for LLM outputs — faithfulness, hallucination, toxicity, bias, and more. You define a metric, wrap your LLM call, and the metric scores the output and gates CI."
+++

## What DeepEval Does

DeepEval is a Python library that provides typed evaluation metrics for LLM outputs. You wrap your LLM call, select which metrics to measure, and run the eval. It handles the scoring logic under the hood — including calling an LLM judge for metrics like faithfulness and GEval — and outputs a pass/fail that you can assert on in CI.

It fills Layers 1–3 of the [eval pyramid](../ai-outputs-eval.md) with ready-made metrics so you do not have to write word-count, JSON-validity, or containment checks by hand (or worse, by regex). But its real value is in the higher-layer semantic metrics: faithfulness, hallucination, summarisation quality, and the configurable GEval rubric.

## When to Use DeepEval

| Scenario | Use DeepEval | Use something else |
|---|---|---|
| You need a faithfulness/hallucination metric | ✅ Built-in `FaithfulnessMetric` | — |
| You want a custom rubric scored by an LLM | ✅ `GEval` with your own criteria | — |
| You need toxicity, bias, or bias detection | ✅ Built-in metrics for all 3 | — |
| You want CI-gated evals with minimal effort | ✅ `deepeval.assert_test()` | — |
| You are comparing models or prompts | — | ✅ Promptfoo |
| You need historical dashboards and trend analysis | — | ✅ Braintrust |
| You want property-based invariant testing | — | ✅ hypothesis |

DeepEval is not a runner — it is a metric library you call from pytest (or any Python runner). That is its strength and its limitation. It gives you the scoring function; you provide the test structure.

## Core Metrics

### Faithfulness and Hallucination

The most common use case: did the LLM invent facts not present in the provided context?

```python
from deepeval.metrics import FaithfulnessMetric
from deepeval.test_case import LLMTestCase

metric = FaithfulnessMetric(
    threshold=0.7,
    model="gpt-4o",
)

test_case = LLMTestCase(
    input="Summarise the Q3 earnings report.",
    actual_output="Q3 revenue grew 12% to $2.1B, driven by cloud services.",
    retrieval_context=[
        "Q3 earnings: revenue $2.1B, up 12% YoY, led by cloud segment.",
    ],
)

metric.measure(test_case)
print(f"Faithfulness: {metric.score:.2f}, Pass: {metric.is_successful()}")
```

The metric calls an LLM judge to compare the output against the retrieval context and score how much is directly supported.

### GEval — Your Own Rubric

GEval lets you define arbitrary criteria and have an LLM score against them:

```python
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCaseParams

metric = GEval(
    name="Conciseness",
    criteria="The output must answer the question in under 3 sentences.",
    evaluation_params=[
        LLMTestCaseParams.INPUT,
        LLMTestCaseParams.ACTUAL_OUTPUT,
    ],
    threshold=0.8,
)

test_case = LLMTestCase(
    input="Explain Kubernetes in simple terms.",
    actual_output="Kubernetes orchestrates containerised applications across a cluster of machines. It handles deployment, scaling, and networking so you do not have to.",
)
metric.measure(test_case)
```

This is the Layer 2 model-graded eval pattern, but you do not write the judge prompt yourself.

### Toxicity, Bias, and Contextual Relevancy

DeepEval ships metrics for safety and relevance:

```python
from deepeval.metrics import ToxicityMetric, BiasMetric, ContextualRelevancyMetric

toxicity = ToxicityMetric(threshold=0.5)
bias = BiasMetric(threshold=0.5)
relevancy = ContextualRelevancyMetric(threshold=0.7)
```

Each returns a score 0.0–1.0 and a pass/fail against your threshold. The toxicity and bias metrics use a classification model (not an LLM judge), so they are fast and deterministic.

## Dataset Management

DeepEval's `LLMTestCase` is a dataclass with typed fields:

- `input` — the prompt
- `actual_output` — the LLM response
- `expected_output` — optional, for comparison metrics
- `retrieval_context` — list of source documents, used by faithfulness/relevancy metrics
- `context` — additional metadata
- `tools_called` — for agentic evals

You can store test cases in a list and run them in bulk:

```python
test_cases = [
    LLMTestCase(input="Capital of France?", actual_output="Paris", expected_output="Paris"),
    LLMTestCase(input="Explain OOP.", actual_output="Object-oriented programming is a paradigm..."),
]

for tc in test_cases:
    metric.measure(tc)
```

## CI Gate

The simplest CI pattern uses `deepeval.assert_test()`:

```python
from deepeval import assert_test

def test_faithfulness():
    test_case = LLMTestCase(
        input="What caused the 2008 financial crisis?",
        actual_output="The 2008 crisis was caused by subprime mortgage defaults...",
        retrieval_context=[
            "The financial crisis was triggered by a collapse in subprime mortgage lending...",
        ],
    )
    assert_test(test_case, [FaithfulnessMetric(threshold=0.7)])
```

Run with pytest. If the metric score falls below threshold, the test fails and CI blocks the merge.

## Custom Metrics

You can write your own metrics by subclassing `BaseMetric`:

```python
from deepeval.metrics import BaseMetric
from deepeval.scorer import Scorer

class ContainsMetric(BaseMetric):
    def __init__(self, *substrings: str, threshold: float = 1.0):
        self.substrings = substrings
        self.threshold = threshold

    def measure(self, test_case):
        output = test_case.actual_output
        matches = sum(1 for s in self.substrings if s.lower() in output.lower())
        self.score = matches / len(self.substrings)
        self.success = self.score >= self.threshold
        return self.score

    def is_successful(self):
        return self.success

    @property
    def __name__(self):
        return "Contains"
```

Use it like any built-in metric:

```python
metric = ContainsMetric("Paris", "capital", threshold=0.66)
metric.measure(test_case)
```

The companion repo includes [`scripts/example_deepeval.py`](https://github.com/welldesignedsystem/baba-yaga/blob/main/scripts/tools/example_deepeval.py) with a custom `ContainsMetric`, a `GEval` rubric, and a `FaithfulnessMetric` for a complete eval loop.

## DeepEval vs. Promptfoo vs. Braintrust

| Dimension | DeepEval | Promptfoo | Braintrust |
|---|---|---|---|
| Primary function | Typed metrics library | Model/prompt comparison + red-teaming | Eval history + dashboards |
| Faithfulness metric | Built-in | Manual via `llm-rubric` | Manual scorer |
| CI gate | `deepeval.assert_test()` | `promptfoo check` | Platform webhook |
| Dashboard | None | Local web UI | Full web dashboards |
| Custom logic | Python `BaseMetric` | JS/Python snippets | Python scorers |
| Configuration | Python only | YAML (no code) | Python + web UI |

All three are usable together. The pattern: pytest is the runner, DeepEval provides metrics, Promptfoo handles model comparison, and Braintrust stores the history. Each tool fills a layer of the pyramid.

## Companion Repo

The companion repo includes [`scripts/example_deepeval.py`](https://github.com/welldesignedsystem/baba-yaga/blob/main/scripts/tools/example_deepeval.py) with a complete DeepEval eval loop using custom and built-in metrics.

## Further Reading

- [DeepEval documentation](https://docs.confident-ai.com/)
- [Testing LLM Outputs: The Eval Pyramid](../ai-outputs-eval.md)
- [Braintrust: Eval History, Dashboards and CI Gates](../braintrust.md)
- [Promptfoo: Model Comparison and Red-Teaming](../promptfoo.md)
- [pytest for LLM Evaluation](../pytest.md)
