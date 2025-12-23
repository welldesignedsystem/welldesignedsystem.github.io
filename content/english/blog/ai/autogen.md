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
@startuml
!define INTERFACE_BG #E8F5E9
!define ABSTRACT_BG #FFF9C4
!define CONCRETE_BG #E3F2FD
!define MESSAGE_BG #FCE4EC
!define CONDITION_BG #F3E5F5
!define TEAM_BG #E0F2F1

' ============ BASE INTERFACES AND PROTOCOLS ============

interface TaskRunner <<Protocol>> {
  +{abstract} run(task, cancellation_token, output_task_messages): TaskResult
  +{abstract} run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
}

interface ChatAgent <<Protocol>> {
  +{abstract} name: str <<property>>
  +{abstract} description: str <<property>>
  +{abstract} produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  +{abstract} on_messages(messages, cancellation_token): Response
  +{abstract} on_messages_stream(messages, cancellation_token): AsyncGenerator
}

interface ComponentBase {
  +component_type: ComponentType
}

interface Component<T> {
  +component_version: int
  +component_config_schema: type
  +component_provider_override: str
  +_to_config(): T
  +_from_config(config: T): Self
}

abstract class ABC

' ============ BASE AGENT CLASS ============

abstract class BaseChatAgent {
  +component_type: ClassVar[ComponentType] = 'agent'
  #_name: str
  #_description: str
  --
  +__init__(name: str, description: str)
  --
  +name: str <<property>>
  +description: str <<property>>
  +{abstract} produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  --
  +{abstract} on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +run(task, cancellation_token, output_task_messages): TaskResult
  +run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
  --
  +{abstract} on_reset(cancellation_token): None
  +on_pause(cancellation_token): None
  +on_resume(cancellation_token): None
  +save_state(): Mapping[str, Any]
  +load_state(state): None
  +close(): None
}

TaskRunner <|.. BaseChatAgent : implements
ChatAgent <|.. BaseChatAgent : implements
ABC <|-- BaseChatAgent : extends
ComponentBase <|.. BaseChatAgent : implements

' ============ MESSAGE HIERARCHY ============

abstract class BaseChatMessage <<message_bg>> {
  +source: str
  +models_usage: RequestUsage | None
  +metadata: Dict[str, Any]
  +type: str <<property>>
  --
  +{abstract} to_text(): str
  +{abstract} to_model_text(): str
  +{abstract} to_model_message(): LLMMessage
}

abstract class BaseTextMessage <<message_bg>> {
  +content: str
  --
  +to_text(): str
  +to_model_text(): str
  +to_model_message(): UserMessage
}

class TextMessage <<message_bg>> {
  +content: str
  --
  +__init__(content: str, source: str, models_usage: RequestUsage | None = None)
}

class MultiModalMessage <<message_bg>> {
  +content: List[str | Image]
  --
  +__init__(content: List[str | Image], source: str, models_usage: RequestUsage | None = None)
  +to_text(): str
  +to_model_text(): str
  +to_model_message(): UserMessage
}

class StopMessage <<message_bg>> {
  +content: str
  --
  +__init__(content: str, source: str)
}

class HandoffMessage <<message_bg>> {
  +content: str
  +target: str
  +context: List[LLMMessage]
  --
  +__init__(content: str, target: str, source: str, context: List[LLMMessage] = [])
}

class ResetMessage <<message_bg>> {
  +content: str
  --
  +__init__(content: str, source: str)
}

class ToolCallMessage <<message_bg>> {
  +content: List[FunctionCall]
  --
  +__init__(content: List[FunctionCall], source: str, models_usage: RequestUsage | None = None)
}

class ToolCallResultMessage <<message_bg>> {
  +content: List[FunctionExecutionResult]
  --
  +__init__(content: List[FunctionExecutionResult], source: str)
}

class ToolCallSummaryMessage <<message_bg>> {
  +content: str
  +call_id: str
  --
  +__init__(content: str, call_id: str, source: str)
}

class StructuredMessage<T> <<message_bg>> {
  +content: T
  +format_string: str | None
  --
  +__init__(content: T, source: str, format_string: str | None = None)
  +to_text(): str
}

