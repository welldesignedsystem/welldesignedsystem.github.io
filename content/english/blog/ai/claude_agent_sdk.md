+++
date = '2026-05-16T11:01:00+10:00'
draft = false
title = 'Claude Agent SDK'
tags = ['LLM', 'AI', 'Anthropic', 'Claude', 'Agent SDK', 'Design Patterns']
summary = "Reference for building production AI agents with the Claude Agent SDK, the agent loop, sessions, tools, MCP, hooks, subagents, permissions, context management, structured output, streaming and deployment."
+++

---

## Introduction

Before the Agent SDK, connecting Claude to real-world tasks meant implementing your own tool loop: call the API, detect tool_use stop reason, run the tool, feed back the result, repeat. The Agent SDK packages that entire loop into a single call — `query()` — so you can focus on what the agent does rather than how the loop runs.

The SDK is available at:
- **Python:** `pip install claude-agent-sdk` — [GitHub](https://github.com/anthropics/claude-agent-sdk-python)

---

## Core Concepts

### What the Agent SDK Is
- SDK is a **library** you import into your application — your process runs the agent loop.
- It packages the same execution model that powers the Claude Code CLI as a programmable API.
- It is distinct from **Managed Agents**, where Anthropic's infrastructure runs the agent and your app talks to it over REST.

### The Agent Loop
The agent runs the same loop every time:
1. **Receive prompt.** Claude receives your prompt, system prompt, tool definitions and conversation history.
2. **Evaluate and respond.** Claude determines what to do: reply with text, call tools, or both.
3. **Execute tools.** The SDK runs each requested tool and feeds results back to Claude.
4. **Repeat.** Steps 2–3 repeat as a cycle. Each full cycle is one **turn**.
5. **Return result.** Claude produces a text-only response (no tool calls) → the SDK yields a `ResultMessage`.

A quick task ("what files are here?") might take 1–2 turns. A complex task ("refactor the auth module and update tests") can chain dozens of tool calls across many turns, with Claude adapting based on each result.

### Context Window
Everything accumulates in the context window across turns within a session: system prompt, tool definitions, conversation history, tool inputs, tool outputs. It does not reset between turns.

**Automatic compaction:** when the context approaches its limit, the SDK summarizes older history to free space while keeping recent exchanges intact. A `compact_boundary` system message is emitted when this happens.

**Prompt caching:** content that stays constant across turns (system prompt, CLAUDE.md, tool definitions) is automatically prompt-cached, reducing cost and latency for repeated prefixes.

### Sessions
A session is the conversation history accumulated during an agent run. The SDK writes it to disk as a JSONL file under `~/.claude/projects/<encoded-cwd>/`. You can resume any past session, continue the most recent one, or fork a session to explore an alternative without modifying the original.

---

## Installation and Setup

```bash
# Python
pip install claude-agent-sdk
```

**Authentication:**
```bash
# Direct API
export ANTHROPIC_API_KEY=your-api-key

# Amazon Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
# + configure AWS credentials

# Claude Platform on AWS
export CLAUDE_CODE_USE_ANTHROPIC_AWS=1
export ANTHROPIC_AWS_WORKSPACE_ID=your-workspace-id
# + configure AWS credentials

# Google Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
# + configure Google Cloud credentials

# Microsoft Azure AI Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
# + configure Azure credentials
```

---

## Quickstart

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
    ):
        print(message)

