+++
date = '2024-01-01T12:44:47+10:00'
draft = false
title = 'Partners & Patterns — OpenAI Agents SDK'
tags = ['OpenAI', 'Agents', 'Design Patterns', 'AI']
summary = "Here we explore agentic systems and design patterns using the OpenAI Agents SDK."
+++

## AI Agent
AI Agent is an inteligent system that has the ability to perceive its environment, reason about it, and take actions to achieve specific goals. They are able to 
1. Observe and interpret their surroundings using sensors or data inputs
2. Reason and make decisions based on their observations and predefined objectives
3. Act upon their environment through actuators or output mechanisms to achieve desired outcomes.

### Anatomy of AI Agent:
- Models: The core components that enable the agent to understand and interact with its environment. This includes natural language processing models, computer vision models, and other specialized models for specific tasks.
- Tools: The functionalities and capabilities that the agent can utilize to perform tasks. This includes APIs
- Memory: The ability of the agent to retain and recall information from past interactions, allowing it to learn and adapt over time.

## Design Patterns

CoT (Chain of Thought) Prompting: This pattern involves breaking down complex tasks into smaller, manageable steps. The agent is guided through a series of prompts that encourage it to think through the problem step by step, leading to more accurate and coherent responses.
ReACT (Reasoning and Acting) Pattern: This pattern combines reasoning and action in a loop. The agent first reasons about the task at hand, then takes an action based on its reasoning, and finally evaluates the outcome of that action. This iterative process allows the agent to refine its approach and improve performance over time.
Plan-and-Execute Pattern: In this pattern, the agent first creates a plan of action based on its understanding of the task and the environment. It then executes the plan step by step, monitoring progress and making adjustments as needed. This structured approach helps ensure that the agent stays focused on its goals and effectively navigates complex tasks.
Hierarchical/Multi-Agent Systems: This pattern involves organizing multiple agents into a hierarchy or network, where each agent has specific roles and responsibilities. Higher-level agents can oversee and coordinate the actions of lower-level agents, allowing for more complex and collaborative problem-solving.

## Use of LiteLLM
LiteLLM is a lightweight library designed to facilitate the development and deployment of AI agents. It provides a simple and efficient interface for integrating various models, tools, and memory mechanisms into agentic systems. LiteLLM supports modular design, allowing developers to easily swap out components and experiment with different configurations. This flexibility makes it an ideal choice for building custom AI agents tailored to specific applications and domains.
OpenAI Agents SDK leverages LiteLLM to streamline the creation of AI agents, providing a robust foundation for implementing the design patterns mentioned above. By utilizing LiteLLM, developers can focus on designing intelligent behaviors and interactions, while relying on the library to handle the underlying complexities of model integration and memory management.
## Core Primitives
### Agent
Agent is an autonomous entity that perceives its environment, makes decisions and takes actions to achieve specific goals. Agents can be designed to operate in various domains, such as virtual environments, robotics, or software applications. They can utilize different models, tools, and memory mechanisms to enhance their capabilities and adapt to changing circumstances.
- https://github.com/welldesignedsystem/crispy-meme/blob/main/src/basics.py#L31-L37


- https://github.com/welldesignedsystem/crispy-meme/blob/main/src/basics.py#L60-L82
