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

## Mermaid   
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
