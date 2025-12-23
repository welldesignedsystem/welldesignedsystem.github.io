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
    %% ============ BASE INTERFACES AND PROTOCOLS ============
    
    class TaskRunner {
        <<Protocol>>
        +run(task, cancellation_token, output_task_messages) TaskResult
        +run_stream(task, cancellation_token, output_task_messages) AsyncGenerator
    }
    
    class ChatAgent {
        <<Protocol>>
        +name: str
        +description: str
        +produced_message_types: Sequence~type~
        +on_messages(messages, cancellation_token) Response
        +on_messages_stream(messages, cancellation_token) AsyncGenerator
    }
    
    class ComponentBase {
        <<Interface>>
        +component_type: ComponentType
    }
    
    class Component~T~ {
        <<Interface>>
        +component_version: int
        +component_config_schema: type
        +component_provider_override: str
        +_to_config() T
        +_from_config(config: T) Self
    }
    
    class ABC {
        <<Abstract>>
    }
    
    %% ============ BASE AGENT CLASS ============
    
    class BaseChatAgent {
        <<Abstract>>
        +component_type: ClassVar~ComponentType~
        #_name: str
        #_description: str
        +__init__(name: str, description: str)
        +name: str
        +description: str
        +produced_message_types: Sequence~type~*
        +on_messages(messages, cancellation_token) Response*
        +on_messages_stream(messages, cancellation_token) AsyncGenerator
        +run(task, cancellation_token, output_task_messages) TaskResult
        +run_stream(task, cancellation_token, output_task_messages) AsyncGenerator
        +on_reset(cancellation_token) None*
        +on_pause(cancellation_token) None
        +on_resume(cancellation_token) None
        +save_state() Mapping
        +load_state(state) None
        +close() None
    }
    
    TaskRunner <|.. BaseChatAgent
    ChatAgent <|.. BaseChatAgent
    ABC <|-- BaseChatAgent
    ComponentBase <|.. BaseChatAgent
    
    %% ============ MESSAGE HIERARCHY ============
    
    class BaseChatMessage {
        <<Abstract>>
        +source: str
        +models_usage: RequestUsage | None
        +metadata: Dict
        +type: str
        +to_text() str*
        +to_model_text() str*
        +to_model_message() LLMMessage*
    }
    
    class BaseTextMessage {
        <<Abstract>>
        +content: str
        +to_text() str
        +to_model_text() str
        +to_model_message() UserMessage
    }
    
    class TextMessage {
        +content: str
        +__init__(content: str, source: str, models_usage: RequestUsage)
    }
    
    class MultiModalMessage {
        +content: List~str | Image~
        +__init__(content: List, source: str, models_usage: RequestUsage)
        +to_text() str
        +to_model_text() str
        +to_model_message() UserMessage
    }
    
    class StopMessage {
        +content: str
        +__init__(content: str, source: str)
    }
    
    class HandoffMessage {
        +content: str
        +target: str
        +context: List~LLMMessage~
        +__init__(content: str, target: str, source: str, context: List)
    }
    
    class ResetMessage {
        +content: str
        +__init__(content: str, source: str)
    }
    
    class ToolCallMessage {
        +content: List~FunctionCall~
        +__init__(content: List, source: str, models_usage: RequestUsage)
    }
    
    class ToolCallResultMessage {
        +content: List~FunctionExecutionResult~
        +__init__(content: List, source: str)
    }
    
    class ToolCallSummaryMessage {
        +content: str
        +call_id: str
        +__init__(content: str, call_id: str, source: str)
    }
    
    class StructuredMessage~T~ {
        +content: T
        +format_string: str | None
        +__init__(content: T, source: str, format_string: str)
        +to_text() str
    }
    
    class BaseAgentEvent {
        <<Abstract>>
        +source: str
        +metadata: Dict
        +type: str
    }
    
    class UserInputRequestedEvent {
        +prompt: str
        +__init__(prompt: str, source: str)
    }
    
    class ModelClientStreamingChunkEvent {
        +content: str
        +__init__(content: str, source: str)
    }
    
    class ToolCallExecutionEvent {
        +content: List~FunctionExecutionResult~
        +__init__(content: List, source: str)
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
    
    %% ============ CONCRETE AGENT IMPLEMENTATIONS ============
    
    class AssistantAgent {
        +component_version: ClassVar~int~
        +component_provider_override: ClassVar~str~
        #_model_client: ChatCompletionClient
        #_tools: List~BaseTool~
        #_workbench: Workbench | None
        #_handoffs: List~Handoff~
        #_model_context: ChatCompletionContext
        #_system_message: str
        #_reflect_on_tool_use: bool
        #_max_tool_iterations: int
        #_tool_call_summary_formatter: Callable
        #_output_content_type: type~BaseModel~ | None
        #_memory: Sequence~Memory~
        +__init__(name, model_client, tools, workbench, handoffs, model_context, description, system_message, model_client_stream, reflect_on_tool_use, max_tool_iterations, tool_call_summary_format, tool_call_summary_formatter, output_content_type, output_content_type_format, memory, metadata)
        +produced_message_types: Sequence~type~
        +model_context: ChatCompletionContext
        +on_messages(messages, cancellation_token) Response
        +on_messages_stream(messages, cancellation_token) AsyncGenerator
        +on_reset(cancellation_token) None
        +save_state() Mapping
        +load_state(state) None
    }
    
    class CodeExecutorAgent {
        +component_provider_override: ClassVar~str~
        +DEFAULT_TERMINAL_DESCRIPTION: str
        +DEFAULT_AGENT_DESCRIPTION: str
        +DEFAULT_SYSTEM_MESSAGE: str
        +NO_CODE_BLOCKS_FOUND_MESSAGE: str
        +DEFAULT_SUPPORTED_LANGUAGES: List~str~
        #_code_executor: CodeExecutor
        #_model_client: ChatCompletionClient | None
        #_model_context: ChatCompletionContext | None
        #_max_retries_on_error: int
        #_sources: Sequence~str~
        #_supported_languages: List~str~
        #_approval_func: Callable
        +__init__(name, code_executor, model_client, model_context, model_client_stream, max_retries_on_error, description, system_message, sources, supported_languages, approval_func)
        +produced_message_types: Sequence~type~
        +model_context: ChatCompletionContext
        +on_messages(messages, cancellation_token) Response
        +on_messages_stream(messages, cancellation_token) AsyncGenerator
        +extract_code_blocks_from_messages(messages) List~CodeBlock~
        +execute_code_block(code_blocks, cancellation_token) CodeResult
        +on_reset(cancellation_token) None
    }
    
    class UserProxyAgent {
        +component_type: ClassVar~ComponentType~
        +component_provider_override: ClassVar~str~
        #_input_func: InputFuncType
        +__init__(name, description, input_func)
        +produced_message_types: Sequence~type~
        +on_messages(messages, cancellation_token) Response
        +on_messages_stream(messages, cancellation_token) AsyncGenerator
        +on_reset(cancellation_token) None
    }
    
    class SocietyOfMindAgent {
        +component_provider_override: ClassVar~str~
        +DEFAULT_INSTRUCTION: str
        +DEFAULT_RESPONSE_PROMPT: str
        +DEFAULT_DESCRIPTION: str
        #_team: Team
        #_model_client: ChatCompletionClient
        #_instruction: str
        #_response_prompt: str
        #_model_context: ChatCompletionContext
        +__init__(name, team, model_client, description, instruction, response_prompt, model_context)
        +produced_message_types: Sequence~type~
        +model_context: ChatCompletionContext
        +on_messages(messages, cancellation_token) Response
        +on_messages_stream(messages, cancellation_token) AsyncGenerator
        +on_reset(cancellation_token) None
        +save_state() Mapping
        +load_state(state) None
    }
    
    BaseChatAgent <|-- AssistantAgent
    Component <|.. AssistantAgent
    
    BaseChatAgent <|-- CodeExecutorAgent
    Component <|.. CodeExecutorAgent
    
    BaseChatAgent <|-- UserProxyAgent
    Component <|.. UserProxyAgent
    
    BaseChatAgent <|-- SocietyOfMindAgent
    Component <|.. SocietyOfMindAgent
    
    %% ============ RESPONSE AND RESULT TYPES ============
    
    class Response {
        +chat_message: BaseChatMessage
        +inner_messages: List | None
        +__init__(chat_message, inner_messages)
    }
    
    class TaskResult {
        +messages: Sequence~BaseChatMessage~
        +stop_reason: str | None
        +__init__(messages, stop_reason)
    }
    
    %% ============ TERMINATION CONDITIONS ============
    
    class TerminationCondition {
        <<Abstract>>
        +component_type: ClassVar~ComponentType~
        +terminated: bool*
        +__call__(messages) StopMessage | None*
        +reset() None*
        +__or__(other) OrTerminationCondition
        +__and__(other) AndTerminationCondition
    }
    
    class MaxMessageTermination {
        +component_provider_override: ClassVar~str~
        #_max_messages: int
        #_message_count: int
        #_terminated: bool
        +__init__(max_messages: int)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class TextMentionTermination {
        +component_provider_override: ClassVar~str~
        #_text: str
        #_sources: List~str~ | None
        #_terminated: bool
        +__init__(text: str, sources: List)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class HandoffTermination {
        +component_provider_override: ClassVar~str~
        #_target: str
        #_terminated: bool
        +__init__(target: str)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class TokenUsageTermination {
        +component_provider_override: ClassVar~str~
        #_max_prompt_tokens: int | None
        #_max_completion_tokens: int | None
        #_prompt_token_count: int
        #_completion_token_count: int
        #_terminated: bool
        +__init__(max_prompt_tokens, max_completion_tokens)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class ExternalTermination {
        +component_provider_override: ClassVar~str~
        #_terminated: bool
        +__init__()
        +terminated: bool
        +set() None
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class TextMessageTermination {
        +component_provider_override: ClassVar~str~
        #_sources: List~str~ | None
        #_terminated: bool
        +__init__(sources: List)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class FunctionCallTermination {
        +component_provider_override: ClassVar~str~
        #_function_name: str
        #_terminated: bool
        +__init__(function_name: str)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class OrTerminationCondition {
        +component_provider_override: ClassVar~str~
        #_conditions: Tuple~TerminationCondition~
        +__init__(*conditions)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    class AndTerminationCondition {
        +component_provider_override: ClassVar~str~
        #_conditions: Tuple~TerminationCondition~
        +__init__(*conditions)
        +terminated: bool
        +__call__(messages) StopMessage | None
        +reset() None
    }
    
    ComponentBase <|.. TerminationCondition
    Component <|.. TerminationCondition
    
    TerminationCondition <|-- MaxMessageTermination
    TerminationCondition <|-- TextMentionTermination
    TerminationCondition <|-- HandoffTermination
    TerminationCondition <|-- TokenUsageTermination
    TerminationCondition <|-- ExternalTermination
    TerminationCondition <|-- TextMessageTermination
    TerminationCondition <|-- FunctionCallTermination
    TerminationCondition <|-- OrTerminationCondition
    TerminationCondition <|-- AndTerminationCondition
    
    %% ============ TEAM HIERARCHY ============
    
    class Team {
        <<Protocol>>
        +name: str
        +description: str
        +run(task, cancellation_token, output_task_messages) TaskResult
        +run_stream(task, cancellation_token, output_task_messages) AsyncGenerator
        +reset() None
        +pause() None
        +resume() None
        +save_state() Mapping
        +load_state(state) None
        +close() None
    }
    
    class BaseGroupChat {
        <<Abstract>>
        #_name: str
        #_description: str
        #_participants: List~ChatAgent | Team~
        #_participant_names: List~str~
        #_termination_condition: TerminationCondition | None
        #_max_turns: int | None
        +__init__(participants, name, description, termination_condition, max_turns)
        +name: str
        +description: str
        +run(task, cancellation_token, output_task_messages) TaskResult
        +run_stream(task, cancellation_token, output_task_messages) AsyncGenerator
        +reset() None
        +pause() None
        +resume() None
        +save_state() Mapping
        +load_state(state) None
        +close() None
    }
    
    class RoundRobinGroupChat {
        +component_config_schema: ClassVar~type~
        +component_provider_override: ClassVar~str~
        +DEFAULT_NAME: str
        +DEFAULT_DESCRIPTION: str
        #_next_speaker_index: int
        +__init__(participants, name, description, termination_condition, max_turns, custom_message_types)
        +_select_speaker(history) str
        +_to_config() RoundRobinGroupChatConfig
        +_from_config(config) Self
    }
    
    class SelectorGroupChat {
        +component_config_schema: ClassVar~type~
        +component_provider_override: ClassVar~str~
        +DEFAULT_NAME: str
        +DEFAULT_DESCRIPTION: str
        +DEFAULT_SELECTOR_PROMPT: str
        #_model_client: ChatCompletionClient
        #_selector_prompt: str
        #_allow_repeated_speaker: bool
        #_selector_func: Callable | None
        +__init__(participants, model_client, name, description, termination_condition, max_turns, selector_prompt, allow_repeated_speaker, selector_func)
        +_select_speaker(history) str
        +_to_config() SelectorGroupChatConfig
        +_from_config(config) Self
    }
    
    class Swarm {
        +component_config_schema: ClassVar~type~
        +component_provider_override: ClassVar~str~
        +DEFAULT_NAME: str
        +DEFAULT_DESCRIPTION: str
        +__init__(participants, name, description, termination_condition, max_turns)
        +_to_config() SwarmConfig
        +_from_config(config) Self
    }
    
    class MagenticOneGroupChat {
        +component_config_schema: ClassVar~type~
        +component_provider_override: ClassVar~str~
        +DEFAULT_NAME: str
        +DEFAULT_DESCRIPTION: str
        +__init__(participants, model_client, name, description, termination_condition, max_turns)
        +_to_config() MagenticOneGroupChatConfig
        +_from_config(config) Self
    }
    
    TaskRunner <|.. Team
    Team <|.. BaseGroupChat
    
    BaseGroupChat <|-- RoundRobinGroupChat
    Component <|.. RoundRobinGroupChat
    
    BaseGroupChat <|-- SelectorGroupChat
    Component <|.. SelectorGroupChat
    
    BaseGroupChat <|-- Swarm
    Component <|.. Swarm
    
    BaseGroupChat <|-- MagenticOneGroupChat
    Component <|.. MagenticOneGroupChat
    
    %% ============ SUPPORT CLASSES ============
    
    class Handoff {
        +target: str
        +message: str
        +condition: Callable | None
        +__init__(target, message, condition)
    }
    
    class ApprovalRequest {
        +code: str
        +context: List~LLMMessage~
        +__init__(code, context)
    }
    
    class ApprovalResponse {
        +approved: bool
        +reason: str
        +__init__(approved, reason)
    }
    
    class CodeBlock {
        +language: str
        +code: str
    }
    
    class CodeResult {
        +exit_code: int
        +output: str
    }
    
    %% ============ RELATIONSHIPS ============
    
    AssistantAgent ..> Response : produces
    AssistantAgent ..> TaskResult : produces
    AssistantAgent ..> TextMessage : produces
    AssistantAgent ..> MultiModalMessage : produces
    AssistantAgent ..> StopMessage : produces
    AssistantAgent ..> HandoffMessage : produces
    AssistantAgent ..> ToolCallMessage : produces
    AssistantAgent ..> ToolCallResultMessage : produces
    AssistantAgent o-- Handoff : uses
    
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
```
