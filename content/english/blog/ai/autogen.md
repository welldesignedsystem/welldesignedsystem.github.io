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

## PlantUML
```plantuml
@startuml

' Base interfaces and abstract classes
interface ChatAgent {
  +{abstract} name: str
  +{abstract} description: str
  +{abstract} produced_message_types: Sequence[type[BaseChatMessage]]
  +{abstract} on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +run(task, cancellation_token, output_task_messages): TaskResult
  +run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
}

abstract class ABC {
}

interface ComponentBase {
  +component_type: ComponentType
}

interface Component<T> {
  +component_version: int
  +component_config_schema: type
  +component_provider_override: str
}

' BaseChatAgent - the main base class
abstract class BaseChatAgent {
  +component_type: ClassVar[ComponentType] = 'agent'
  --
  +__init__(name: str, description: str)
  --
  +name: str <<property>>
  +description: str <<property>>
  +{abstract} produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  +{abstract} on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +run(task, cancellation_token, output_task_messages): TaskResult
  +run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
  +{abstract} on_reset(cancellation_token): None
  +on_pause(cancellation_token): None
  +on_resume(cancellation_token): None
  +save_state(): Mapping[str, Any]
  +load_state(state): None
  +close(): None
}

' Concrete agent implementations
class AssistantAgent {
  +component_version: ClassVar[int] = 2
  +component_provider_override: ClassVar[str]
  --
  +__init__(name: str, model_client: ChatCompletionClient, \\
    tools: List[BaseTool] = None, \\
    workbench: Workbench = None, \\
    handoffs: List[Handoff | str] = None, \\
    model_context: ChatCompletionContext = None, \\
    description: str = "...", \\
    system_message: str = "...", \\
    model_client_stream: bool = False, \\
    reflect_on_tool_use: bool = None, \\
    max_tool_iterations: int = 1, \\
    tool_call_summary_format: str = "{result}", \\
    tool_call_summary_formatter: Callable = None, \\
    output_content_type: type[BaseModel] = None, \\
    output_content_type_format: str = None, \\
    memory: Sequence[Memory] = None, \\
    metadata: Dict[str, str] = None)
  --
  +produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  +model_context: ChatCompletionContext <<property>>
  +on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +on_reset(cancellation_token): None
  +save_state(): Mapping[str, Any]
  +load_state(state): None
}

class CodeExecutorAgent {
  +component_provider_override: ClassVar[str]
  +DEFAULT_TERMINAL_DESCRIPTION: str
  +DEFAULT_AGENT_DESCRIPTION: str
  +DEFAULT_SYSTEM_MESSAGE: str
  +NO_CODE_BLOCKS_FOUND_MESSAGE: str
  +DEFAULT_SUPPORTED_LANGUAGES: List[str]
  --
  +__init__(name: str, code_executor: CodeExecutor, \\
    model_client: ChatCompletionClient = None, \\
    model_context: ChatCompletionContext = None, \\
    model_client_stream: bool = False, \\
    max_retries_on_error: int = 0, \\
    description: str = None, \\
    system_message: str = DEFAULT_SYSTEM_MESSAGE, \\
    sources: Sequence[str] = None, \\
    supported_languages: List[str] = None, \\
    approval_func: Callable = None)
  --
  +produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  +model_context: ChatCompletionContext <<property>>
  +on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +extract_code_blocks_from_messages(messages): List[CodeBlock]
  +execute_code_block(code_blocks, cancellation_token): CodeResult
  +on_reset(cancellation_token): None
}

' Support classes
class ApprovalRequest {
  +code: str
  +context: List[LLMMessage]
}

class ApprovalResponse {
  +approved: bool
  +reason: str
}

' Relationships
ChatAgent <|.. BaseChatAgent : implements
ABC <|-- BaseChatAgent : extends
ComponentBase <|.. BaseChatAgent : implements

BaseChatAgent <|-- AssistantAgent : extends
Component <|.. AssistantAgent : implements

BaseChatAgent <|-- CodeExecutorAgent : extends
Component <|.. CodeExecutorAgent : implements

CodeExecutorAgent ..> ApprovalRequest : uses
CodeExecutorAgent ..> ApprovalResponse : uses

' Notes
note right of BaseChatAgent
  Base abstract class for all agents.
  Provides common functionality and
  defines the interface that all agents
  must implement.
end note

note right of AssistantAgent
  An agent that provides assistance
  with tool use and can generate
  responses using a model client.
  Supports structured output, tool
  calling, handoffs, and memory.
end note

note right of CodeExecutorAgent
  (Experimental) An agent that generates
  and executes code snippets based on
  user instructions. Can work with or
  without a model client.
end note

@enduml
```
