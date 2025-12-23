+++
date = '2025-12-22T12:44:47+10:00'
draft = false
title = 'Autogen Patterns'
tags = ['Autogen', 'Agnetic AI', 'Design Patterns']
summary = "Autogen Patterns"
+++

## Introduction

## Architecture
![](../img/autogen_architecture.png)
### Components
- [Source](https://github.com/microsoft/autogen/tree/main/python/packages)
#### Apps
- [Magentic One](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/magentic-one.html) - Prebuilt application by microsoft
#### Frameworks
- [Extension](https://microsoft.github.io/autogen/stable/user-guide/extensions-user-guide/index.html)
- [Agent Chat](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/index.html)
  - **Definition** - AgentChat is a high-level API for building multi-agent applications. It is built on top of the autogen-core package. For beginner users, AgentChat is the recommended starting point. For advanced users, autogen-core’s event-driven programming model provides more flexibility and control over the underlying components.
- [Core](https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/index.html) 
  - **Definition** - AutoGen core offers an easy way to quickly build event-driven, distributed, scalable, resilient AI agent systems. Agents are developed by using the Actor model. You can build and run your agent system locally and easily move to a distributed system in the cloud when you are ready.
  - is Foundation and is rebuilt in version 0.4 v/s 0.2
  - **Asynchronous Messaging** - Agents communicate through asynchronous messages, enabling event-driven and request/response communication models. 
  - **Scalable & Distributed** - Enable complex scenarios with networks of agents across organizational boundaries. 
  - **Multi-Language Support** - Python & Dotnet interoperating agents today, with more languages coming soon. 
  - **Modular & Extensible** - Highly customizable with features like custom agents, memory as a service, tools registry, and model library. 
  - **Observable & Debuggable** - Easily trace and debug your agent systems. 
- **Event-Driven Architecture** - Build event-driven, distributed, scalable, and resilient AI agent systems.
  
#### Developer Tools
- [Studio](https://microsoft.github.io/autogen/stable/user-guide/autogenstudio-user-guide/index.html)
  - no coding
- Bench
  - Testing ground
  - Test AI models e.g. for
    - performance
    - parallelism
    - cost
   
```mermaid
classDiagram
    %% Base interfaces and abstract classes
    class ChatAgent {
      <<interface>>
      +name: str
      +description: str
      +produced_message_types: Sequence[type[BaseChatMessage]]
      +on_messages(messages, cancellation_token): Response
      +on_messages_stream(messages, cancellation_token): AsyncGenerator
      +run(task, cancellation_token, output_task_messages): TaskResult
      +run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
    }
    class ABC {
      <<abstract>>
    }
    class ComponentBase {
      <<interface>>
      +component_type: ComponentType
    }
    class Component~T~ {
      <<interface>>
      +component_version: int
      +component_config_schema: type
      +component_provider_override: str
    }
    class BaseChatAgent {
      <<abstract>>
      +component_type: ClassVar[ComponentType] = 'agent'
      +name: str
      +description: str
      +produced_message_types: Sequence[type[BaseChatMessage]]
      +on_messages(messages, cancellation_token): Response
      +on_messages_stream(messages, cancellation_token): AsyncGenerator
      +run(task, cancellation_token, output_task_messages): TaskResult
      +run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
      +on_reset(cancellation_token): None
      +on_pause(cancellation_token): None
      +on_resume(cancellation_token): None
      +save_state(): Mapping[str, Any]
      +load_state(state): None
      +close(): None
    }
    class AssistantAgent {
      +component_version: ClassVar[int] = 2
      +component_provider_override: ClassVar[str] = 'autogen_agentchat.agents.AssistantAgent'
      -_model_client: ChatCompletionClient
      -_tools: List[BaseTool]
      -_workbench: Workbench | Sequence[Workbench]
      -_handoffs: List[Handoff | str]
      -_model_context: ChatCompletionContext
      -_system_message: str
      -_model_client_stream: bool
      -_reflect_on_tool_use: bool
      -_max_tool_iterations: int
      -_tool_call_summary_format: str
      -_tool_call_summary_formatter: Callable
      -_output_content_type: type[BaseModel]
      -_memory: Sequence[Memory]
      +produced_message_types: Sequence[type[BaseChatMessage]]
      +model_context: ChatCompletionContext
      +on_messages(messages, cancellation_token): Response
      +on_messages_stream(messages, cancellation_token): AsyncGenerator
      +on_reset(cancellation_token): None
      +save_state(): Mapping[str, Any]
      +load_state(state): None
    }
    class CodeExecutorAgent {
      +component_provider_override: ClassVar[str] = 'autogen_agentchat.agents.CodeExecutorAgent'
      +DEFAULT_TERMINAL_DESCRIPTION: str
      +DEFAULT_AGENT_DESCRIPTION: str
      +DEFAULT_SYSTEM_MESSAGE: str
      +NO_CODE_BLOCKS_FOUND_MESSAGE: str
      +DEFAULT_SUPPORTED_LANGUAGES: List[str]
      -_code_executor: CodeExecutor
      -_model_client: ChatCompletionClient
      -_model_context: ChatCompletionContext
      -_model_client_stream: bool
      -_max_retries_on_error: int
      -_sources: Sequence[str]
      -_supported_languages: List[str]
      -_approval_func: Callable
      +produced_message_types: Sequence[type[BaseChatMessage]]
      +model_context: ChatCompletionContext
      +on_messages(messages, cancellation_token): Response
      +on_messages_stream(messages, cancellation_token): AsyncGenerator
      +extract_code_blocks_from_messages(messages): List[CodeBlock]
      +execute_code_block(code_blocks, cancellation_token): CodeResult
      +on_reset(cancellation_token): None
    }
    class ApprovalRequest {
      +code: str
      +context: List[LLMMessage]
    }
    class ApprovalResponse {
      +approved: bool
      +reason: str
    }
    
    %% Relationships
    ChatAgent <|.. BaseChatAgent
    ABC <|-- BaseChatAgent
    ComponentBase <|.. BaseChatAgent
    BaseChatAgent <|-- AssistantAgent
    Component~T~ <|.. AssistantAgent
    BaseChatAgent <|-- CodeExecutorAgent
    Component~T~ <|.. CodeExecutorAgent
    CodeExecutorAgent ..> ApprovalRequest
    CodeExecutorAgent ..> ApprovalResponse

```