asyncio.run(main())
```

---

## Built-in Tools

The SDK ships with all the tools that power Claude Code. No implementation required — Claude uses them autonomously.

| Category | Tool | What It Does |
|---|---|---|
| **File operations** | `Read` | Read any file in the working directory |
| | `Write` | Create new files |
| | `Edit` | Make precise edits to existing files |
| **Search** | `Glob` | Find files by pattern (`**/*.py`, `src/**/*.ts`) |
| | `Grep` | Search file contents with regex |
| **Execution** | `Bash` | Run shell commands, scripts, git operations |
| | `Monitor` | Watch a background script and react to each output line |
| **Web** | `WebSearch` | Search the web for current information |
| | `WebFetch` | Fetch and parse web page content |
| **Orchestration** | `Agent` | Spawn subagents for focused subtasks |
| | `Skill` | Invoke a skill from the skills directory |
| | `TodoWrite` | Maintain a structured task list for planning |
| | `AskUserQuestion` | Ask the user clarifying questions with multiple-choice options |
| **Discovery** | `ToolSearch` | Dynamically load MCP tools on-demand instead of preloading all |

---

## ClaudeAgentOptions — Full Reference

All agent behaviour is configured via `ClaudeAgentOptions` (Python).

```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit", "Bash"],   # Auto-approve these tools
    disallowed_tools=["Write"],               # Block these tools entirely
    permission_mode="acceptEdits",            # How ungoverned tools are handled
    model="claude-sonnet-4-6",               # Pin a specific model
    max_turns=30,                             # Max tool-use round trips
    max_budget_usd=1.00,                      # Max spend before stopping
    effort="high",                            # Reasoning depth
    setting_sources=["project"],              # Load CLAUDE.md, skills, hooks
    resume="session-id-here",                 # Resume a specific past session
    continue_conversation=True,               # Resume the most recent session
    fork_session=True,                        # Fork instead of overwrite
    hooks={...},                              # Lifecycle callbacks
    mcp_servers={...},                        # MCP server connections
    agents={...},                             # Custom subagent definitions
    system_prompt="...",                      # Append to base system prompt
)
```

### Permission Modes

| Mode | Behaviour |
|---|---|
| `"default"` | Tools not in allowed list trigger your approval callback; no callback = deny |
| `"acceptEdits"` | Auto-approves file edits and common filesystem commands (`mkdir`, `touch`, `mv`, `cp`); other Bash commands follow default rules |
| `"plan"` | No tool execution; Claude produces a plan for review |
| `"dontAsk"` | Never prompts; tools pre-approved by permission rules run, everything else is denied |
| `"auto"` *(TypeScript only)* | Uses a model classifier to approve or deny each tool call |
| `"bypassPermissions"` | All allowed tools run without asking. **Only for isolated environments. Cannot run as root on Unix.** |

### Effort Levels

| Level | Behaviour | Good For |
|---|---|---|
| `"low"` | Minimal reasoning, fast responses | File lookups, directory listing |
| `"medium"` | Balanced reasoning | Routine edits, standard tasks |
| `"high"` | Thorough analysis (TypeScript default) | Refactors, debugging |
| `"max"` | Maximum reasoning depth | Multi-step problems, deep analysis |

`effort` and Extended Thinking are independent — you can use either, neither, or both.

### Result Subtypes

The `ResultMessage` at the end of every session carries a `subtype` indicating what happened:

| Subtype | Meaning | `result` field? |
|---|---|---|
| `success` | Claude finished the task normally | ✅ Yes |
| `error_max_turns` | Hit `max_turns` before finishing | ❌ No |
| `error_max_budget_usd` | Hit `max_budget_usd` before finishing | ❌ No |
| `error_during_execution` | API failure or cancelled request | ❌ No |
| `error_max_structured_output_retries` | Structured output validation failed | ❌ No |

Always check the subtype before reading `result`. All subtypes carry `total_cost_usd`, `usage`, `num_turns` and `session_id`.

---

## Message Types

As the loop runs, the SDK yields a stream of typed messages.

| Type | When Emitted | Key Fields |
|---|---|---|
| `SystemMessage` | Session lifecycle events | `subtype`: `"init"` (session start), `"compact_boundary"` (after compaction) |
| `AssistantMessage` | After each Claude response | `content`: text blocks and tool call blocks |
| `UserMessage` | After each tool execution | Tool result content fed back to Claude |
| `StreamEvent` | When `include_partial_messages=True` | Raw API streaming events (text deltas, tool chunks) |
| `ResultMessage` | Always last | `result`, `subtype`, `total_cost_usd`, `usage`, `session_id` |

```python
from claude_agent_sdk import (
    query, ClaudeAgentOptions,
    AssistantMessage, ResultMessage, SystemMessage
)

async for message in query(prompt="Summarize this project"):
    if isinstance(message, SystemMessage) and message.subtype == "init":
        session_id = message.data["session_id"]

    elif isinstance(message, AssistantMessage):
        print(f"Turn: {len(message.content)} content blocks")

    elif isinstance(message, ResultMessage):
        if message.subtype == "success":
            print(message.result)
        else:
            print(f"Stopped: {message.subtype}")
        print(f"Cost: ${message.total_cost_usd:.4f}")
```

---

## Session Management

### Why Sessions Matter
Sessions persist the conversation history to disk. When you resume a session, Claude has full context from before — files already read, analysis performed, decisions made — without re-doing that work.

**Sessions persist the conversation, not the filesystem.** For snapshotting and reverting file changes, use File Checkpointing.

### Choosing the Right Approach

| Use Case | Approach |
|---|---|
| One-shot task | Nothing extra. One `query()` call handles it. |
| Multi-turn conversation in one process | `ClaudeSDKClient` (Python) or `continue: true` (TypeScript) |
| Pick up after a process restart | `continue_conversation=True` (Python) / `continue: true` (TypeScript) |
| Resume a specific past session | Capture the session ID, pass it to `resume` |
| Explore an alternative without losing original | Fork the session |
| Stateless task (TypeScript only) | `persistSession: false` |

### Python: `ClaudeSDKClient` (Automatic)
`ClaudeSDKClient` manages session IDs across calls automatically. No ID tracking required.

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, ResultMessage

async def main():
    options = ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Glob"])

    async with ClaudeSDKClient(options=options) as client:
        # First query — creates a new session
        await client.query("Analyse the auth module")
        async for message in client.receive_response():
            if isinstance(message, ResultMessage):
                print(message.result)

        # Second query — automatically continues the same session
        await client.query("Now refactor it to use JWT")
        async for message in client.receive_response():
            if isinstance(message, ResultMessage):
                print(message.result)

asyncio.run(main())
```