' Message Event Types
abstract class BaseAgentEvent <<message_bg>> {
  +source: str
  +metadata: Dict[str, Any]
  +type: str <<property>>
}

class UserInputRequestedEvent <<message_bg>> {
  +prompt: str
  --
  +__init__(prompt: str, source: str)
}

class ModelClientStreamingChunkEvent <<message_bg>> {
  +content: str
  --
  +__init__(content: str, source: str)
}

class ToolCallExecutionEvent <<message_bg>> {
  +content: List[FunctionExecutionResult]
  --
  +__init__(content: List[FunctionExecutionResult], source: str)
}

BaseChatMessage <|-- BaseTextMessage
BaseTextMessage <|-- TextMessage
BaseChatMessage <|-- MultiModalMessage
BaseTextMessage <|-- StopMessage
BaseChatMessage <|-- HandoffMessage
BaseTextMessage <|-- ResetMessage
BaseChatMessage <|-- ToolCallMessage
BaseChatMessage <|-- ToolCallResultMessage
BaseTextMessage <|-- ToolCallSummaryMessage
BaseChatMessage <|-- StructuredMessage

BaseAgentEvent <|-- UserInputRequestedEvent
BaseAgentEvent <|-- ModelClientStreamingChunkEvent
BaseAgentEvent <|-- ToolCallExecutionEvent

' ============ CONCRETE AGENT IMPLEMENTATIONS ============

