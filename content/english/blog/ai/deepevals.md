+++
date = '2026-04-25T12:00:00+00:00'
draft = false
title = 'DeepEvals — Placeholder'
tags = ['deepevals', 'ai']
summary = "Placeholder post for DeepEvals."
+++

## Evaluating LLM Applications from Development to Production using DeepEval

> **Based on the official DeepEval tutorials at [deepeval.com/tutorials](https://deepeval.com/tutorials/tutorial-introduction) — last updated April 2026.**

LLMs are probabilistic and prone to inconsistency. Eyeballing outputs won't catch subtle regressions, logical errors, or hallucinated responses. That's the core premise behind **DeepEval** — an open-source LLM evaluation framework built by Confident AI that gives developers a rigorous, repeatable way to test and improve their AI applications, from first prototype to live production.

This guide walks through everything covered in the official DeepEval tutorials: how to set up the framework, what the three main tutorial projects teach you, which metrics to use and when, and how to wire evaluations into a real CI/CD pipeline.

---

## What is DeepEval?

DeepEval is an open-source, Apache 2.0 licensed Python framework for evaluating LLM applications. It supports a wide range of evaluation metrics tailored to different use cases — RAG pipelines, conversational chatbots, agentic workflows, and summarization agents — and integrates with **Confident AI**, a cloud platform for dashboards, dataset management, tracing, and observability.

The framework is built around a core idea: **LLM evaluation isn't a one-time step — it's a continuous loop.** Production data sharpens development. Development precision strengthens production. DeepEval is designed to support both ends of that loop.

### Key Terminology

Before diving in, the tutorials establish four key terms used throughout:

- **Hyperparameters** — The configuration values that shape your LLM application: system prompts, model choice, temperature, chunk size (for RAG), and more.
- **System Prompt** — A prompt that defines the overall behaviour of your LLM across all interactions.
- **Generation Model** — The LLM you're actually evaluating (the model that produces responses).
- **Evaluation Model** — A separate LLM used to score or critique the generation model's outputs. This is *not* the model being evaluated. By default, DeepEval uses OpenAI's models for this.

---

## Getting Started: Installation and Your First Eval

### Installation

```bash
pip install -U deepeval
```

### Writing Your First Test

Test files must be named with a `test_` prefix (e.g., `test_app.py`) for DeepEval to recognise and run them.

```python
from deepeval import evaluate
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import GEval

correctness_metric = GEval(
    name="Correctness",
    criteria="Determine if the 'actual output' is correct based on the 'expected output'.",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.EXPECTED_OUTPUT],
    threshold=0.5
)

test_case = LLMTestCase(
    input="I have a persistent cough and fever. Should I be worried?",
    actual_output="A persistent cough and fever could signal various illnesses...",
    expected_output="A persistent cough and fever could indicate a range of illnesses..."
)

evaluate([test_case], [correctness_metric])
```

Run it with:

```bash
deepeval test run test_app.py
```

Because metrics like `GEval` use LLM-as-a-judge under the hood, you'll need to set your OpenAI API key:

```bash
export OPENAI_API_KEY="your_api_key"
```

You can also use any custom LLM as your evaluation model — DeepEval has documentation covering this option.

### Connecting to Confident AI

DeepEval works standalone, but you can optionally connect it to **Confident AI** for cloud dashboards, result logging, dataset management, annotation, and prompt versioning. It's free to get started:

```bash
deepeval login
```

After creating an account, paste your Confident AI Project API Key. Login persists to `.env.local` by default. You can also log in programmatically or specify a custom dotenv path.

---

## Tutorial 1: Meeting Summarizer

### What You'll Build

A **meeting summarisation agent** that takes a raw meeting transcript and returns:
- A concise plain-text summary of the discussion
- A structured JSON object of action items (individual and team-wide)

This mirrors how tools like Otter.ai and Circleback work.

### Building the Agent

The agent is implemented as a `MeetingSummarizer` class using the OpenAI API. The key design decision is to split summarisation into two separate LLM calls with tailored system prompts — one for the summary, one for action items. This enables **component-level evaluation** later.

**Summary system prompt (initial):**
```
You are an AI assistant summarizing meeting transcripts. Provide a clear and
concise summary of the following conversation, avoiding interpretation and
unnecessary details. Focus on the main discussion points only. Do not include
any action items. Respond with only the summary as plain text — no headings,
formatting, or explanations.
```

**Action items system prompt (initial):**
```
Extract all action items from the following meeting transcript. Identify individual
and team-wide action items in the following format:

{
  "individual_actions": { "Alice": ["Task 1"] },
  "team_actions": ["Task 1"],
  "entities": ["Alice"]
}

Only include what is explicitly mentioned. Do not infer. Respond strictly in valid JSON.
```

The `MeetingSummarizer` class exposes `get_summary()`, `get_action_items()`, and a combined `summarize()` method returning a tuple of `(str, dict)`.

### Evaluating the Summarizer

Since the agent makes two separate LLM calls, you create **two `LLMTestCase` objects per transcript**: one for the summary output and one for the action items output.

**Setting up datasets with Goldens:**

Rather than maintaining a custom database, DeepEval uses `EvaluationDataset` objects populated with `Golden`s. A `Golden` stores just the `input` (the transcript) without requiring an `actual_output` at creation time — the output is generated at runtime when you call your LLM.

```python
from deepeval.dataset import Golden, EvaluationDataset

goldens = [Golden(input=transcript) for transcript in transcripts]
dataset = EvaluationDataset(goldens=goldens)
dataset.push(alias="MeetingSummarizer Dataset")
```

Later, pull the dataset and generate test cases on the fly:

```python
dataset = EvaluationDataset()
dataset.pull(alias="MeetingSummarizer Dataset")

for golden in dataset.goldens:
    summary, action_items = summarizer.summarize(golden.input)
    summary_test_cases.append(LLMTestCase(input=golden.input, actual_output=summary))
    action_item_test_cases.append(LLMTestCase(input=golden.input, actual_output=str(action_items)))
```

**Metrics used — both are custom `GEval`:**

```python
summary_concision = GEval(
    name="Summary Concision",
    criteria="Assess whether the summary is concise and focused only on the essential points...",
    threshold=0.9,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT]
)

action_item_check = GEval(
    name="Action Item Accuracy",
    criteria="Are the action items accurate, complete, and clearly reflect the key tasks...?",
    threshold=0.9,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT]
)
```

`GEval` uses LLM-as-a-judge with chain-of-thought (CoT) reasoning to produce scores and human-readable explanations for why test cases pass or fail — making it easy to debug your application.

### Improving via Hyperparameter Iteration

Using the evaluation scores, you can iterate over different models and prompts systematically. The tutorials show running evaluations across `gpt-3.5-turbo`, `gpt-4o`, and `gpt-4-turbo` with updated, more detailed system prompts:

| Model | Summary Concision | Action Item Accuracy |
|---|---|---|
| gpt-3.5-turbo | 0.7 | 0.6 |
| gpt-4o | **0.9** | 0.7 |
| gpt-4-turbo | 0.8 | **0.9** |

The results show that different models can excel at different tasks. The solution presented is to use `gpt-4o` for summary generation and `gpt-4-turbo` for action items — exposing `summary_model` and `action_item_model` as separate parameters on the `summarize()` method.

Pass `hyperparameters` to the `evaluate()` call to track which model and prompt produced each score in Confident AI:

```python
evaluate(
    test_cases=summary_test_cases,
    metrics=[summary_concision],
    hyperparameters={"model": model},
)
```

### CI/CD Integration

DeepEval integrates directly with pytest and GitHub Actions. The test file uses `assert_test` with `@pytest.mark.parametrize` over your dataset goldens:

```python
@pytest.mark.parametrize("golden", dataset.goldens)
def test_meeting_summarizer_components(golden):
    assert_test(golden=golden, observed_callback=summarizer.summarize)
```

The `@observe` decorator is added to agent methods for tracing, enabling component-level visibility and online metrics in production. A complete GitHub Actions YAML workflow triggers the test run on every push to `main`.

---

## Tutorial 2: RAG QA Agent

### What You'll Build

A **Retrieval-Augmented Generation QA agent** built with OpenAI and LangChain. The tutorial uses a knowledge base about the fictional company Theranos as its domain, but the patterns apply to any RAG application. The agent evaluates both the **retriever** (what context is fetched) and the **generator** (how well it answers using that context) in isolation, as well as the combined pipeline.

### RAG-Specific Test Cases

For RAG applications, `LLMTestCase` must include a `retrieval_context` field alongside `input` and `actual_output`:

```python
test_case = LLMTestCase(
    input="...",          # The user query
    actual_output="...",  # The RAG agent's answer
    retrieval_context=[], # The retrieved document chunks
    expected_output="..."  # From the golden
)
```

### Generating Synthetic QA Pairs (Recommended Approach)

The recommended approach is to use DeepEval's `Synthesizer` to generate synthetic question-answer pairs from your knowledge base documents. This produces a dataset that covers edge cases you'd never manually think of:

```python
from deepeval.synthesizer import Synthesizer

synthesizer = Synthesizer()
goldens = synthesizer.generate_goldens_from_docs(
    document_paths=['knowledge_base.txt', 'knowledge_base.pdf']
)

dataset = EvaluationDataset(goldens=goldens)
dataset.push(alias="RAG QA Agent Dataset")
```

Alternatively, historical queries from your database can be used, though this approach is backward-looking and doesn't reflect your current RAG agent's capabilities.

### Retriever Metrics

DeepEval provides three purpose-built metrics for evaluating a retriever:

- **`ContextualRelevancyMetric`** — The retrieved context must be relevant to the query
- **`ContextualRecallMetric`** — The retrieved context must be sufficient to answer the query (requires `expected_output`)
- **`ContextualPrecisionMetric`** — The retrieved context should be precise, without unnecessary noise (requires `expected_output`)

```python
from deepeval.metrics import (
    ContextualRelevancyMetric,
    ContextualRecallMetric,
    ContextualPrecisionMetric,
)

relevancy = ContextualRelevancyMetric()
recall = ContextualRecallMetric()
precision = ContextualPrecisionMetric()
```

### Generator Metrics

For the generator, custom `GEval` metrics are created for use-case-specific criteria:

```python
answer_correctness = GEval(
    name="Answer Correctness",
    criteria="Evaluate if the actual output's 'answer' is correct and complete from the input and retrieved context.",
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.RETRIEVAL_CONTEXT]
)

citation_accuracy = GEval(
    name="Citation Accuracy",
    criteria="Check if the citations in the actual output are correct and relevant.",
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.RETRIEVAL_CONTEXT]
)
```

Retriever and generator evaluations are run separately:

```python
evaluate(test_cases, [relevancy, recall, precision])
evaluate(test_cases, [answer_correctness, citation_accuracy])
```

### RAG Hyperparameters to Iterate On

Unlike the summarizer, a RAG application has more tunable hyperparameters: embedding model, chunk size, chunk overlap, number of retrieved chunks (`top_k`), and the generation model. The improvement section of this tutorial demonstrates how to loop over these configurations, evaluate each combination with the same dataset, and identify the configuration that produces the best scores across all metrics.

### Production Tracing for RAG

In production, the `@observe` decorator is applied to the retriever component with `type="retriever"` and the `ContextualRelevancyMetric` attached inline. `update_current_span()` is called after retrieval to log the input query and the fetched contexts:

```python
@observe(metrics=[ContextualRelevancyMetric()], type="retriever")
def retrieve(self, query: str) -> list:
    hits = self.client.search(...)
    contexts = [hit.payload['content'] for hit in hits]
    update_current_span(input=query, retrieval_context=contexts)
    return contexts
```

CI/CD integration follows the same pytest + GitHub Actions pattern as the summarizer tutorial.

---

## Tutorial 3: Medical Chatbot (Multi-Turn Evaluation)

### What You'll Build

A **multi-turn medical chatbot** built with OpenAI, LangChain, and Qdrant. The chatbot can diagnose symptoms using a RAG pipeline over a medical encyclopedia, book appointments, and retain memory across a full conversation. This tutorial introduces **conversational test cases** — the correct way to evaluate multi-turn dialogue.

### ConversationalTestCase

Unlike single-turn test cases, multi-turn conversations are modelled using `ConversationalTestCase` and `Turn` objects:

```python
from deepeval.test_case import ConversationalTestCase, Turn

test_case = ConversationalTestCase(
    turns=[
        Turn(role="user", content="I've had a sore throat for three days."),
        Turn(role="assistant", content="I'm sorry to hear that. How severe is the pain..."),
    ]
)
```

A `ConversationalTestCase` can optionally include `scenario` and `expected_outcome` fields, which are used when simulating conversations.

### Three Approaches to Testing Multi-Turn Conversations

**1. Historical data** — Convert past production conversations into `ConversationalTestCase` objects. Fast to set up, but only backward-looking.

**2. Manual prompting** — Interactively build conversations by running the chatbot yourself, capturing turns. Better than historical data (tests the current version), but slow and hard to scale.

**3. User simulation (recommended)** — Use `ConversationSimulator` to automatically simulate entire conversations based on predefined scenarios, using `ConversationalGolden`s:

```python
from deepeval.dataset import EvaluationDataset, ConversationalGolden

goldens = [
    ConversationalGolden(
        scenario="User with a sore throat asking for paracetamol.",
        expected_outcome="Gets a recommendation for panadol."
    ),
    ConversationalGolden(
        scenario="Frustrated user looking to rebook their appointment.",
        expected_outcome="Gets redirected to a human agent"
    ),
]

dataset = EvaluationDataset(goldens=goldens)
dataset.push(alias="Medical Chatbot Dataset")
```

Simulate conversations by wrapping your chatbot in a callback:

```python
from deepeval.simulator import ConversationSimulator

def model_callback(input, turns, thread_id):
    response = chatbot.agent.invoke({"input": turns[-1].content}, ...)
    return Turn(role="assistant", content=response["output"])

simulator = ConversationSimulator(model_callback=model_callback)
test_cases = simulator.simulate(goldens=dataset.goldens)
```

The tutorials recommend at least **20 goldens** for a barely-adequate evaluation dataset, since each golden produces one test case.

### Conversational Metrics

DeepEval provides dedicated metrics for multi-turn evaluation:

**`TurnRelevancyMetric`** — A generic metric that loops through each assistant turn and uses a sliding window approach to construct historical context for evaluation. Relevancy is the most common multi-turn metric and applies to virtually any use case.

**`TurnFaithfulnessMetric`** — Specific to chatbots that use external knowledge (like a RAG pipeline). It checks whether each assistant turn contradicts the retrieval context it was given.

```python
from deepeval.metrics import TurnRelevancyMetric, TurnFaithfulnessMetric

relevancy = TurnRelevancyMetric()
faithfulness = TurnFaithfulnessMetric()

evaluate(
    test_cases=test_cases,
    metrics=[relevancy, faithfulness],
    hyperparameters={"Model": MODEL, "Prompt": SYSTEM_PROMPT}
)
```

By logging hyperparameters, every score is tied to a specific model and prompt version — making it easy to identify regressions when either parameter changes.

### Production Tracing for Chatbots

The `@observe(type="agent")` decorator wraps the interactive session, and `update_current_trace()` records the thread ID, input, and output on every turn. This groups individual LLM calls into a full conversation trace:

```python
@observe(type="agent")
def interactive_session(self, session_id):
    while True:
        user_input = input("Your query: ")
        response = self.agent_with_chat_history.invoke({"input": user_input}, ...)
        update_current_trace(
            thread_id=session_id,
            input=user_input,
            output=response["output"]
        )
```

Online evaluation is then triggered by thread ID using `evaluate_thread()`, which runs against a **Metric Collection** defined in Confident AI:

```python
from deepeval.tracing import evaluate_thread

evaluate_thread(thread_id="your-thread-id", metric_collection="Metric Collection")
```

---

## Core Concepts: A Reference Summary

### LLMTestCase vs ConversationalTestCase

| Feature | `LLMTestCase` | `ConversationalTestCase` |
|---|---|---|
| Use case | Single-turn interactions | Multi-turn dialogues |
| Key fields | `input`, `actual_output`, `retrieval_context`, `expected_output` | `turns` (list of `Turn`), `scenario`, `expected_outcome` |
| Typical apps | RAG agents, summarisers | Chatbots, voice assistants |

### Golden vs TestCase

| Feature | `Golden` | `LLMTestCase` / `ConversationalTestCase` |
|---|---|---|
| Requires `actual_output`? | No | Yes |
| When to use | Dataset creation, storage | At evaluation time |
| Role | Template / input definition | Fully populated test unit |

### Metric Types

| Metric | Type | Use Case |
|---|---|---|
| `GEval` | LLM-as-a-judge | Any custom criteria |
| `ContextualRelevancyMetric` | RAG | Retriever quality |
| `ContextualRecallMetric` | RAG | Retriever coverage |
| `ContextualPrecisionMetric` | RAG | Retriever precision |
| `TurnRelevancyMetric` | Multi-turn | Conversational relevance |
| `TurnFaithfulnessMetric` | Multi-turn | Grounding in retrieved context |

---

## The Evaluation Workflow: End-to-End

Every tutorial follows the same four-stage lifecycle:

**Stage 1 — Build.** Implement your LLM application with tunable hyperparameters (model, system prompt, retrieval config) exposed as variables. Use modular functions for components you'll want to evaluate in isolation.

**Stage 2 — Evaluate.** Define criteria, choose the right metrics, create test cases from your dataset, and run evaluations. Interpret the reasons provided by LLM-as-a-judge metrics to understand why specific test cases fail.

**Stage 3 — Improve.** Iterate over hyperparameters — update prompts, switch models, adjust retrieval settings. Rerun evaluations with the same dataset to produce comparable benchmarks. Log hyperparameters in every `evaluate()` call.

**Stage 4 — Deploy.** Add `@observe` decorators, attach metrics to spans, and wire `assert_test` into CI/CD using pytest and GitHub Actions. For production, use `evaluate_thread()` and metric collections on Confident AI.

---

## Best Practices

**Use datasets, not ad-hoc test cases.** Store inputs as `Golden`s in `EvaluationDataset` objects on Confident AI so you can pull and reuse them across iterations without maintaining a separate database.

**Separate component evaluation from end-to-end evaluation.** For RAG agents, evaluate the retriever and generator independently before assessing the whole pipeline. For summarisers, create separate test cases for each LLM call.

**Generate synthetic data for RAG.** DeepEval's `Synthesizer` creates question-answer pairs from your knowledge base documents and covers edge cases you'd never manually identify.

**Simulate conversations, don't write them manually.** `ConversationSimulator` produces consistent, repeatable benchmarks far faster than interactive manual testing.

**Log hyperparameters in every `evaluate()` call.** Scores without associated configuration data are nearly impossible to use for systematic improvement.

**Choose your evaluation model carefully.** The tutorials recommend strong models like `gpt-4`, `gpt-4o`, or `claude-3-opus` for evaluation, especially for summarisation tasks. The evaluation model's quality directly affects the reliability of your scores.

**Run at least 20 goldens per evaluation run.** Fewer test cases produce noisy metrics that may not represent real performance.

---

## Conclusion

DeepEval brings software engineering discipline to LLM development — the same emphasis on automated testing, reproducibility, and regression detection that software teams apply to traditional code. The three tutorial projects (meeting summariser, RAG QA agent, medical chatbot) cover the most common LLM application patterns and demonstrate how the same core workflow — build, evaluate, improve, deploy — applies across all of them.

The framework is open source, actively maintained (the tutorials were last updated in April 2026), and integrates with Confident AI for production observability with no code changes beyond a decorator.

**Resources:**
- Official tutorials: [deepeval.com/tutorials](https://deepeval.com/tutorials/tutorial-introduction)
- GitHub: [github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval)
- Discord community: [discord.gg/a3K9c8GRGt](https://discord.gg/a3K9c8GRGt)
- Confident AI platform: [app.confident-ai.com](https://app.confident-ai.com)