### Resume by Session ID
```python
session_id = None

# Step 1: Capture the session ID
async for message in query(
    prompt="Analyse the auth module and suggest improvements",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Glob", "Grep"]),
):
    if isinstance(message, ResultMessage):
        session_id = message.session_id

# Step 2: Resume with a follow-up prompt
async for message in query(
    prompt="Now implement the refactoring you suggested",
    options=ClaudeAgentOptions(
        resume=session_id,
        allowed_tools=["Read", "Edit", "Write"],
    ),
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(message.result)
```

### Fork a Session
Forking creates a new session branching from the original's history. The original stays unchanged.

```python
# Fork from session_id to explore OAuth2 instead of JWT
forked_id = None
async for message in query(
    prompt="Instead of JWT, implement OAuth2 for the auth module",
    options=ClaudeAgentOptions(resume=session_id, fork_session=True),
):
    if isinstance(message, ResultMessage):
        forked_id = message.session_id  # New ID for the fork

# Original session_id still intact — resume it to continue the JWT thread
async for message in query(
    prompt="Continue with the JWT approach",
    options=ClaudeAgentOptions(resume=session_id),
):
    ...
```

### Resuming Across Hosts
Session files are local: `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`. To resume on a different machine:
- Mirror the JSONL file to shared storage and restore it at the same path before resuming.
- Or don't rely on session resume — capture results as application state and pass them into a fresh session's prompt.

---

## Hooks — Intercept and Control Agent Behaviour

Hooks are callback functions that fire at specific points in the agent lifecycle. They run in your application process — not inside the context window — so they don't consume tokens.

### How Hooks Work
1. An event fires (e.g. a tool is about to run).
2. The SDK checks registered hooks for that event type.
3. Matchers (regex against tool name) filter which callbacks execute.
4. Your callback receives event details and returns a decision.
5. The decision controls what happens: allow, deny, modify input, inject context.

### Available Hook Events

| Hook | Python | TypeScript | When It Fires | Common Uses |
|---|---|---|---|---|
| `PreToolUse` | ✅ | ✅ | Before a tool executes | Block dangerous commands, validate inputs |
| `PostToolUse` | ✅ | ✅ | After a tool returns | Audit outputs, log changes |
| `PostToolUseFailure` | ✅ | ✅ | When a tool fails | Error handling, alerting |
| `UserPromptSubmit` | ✅ | ✅ | When a prompt is sent | Inject additional context |
| `Stop` | ✅ | ✅ | When agent execution stops | Save session state |
| `SubagentStart` | ✅ | ✅ | When a subagent spawns | Track parallel tasks |
| `SubagentStop` | ✅ | ✅ | When a subagent completes | Aggregate parallel results |
| `PreCompact` | ✅ | ✅ | Before context compaction | Archive full transcript |
| `PermissionRequest` | ✅ | ✅ | Permission dialog would show | Custom permission handling |
| `Notification` | ✅ | ✅ | Agent status messages | Forward to Slack, PagerDuty |
| `SessionStart` | ❌ | ✅ | Session initialisation | Logging, telemetry setup |
| `SessionEnd` | ❌ | ✅ | Session termination | Clean up resources |
| `TaskCompleted` | ❌ | ✅ | Background task completes | Aggregate parallel results |
| `ConfigChange` | ❌ | ✅ | Config file changes | Reload settings |

### Hook Return Values

| Field | Type | Effect |
|---|---|---|
| `{}` (empty) | — | Allow the operation without changes |
| `hookSpecificOutput.permissionDecision` | `"allow"`, `"deny"`, `"ask"` | Control whether the tool runs |
| `hookSpecificOutput.permissionDecisionReason` | `str` | Explain the decision to Claude |
| `hookSpecificOutput.updatedInput` | `dict` | Modify tool arguments before execution |
| `hookSpecificOutput.additionalContext` | `str` | Append context to tool result (`PostToolUse`) |
| `systemMessage` | `str` | Inject a message into the conversation the model sees |
| `continue_` / `continue` | `bool` | Whether the agent continues running after this hook |
| `async_: True` | — | Agent proceeds immediately; hook runs as background task |

**Priority rule:** deny > ask > allow. If any hook returns deny, the operation is blocked.

### Hook Examples

**Block writes to sensitive files:**
```python
async def protect_env_files(input_data, tool_use_id, context):
    file_path = input_data["tool_input"].get("file_path", "")
    if file_path.endswith(".env"):
        return {
            "hookSpecificOutput": {
                "hookEventName": input_data["hook_event_name"],
                "permissionDecision": "deny",
                "permissionDecisionReason": "Cannot modify .env files",
            }
        }
    return {}

options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [HookMatcher(matcher="Write|Edit", hooks=[protect_env_files])]
    }
)
```

