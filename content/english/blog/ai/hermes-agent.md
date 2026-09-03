+++
date = '2026-09-03T12:00:00+10:00'
draft = false
title = 'Hermes Agent: From Zero to Expert'
tags = ['AI', 'AGENTS', 'Hermes', 'RAG', 'Reinforcement Learning', 'Messaging Bots', 'LLM', 'Agentic AI']
summary = "A complete learning path for Hermes Agent — architecture, each component deep-dived from beginner to expert, and a working Telegram personal assistant bot with voice calls."
+++

Hermes Agent by Nous Research is an open-source personal AI agent that runs on your own machine, in your terminal, on your messaging apps, and as a Python library. It is a battery-included assistant that can chat, run shell commands, browse the web, remember you across conversations, schedule jobs, and speak back to you in voice.

This guide is a structured learning path. We start with the overall system and its components, then dive deep into every major section from beginner to expert, and finish by building a real sample application: a Telegram personal assistant bot that does things for you and talks back with voice.

Official docs: [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs) · Source: [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

---

## Table of Contents

1. [What Is Hermes Agent?](#what-is-hermes-agent)
2. [Part 1 — Components and Architecture](#part-1--components-and-architecture)
3. [Part 2 — Deep Dive, Beginner to Expert](#part-2--deep-dive-beginner-to-expert)
4. [Part 3 — Sample Application: Telegram Personal Assistant](#part-3--sample-application-telegram-personal-assistant)

---

## What Is Hermes Agent?

Hermes Agent is more than a chat wrapper around an LLM. It is a complete agent harness that combines:

- **A CLI/TUI** for interactive terminal conversations
- **A messaging gateway** that turns the same agent into a Telegram, Discord, Slack, WhatsApp, Signal, Email or Home Assistant bot
- **A tool system** with 70+ built-in tools across ~28 toolsets (files, terminal, web, browser, vision, image generation, TTS)
- **Persistent memory** across sessions
- **A cron scheduler** for recurring agent tasks
- **Skills** — installable, reusable instruction packages (compatible with the [agentskills.io](https://agentskills.io/specification) open standard)
- **An RL training pipeline** powered by Atropos
- **A Python library** for programmatic integration
- **ACP** (Agent Client Protocol) support for editor-native agents in VS Code, Zed and JetBrains

The defining architectural idea: **one core agent that serves every surface**. The same `AIAgent` class powers the CLI, the gateway bots, cron jobs, the batch runner, the API server and the Python library. Platform differences live in the entry points, not in the agent.

---

## Part 1 — Components and Architecture

### System Overview

Hermes Agent is organized around a handful of entry points that all funnel into a single core agent:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Entry Points                                  │
│                                                                      │
│  CLI (cli.py)    Gateway (gateway/run.py)    ACP (acp_adapter/)     │
│  Batch Runner    API Server                  Python Library          │
└──────────┬──────────────┬───────────────────────┬───────────────────┘
           ▼              ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AIAgent (run_agent.py)                          │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Prompt       │  │ Provider     │  │ Tool         │               │
│  │ Builder      │  │ Resolution   │  │ Dispatch     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                       │
│  ┌──────┴───────┐         │                 │                       │
│  │ Compression  │  ┌──────┴───────┐         │                       │
│  │ & Caching    │  │ 3 API Modes  │  ┌──────┴───────┐               │
│  │              │  │ chat_compl.  │  │ Tool Registry│               │
│  │              │  │ codex_resp.  │  │ 70+ tools    │               │
│  │              │  │ anthropic    │  │ 28 toolsets  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────┴─────────────────┴─────────────────┴───────────────────────┘
           ▼                                    ▼
┌───────────────────┐              ┌──────────────────────┐
│ Session Storage   │              │ Tool Backends         │
│ (SQLite + FTS5)   │              │ Terminal (7 backends) │
│ hermes_state.py   │              │ Browser (5 backends)  │
│ gateway/session.py│              │ Web (4 backends)      │
└───────────────────┘              │ MCP (dynamic)         │
                                   │ File, Vision, etc.    │
                                   └──────────────────────┘
```

### Major Subsystems

#### Agent Loop

The synchronous orchestration engine (`AIAgent` in `run_agent.py`) is where the actual work happens. It handles provider selection, prompt construction, tool execution, retries, fallback, callbacks, compression and persistence. It supports three API modes to talk to different provider backends:

- `chat_completions` — OpenAI-compatible chat API
- `codex_responses` — the Responses/Codex API
- `anthropic_messages` — Anthropic Messages API

The loop is: user input → build system prompt → resolve provider → call the model → if the model emits a tool call, dispatch it and feed the result back → repeat until the final response.

#### Prompt System

The prompt system assembles the system prompt in **ordered tiers**: `stable` → `context` → `volatile`.

- **Stable** tier: identity, tool guidance, skills
- **Context** tier: context files
- **Volatile** tier: memory, profile, timestamp blocks

The output is cached via Anthropic breakpoints and the system prompt is designed not to change mid-conversation, which preserves the prefix cache except for explicit user actions like `/model`.

#### Provider Resolution

A shared runtime resolver maps `(provider, model)` tuples to `(api_mode, api_key, base_url)`. It handles 18+ providers, OAuth flows, credential pools and alias resolution. The same resolver is used by CLI, gateway, cron, ACP and auxiliary calls (like vision and summarization), so provider configuration is consistent everywhere.

#### Tool System

A central tool registry (`tools/registry.py`) registers 70+ tools across ~28 toolsets. Each tool file **self-registers at import time** via a `registry.register()` call — there is no manual import list. The registry handles schema collection, dispatch, availability checking (`check_fn`) and error wrapping.

Tool backends are pluggable:
- **Terminal**: 7 backends (local, Docker, SSH, Daytona, Modal, Singularity, Vercel Sandbox)
- **Browser**: 5 backends
- **Web**: 4 backends
- **MCP**: dynamic — external tool servers are discovered at runtime

#### Session Persistence

All sessions are stored in SQLite (`~/.hermes/state.db`) with **FTS5 full-text search**. Sessions track lineage (parent/child across compression), are isolated per platform, and use atomic writes with contention handling. Keys are deterministic, e.g. a Telegram DM is `agent:main:telegram:dm:<chat_id>`.

#### Messaging Gateway

A long-running process with 27+ platform adapters (built-in plus bundled plugins). It handles unified session routing, user authorization (allowlists + DM pairing), slash-command dispatch, a hook system, cron ticking and background maintenance. When the agent emits a `MEDIA:/path/to/file` tag, the gateway ships the file as a native platform attachment.

#### Plugin System

Plugins register tools, hooks and CLI commands through a context API. Three discovery sources: `~/.hermes/plugins/` (user), `.hermes/plugins/` (project) and pip entry points. Two specialized plugin types are single-select: **memory providers** and **context engines**.

#### Cron

Cron jobs are first-class agent tasks (not shell tasks), stored in JSON, supporting multiple schedule formats, optional skill attachment, and delivery to any platform.

#### ACP Integration

Exposes Hermes as an editor-native agent over stdio/JSON-RPC for VS Code, Zed and JetBrains.

#### Trajectories

Generates ShareGPT-format trajectories from agent sessions — used to produce training data for RL training.

### Design Principles

| Principle | What it means in practice |
|---|---|
| **Prompt stability** | System prompt does not change mid-conversation; no cache-breaking mutations except explicit user actions |
| **Observable execution** | Every tool call is visible via callbacks; progress shows in CLI spinner and gateway chat messages |
| **Interruptible** | API calls and tool execution can be cancelled mid-flight by user input or signals |
| **Platform-agnostic core** | One `AIAgent` serves CLI, gateway, ACP, batch and API server |
| **Loose coupling** | MCP, plugins, memory providers and RL environments use registry patterns, not hard dependencies |
| **Profile isolation** | Each profile gets its own `HERMES_HOME`, config, memory, sessions and gateway PID |

### Where Settings Live

Hermes separates secrets from normal config:

- **Secrets and tokens** → `~/.hermes/.env`
- **Non-secret settings** → `~/.hermes/config.yaml`

The `hermes config set` command routes values to the right file automatically — API keys go to `.env`, everything else to `config.yaml`.

```
~/.hermes/
├── config.yaml     # Settings (model, terminal, TTS, compression, etc.)
├── .env            # API keys and secrets
├── auth.json       # OAuth provider credentials
├── SOUL.md         # Primary agent identity (slot #1 in system prompt)
├── memories/       # Persistent memory (MEMORY.md, USER.md)
├── skills/         # Agent-created skills
├── cron/           # Scheduled jobs
├── sessions/       # Gateway sessions
└── logs/           # errors.log, gateway.log (secrets auto-redacted)
```

---

## Part 2 — Deep Dive, Beginner to Expert

The official learning path splits readers into three tiers. This section walks each tier in order.

### Tier 1 — Beginner (first hour)

**Goal:** get a working install, have a real conversation, use built-in tools.

#### Install

Easiest path is the Hermes Desktop installer. For CLI-only:

```bash
# Linux / macOS / WSL2 / Android (Termux)
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Windows (native, in PowerShell)
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

Then reload your shell:

```bash
source ~/.bashrc   # or source ~/.zshrc
```

#### Choose a Provider

The single most important setup step. Use:

```bash
hermes model
```

The easiest path for first-time users is Nous Portal:

```bash
hermes setup --portal
```

One OAuth login covers a model plus the four Tool Gateway tools (web search, image generation, TTS, cloud browser).

**Minimum context: 64K tokens.** Hermes requires a model with at least 64,000 tokens of context. Models with smaller windows cannot maintain enough working memory for multi-step tool-calling and will be rejected at startup.

Supported providers include Nous Portal, OpenAI Codex, Anthropic, OpenRouter, Google AI Studio, xAI, AWS Bedrock, Azure Foundry, DeepSeek, GitHub Copilot, Ollama, LM Studio, Qwen OAuth and custom OpenAI-compatible endpoints. You can switch at any time with `hermes model` — no lock-in.

#### Run Your First Chat

```bash
hermes            # classic CLI
hermes --tui      # modern TUI (recommended)
```

The banner shows your model, provider, available tools and skills. A good first prompt uses a tool so you can verify the tool loop works:

```
Summarize this repo in 5 bullets and tell me what the main entrypoint is.
```

**What success looks like:** the banner shows your model, Hermes replies without error, it can use a tool if needed (terminal, file read, web search) and the conversation continues for more than one turn.

#### Verify Sessions Work

```bash
hermes --continue    # resume the most recent session
hermes -c            # short form
```

If that does not bring you back to your session, check you are in the same profile and that the session actually saved.

#### Configuration Essentials

```bash
hermes config              # view current configuration
hermes config edit         # open config.yaml in your editor
hermes config get KEY      # print a resolved value
hermes config set KEY VAL  # set a specific value
hermes config unset KEY    # remove a user-set value
hermes config check        # find missing options after updates
hermes config migrate      # interactively add missing options
```

Examples:

```bash
hermes config set model anthropic/claude-opus-4
hermes config set terminal.backend docker
hermes config set OPENROUTER_API_KEY sk-or-...   # saves to .env
```

**Precedence (highest to lowest):** CLI arguments → `config.yaml` → `.env` → built-in defaults.

Common slash commands for beginners:

| Command | What it does |
|---|---|
| `/help` | Show all available commands |
| `/tools` | List available tools |
| `/model` | Switch models interactively |
| `/personality pirate` | Try a fun personality |
| `/save` | Save the conversation |
| `/new` | Start a fresh conversation |
| `/title My Session` | Name the current session |

**Interrupt the agent:** type a new message and press Enter mid-turn to interrupt the current task and switch to your new instructions. `Ctrl+C` also works.

### Tier 2 — Intermediate (2–3 hours)

**Goal:** set up messaging bots, memory, cron jobs and skills.

#### Sessions

Every conversation is saved automatically. Sessions support resume, cross-platform handoff, full-text search and history management.

```bash
hermes -c "my project"        # resume by (fuzzy) name
hermes --resume <session_id>  # resume a specific session
hermes -r latest              # resume latest session
hermes sessions list          # list sessions
hermes sessions list --source telegram
hermes sessions export backup.jsonl          # export (jsonl/md/qmd/html/trace)
hermes sessions delete <session_id>
```

Cross-platform handoff moves a session from CLI to a bot:

```bash
/handoff telegram
```

The gateway claims the handoff, creates a new thread on the destination, and re-binds the session ID. Resume back with `/resume <title>`.

**What counts toward context:** system prompt + current conversation window + explicitly injected content. Media attachments are turn-scoped — processed once, not carried repeatedly.

#### Tools and Toolsets

Tools are functions that extend the agent. They are grouped into **toolsets** that can be enabled or disabled per platform.

| Category | Tools |
|---|---|
| Web | `web_search`, `web_extract` |
| X Search | `x_search` (off by default, opt in) |
| Terminal & Files | `terminal`, `process`, `read_file`, `patch` |
| Browser | `browser_navigate`, `browser_snapshot`, `browser_vision` |
| Media | `vision_analyze`, `image_generate`, `text_to_speech` |
| Orchestration | `todo`, `clarify`, `execute_code`, `delegate_task` |
| Memory | `memory`, `session_search` |
| Automation | `cronjob` |
| Integrations | Home Assistant (`ha_*`), MCP servers |

Common toolset names: `web`, `search`, `terminal`, `file`, `browser`, `vision`, `image_gen`, `skills`, `tts`, `todo`, `memory`, `session_search`, `cronjob`, `code_execution`, `delegation`, `clarify`, `homeassistant`, `messaging`, `spotify`. Platform presets include `hermes-cli` and `hermes-telegram`. Dynamic MCP toolsets appear as `mcp-<server>`.

Manage tools:

```bash
hermes tools
hermes chat --toolsets "web,terminal"
```

Terminal backends (config in `~/.hermes/config.yaml`):

```yaml
terminal:
  backend: local    # local | docker | ssh | modal | daytona | vercel_sandbox | singularity
  cwd: "."
  timeout: 180
```

Docker example — one persistent container shared across the whole process:

```yaml
terminal:
  backend: docker
  docker_image: python:3.11-slim
```

**Gotcha — shell startup files:** agent terminal calls run non-interactively (no TTY). Heavy `.bashrc`/`.zshrc` init (e.g. `nvm.sh`) causes latency or timeouts. Use the standard `case $- in *i*) ;; *) return;; esac` guard in your rc files.

**Gotcha — Docker file delivery:** on a `docker` backend, Telegram attachments are sent by the gateway process, not from inside the container. A file written inside Docker to `/workspace/report.txt` is invisible on the host. Mount a shared volume and emit the host-visible path in `MEDIA:`.

```yaml
terminal:
  backend: docker
  docker_volumes:
    - "/home/user/.hermes/cache/documents:/output"
```

Background processes are supported via the `process` tool (`list`, `poll`, `wait`, `log`, `kill`, `write`). PTY mode (`pty=true`) enables interactive CLI tools.

#### Memory

Hermes has **bounded, curated memory** that persists across sessions via two markdown files in `~/.hermes/memories/`:

| File | Purpose | Char limit |
|---|---|---|
| `MEMORY.md` | Agent's personal notes — environment facts, conventions, lessons learned | 2,200 chars (~800 tokens) |
| `USER.md` | User profile — preferences, communication style, expectations | 1,375 chars (~500 tokens) |

Memory is injected as a **frozen snapshot** into the system prompt at session start. The agent manages its own memory through the `memory` tool with three actions — `add`, `replace`, `remove` (no `read`; memory is auto-injected). When full, the tool tells the agent to consolidate entries and retry.

```yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  memory_char_limit: 2200
  user_char_limit: 1375
  write_approval: false
```

`session_search` complements memory with fast SQLite FTS5 full-text search over all past sessions — no LLM calls. Memory entries are scanned for injection and exfiltration patterns.

View the learning journey:

```bash
hermes journey                # timeline of saved skills and memory
hermes journey list
```

#### Skills

Skills are **on-demand instruction documents** that teach Hermes how to do a specific task. Each is a `SKILL.md` file with a name, description and step-by-step procedure. They follow a **progressive disclosure** pattern to minimize token usage:

```
Level 0: skills_list()        → names + descriptions   (~3k tokens)
Level 1: skill_view(name)     → full content + metadata
Level 2: skill_view(name, path) → specific reference file
```

Every installed skill becomes a slash command automatically:

```
/k8s deploy the staging manifest          # run the skill with a request
/k8s                                     # load it and let Hermes ask what you need
```

Browse and install from the hub:

```bash
hermes skills browse                     # list everything available
hermes skills search kubernetes          # find skills by keyword
hermes skills install openai/skills/k8s  # install one (runs a security scan first)
```

The install argument is a `source/path` slug from the hub. Skills live in `~/.hermes/skills/`, the single source of truth. The `/learn` command turns reference material into a reusable skill without hand-writing `SKILL.md`:

```
/learn the REST client in ~/projects/acme-sdk, focus on auth + pagination
```

All hub-installed skills go through a **security scanner** checking for data exfiltration, prompt injection, destructive commands and supply-chain signals. Trust levels: `builtin`, `official`, `trusted`, `community`. A `dangerous` verdict stays blocked.

#### Cron

Schedule recurring agent tasks with natural language or cron expressions, exposed through a single `cronjob` tool. The gateway daemon ticks the scheduler every 60 seconds.

```bash
# In chat
/cron add "every 2h" "Check server status"
/cron add "every 1h" "Summarize new feed items" --skill blogwatcher
/cron list
/cron remove <job_id>

# Standalone CLI
hermes cron create "every 2h" "Check server status"
hermes cron create "0 8 * * *" "Morning briefing" --deliver telegram
hermes cron status
hermes cron doctor
```

Schedule formats: relative (`in 30m`, `every 2h`), natural day/time (`every monday 9am`, `weekdays at 9am`), cron expressions (`0 9 * * *`, `0 9 * * 1-5`) and ISO timestamps.

Jobs run in **fresh agent sessions** (no memory, no prior context) — the prompt must be self-contained. Deliveries can target `origin`, `local`, `telegram`, `discord`, `slack`, `whatsapp`, `email` or `all`. If the agent response is exactly `[SILENT]`, delivery is suppressed.

Home channel for cron delivery:

```
/sethome
```

or set `TELEGRAM_HOME_CHANNEL` in `.env`.

### Tier 3 — Advanced / Expert (4–6 hours)

**Goal:** build custom tools, create skills, integrate MCP, train models with RL, contribute.

#### MCP (Model Context Protocol)

MCP connects Hermes to external tool servers — GitHub, databases, file systems, browser stacks, APIs. It ships with the standard install.

```yaml
# ~/.hermes/config.yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_xxx"
```

Two transport types:

**Stdio** (local subprocess) — uses `command`, `args`, `env`.
**HTTP** (remote endpoint) — uses `url`, `headers`, `auth: oauth`.

```yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
```

MCP tools are prefixed `mcp_<server>_<tool>`, e.g. `mcp_filesystem_read_file`. Servers can send `notifications/tools/list_changed` and Hermes auto-refetches. Reload with `/reload-mcp`.

Hermes can also run **as** an MCP server:

```bash
hermes mcp serve
```

Useful catalog commands: `hermes mcp catalog`, `hermes mcp install n8n`, `hermes mcp login <server>`.

#### Adding a Custom Tool

Built-in tool development lives in the `tools/` directory. A tool needs the handler plus a toolset entry.

```python
import os, json
from tools.registry import registry

def check_weather_requirements() -> bool:
    return bool(os.getenv("WEATHER_API_KEY"))

def weather_tool(location: str, units: str = "metric") -> str:
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return json.dumps({"error": "WEATHER_API_KEY not configured"})
    return json.dumps({"location": location, "temp": 22, "units": units})

WEATHER_SCHEMA = {
    "name": "weather",
    "description": "Get current weather for a location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "City name"},
            "units": {"type": "string", "enum": ["metric", "imperial"], "default": "metric"}
        },
        "required": ["location"]
    }
}

registry.register(
    name="weather",
    toolset="weather",
    schema=WEATHER_SCHEMA,
    handler=lambda args, **kw: weather_tool(location=args.get("location", "")),
    check_fn=check_weather_requirements,
    requires_env=["WEATHER_API_KEY"],
)
```

**Key rules:** handlers must return a JSON string via `json.dumps()` (never raw dicts); errors must be `{"error": "message"}` (never raised as exceptions); `check_fn` returning `False` silently excludes the tool. Any `tools/*.py` file with a top-level `registry.register()` is auto-discovered — no manual import list. Add the tool name to `_HERMES_CORE_TOOLS` in `toolsets.py`.

Test with:

```bash
hermes chat -q "Use the weather tool for London"
```

#### Creating a Skill

Skills are the **no-code** way to extend capabilities. Create a directory with a `SKILL.md`:

```
~/.hermes/skills/weather/
└── SKILL.md
```

```markdown
---
name: weather-check
description: Get current weather for a location
version: 1.0.0
metadata:
  hermes:
    tags: [weather, api]
    category: general
required_environment_variables:
  - name: WEATHER_API_KEY
    prompt: "Enter your API key"
---
# Weather Check

## When to Use
Use this skill when the user asks for the current weather.

## Procedure
1. Call the `weather` tool with the location.
2. Format the result as a short summary.
```

Skills can use `metadata.hermes.requires_toolsets`, `requires_tools`, `fallback_for_toolsets` and `fallback_for_tools` for conditional activation. `required_environment_variables` are stored in `.env` and never shown to the model.

#### Programmatic Integration (Python Library)

Use Hermes as a Python library in your own applications. Follow the [Python Library Guide](https://hermes-agent.nousresearch.com/docs/guides/python-library) — the same `AIAgent` core is importable, sharing providers, sessions and tools configured via the CLI.

#### RL Training (powered by Atropos)

The RL training pipeline is powered by [Atropos](https://github.com/NousResearch/atropos). You use Hermes to generate trajectories (ShareGPT format) from agent sessions, which become training data. RL training works best once you already understand how Hermes handles conversations and tool calls — run through the beginner path first. See provider routing and architecture before attempting training.

#### Contributing

The project has ~25,000 tests across ~1,250 files. See the [Contributing guide](https://hermes-agent.nousresearch.com/docs/developer-guide/contributing) to get started.

---

## Part 3 — Sample Application: Telegram Personal Assistant with Voice Calls

Now we build a real project: a **Telegram personal assistant bot** that does things for you (runs tools, web search, memory, daily briefings via cron) **and makes calls** — meaning it talks to you by voice (voice memos in, spoken replies out).

This is a realistic, production-shaped setup that combines everything from the previous sections. No custom Python is required — Hermes is the application.

### What the bot will do

- Chat with you from any device over Telegram (text, images, files)
- Use tools: run commands, read/write files, search the web, browse
- Transcribe your **voice memos** (STT) and reply with **voice bubbles** (TTS)
- Remember you across conversations (memory)
- Send a **daily briefing** on a schedule (cron + web search)
- Follow group-chat rules so it only responds when actually addressed

### Step 1 — Create the Bot on Telegram

Every Telegram bot needs an API token from [@BotFather](https://t.me/BotFather).

1. Search for **@BotFather**
2. Send `/newbot`
3. Choose a display name (e.g. `Hermes Assistant`)
4. Choose a username ending in `bot` (e.g. `my_hermes_assistant_bot`)
5. BotFather replies with your API token, shaped like `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`

> **Keep your bot token secret.** Anyone with it can control your bot. Revoke it with `/revoke` in BotFather if it leaks.

Optional but nice: use `/setcommands` to define the command menu:

```
help - Show help information
new - Start a new conversation
sethome - Set this chat as the home channel
```

### Step 2 — Configure Hermes

Run the interactive setup:

```bash
hermes gateway setup
```

Select **Telegram** and paste your bot token and allowed user IDs. To find your numeric user ID (not your username), message [@userinfobot](https://t.me/userinfobot).

Manual equivalent in `~/.hermes/.env`:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_ALLOWED_USERS=123456789
```

Set a home channel for cron deliveries:

```
TELEGRAM_HOME_CHANNEL=-1001234567890
```

(Group chat IDs are negative numbers; your DM chat ID is your user ID.)

### Step 3 — Add Voice (STT and TTS)

Voice is what makes this an assistant that "makes calls" with you. Add to `~/.hermes/config.yaml`:

```yaml
stt:
  provider: "local"        # local (free) | groq | openai | mistral | xai
  local:
    model: "base"

tts:
  provider: "edge"         # edge (free) | elevenlabs | openai | ...
  edge:
    voice: "en-US-AriaNeural"
```

For zero-key local speech-to-text, install `faster-whisper` (the model downloads automatically):

```bash
cd ~/.hermes/hermes-agent && uv pip install -e ".[messaging]"
# faster-whisper for free local STT
pip install faster-whisper
```

On Ubuntu/Debian install system deps for audio and TTS conversion:

```bash
sudo apt install ffmpeg libopus0
```

**For local STT**, you need no API key. For cloud STT use `GROQ_API_KEY` or `VOICE_TOOLS_OPENAI_KEY`.

Voice requires the `[messaging]` extras (`python-telegram-bot`, `discord.py[voice]`, `aiohttp`). On the curl installer, the agent source is at `~/.hermes/hermes-agent`.

### Step 4 — Control Voice in Chat

Once the gateway is running, use these commands in your Telegram DM:

```
/voice on       Voice replies only when you send a voice message
/voice tts      Voice replies to every message
/voice off      Disable voice replies
/voice status   Show current setting
```

When you send a **voice memo**, Hermes transcribes it and injects the text into the conversation. When it replies, the TTS audio is delivered as a native Telegram **voice bubble** (the round, inline-playable kind). Edge TTS outputs MP3 and needs `ffmpeg` to convert to Opus voice bubbles; without ffmpeg it is sent as a regular audio file.

### Step 5 — Start the Gateway

```bash
hermes gateway          # run in foreground
```

Or install it as a service so it runs always-on:

```bash
hermes gateway install              # user service
sudo hermes gateway install --system   # Linux boot-time system service
hermes gateway start
hermes gateway status
```

The bot should come online within seconds. Send it a message to verify.

### Step 6 — Give It Tools and Memory

Enable the toolsets you want per platform:

```bash
hermes tools
```

For a personal assistant, keep `web`, `search`, `file`, `terminal`, `vision`, `tts`, `memory` and `cronjob` enabled. Memory is on by default with `memory_enabled: true` — the bot will build a profile of your preferences in `USER.md` and environment notes in `MEMORY.md` as you talk.

### Step 7 — Add a Daily Briefing via Cron

Cron jobs run in a fresh session with **no memory and no prior context**, so the prompt must be fully self-contained. In your Telegram DM:

```
/cron add "0 8 * * *" "Search the web for the latest news about AI agents and
open source LLMs. Find at least 5 recent articles from the past 24 hours.
Summarize the top 3 most important stories in a concise daily briefing.
For each story include a clear headline, a 2-sentence summary and the source
URL. Use a friendly, professional tone. Format with emoji bullets and end
with a total story count. Deliver to telegram."
```

The result lands in your home channel every morning. For `web_search` to work you need a web-search key (e.g. `FIRECRAWL_API_KEY`) or a Nous Portal subscription, which bundles search via the Tool Gateway.

### Step 8 — Hardening for Real Use

**Authorization:** Hermes denies all users by default. Only users in `TELEGRAM_ALLOWED_USERS` can trigger the bot, even in groups.

**Group chats:** Telegram bots have **privacy mode on by default**, so the bot only sees `/` commands, replies to its own messages and service messages. To have it respond to mentions in groups, you can:

- Turn **off** Group Privacy in BotFather (then remove and re-add the bot to the group — Telegram caches privacy state), or
- Promote the bot to **group admin** (admin bots always receive all messages), or
- Keep privacy mode on and only use explicit mentions

For a personal assistant, require an explicit trigger so it does not answer every group message:

```yaml
telegram:
  require_mention: true
  exclusive_bot_mentions: true
```

**Webhook mode (cloud):** if you deploy on a cloud platform like Fly.io, use webhook mode so the machine can sleep when idle. Set `TELEGRAM_WEBHOOK_URL` and a `TELEGRAM_WEBHOOK_SECRET` (generate with `openssl rand -hex 32`) — the gateway refuses to start without the secret. Polling (the default) works fine for an always-on local server.

**Troubleshooting checklist** if the bot works in DMs but not groups:

1. Turn off BotFather privacy mode, promote to admin, or mention the bot
2. Re-add the bot after changing privacy
3. Confirm the sender is in `TELEGRAM_ALLOWED_USERS` or the group chat is allowed
4. Check `require_mention` — normal chatter is ignored unless it is a command, reply, mention or matching pattern
5. Use a unique bot token per running gateway profile

### Live Example Interaction

Here is what a session feels like end to end:

```
You (voice memo, ~20s):
  "What's the weather in Austin today, and set a reminder to water the plants at 6pm."

Hermes (transcribes via STT, then uses the tools):
  [web_search] Austin weather
  [memory add] User waters plants every day at 6pm
  [cronjob create] "0 18 * * *" "Remind user to water the plants"

Hermes (reply — text + spoken voice bubble):
  "It's 31°C and sunny in Austin today. I've added a daily reminder at
   6pm to water the plants. 🌱"
```

The bot did things (searched, remembered, scheduled) and spoke back — a complete personal assistant.

---

## Summary

Hermes Agent is a full agent harness with a single platform-agnostic core that powers terminal, messaging, cron, batch and programmatic surfaces. The beginner path is install, provider and a verified chat. The intermediate path adds sessions, tools, memory, skills and cron. The advanced path adds custom tools, skill authoring, MCP and RL training.

The Telegram assistant we built wraps all of it: a bot with tools, memory, a scheduled daily briefing and two-way voice. Start with a clean single conversation, add messaging, then layer on cron, memory, skills and voice one at a time — the same discipline the official quickstart recommends.

### Sources

- Official documentation: [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs)
- Architecture: [developer-guide/architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture)
- Quickstart: [getting-started/quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart)
- Learning Path: [getting-started/learning-path](https://hermes-agent.nousresearch.com/docs/getting-started/learning-path)
- Telegram: [user-guide/messaging/telegram](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram)
- Voice Mode: [user-guide/features/voice-mode](https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode)
- Tools, Skills, Memory, Cron, Sessions, Configuration, MCP, Daily Briefing Bot — linked throughout the sections above