class AssistantAgent <<concrete_bg>> {
  +component_version: ClassVar[int] = 2
  +component_provider_override: ClassVar[str]
  #_model_client: ChatCompletionClient
  #_tools: List[BaseTool]
  #_workbench: Workbench | None
  #_handoffs: List[Handoff]
  #_model_context: ChatCompletionContext
  #_system_message: str
  #_reflect_on_tool_use: bool
  #_max_tool_iterations: int
  #_tool_call_summary_formatter: Callable
  #_output_content_type: type[BaseModel] | None
  #_memory: Sequence[Memory]
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

class CodeExecutorAgent <<concrete_bg>> {
  +component_provider_override: ClassVar[str]
  +DEFAULT_TERMINAL_DESCRIPTION: str
  +DEFAULT_AGENT_DESCRIPTION: str
  +DEFAULT_SYSTEM_MESSAGE: str
  +NO_CODE_BLOCKS_FOUND_MESSAGE: str
  +DEFAULT_SUPPORTED_LANGUAGES: List[str]
  #_code_executor: CodeExecutor
  #_model_client: ChatCompletionClient | None
  #_model_context: ChatCompletionContext | None
  #_max_retries_on_error: int
  #_sources: Sequence[str]
  #_supported_languages: List[str]
  #_approval_func: Callable
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

class UserProxyAgent <<concrete_bg>> {
  +component_type: ClassVar[ComponentType] = 'agent'
  +component_provider_override: ClassVar[str]
  #_input_func: InputFuncType
  --
  +__init__(name: str, description: str = "...", \\
    input_func: InputFuncType = None)
  --
  +produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  +on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +on_reset(cancellation_token): None
}

class SocietyOfMindAgent <<concrete_bg>> {
  +component_provider_override: ClassVar[str]
  +DEFAULT_INSTRUCTION: str
  +DEFAULT_RESPONSE_PROMPT: str
  +DEFAULT_DESCRIPTION: str
  #_team: Team
  #_model_client: ChatCompletionClient
  #_instruction: str
  #_response_prompt: str
  #_model_context: ChatCompletionContext
  --
  +__init__(name: str, team: Team, \\
    model_client: ChatCompletionClient, \\
    description: str = DEFAULT_DESCRIPTION, \\
    instruction: str = DEFAULT_INSTRUCTION, \\
    response_prompt: str = DEFAULT_RESPONSE_PROMPT, \\
    model_context: ChatCompletionContext = None)
  --
  +produced_message_types: Sequence[type[BaseChatMessage]] <<property>>
  +model_context: ChatCompletionContext <<property>>
  +on_messages(messages, cancellation_token): Response
  +on_messages_stream(messages, cancellation_token): AsyncGenerator
  +on_reset(cancellation_token): None
  +save_state(): Mapping[str, Any]
  +load_state(state): None
}

BaseChatAgent <|-- AssistantAgent
Component <|.. AssistantAgent : implements

BaseChatAgent <|-- CodeExecutorAgent
Component <|.. CodeExecutorAgent : implements

BaseChatAgent <|-- UserProxyAgent
Component <|.. UserProxyAgent : implements

BaseChatAgent <|-- SocietyOfMindAgent
Component <|.. SocietyOfMindAgent : implements

' ============ RESPONSE AND RESULT TYPES ============

class Response {
  +chat_message: TextMessage | MultiModalMessage | StopMessage | HandoffMessage | ResetMessage
  +inner_messages: List[ToolCallMessage | ToolCallResultMessage] | None
  --
  +__init__(chat_message: BaseChatMessage, \\
    inner_messages: List | None = None)
}

class TaskResult {
  +messages: Sequence[ToolCallMessage | ToolCallResultMessage | \\
    TextMessage | MultiModalMessage | StopMessage | \\
    HandoffMessage | ResetMessage]
  +stop_reason: str | None
  --
  +__init__(messages: Sequence[BaseChatMessage], \\
    stop_reason: str | None = None)
}

' ============ TERMINATION CONDITIONS ============

abstract class TerminationCondition <<condition_bg>> {
  +component_type: ClassVar[ComponentType] = 'termination'
  --
  +{abstract} terminated: bool <<property>>
  +{abstract} __call__(messages): StopMessage | None
  +{abstract} reset(): None
  +__or__(other: TerminationCondition): OrTerminationCondition
  +__and__(other: TerminationCondition): AndTerminationCondition
}

class MaxMessageTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_max_messages: int
  #_message_count: int
  #_terminated: bool
  --
  +__init__(max_messages: int)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class TextMentionTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_text: str
  #_sources: List[str] | None
  #_terminated: bool
  --
  +__init__(text: str, sources: List[str] | None = None)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class HandoffTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_target: str
  #_terminated: bool
  --
  +__init__(target: str)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class TokenUsageTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_max_prompt_tokens: int | None
  #_max_completion_tokens: int | None
  #_prompt_token_count: int
  #_completion_token_count: int
  #_terminated: bool
  --
  +__init__(max_prompt_tokens: int | None = None, \\
    max_completion_tokens: int | None = None)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class ExternalTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_terminated: bool
  --
  +__init__()
  --
  +terminated: bool <<property>>
  +set(): None
  +__call__(messages): StopMessage | None
  +reset(): None
}

class TextMessageTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_sources: List[str] | None
  #_terminated: bool
  --
  +__init__(sources: List[str] | None = None)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class FunctionCallTermination <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_function_name: str
  #_terminated: bool
  --
  +__init__(function_name: str)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class OrTerminationCondition <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_conditions: Tuple[TerminationCondition, ...]
  --
  +__init__(*conditions: TerminationCondition)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

class AndTerminationCondition <<condition_bg>> {
  +component_provider_override: ClassVar[str]
  #_conditions: Tuple[TerminationCondition, ...]
  --
  +__init__(*conditions: TerminationCondition)
  --
  +terminated: bool <<property>>
  +__call__(messages): StopMessage | None
  +reset(): None
}

ComponentBase <|.. TerminationCondition : implements
Component <|.. TerminationCondition : implements

TerminationCondition <|-- MaxMessageTermination
TerminationCondition <|-- TextMentionTermination
TerminationCondition <|-- HandoffTermination
TerminationCondition <|-- TokenUsageTermination
TerminationCondition <|-- ExternalTermination
TerminationCondition <|-- TextMessageTermination
TerminationCondition <|-- FunctionCallTermination
TerminationCondition <|-- OrTerminationCondition
TerminationCondition <|-- AndTerminationCondition

' ============ TEAM HIERARCHY ============

interface Team <<Protocol>> {
  +{abstract} name: str <<property>>
  +{abstract} description: str <<property>>
  +{abstract} run(task, cancellation_token, output_task_messages): TaskResult
  +{abstract} run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
  +{abstract} reset(): None
  +{abstract} pause(): None
  +{abstract} resume(): None
  +{abstract} save_state(): Mapping[str, Any]
  +{abstract} load_state(state): None
  +{abstract} close(): None
}

abstract class BaseGroupChat <<team_bg>> {
  #_name: str
  #_description: str
  #_participants: List[ChatAgent | Team]
  #_participant_names: List[str]
  #_termination_condition: TerminationCondition | None
  #_max_turns: int | None
  --
  +__init__(participants: List[ChatAgent | Team], \\
    name: str | None = None, \\
    description: str | None = None, \\
    termination_condition: TerminationCondition = None, \\
    max_turns: int | None = None)
  --
  +name: str <<property>>
  +description: str <<property>>
  +run(task, cancellation_token, output_task_messages): TaskResult
  +run_stream(task, cancellation_token, output_task_messages): AsyncGenerator
  +reset(): None
  +pause(): None
  +resume(): None
  +save_state(): Mapping[str, Any]
  +load_state(state): None
  +close(): None
}

class RoundRobinGroupChat <<team_bg>> {
  +component_config_schema: ClassVar[type]
  +component_provider_override: ClassVar[str]
  +DEFAULT_NAME: str = "RoundRobinGroupChat"
  +DEFAULT_DESCRIPTION: str = "A team of agents."
  #_next_speaker_index: int
  --
  +__init__(participants: List[ChatAgent | Team], \\
    name: str | None = None, \\
    description: str | None = None, \\
    termination_condition: TerminationCondition = None, \\
    max_turns: int | None = None, \\
    custom_message_types: List[type] = None)
  --
  +_select_speaker(history): str
  +_to_config(): RoundRobinGroupChatConfig
  +_from_config(config): Self
}

class SelectorGroupChat <<team_bg>> {
  +component_config_schema: ClassVar[type]
  +component_provider_override: ClassVar[str]
  +DEFAULT_NAME: str = "SelectorGroupChat"
  +DEFAULT_DESCRIPTION: str = "A team of agents."
  +DEFAULT_SELECTOR_PROMPT: str
  #_model_client: ChatCompletionClient
  #_selector_prompt: str
  #_allow_repeated_speaker: bool
  #_selector_func: Callable | None
  --
  +__init__(participants: List[ChatAgent | Team], \\
    model_client: ChatCompletionClient, \\
    name: str | None = None, \\
    description: str | None = None, \\
    termination_condition: TerminationCondition = None, \\
    max_turns: int | None = None, \\
    selector_prompt: str = DEFAULT_SELECTOR_PROMPT, \\
    allow_repeated_speaker: bool = False, \\
    selector_func: Callable = None)
  --
  +_select_speaker(history): str
  +_to_config(): SelectorGroupChatConfig
  +_from_config(config): Self
}

class Swarm <<team_bg>> {
  +component_config_schema: ClassVar[type]
  +component_provider_override: ClassVar[str]
  +DEFAULT_NAME: str = "Swarm"
  +DEFAULT_DESCRIPTION: str = "A swarm team."
  --
  +__init__(participants: List[ChatAgent], \\
    name: str | None = None, \\
    description: str | None = None, \\
    termination_condition: TerminationCondition = None, \\
    max_turns: int | None = None)
  --
  +_to_config(): SwarmConfig
  +_from_config(config): Self
}

class MagenticOneGroupChat <<team_bg>> {
  +component_config_schema: ClassVar[type]
  +component_provider_override: ClassVar[str]
  +DEFAULT_NAME: str = "MagenticOneGroupChat"
  +DEFAULT_DESCRIPTION: str = "Magentic-One team."
  --
  +__init__(participants: List[ChatAgent], \\
    model_client: ChatCompletionClient, \\
    name: str | None = None, \\
    description: str | None = None, \\
    termination_condition: TerminationCondition = None, \\
    max_turns: int | None = None)
  --
  +_to_config(): MagenticOneGroupChatConfig
  +_from_config(config): Self
}

TaskRunner <|.. Team : implements
Team <|.. BaseGroupChat : implements

BaseGroupChat <|-- RoundRobinGroupChat
Component <|.. RoundRobinGroupChat : implements

BaseGroupChat <|-- SelectorGroupChat
Component <|.. SelectorGroupChat : implements

BaseGroupChat <|-- Swarm
Component <|.. Swarm : implements

BaseGroupChat <|-- MagenticOneGroupChat
Component <|.. MagenticOneGroupChat : implements

' ============ SUPPORT CLASSES ============

class Handoff {
  +target: str
  +message: str
  +condition: Callable | None
  --
  +__init__(target: str, message: str = "...", \\
    condition: Callable = None)
}

class ApprovalRequest {
  +code: str
  +context: List[LLMMessage]
  --
  +__init__(code: str, context: List[LLMMessage])
}

class ApprovalResponse {
  +approved: bool
  +reason: str
  --
  +__init__(approved: bool, reason: str = "")
}

class CodeBlock {
  +language: str
  +code: str
}

class CodeResult {
  +exit_code: int
  +output: str
}

' ============ RELATIONSHIPS ============

AssistantAgent ..> Response : produces
AssistantAgent ..> TaskResult : produces
AssistantAgent ..> TextMessage : produces
AssistantAgent ..> MultiModalMessage : produces
AssistantAgent ..> StopMessage : produces
AssistantAgent ..> HandoffMessage : produces
AssistantAgent ..> ToolCallMessage : produces
AssistantAgent ..> ToolCallResultMessage : produces

CodeExecutorAgent ..> ApprovalRequest : uses
CodeExecutorAgent ..> ApprovalResponse : uses
CodeExecutorAgent ..> CodeBlock : uses
CodeExecutorAgent ..> CodeResult : uses

RoundRobinGroupChat o-- ChatAgent : participants
RoundRobinGroupChat o-- Team : participants
RoundRobinGroupChat o-- TerminationCondition : uses

SelectorGroupChat o-- ChatAgent : participants
SelectorGroupChat o-- Team : participants
SelectorGroupChat o-- TerminationCondition : uses

SocietyOfMindAgent o-- Team : uses

AssistantAgent o-- Handoff : uses

' ============ NOTES ============

note right of BaseChatAgent
  Base abstract class for all agents.
  Provides common functionality and
  defines the interface that all agents
  must implement. All agents are stateful
  and maintain conversation context.
end note

note right of AssistantAgent
  Main agent for prototyping with LLM.
  Supports:
  - Tool calling and workbench
  - Handoffs to other agents
  - Model context management
  - Structured output (Pydantic)
  - Memory components
  - Tool reflection
end note

note right of CodeExecutorAgent
  (Experimental) Generates and executes
  code snippets. Can work with or without
  a model client. Supports approval
  workflow for code execution safety.
end note

note right of UserProxyAgent
  Agent that prompts for human input.
  Blocks execution until user provides
  feedback. Useful for approval workflows
  and interactive sessions.
end note

note right of SocietyOfMindAgent
  Meta-agent that uses an inner team
  of agents to generate responses.
  Coordinates multiple agents and
  synthesizes their outputs.
end note

note right of BaseGroupChat
  Base class for team implementations.
  Teams coordinate multiple agents with
  shared context. Support termination
  conditions and max turns.
end note

note right of RoundRobinGroupChat
  Agents take turns in round-robin
  fashion. Simple but effective for
  many multi-agent workflows like
  reflection patterns.
end note

note right of SelectorGroupChat
  Model-based next speaker selection.
  Uses LLM to dynamically choose which
  agent should respond next based on
  conversation context.
end note

note right of TerminationCondition
  Stateful conditions that determine
  when conversations should stop.
  Can be combined with | (OR) and
  & (AND) operators. Auto-reset
  after each run/run_stream call.
end note

note right of Response
  Response from on_messages().
  Contains the chat message and
  optional inner messages like
  tool calls and results.
end note

note right of TaskResult
  Result from run().
  Contains all messages produced
  during task execution and an
  optional stop reason.
end note

note right of BaseChatMessage
  Base for all chat messages.
  Subclasses cover text, multimodal,
  tool calls, handoffs, and custom
  structured messages.
end note

@enduml
```