**Redirect all file writes to a sandbox:**
```python
async def redirect_to_sandbox(input_data, tool_use_id, context):
    if input_data["tool_name"] == "Write":
        original_path = input_data["tool_input"].get("file_path", "")
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
                "updatedInput": {
                    **input_data["tool_input"],
                    "file_path": f"/sandbox{original_path}",
                },
            }
        }
    return {}
```

**Audit log every file change:**
```python
from datetime import datetime

async def log_file_change(input_data, tool_use_id, context):
    file_path = input_data.get("tool_input", {}).get("file_path", "unknown")
    with open("./audit.log", "a") as f:
        f.write(f"{datetime.now()}: modified {file_path}\n")
    return {}

options = ClaudeAgentOptions(
    permission_mode="acceptEdits",
    hooks={
        "PostToolUse": [HookMatcher(matcher="Edit|Write", hooks=[log_file_change])]
    },
)
```

**Forward agent notifications to Slack:**
```python
import asyncio, json, urllib.request

async def notify_slack(input_data, tool_use_id, context):
    data = json.dumps({"text": f"Agent: {input_data.get('message', '')}"}).encode()
    req = urllib.request.Request(
        "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
        data=data, headers={"Content-Type": "application/json"}, method="POST",
    )
    try:
        await asyncio.to_thread(urllib.request.urlopen, req)
    except Exception as e:
        print(f"Slack notification failed: {e}")
    return {}

options = ClaudeAgentOptions(
    hooks={"Notification": [HookMatcher(hooks=[notify_slack])]}
)
```

**Chain multiple hooks (order matters — deny wins):**
```python
options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [
            HookMatcher(hooks=[rate_limiter]),        # 1. Check rate limits
            HookMatcher(hooks=[authorization_check]), # 2. Verify permissions
            HookMatcher(hooks=[input_sanitizer]),     # 3. Sanitize inputs
            HookMatcher(hooks=[audit_logger]),        # 4. Log the action
        ]
    }
)
```

### Matcher Patterns

Matchers are **regex strings** applied to the **tool name only**, not to file paths or other arguments. To filter by file path, check `tool_input.file_path` inside the callback.

```python
hooks={
    "PreToolUse": [
        HookMatcher(matcher="Write|Edit|Delete", hooks=[file_security_hook]),  # File tools
        HookMatcher(matcher="^mcp__", hooks=[mcp_audit_hook]),                 # All MCP tools
        HookMatcher(hooks=[global_logger]),                                    # Everything
    ]
}
```

MCP tools always follow the pattern `mcp__<server-name>__<action>`.

---

## Subagents

Subagents let the main agent delegate focused subtasks to a fresh agent instance. The parent receives only the final result — all intermediate tool calls are hidden — keeping the main agent's context lean.

### When to Use Subagents

| Use | Avoid |
|---|---|
| Multi-step subtasks that would clutter the main context | Simple one-step tasks |
| Work requiring specialised instructions | When intermediate context must be preserved |
| Tasks that benefit from a different tool set | When delegation overhead outweighs benefit |
| Parallel workstreams | |

### What Subagents Inherit
- Each subagent starts with a **fresh conversation** — no prior message history from the parent.
- They do load their own system prompt and project-level context like `CLAUDE.md`.
- Only the final response returns to the parent as a tool result.
- The parent's context grows by that summary, not by the full subtask transcript.

### Defining Subagents

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

options = ClaudeAgentOptions(
    allowed_tools=["Read", "Glob", "Grep", "Agent"],  # Include "Agent" to enable subagents
    agents={
        "code-reviewer": AgentDefinition(
            description="Expert code reviewer for quality and security reviews.",
            prompt="Analyse code quality and suggest improvements. Focus on security, performance and maintainability.",
            tools=["Read", "Glob", "Grep"],
        ),
        "test-writer": AgentDefinition(
            description="Writes comprehensive unit tests for Python functions.",
            prompt="Write pytest unit tests with good coverage. Include edge cases and error conditions.",
            tools=["Read", "Write", "Bash"],
        ),
    },
)

async for message in query(
    prompt="Use the code-reviewer agent to review auth.py, then use test-writer to add tests",
    options=options,
):
    if hasattr(message, "result"):
        print(message.result)
```

### AgentDefinition Fields

| Field | Type | Description |
|---|---|---|
| `description` | `str` | Required. What this subagent does. The main agent uses this to decide when to delegate. Be specific. |
| `prompt` | `str` | Required. Instructions for the subagent (its system prompt). Does NOT inherit from parent. |
| `tools` | `list[str]` | Optional. Tools the subagent can use. Defaults to parent's tool set if omitted. |
| `model` | `str` | Optional. Override the model for this subagent. Useful for cost optimisation. |

### Tracking Subagent Messages
Messages from within a subagent's context include a `parent_tool_use_id` field, letting you correlate which messages belong to which subagent run.

### Parallel Subagents
Multiple subagents can run concurrently. Use `SubagentStart` and `SubagentStop` hooks to track parallel task spawning and aggregation:

```python
async def subagent_tracker(input_data, tool_use_id, context):
    print(f"[SUBAGENT] Completed: {input_data['agent_id']}")
    print(f"  Transcript: {input_data['agent_transcript_path']}")
    return {}

