+++
date = '2026-04-24T12:00:00+00:00'
draft = false
title = 'DeepEvals — Placeholder'
tags = ['deepevals', 'ai']
summary = "Evaluating LLM Applications from Development to Production using DeepEval."
+++

## Evaluating LLM Applications from Development to Production using DeepEval

> **Based on the official DeepEval tutorials at [deepeval.com/tutorials](https://deepeval.com/tutorials/tutorial-introduction) — last updated April 2026.**

LLMs are probabilistic and prone to inconsistency. Eyeballing outputs won't catch subtle regressions, logical errors, or hallucinated responses. That's the core premise behind **DeepEval** — an open-source LLM evaluation framework built by Confident AI that gives developers a rigorous, repeatable way to test and improve their AI applications, from first prototype to live production.

This guide walks through everything covered in the official DeepEval tutorials: how to set up the framework, what the three main tutorial projects teach you, which metrics to use and when, and how to wire evaluations into a real CI/CD pipeline.

---

## What is DeepEval?

DeepEval is an open-source, Apache 2.0 licensed Python framework for evaluating LLM applications. It supports a wide range of evaluation metrics tailored to different use cases — RAG pipelines, conversational chatbots, agentic workflows, and summarization agents — and integrates with **Confident AI**, a cloud platform for dashboards, dataset management, tracing, and observability.

The framework is built around a core idea: **LLM evaluation isn't a one-time step — it's a continuous loop.** Production data sharpens development. Development precision strengthens production. DeepEval is designed to support both ends of that loop.

### Who This Is For

Whether you're building chatbots, summarizers, or agent systems powered by LLMs, these tutorials are designed for:

- Developers shipping LLM features in real products
- Researchers testing prompts or model variations
- Teams optimising LLM outputs at scale

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
pip install -U deepeval langchain-openai langchain-community langchain-text-splitters
```

### Writing Your First Test

Test files must be named with a `test_` prefix (e.g., `test_app.py`) for DeepEval to recognise and run them.

```python
# test_app.py
from deepeval import evaluate
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import GEval

# threshold is set on the metric — not on evaluate() or assert_test().
# A test passes when score >= threshold, and fails when score < threshold.
correctness_metric = GEval(
    name="Correctness",
    criteria="Determine if the 'actual output' is correct based on the 'expected output'.",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.EXPECTED_OUTPUT],
    threshold=0.5
)

