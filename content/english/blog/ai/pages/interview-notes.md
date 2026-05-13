---
title: "Interview Notes"
meta_title: ""
description: "Interview Notes"
draft: false
---
# Q1: Claude Models — Practical GenAI Guide (LangChain + LangGraph Focus)

## Key characteristics:
- Claude by Antropic is a family of LLMs optimized for reasoning, reliability and structured output.
- Strong reasoning and structured output
- Very large context window (~200K tokens)
- Lower hallucination rates in multi-step workflows
- Excellent for agents, RAG, and evaluation loops

## Claude Model Variants (Practical Comparison)

| Model | Strengths | Weaknesses | Best Use Cases | Context Window |
|------|----------|------------|---------------|----------------|
| Claude 3 Opus | Deep reasoning, best coding | Expensive, slower | Complex agents, architecture design, critical reasoning | ~200K |
| Claude 3 Sonnet | Balanced performance | Slightly weaker than Opus | Default production workloads, APIs, agents | ~200K |
| Claude 3 Haiku | Fast, cheap | Limited reasoning | Chatbots, classification, routing | ~200K |

## LangChain — Access Patterns

### Direct LLM Base Model

```python
from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(
    model="claude-3-sonnet-20240229",
    temperature=0.2
)

response = llm.invoke("Explain microservices")
```

### using init_model

```python
from langchain.chat_models import init_model
LLM = init_model(
        model="claude-3-sonnet-20240229",
        model_provider=provider,
        temperature=0.2
    )
response = llm.invoke("Explain microservices")
```
## Model Comparison

| Model | Cost | Speed | Reasoning | Context | Best For |
|------|------|------|----------|--------|---------|
| Claude Sonnet | Medium | Medium | High | Very High | - Production agents<br>- Balanced performance tasks<br>- Multi-step workflows |
| Claude Opus | High | Slow | Very High | Very High | - Critical reasoning<br>- Complex problem solving<br>- High-stakes decisions |
| GPT-4/5 | High | Medium | Very High | High | - General purpose tasks<br>- Creative writing<br>- Advanced coding<br>- Research and analysis |
| Mistral | Low / Free | Fast | Medium | Medium | - Cost-sensitive applications<br>- Fast prototyping<br>- Lightweight chatbots<br>- Open-source projects |
| LLaMA | Free | Medium | Medium | Medium | - On-premises deployment<br>- Private data handling<br>- Custom fine-tuning<br>- Resource-constrained environments |
| Gemini | Medium | Fast | High | Very High | - Multimodal applications<br>- Image and text integration<br>- Fast responses<br>- Google ecosystem integration |

---

# Q2: Using Deterministic Code v/s Non Deterministic LLM

> Code handles truth. LLMs handle meaning.
## What is Deterministic Code?

- Deterministic systems always produce the same output for the same input.
- Deterministic code gives predicability, correctness, consistency, and control  

```python
total = price * quantity
```

## What is an LLM?

- LLMs generate outputs based on probability.
- LLMs give flexibility, interpretation, and reasoning  

Example:
```
Summarize this customer complaint
```
Outputs may vary slightly each time.

## How to Reduce Variability in LLM Outputs (Improve Determinism)

LLMs are inherently probabilistic, but in production systems you can **significantly reduce variance** and make outputs behave almost deterministically.

Below are the techniques that actually work in practice.
- **1. Control Sampling Parameters (Most Important)**
Temperature

```python
temperature = 0.0 - 0.3
```
---

## Comparison

| Dimension | Deterministic Code | LLM |
|----------|------------------|-----|
| Output | Exact | Probabilistic |
| Reliability | High | Variable |
| Cost | Low | Higher |
| Speed | Fast | Slower |
| Use Case | Logic, rules, math | Language, reasoning |

## When to Use Deterministic Code

- Business rules  
- Data validation  
- Calculations  
- Security systems  
- Database operations  

## When to Use LLMs

- Language understanding  
- Content generation  
- Unstructured data processing  
- Semantic search (RAG)  
- Reasoning tasks  

## Hybrid Architecture

### Example Flow

1. LLM interprets user input  
2. Code validates and decides  
3. LLM generates response  

### Common Mistakes

❌ Using LLM for strict logic  
❌ Using code for natural language understanding  

### Decision Framework

- One correct answer → Code  
- Ambiguous problem → LLM  
- No tolerance for error → Code  
- Flexible output acceptable → LLM  


### Final Takeaways

- Code = precision and reliability  
- LLM = flexibility and intelligence  
- Best systems = hybrid  

# Q3: Miscellaneous:
- https://welldesignedsystem.github.io/blog/ai/gen_ai_langchain/#prompt-engineering-and-patterns
- https://welldesignedsystem.github.io/blog/system_design/system_design/#rest-and-rest-maturity-model 
- https://welldesignedsystem.github.io/blog/system_design/system_design/#2-distributed-scaling--the-scale-cube
- https://welldesignedsystem.github.io/blog/system_design/youtube/#2a-microservice-decomposition--hexagonal-architecture-chris-richardson
- https://welldesignedsystem.github.io/blog/system_design/system_design/#cap-theorem
- https://welldesignedsystem.github.io/blog/system_design/system_design/#sql-vs-nosql-vs-object-store
- https://welldesignedsystem.github.io/blog/containerization/docker/
- https://welldesignedsystem.github.io/blog/containerization/kubernetes/
- https://docs.langchain.com/