options = ClaudeAgentOptions(
    hooks={"SubagentStop": [HookMatcher(hooks=[subagent_tracker])]}
)
```

---

## Tools: Custom and MCP

### Custom Tools
Define functions as tools — Claude will call them when relevant:

```python
from claude_agent_sdk import query, ClaudeAgentOptions

async def get_database_schema(table_name: str) -> str:
    """Return the schema for a database table."""
    # Your implementation here
    return f"CREATE TABLE {table_name} (id INT PRIMARY KEY, name VARCHAR(255));"

options = ClaudeAgentOptions(
    tools=[get_database_schema],
    allowed_tools=["get_database_schema", "Read", "Bash"],
)

async for message in query(
    prompt="Analyse the users table schema and suggest indexes",
    options=options,
):
    if hasattr(message, "result"):
        print(message.result)
```

Custom tools default to sequential execution. Mark them read-only for parallel execution:
- TypeScript: `readOnly: true` in tool annotations
- Python: `readOnlyHint=True` in tool definition

### MCP (Model Context Protocol)
MCP servers connect your agent to external systems — databases, browsers, APIs — without you implementing tool execution.

```python
options = ClaudeAgentOptions(
    mcp_servers={
        # Browser automation
        "playwright": {
            "command": "npx",
            "args": ["@playwright/mcp@latest"]
        },
        # File system over network
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
        },
        # SQLite database
        "sqlite": {
            "command": "uvx",
            "args": ["mcp-server-sqlite", "--db-path", "./data.db"]
        },
    }
)
```

MCP tools appear as `mcp__<server-name>__<action>` (e.g. `mcp__playwright__browser_screenshot`). Include these in `allowed_tools` to auto-approve them.

**MCP tool search:** when you have many MCP tools, preloading all of them consumes significant context. Use `ToolSearch` to load tools on-demand instead:

```python
options = ClaudeAgentOptions(
    allowed_tools=["ToolSearch"],  # Let Claude discover tools as needed
    mcp_servers={...},
)
```

**Context cost of MCP:** every MCP server adds all its tool schemas to every request. A few large MCP servers can consume significant context before the agent does any work.

---

## Permissions

Three settings work together to control what runs:

1. **`allowed_tools`** — auto-approves listed tools (no prompting).
2. **`disallowed_tools`** — blocks listed tools regardless of other settings.
3. **`permission_mode`** — controls what happens to tools not covered by either list.

### Tool Scoping with Rules
You can scope individual tools with rules to allow only specific commands:
```python
# Allow only npm commands via Bash
allowed_tools=["Bash(npm:*)"]

# Allow read-only filesystem operations
allowed_tools=["Read", "Glob", "Grep"]

# Block specific paths
disallowed_tools=["Bash(rm -rf:*)"]
```

### Approval Callbacks
For interactive applications, provide a callback to handle tool approval prompts:

```python
async def approve_tool(tool_name, tool_input):
    print(f"Claude wants to run: {tool_name}")
    print(f"Arguments: {tool_input}")
    decision = input("Allow? (y/n): ").strip().lower()
    return decision == "y"

options = ClaudeAgentOptions(
    permission_mode="default",
    # approval_callback=approve_tool  # Framework-specific
)
```

---

## Context Management

### What Consumes Context

| Source | When It Loads | Impact |
|---|---|---|
| System prompt | Every request | Small fixed cost, always present |
| CLAUDE.md files | Session start (when `settingSources` enabled) | Full content every request (prompt-cached after first) |
| Tool definitions | Every request | Each tool adds its schema |
| Conversation history | Accumulates over turns | Grows with each turn |
| Skill descriptions | Session start | Short summaries; full content loads on invocation |
| MCP tool schemas | Every request | All schemas for all connected servers |

### Automatic Compaction
When context approaches the window limit, the SDK automatically summarises older history and emits a `compact_boundary` system message.

**Customise what gets preserved:**
Add a section to your `CLAUDE.md` file:
```markdown
## Summary instructions

When summarising this conversation, always preserve:
- The current task objective and acceptance criteria
- File paths that have been read or modified
- Test results and error messages
- Decisions made and the reasoning behind them
```

**Manual compaction:** send `/compact` as a prompt string to trigger on demand.

**PreCompact hook:** run custom logic before compaction (e.g. archive full transcript):
```python
async def archive_transcript(input_data, tool_use_id, context):
    trigger = input_data.get("trigger")  # "manual" or "auto"
    # Save full transcript to your storage before it gets summarised
    await save_transcript_to_s3(input_data["session_id"])
    return {}