test_case = LLMTestCase(
    input="I have a persistent cough and fever. Should I be worried?",
    actual_output="A persistent cough and fever could signal various illnesses, from minor "
                  "infections to more serious conditions like pneumonia or COVID-19. It's "
                  "advisable to seek medical attention if symptoms worsen or persist.",
    expected_output="A persistent cough and fever could indicate a range of illnesses, from "
                    "a mild viral infection to more serious conditions like pneumonia or "
                    "COVID-19. You should seek medical attention if symptoms worsen or persist."
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

You can also use any custom LLM as your evaluation model — DeepEval has [documentation covering this option](https://deepeval.com/guides/guides-using-custom-llms).

### Connecting to Confident AI

DeepEval works standalone, but you can optionally connect it to **Confident AI** for cloud dashboards, result logging, dataset management, and prompt versioning. It's free to get started:

```bash
deepeval login
```

Navigate to your Settings page, copy your Project API Key, and paste it when prompted. Login persists to `.env.local` by default. You can also log in programmatically or with a custom dotenv path:

```bash
# With a custom path
deepeval login --confident-api-key "ck_..." --save dotenv:.env.custom

# To clear saved credentials later
deepeval logout
```

---

## Tutorial 1: Meeting Summarizer

### What You'll Build

A **meeting summarisation agent** that takes a raw meeting transcript and returns:
- A concise plain-text summary of the discussion
- A structured JSON object of action items (individual and team-wide)

### Building the Agent

The agent is implemented as a `MeetingSummarizer` class using LangChain's `ChatOpenAI`. The key design decision is to split summarisation into two separate LLM calls — one for the summary, one for action items. This enables **component-level evaluation** later.

```python
# meeting_summarizer.py

import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from deepeval.tracing import observe, update_current_span
from deepeval import evaluate
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

load_dotenv()

# ---------------------------------------------------------------------------
# System Prompts
# ---------------------------------------------------------------------------

# Instructs the model to produce a concise, executive-style summary.
# Explicitly excludes action items to keep concerns separated from
# the ACTION_ITEM_PROMPT below.
SUMMARY_PROMPT = """You are an expert meeting summarization assistant. Generate a tightly
written, executive-style summary of the meeting transcript, focusing only on high-value
information: key technical insights, decisions made, problems discussed, model/tool
comparisons, and rationale behind proposals. Exclude all action items. Prioritize clarity,
brevity, and factual precision. The summary should allow a stakeholder to fully grasp the
discussion in under 60 seconds."""

# Instructs the model to extract action items as strict JSON.
# The rigid format constraint (no extra text, no inferred tasks) makes the
# response reliably machine-parseable via json.loads().
ACTION_ITEM_PROMPT = """Parse the following meeting transcript and extract only the action
items that are explicitly stated. Organize them into individual responsibilities, team-wide
tasks, and named entities. Respond with valid JSON only, following this exact format:

{
  "individual_actions": {
    "Alice": ["Task 1", "Task 2"],
    "Bob": ["Task 1"]
  },
  "team_actions": ["Task 1", "Task 2"],
  "entities": ["Alice", "Bob"]
}

Do not invent or infer any tasks. No natural language, notes, or extra formatting."""


# ---------------------------------------------------------------------------
# MeetingSummarizer
# ---------------------------------------------------------------------------

class MeetingSummarizer:
    """
    Processes a meeting transcript into two complementary outputs:
      1. A concise executive summary  (get_summary)
      2. Structured action items       (get_action_items)

    Both methods are traced via DeepEval's @observe decorator, allowing
    inputs, outputs, and latency to be captured for later evaluation.
    Different models can be used for each task since summarization and
    structured extraction have different quality/cost trade-offs.
    """

    def __init__(
        self,
        model: str = "gpt-4o",
        summary_system_prompt: str = "",
        action_item_system_prompt: str = "",
    ):
        """
        Args:
            model:                    Fallback model if no per-call model is specified.
            summary_system_prompt:    Overrides SUMMARY_PROMPT when provided.
            action_item_system_prompt: Overrides ACTION_ITEM_PROMPT when provided.
        """
        self.model = model
        # Fall back to the module-level defaults if no custom prompts are supplied
        self.summary_system_prompt = summary_system_prompt or SUMMARY_PROMPT
        self.action_item_system_prompt = action_item_system_prompt or ACTION_ITEM_PROMPT

    # ------------------------------------------------------------------ #
    #  Public entry point                                                  #
    # ------------------------------------------------------------------ #

    @observe(type="agent")  # Marks the root span; child spans nest inside this one
    def summarize(
        self,
        transcript: str,
        summary_model: str = "gpt-4o",
        action_item_model: str = "gpt-4-turbo",
    ) -> tuple[str, dict]:
        """
        Orchestrates both LLM calls and returns their results together.
        Using separate models per task lets us balance quality vs. cost:
          - gpt-4o        → better prose for the summary
          - gpt-4-turbo   → cheaper for the structured extraction task

        Returns:
            (summary, action_items) — plain string and parsed dict respectively.
        """
        summary = self.get_summary(transcript, summary_model)
        action_items = self.get_action_items(transcript, action_item_model)
        return summary, action_items

    # ------------------------------------------------------------------ #
    #  LLM helpers                                                         #
    # ------------------------------------------------------------------ #

    @observe(name="Summary")  # Creates a named child span under the agent span above
    def get_summary(self, transcript: str, model: str = None) -> str:
        """
        Sends the transcript to the model with the summary system prompt
        and returns the cleaned response text.

        update_current_span() manually attaches the prompt input and model
        output to the active DeepEval span so they can be evaluated later.
        """
        try:
            llm = ChatOpenAI(model=model or self.model)
            messages = [
                SystemMessage(content=self.summary_system_prompt),
                HumanMessage(content=transcript),
            ]
            response = llm.invoke(messages)
            summary = response.content.strip()

            # Attach I/O to the span so DeepEval can run evaluation metrics on it
            update_current_span(input=transcript, actual_output=summary)
            return summary

        except Exception as e:
            # Surface the error as a readable string rather than crashing the pipeline
            return f"Error: Could not generate summary: {e}"

    @observe(name="Action Items")  # Creates a second named child span
    def get_action_items(self, transcript: str, model: str = None) -> dict:
        """
        Sends the transcript to the model with the action-item system prompt
        and parses the response as JSON.

        Returns a structured dict on success, or an error dict on failure so
        callers always receive a consistent type (dict) regardless of outcome.
        """
        try:
            llm = ChatOpenAI(model=model or self.model, 
                             model_kwargs={"response_format": {"type": "json_object"}})
            messages = [
                SystemMessage(content=self.action_item_system_prompt),
                HumanMessage(content=transcript),
            ]
            response = llm.invoke(messages)
            raw = response.content.strip()

            # The prompt enforces JSON-only output; parse it directly
            action_items = json.loads(raw)

            # Attach I/O to the span for DeepEval evaluation
            update_current_span(input=transcript, actual_output=str(action_items))
            return action_items

        except json.JSONDecodeError:
            # Model didn't respect the JSON-only constraint; return raw output for debugging
            return {"error": "Invalid JSON returned from model", "raw_output": raw}

        except Exception as e:
            # Catch-all for network errors, auth failures, etc.
            return {"error": f"API call failed: {e}", "raw_output": ""}
```

testing meeting summarizer

```python
# test_meeting_summarizer.py

import pytest
from meeting_summarizer import MeetingSummarizer

SAMPLE_TRANSCRIPT = """
Alice: We need to decide between using GPT-4o and Claude for the summarization pipeline.
Bob: I ran benchmarks last week — Claude scored higher on faithfulness but GPT-4o was faster.
Alice: Given our latency requirements, let's go with GPT-4o for now and revisit in Q3.
Bob: Agreed. I'll update the model config and write up the benchmark results for the team.
Alice: I'll inform the stakeholders of the decision.
"""

@pytest.fixture
def summarizer():
    return MeetingSummarizer()

def test_summary_quality(summarizer):
    """Fails if the summary score drops below the 0.7 threshold."""
    summary = summarizer.get_summary(SAMPLE_TRANSCRIPT)
    summarizer.evaluate_summary(SAMPLE_TRANSCRIPT, summary)

def test_action_item_quality(summarizer):
    """Fails if extracted action items are invented or incomplete."""
    action_items = summarizer.get_action_items(SAMPLE_TRANSCRIPT)
    summarizer.evaluate_action_items(SAMPLE_TRANSCRIPT, action_items)

def test_full_pipeline_quality(summarizer):
    """Single call that runs both LLM steps and evaluates both outputs."""
    summary, action_items = summarizer.summarize_and_evaluate(SAMPLE_TRANSCRIPT)
    assert isinstance(summary, str) and len(summary) > 0
    assert "individual_actions" in action_items
```
### Setting Up Your Evaluation Dataset

Rather than maintaining a custom database, DeepEval uses `EvaluationDataset` objects populated with `Golden`s. A `Golden` stores just the `input` without requiring an `actual_output` — the output is generated at runtime.

```python
# create_dataset.py
import os
from deepeval.dataset import Golden, EvaluationDataset

documents_path = "path/to/transcripts/folder"
goldens = []

for filename in os.listdir(documents_path):
    if filename.endswith(".txt"):
        file_path = os.path.join(documents_path, filename)
        with open(file_path, "r") as f:
            transcript = f.read().strip()
        goldens.append(Golden(input=transcript))

dataset = EvaluationDataset(goldens=goldens)
dataset.push(alias="MeetingSummarizer Dataset")
print(f"Pushed {len(goldens)} goldens to Confident AI.")
```

### Evaluating the Summarizer

Pull the dataset, generate test cases at runtime, and run the evaluation. Because the agent makes two separate LLM calls, you create **two `LLMTestCase` objects per transcript**.

```python
# evaluate_summarizer.py
from deepeval import evaluate
from deepeval.dataset import EvaluationDataset
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import GEval
from meeting_summarizer import MeetingSummarizer

# --- Pull dataset ---
dataset = EvaluationDataset()
dataset.pull(alias="MeetingSummarizer Dataset")

summarizer = MeetingSummarizer()
summary_test_cases = []
action_item_test_cases = []

for golden in dataset.goldens:
    summary, action_items = summarizer.summarize(golden.input)
    summary_test_cases.append(
        LLMTestCase(input=golden.input, actual_output=summary)
    )
    action_item_test_cases.append(
        LLMTestCase(input=golden.input, actual_output=str(action_items))
    )

# --- Define metrics ---
# threshold is set on the metric constructor; a score >= 0.9 passes, < 0.9 fails
summary_concision = GEval(
    name="Summary Concision",
    criteria=(
        "Assess whether the summary is concise and focused only on the essential "
        "points of the meeting. It should avoid repetition, irrelevant details, "
        "and unnecessary elaboration."
    ),
    threshold=0.9,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
)

action_item_check = GEval(
    name="Action Item Accuracy",
    criteria=(
        "Are the action items accurate, complete, and clearly reflect the key tasks "
        "or follow-ups mentioned in the meeting?"
    ),
    threshold=0.9,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
)

# --- Run evaluations separately for each component ---
evaluate(test_cases=summary_test_cases, metrics=[summary_concision])
evaluate(test_cases=action_item_test_cases, metrics=[action_item_check])
```

`GEval` uses LLM-as-a-judge with chain-of-thought reasoning. It not only scores each test case but also explains *why* it passed or failed. A typical reason from a failing test case looks like:

> *"The summary captures key discussion points but includes some verbose phrasing. Some sentences feel unnecessarily elaborate for an executive-style brief."*

### Iterating on Hyperparameters

Use the evaluation scores to loop over different models and system prompts, logging `hyperparameters` in every `evaluate()` call so every score is traceable in Confident AI.

```python
# iterate_hyperparameters.py
from deepeval import evaluate
from deepeval.dataset import EvaluationDataset
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import GEval
from meeting_summarizer import MeetingSummarizer, SUMMARY_PROMPT, ACTION_ITEM_PROMPT

dataset = EvaluationDataset()
dataset.pull(alias="MeetingSummarizer Dataset")

summary_concision = GEval(
    name="Summary Concision",
    criteria="Assess whether the summary is concise and focused only on the essential points.",
    threshold=0.9,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
)
action_item_check = GEval(
    name="Action Item Accuracy",
    criteria="Are the action items accurate, complete, and clearly reflect the key tasks?",
    threshold=0.9,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
)

models = ["gpt-3.5-turbo", "gpt-4o", "gpt-4-turbo"]

for model in models:
    summarizer = MeetingSummarizer(
        model=model,
        summary_system_prompt=SUMMARY_PROMPT,
        action_item_system_prompt=ACTION_ITEM_PROMPT,
    )

    summary_test_cases = []
    action_item_test_cases = []

    for golden in dataset.goldens:
        summary, action_items = summarizer.summarize(golden.input)
        summary_test_cases.append(
            LLMTestCase(input=golden.input, actual_output=summary)
        )
        action_item_test_cases.append(
            LLMTestCase(input=golden.input, actual_output=str(action_items))
        )

    evaluate(
        test_cases=summary_test_cases,
        metrics=[summary_concision],
        hyperparameters={"model": model, "prompt": "updated-v2"},
    )
    evaluate(
        test_cases=action_item_test_cases,
        metrics=[action_item_check],
        hyperparameters={"model": model, "prompt": "updated-v2"},
    )
```

Results across the three models with the updated prompts:

| Model | Summary Concision | Action Item Accuracy |
|---|---|---|
| gpt-3.5-turbo | 0.7 | 0.6 |
| gpt-4o | **0.9** | 0.7 |
| gpt-4-turbo | 0.8 | **0.9** |

Different models excel at different tasks. The solution is to configure `gpt-4o` for summaries and `gpt-4-turbo` for action items by passing them as separate arguments to `summarize()`.

### CI/CD Integration

**Pytest test file:**

```python
# test_meeting_summarizer_quality.py
import pytest
from deepeval import assert_test
from deepeval.dataset import EvaluationDataset
from meeting_summarizer import MeetingSummarizer

dataset = EvaluationDataset()
dataset.pull(alias="MeetingSummarizer Dataset")

summarizer = MeetingSummarizer()

@pytest.mark.parametrize("golden", dataset.goldens)
def test_meeting_summarizer_components(golden):
    assert_test(golden=golden, observed_callback=summarizer.summarize)
```

Run it locally with:

```bash
poetry run deepeval test run test_meeting_summarizer_quality.py
```

**GitHub Actions workflow** — triggers on every push to `main`:

```yaml
# .github/workflows/deepeval-summarizer.yml
name: Meeting Summarizer DeepEval Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"

      - name: Install Poetry
        run: |
          curl -sSL https://install.python-poetry.org | python3 -
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Install Dependencies
        run: poetry install --no-root

      - name: Run DeepEval Tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          CONFIDENT_API_KEY: ${{ secrets.CONFIDENT_API_KEY }}
        run: poetry run deepeval test run test_meeting_summarizer_quality.py
```

---

## Tutorial 2: RAG QA Agent

### What You'll Build

A **Retrieval-Augmented Generation QA agent** built with LangChain. The tutorial uses a knowledge base about the fictional company Theranos as its domain. The agent evaluates both the **retriever** and the **generator** independently, as well as the combined pipeline.

### Building the Agent

The agent uses LangChain's `ChatOpenAI` for generation, `OpenAIEmbeddings` for embeddings, and `FAISS` as the vector store. Note the modern import paths: `langchain_openai` for model and embeddings classes, `langchain_community.vectorstores` for FAISS, and `langchain_text_splitters` for the text splitter.

```python
# rag_qa_agent.py
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage
from deepeval.tracing import observe, update_current_span
from deepeval.metrics import (
    ContextualRelevancyMetric,
    ContextualRecallMetric,
    ContextualPrecisionMetric,
    GEval,
)
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

GENERATOR_PROMPT = """You are an AI assistant designed for factual retrieval. Using the
context below, extract only the information needed to answer the user's query. Respond
in strictly valid JSON using this schema:

{{
  "answer": "string — a precise, factual answer found in the context",
  "citations": ["string — exact quotes or summaries that support the answer"]
}}

Do not fabricate information. Return only valid JSON. If no answer is found, return:
{{"answer": "No relevant information available.", "citations": []}}

Context:
{context}

Query:
{query}"""


class RAGAgent:
    def __init__(self, document_paths: list[str], k: int = 4):
        self.k = k
        self.vector_store = self._load_vector_store(document_paths)

    def _load_vector_store(self, document_paths: list[str]):
        texts = []
        for path in document_paths:
            with open(path, "r") as f:
                texts.append(f.read())
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.create_documents(texts)
        return FAISS.from_documents(chunks, OpenAIEmbeddings())

    @observe(
        metrics=[
            ContextualRelevancyMetric(),
            ContextualRecallMetric(),
            ContextualPrecisionMetric(),
        ],
        name="Retriever",
    )
    def retrieve(self, query: str) -> list[str]:
        docs = self.vector_store.similarity_search(query, k=self.k)
        context = [doc.page_content for doc in docs]
        update_current_span(
            test_case=LLMTestCase(
                input=query,
                actual_output="",
                retrieval_context=context,
            )
        )
        return context

    @observe(
        metrics=[
            GEval(
                name="Answer Correctness",
                criteria=(
                    "Evaluate if the actual output's 'answer' property is correct and "
                    "complete from the input and retrieved context. Reduce score if not."
                ),
                evaluation_params=[
                    LLMTestCaseParams.INPUT,
                    LLMTestCaseParams.ACTUAL_OUTPUT,
                    LLMTestCaseParams.RETRIEVAL_CONTEXT,
                ],
            ),
            GEval(
                name="Citation Accuracy",
                criteria=(
                    "Check if the citations in the actual output are correct and relevant "
                    "based on input and retrieved context. Reduce score if not."
                ),
                evaluation_params=[
                    LLMTestCaseParams.INPUT,
                    LLMTestCaseParams.ACTUAL_OUTPUT,
                    LLMTestCaseParams.RETRIEVAL_CONTEXT,
                ],
            ),
        ],
        name="Generator",
    )
    def generate(self, query: str, retrieved_docs: list[str]) -> str:
        context = "\n".join(retrieved_docs)
        prompt = GENERATOR_PROMPT.format(context=context, query=query)
        llm = ChatOpenAI(model="gpt-4o")
        response = llm.invoke([HumanMessage(content=prompt)])
        answer = response.content
        update_current_span(
            test_case=LLMTestCase(
                input=query,
                actual_output=answer,
                retrieval_context=retrieved_docs,
            )
        )
        return answer

    @observe(type="agent")
    def answer(self, query: str) -> tuple[str, list[str]]:
        retrieved_docs = self.retrieve(query)
        generated_answer = self.generate(query, retrieved_docs)
        return generated_answer, retrieved_docs
```

### Generating Synthetic QA Pairs (Recommended)

Use DeepEval's `Synthesizer` to generate question-answer pairs from your knowledge base. This creates ground truth and covers edge cases you'd never write manually.

```python
# create_rag_dataset.py
from deepeval.synthesizer import Synthesizer
from deepeval.dataset import EvaluationDataset

synthesizer = Synthesizer()
goldens = synthesizer.generate_goldens_from_docs(
    document_paths=["theranos_legacy.txt", "theranos_legacy.docx", "theranos_legacy.pdf"]
)

dataset = EvaluationDataset(goldens=goldens)
dataset.push(alias="RAG QA Agent Dataset")
print(f"Pushed {len(goldens)} synthetic QA pairs to Confident AI.")
```

The goldens returned by the synthesizer contain both `input` and `expected_output`, giving you a ground truth to evaluate against. `ContextualRecallMetric` and `ContextualPrecisionMetric` both require `expected_output` to be present on the test case — this is what the synthesizer provides. Using historical queries from a database is quicker but only backward-looking and may not reflect your current RAG agent's capabilities.

### Evaluating the RAG Agent

```python
# evaluate_rag_agent.py
from deepeval import evaluate
from deepeval.dataset import EvaluationDataset
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import (
    ContextualRelevancyMetric,
    ContextualRecallMetric,
    ContextualPrecisionMetric,
    GEval,
)
from rag_qa_agent import RAGAgent

# --- Pull dataset ---
dataset = EvaluationDataset()
dataset.pull("RAG QA Agent Dataset")

agent = RAGAgent(document_paths=["theranos_legacy.txt"])

# --- Build test cases ---
test_cases = []
for golden in dataset.goldens:
    retrieved_docs = agent.retrieve(golden.input)
    response = agent.generate(golden.input, retrieved_docs)
    test_cases.append(
        LLMTestCase(
            input=golden.input,
            actual_output=str(response),
            retrieval_context=retrieved_docs,
            expected_output=golden.expected_output,  # from Synthesizer; required for recall and precision
        )
    )

# --- Retriever metrics ---
relevancy = ContextualRelevancyMetric()
recall = ContextualRecallMetric()        # requires expected_output
precision = ContextualPrecisionMetric()  # requires expected_output

# --- Generator metrics ---
answer_correctness = GEval(
    name="Answer Correctness",
    criteria=(
        "Evaluate if the actual output's 'answer' property is correct and complete "
        "from the input and retrieved context. Reduce score if not."
    ),
    evaluation_params=[
        LLMTestCaseParams.INPUT,
        LLMTestCaseParams.ACTUAL_OUTPUT,
        LLMTestCaseParams.RETRIEVAL_CONTEXT,
    ],
)
citation_accuracy = GEval(
    name="Citation Accuracy",
    criteria=(
        "Check if the citations in the actual output are correct and relevant "
        "based on input and retrieved context. Reduce score if not."
    ),
    evaluation_params=[
        LLMTestCaseParams.INPUT,
        LLMTestCaseParams.ACTUAL_OUTPUT,
        LLMTestCaseParams.RETRIEVAL_CONTEXT,
    ],
)

# --- Run separately: retriever then generator ---
evaluate(test_cases, [relevancy, recall, precision])
evaluate(test_cases, [answer_correctness, citation_accuracy])
```

### CI/CD Integration

**Pytest test file:**

```python
# test_rag_qa_agent.py
import pytest
from deepeval import assert_test
from deepeval.dataset import EvaluationDataset
from rag_qa_agent import RAGAgent

dataset = EvaluationDataset()
dataset.pull(alias="RAG QA Agent Dataset")

agent = RAGAgent(document_paths=["theranos_legacy.txt"])

@pytest.mark.parametrize("golden", dataset.goldens)
def test_rag_qa_agent(golden):
    assert_test(golden=golden, observed_callback=agent.answer)
```

Run it locally with:

```bash
poetry run deepeval test run test_rag_qa_agent.py
```

**GitHub Actions workflow:**

```yaml
# .github/workflows/deepeval-rag.yml
name: RAG QA Agent DeepEval Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"

      - name: Install Poetry
        run: |
          curl -sSL https://install.python-poetry.org | python3 -
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Install Dependencies
        run: poetry install --no-root

      - name: Run DeepEval Tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          CONFIDENT_API_KEY: ${{ secrets.CONFIDENT_API_KEY }}
        run: poetry run deepeval test run test_rag_qa_agent.py
```

---

## Tutorial 3: Medical Chatbot (Multi-Turn Evaluation)

### What You'll Build

A **multi-turn medical chatbot** built with LangChain and Qdrant. The chatbot diagnoses symptoms using a RAG pipeline over a medical encyclopedia, books appointments, and retains memory across a full conversation. This tutorial introduces **conversational test cases** — the correct way to evaluate multi-turn dialogue.

### Building the Chatbot

```python
# medical_chatbot.py
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from langchain_openai import ChatOpenAI
from deepeval.tracing import observe, update_current_span, update_current_trace
from deepeval.metrics import ContextualRelevancyMetric

SYSTEM_PROMPT = """You are a virtual health assistant designed to support users with
symptom understanding and appointment management. Start every conversation by actively
listening to the user's concerns. Ask clear follow-up questions to gather information
like symptom duration, intensity, and relevant health history. Use available tools to
fetch diagnostic information or manage medical appointments. Never assume a diagnosis
unless there's enough detail, and always recommend professional medical consultation
when appropriate."""


class MedicalChatbot:
    def __init__(
        self,
        document_path: str,
        model: str = "gpt-4o",
        encoder: str = "all-MiniLM-L6-v2",
        system_prompt: str = "",
    ):
        self.llm = ChatOpenAI(model=model)
        self.appointments = {}
        self.encoder = SentenceTransformer(encoder)
        self.client = QdrantClient(":memory:")
        self.system_prompt = system_prompt or SYSTEM_PROMPT
        self.store_data(document_path)
        self.setup_agent(self.system_prompt)

    def store_data(self, document_path: str):
        # Load and embed The Gale Encyclopedia of Alternative Medicine into Qdrant
        ...

    def setup_agent(self, system_prompt: str):
        # Build a LangChain agent with memory, tools, and the system prompt
        ...

    @observe(metrics=[ContextualRelevancyMetric()], type="retriever")
    def query_engine(self, query: str) -> str:
        """Tool: retrieve diagnostic data from The Gale Encyclopedia of Alternative Medicine."""
        hits = self.client.search(
            collection_name="gale_encyclopedia",
            query_vector=self.encoder.encode(query).tolist(),
            limit=3,
        )
        contexts = [hit.payload["content"] for hit in hits]
        update_current_span(input=query, retrieval_context=contexts)
        return "\n".join(contexts)

    @observe(type="agent")
    def interactive_session(self, session_id: str):
        print("Hello! I am Baymax, your personal health care companion.")
        print("Type 'exit' to quit.")

        while True:
            user_input = input("Your query: ")
            if user_input.lower() == "exit":
                break

            response = self.agent_with_chat_history.invoke(
                {"input": user_input},
                config={"configurable": {"session_id": session_id}},
            )
            # Groups all turns in this session into a single conversation trace
            update_current_trace(
                thread_id=session_id,
                input=user_input,
                output=response["output"],
            )
            print("Baymax:", response["output"])
```

### Setting Up Conversational Test Cases

Unlike single-turn test cases, multi-turn conversations are modelled with `ConversationalTestCase` and `Turn`:

```python
from deepeval.test_case import ConversationalTestCase, Turn

test_case = ConversationalTestCase(
    turns=[
        Turn(role="user",      content="I've had a sore throat for three days."),
        Turn(role="assistant", content="I'm sorry to hear that. How severe is the pain on a scale of 1–10?"),
        Turn(role="user",      content="About a 6. I also have a slight fever."),
        Turn(role="assistant", content="Given the duration and fever, this could indicate a bacterial infection. I recommend seeing a doctor for a throat swab."),
    ]
)
```

### Three Approaches to Testing Multi-Turn Conversations

**1. Historical data** — Fast to set up, but only backward-looking:

```python
from deepeval.test_case import ConversationalTestCase, Turn

conversations = fetch_conversations_from_db()  # your DB call here

test_cases = []
for conv in conversations:
    turns = [Turn(role=msg["role"], content=msg["content"]) for msg in conv["messages"]]
    test_cases.append(ConversationalTestCase(turns=turns))
```

**2. Manual prompting** — Tests the current version but is slow and hard to scale:

```python
from deepeval.test_case import ConversationalTestCase, Turn

chatbot = MedicalChatbot(document_path="gale_encyclopedia.pdf")
turns = []
session_id = "manual-session-001"

while True:
    user_input = input("Your query: ")
    if user_input.lower() == "exit":
        break

    response = chatbot.agent_with_memory.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}},
    )
    turns.append(Turn(role="user",      content=user_input))
    turns.append(Turn(role="assistant", content=response["output"]))
    print("Baymax:", response["output"])

test_case = ConversationalTestCase(turns=turns)
```

**3. User simulation (recommended)** — Automated, consistent, forward-looking. Define scenarios in `ConversationalGolden`s (note: `scenario` and `expected_outcome` live on the golden, not on the test case):

```python
# create_chatbot_dataset.py
from deepeval.dataset import EvaluationDataset, ConversationalGolden

goldens = [
    ConversationalGolden(
        scenario="User with a sore throat asking for paracetamol.",
        expected_outcome="Gets a recommendation for panadol.",
    ),
    ConversationalGolden(
        scenario="Frustrated user looking to rebook their appointment.",
        expected_outcome="Gets redirected to a human agent.",
    ),
    ConversationalGolden(
        scenario="User just looking to talk to somebody.",
        expected_outcome="Told the chatbot isn't meant for this use case.",
    ),
    # Include at least 20 goldens for a meaningful benchmark.
]

dataset = EvaluationDataset(goldens=goldens)
dataset.push(alias="Medical Chatbot Dataset")
print(f"Pushed {len(goldens)} conversational goldens to Confident AI.")
```

Then simulate conversations and run evaluations:

```python
# simulate_and_evaluate.py
from typing import List
from deepeval.dataset import EvaluationDataset
from deepeval.test_case import Turn
from deepeval.simulator import ConversationSimulator
from deepeval.metrics import TurnRelevancyMetric, TurnFaithfulnessMetric
from deepeval import evaluate
from medical_chatbot import MedicalChatbot

chatbot = MedicalChatbot(document_path="gale_encyclopedia.pdf")

dataset = EvaluationDataset()
dataset.pull(alias="Medical Chatbot Dataset")

# Wrap your chatbot in the required callback signature.
# The callback must return a plain string — the simulator constructs the Turn internally.
def model_callback(input: str, turns: List[Turn], thread_id: str) -> str:
    user_input = turns[-1].content
    response = chatbot.agent_with_chat_history.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": thread_id}},
    )
    return response["output"]

simulator = ConversationSimulator(model_callback=model_callback)
test_cases = simulator.simulate(goldens=dataset.goldens)

# TurnRelevancyMetric: generic — loops through each assistant turn using a
#   sliding window of historical context. Works for any conversational use case.
# TurnFaithfulnessMetric: specific — checks whether any assistant turn
#   contradicts the retrieval context it was given.
relevancy = TurnRelevancyMetric()
faithfulness = TurnFaithfulnessMetric()

evaluate(
    test_cases=test_cases,
    metrics=[relevancy, faithfulness],
    hyperparameters={"Model": "gpt-4o", "Prompt": "health-assistant-v2"},
)
```

### Production Online Evaluation

Once deployed, trigger online evaluations using the thread ID from each live conversation and a Metric Collection defined in Confident AI:

```python
# online_eval.py
from deepeval.tracing import evaluate_thread

# Called after a real production conversation ends.
# thread_id matches the session_id passed to interactive_session().
evaluate_thread(
    thread_id="user-session-abc123",
    metric_collection="Medical Chatbot Metrics",
)
```

---

## Core Concepts: A Reference Summary

### LLMTestCase vs ConversationalTestCase

| Feature | `LLMTestCase` | `ConversationalTestCase` |
|---|---|---|
| Use case | Single-turn interactions | Multi-turn dialogues |
| Key fields | `input`, `actual_output`, `retrieval_context`, `expected_output` | `turns` (list of `Turn`) |
| Typical apps | RAG agents, summarisers | Chatbots, voice assistants |

### Golden vs TestCase

| Feature | `Golden` / `ConversationalGolden` | `LLMTestCase` / `ConversationalTestCase` |
|---|---|---|
| Requires `actual_output`? | No | Yes |
| When to use | Dataset creation, storage | At evaluation time |
| Role | Template / input definition | Fully populated test unit |
| Extra fields | `expected_output`, `scenario`, `expected_outcome` | — |

`scenario` and `expected_outcome` are fields on `ConversationalGolden` (used when defining simulation scenarios). They are not fields on `ConversationalTestCase` itself.

### Metric Types

| Metric | Type | Use Case |
|---|---|---|
| `GEval` | LLM-as-a-judge | Any custom criteria |
| `ContextualRelevancyMetric` | RAG | Retriever quality |
| `ContextualRecallMetric` | RAG | Retriever coverage (needs `expected_output`) |
| `ContextualPrecisionMetric` | RAG | Retriever precision (needs `expected_output`) |
| `TurnRelevancyMetric` | Multi-turn | Conversational relevance |
| `TurnFaithfulnessMetric` | Multi-turn | Grounding in retrieved context |
| `ArenaGEval` | LLM-as-a-judge | Head-to-head model comparison |

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

**Simulate conversations, don't write them manually.** `ConversationSimulator` produces consistent, repeatable benchmarks far faster than interactive manual testing, and tests the current version of your system rather than past behaviour.

**Always set `threshold` on the metric, not on `evaluate()` or `assert_test()`.** Each metric gets its own threshold via its constructor. A score >= threshold passes; below it fails. `evaluate()` and `assert_test()` simply run whatever metrics you pass in.

**Log hyperparameters in every `evaluate()` call.** Scores without associated configuration data are nearly impossible to use for systematic improvement. Every run should be traceable to a specific model and prompt version.

**Choose your evaluation model carefully.** The tutorials recommend strong models like `gpt-4o` or `claude-3-opus` for evaluation, especially for summarisation tasks. The evaluation model's quality directly affects the reliability of your scores.

**Run at least 20 goldens per evaluation run.** Fewer test cases produce noisy, statistically unreliable metrics. Twenty is a practical minimum to distinguish a genuine regression from random variance in LLM outputs.

---

## Conclusion

DeepEval brings software engineering discipline to LLM development — the same emphasis on automated testing, reproducibility, and regression detection that software teams apply to traditional code. The three tutorial projects (meeting summariser, RAG QA agent, medical chatbot) cover the most common LLM application patterns and demonstrate how the same core workflow — build, evaluate, improve, deploy — applies across all of them.

The framework is open source, actively maintained (the tutorials were last updated in April 2026), and integrates with Confident AI for production observability with no code changes beyond a decorator.

**Resources:**
- Official tutorials: [deepeval.com/tutorials](https://deepeval.com/tutorials/tutorial-introduction)
- GitHub: [github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval)
- Discord community: [discord.gg/a3K9c8GRGt](https://discord.gg/a3K9c8GRGt)
- Confident AI platform: [app.confident-ai.com](https://app.confident-ai.com)