options = ClaudeAgentOptions(
    hooks={"PreCompact": [HookMatcher(hooks=[archive_transcript])]}
)
```

### Strategies for Long-Running Agents
- **Use subagents for subtasks.** Each starts with a fresh context; only the summary returns to the parent.
- **Be selective with tools.** Every tool definition costs context. Scope subagents to minimal tool sets.
- **Watch MCP server costs.** Large MCP servers with many tools can consume significant context upfront. Use `ToolSearch` to load on-demand.
- **Use lower effort for routine tasks.** `effort="low"` reduces token usage for simple lookups and listing.
- **Set budget limits.** `max_budget_usd=1.00` prevents runaway sessions in production.

---

## Claude Code Features (CLAUDE.md, Skills, Commands)

The SDK loads Claude Code's filesystem-based configuration from `.claude/` in the working directory and `~/.claude/`. Control which sources load with `setting_sources`:

```python
options = ClaudeAgentOptions(
    setting_sources=["project"],   # Load from .claude/ in working dir
    # setting_sources=["global"],  # Load from ~/.claude/ only
    # setting_sources=["project", "global"],  # Both
)
```

### CLAUDE.md (Memory)
`CLAUDE.md` files provide persistent project context that is always injected into every request. Use them for:
- Project conventions and coding style
- Architecture decisions and constraints
- Tool usage guidelines
- Summarisation instructions for compaction

```markdown
# Project Context

This is a Python FastAPI application. Always:
- Use type hints on all functions
- Write docstrings for public APIs
- Follow PEP 8 naming conventions
- Run `pytest` before declaring code complete

## Summary instructions
When summarising, always preserve: current task, files modified, test results.
```

### Skills
Skills are Markdown files in `.claude/skills/*/SKILL.md` that define reusable workflows and domain expertise. Claude reads skill descriptions at startup and loads full content only when a skill is relevant to the current task (progressive disclosure).

```
.claude/
  skills/
    deploy/
      SKILL.md         ← Deployment workflow instructions
    code-review/
      SKILL.md         ← Code review checklist and standards
      templates/
        review.md      ← Review template
```

### Slash Commands
Custom commands defined in `.claude/commands/*.md` are available as slash commands in the agent. In the SDK, send them as prompt strings:

```python
# Trigger a custom slash command
async for message in query(prompt="/deploy staging"):
    ...

# Trigger compaction
async for message in query(prompt="/compact"):
    ...
```

### Plugins
Plugins extend the SDK programmatically with custom commands, agents, and MCP server configurations:

```python
options = ClaudeAgentOptions(
    plugins=[
        {
            "name": "my-plugin",
            "mcpServers": {"my-db": {"command": "uvx", "args": ["my-db-server"]}},
            "agents": {"my-agent": {"description": "...", "prompt": "..."}},
        }
    ]
)
```

---

## Input Modes and Streaming

### Streaming Output
Stream the agent's response in real-time as the loop runs:

```python
options = ClaudeAgentOptions(
    include_partial_messages=True,  # Enable StreamEvent messages
    allowed_tools=["Read", "Edit"],
)

async for message in query(prompt="Refactor utils.py", options=options):
    if hasattr(message, "type") and message.type == "content_block_delta":
        print(message.delta.text, end="", flush=True)  # Live text output
```

### Streaming Input
You can stream user input into a running agent session mid-execution — useful for interactive applications where the user wants to provide guidance while the agent is working.

### Handling Approval Prompts Mid-Loop
The `AskUserQuestion` tool lets the agent ask clarifying questions during execution without ending the session:

```python
async for message in query(prompt="Deploy the application", options=options):
    if hasattr(message, "tool_name") and message.tool_name == "AskUserQuestion":
        # Present choices to the user and respond
        user_choice = present_choices_to_user(message.choices)
        # Framework-specific: respond with the user's choice
```

---

## Structured Output

Agents can return validated structured data instead of free-form text:

```python
from pydantic import BaseModel, Field
from claude_agent_sdk import query, ClaudeAgentOptions

class BugReport(BaseModel):
    file_path: str = Field(description="Path to the file containing the bug")
    line_number: int = Field(description="Line number where the bug occurs")
    description: str = Field(description="Description of the bug")
    severity: str = Field(description="Severity: critical, high, medium, or low")
    suggested_fix: str = Field(description="Suggested code fix")

options = ClaudeAgentOptions(
    allowed_tools=["Read", "Glob", "Grep"],
    response_format=BugReport,
)

async for message in query(prompt="Find the most critical bug in auth.py", options=options):
    if hasattr(message, "structured_response"):
        report = message.structured_response
        print(f"Bug at {report.file_path}:{report.line_number}")
        print(f"Severity: {report.severity}")
        print(f"Fix: {report.suggested_fix}")
```

If structured output validation fails repeatedly, the result subtype is `error_max_structured_output_retries`.

---

## File Checkpointing

File checkpointing snapshots the filesystem state before and after agent runs, letting you revert file changes without affecting the session history (which is handled separately by session management).

```python
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit", "Write", "Bash"],
    # checkpointing=True  # Framework-specific; creates snapshots before each tool
)

# After the agent runs, you can revert to any prior snapshot if needed
```

Use file checkpointing when:
- The agent may make multiple file changes and you want the ability to undo any of them.
- You want to fork the file state independently of forking the session.
- You're running agents in CI and want guaranteed rollback on failure.

---

## Cost Tracking and Observability

### Tracking Cost Per Session
Every `ResultMessage` carries `total_cost_usd` and `usage`:

```python
async for message in query(prompt="Refactor the API layer", options=options):
    if isinstance(message, ResultMessage):
        if message.total_cost_usd is not None:
            print(f"Total cost: ${message.total_cost_usd:.4f}")
        print(f"Turns used: {message.num_turns}")
        print(f"Session: {message.session_id}")
```

### OpenTelemetry Observability
The SDK emits OpenTelemetry traces for all agent activity:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)

# Agent runs are now traced automatically
async for message in query(prompt="Fix the tests", options=options):
    ...
```

### Todo Tracking
The `TodoWrite` tool gives the agent a structured task list to track its progress. Monitor it via hooks:

```python
async def track_todos(input_data, tool_use_id, context):
    if input_data.get("tool_name") == "TodoWrite":
        todos = input_data["tool_input"].get("todos", [])
        completed = [t for t in todos if t.get("status") == "completed"]
        print(f"Progress: {len(completed)}/{len(todos)} tasks done")
    return {}
```

---

## Deployment

### Self-Hosted
The Agent SDK runs inside your own process. You are responsible for building and operating the HTTP/WebSocket server, authentication, and session management that exposes the agent to end users.

```python
# Example: FastAPI wrapper around the SDK
from fastapi import FastAPI
from claude_agent_sdk import query, ClaudeAgentOptions

app = FastAPI()

@app.post("/agent/run")
async def run_agent(prompt: str, session_id: str | None = None):
    results = []
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep"],
        resume=session_id,
        max_budget_usd=0.50,
    )
    async for message in query(prompt=prompt, options=options):
        if hasattr(message, "result"):
            results.append(message.result)
    return {"results": results}
```

### Managed Agents (Alternative)
If you don't want to operate the agent infrastructure, Anthropic's **Managed Agents** service runs the agent loop and sandbox on Anthropic's infrastructure. Your application calls a REST API and streams back results.

| | Agent SDK | Managed Agents |
|---|---|---|
| **Runs in** | Your process | Anthropic infrastructure |
| **Interface** | Python/TS library | REST API |
| **Agent works on** | Your filesystem / services | Anthropic-managed sandbox |
| **Session state** | JSONL on your filesystem | Anthropic-hosted event log |
| **Custom tools** | In-process functions | You execute, return results |
| **Best for** | Local prototyping, direct filesystem access | Production without managing sandboxes |

A common path: prototype with the Agent SDK locally, then migrate to Managed Agents for production.

### Security Considerations
- Use `allowed_tools` and `disallowed_tools` to enforce the principle of least privilege.
- Never use `bypassPermissions` or `dontAsk` modes unless running in a fully isolated container.
- Use `PreToolUse` hooks to validate and sanitise tool inputs before execution.
- Store API keys in environment variables, never in source code.
- Set `max_budget_usd` and `max_turns` to bound runaway sessions.
- Use file checkpointing in production to enable rollback.
- Audit tool calls with `PostToolUse` hooks and ship logs to your SIEM.

---

## Comparing the SDK to Other Claude Tools

### Agent SDK vs Anthropic Client SDK

| | Client SDK | Agent SDK |
|---|---|---|
| **Tool loop** | You implement it | Claude handles it autonomously |
| **Built-in tools** | None — you provide all tools | Read, Write, Edit, Bash, Glob, Grep, WebSearch, etc. |
| **Session management** | Manual | Automatic (JSONL on disk) |
| **Best for** | Custom control, simpler single-turn tasks | Multi-step autonomous tasks |

```python
# Client SDK — you implement the loop
response = client.messages.create(...)
while response.stop_reason == "tool_use":
    result = your_tool_executor(response.tool_use)
    response = client.messages.create(tool_result=result, **params)

# Agent SDK — Claude handles it
async for message in query(prompt="Fix the bug in auth.py"):
    print(message)
```

### Agent SDK vs Claude Code CLI

| Use Case | Best Choice |
|---|---|
| Interactive development | CLI |
| CI/CD pipelines | SDK |
| Custom applications | SDK |
| One-off tasks | CLI |
| Production automation | SDK |

Workflows translate directly between them — many teams use the CLI for development and the SDK for production.

---

## Common Patterns and Use Cases

### Pattern 1: Code Review Agent
Read-only agent that analyses a codebase and produces a structured report.
```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Glob", "Grep"],
    permission_mode="dontAsk",
    effort="high",
    response_format=CodeReviewReport,
    max_budget_usd=0.50,
)
```

### Pattern 2: Bug-Fixing Agent with Safety Gates
Autonomous bug fixing with human approval before each file edit.
```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Glob", "Grep", "Bash"],
    permission_mode="default",
    hooks={
        "PreToolUse": [HookMatcher(matcher="Edit|Write", hooks=[human_approval_hook])]
    },
)
```

### Pattern 3: Research Agent with Web Search
Gather information from the web and synthesise a report without touching the filesystem.
```python
options = ClaudeAgentOptions(
    allowed_tools=["WebSearch", "WebFetch"],
    permission_mode="dontAsk",
    max_turns=20,
    effort="medium",
)
```

### Pattern 4: Multi-Stage Pipeline with Subagents
Orchestrator delegates specialised work to focused subagents — collector, analyser, report writer.
```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Write", "Agent"],
    agents={
        "data-collector": AgentDefinition(
            description="Collects raw data from sources",
            prompt="Gather all relevant data. Be thorough.",
            tools=["WebSearch", "WebFetch", "Read"],
        ),
        "analyst": AgentDefinition(
            description="Analyses collected data",
            prompt="Produce key insights. Be concise.",
            tools=["Read"],
        ),
    },
)
```

### Pattern 5: CI/CD Agent
Runs in a pipeline, exits with non-zero on failure, bounded by cost.
```python
import sys

session_id = None
async for message in query(
    prompt="Run the test suite and fix any failing tests",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Edit", "Bash"],
        permission_mode="bypassPermissions",  # Safe in CI container
        max_turns=50,
        max_budget_usd=2.00,
        effort="high",
    ),
):
    if isinstance(message, ResultMessage):
        session_id = message.session_id
        if message.subtype != "success":
            print(f"Agent failed: {message.subtype}")
            sys.exit(1)
        print(message.result)
```

---

## Troubleshooting

### Hook Not Firing
- Hook event names are case-sensitive: `PreToolUse` not `preToolUse`.
- Hooks may not fire if the session ends before they can execute (e.g. hitting `max_turns`).
- Check that `setting_sources` includes `"project"` if using file-based hooks.

### Matcher Not Filtering as Expected
- Matchers only match tool **names**, not file paths or arguments.
- To filter by file path, check `tool_input["file_path"]` inside the callback.
- MCP tools follow the pattern `mcp__<server>__<action>`.

### Tool Blocked Unexpectedly
- Check all `PreToolUse` hooks for `permissionDecision: "deny"` returns.
- Verify matchers aren't too broad (no matcher matches everything).
- Log `permissionDecisionReason` to identify which hook is blocking.

### Context Window Errors
- Set `max_turns` to bound total context growth.
- Add summarisation instructions to `CLAUDE.md`.
- Use subagents to isolate large subtasks.
- Use `ToolSearch` instead of preloading all MCP tools.

### Resuming Wrong Session
- Sessions are stored under `~/.claude/projects/<encoded-cwd>/`.
- The `encoded-cwd` is the absolute path with all non-alphanumeric characters replaced by `-`.
- If the `cwd` is different on resume, the SDK looks in the wrong location.

### Modified Tool Input Not Applied
- `updatedInput` must be inside `hookSpecificOutput`, not at the top level.
- You must also return `permissionDecision: "allow"` for the modification to take effect.
- Include `hookEventName` in `hookSpecificOutput`.

---

## Summary of Key APIs

```python
# Single query
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

async for message in query(
    prompt="Your task here",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Edit", "Bash"],
        permission_mode="acceptEdits",
        model="claude-sonnet-4-6",
        max_turns=30,
        max_budget_usd=1.00,
        effort="high",
        setting_sources=["project"],
        resume="session-id",          # Resume specific session
        continue_conversation=True,   # Resume most recent session
        fork_session=True,            # Fork instead of modify
        hooks={...},
        mcp_servers={...},
        agents={...},
        system_prompt="...",
    ),
):
    if isinstance(message, ResultMessage):
        if message.subtype == "success":
            print(message.result)
        print(f"Cost: ${message.total_cost_usd:.4f}")
        print(f"Session: {message.session_id}")

# Multi-turn (Python)
from claude_agent_sdk import ClaudeSDKClient

async with ClaudeSDKClient(options=options) as client:
    await client.query("First prompt")
    async for msg in client.receive_response():
        ...
    await client.query("Follow-up prompt")   # Continues same session
    async for msg in client.receive_response():
        ...

# Session utilities
from claude_agent_sdk import list_sessions, get_session_messages, get_session_info

sessions = await list_sessions()
messages = await get_session_messages(session_id)
info = await get_session_info(session_id)
```

---

## Further Reading

- [Agent SDK Overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [Python SDK Reference](https://code.claude.com/docs/en/agent-sdk/python)
- [TypeScript SDK Reference](https://code.claude.com/docs/en/agent-sdk/typescript)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Permissions Reference](https://code.claude.com/docs/en/agent-sdk/permissions)
- [Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview)
- [Python Changelog](https://github.com/anthropics/claude-agent-sdk-python/blob/main/CHANGELOG.md)
- [TypeScript Changelog](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md)
- [Example Agents](https://code.claude.com/docs/en/agent-sdk/examples)
