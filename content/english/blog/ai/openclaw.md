+++
date = '2026-05-18T10:00:00+00:00'
draft = false
title = 'OpenClaw: The AI That Actually Does Things'
tags = ['AI', 'Productivity', 'Tools', 'OpenClaw']
summary = "A complete guide to OpenClaw — what it is, how it works, its architecture, skills system, security landscape, and what makes it different from every AI assistant that came before it."
+++

The AI that actually does things. A complete guide to OpenClaw — what it is, how it works, its architecture, skills system, security landscape, and why it feels different from every AI assistant that came before it.

---

## What OpenClaw Actually Is

OpenClaw is not a chatbot wrapper. It is a full agent runtime: a persistent, self-hosted Node.js process that turns an LLM into a stateful, tool-using assistant. It runs as a daemon on your machine, connects to 24+ messaging platforms, executes real actions (shell commands, file writes, browser automation, API calls), and maintains memory across every conversation.

Written in TypeScript (with a Swift component for native macOS/iOS), licensed MIT, hosted at `github.com/openclaw/openclaw`. 
- As of May 2026 the repository has **369K+ stars**, 76K+ forks, and 136 releases — making it one of the fastest-growing open-source repositories in GitHub history. 
- The project was created by Austrian developer **Peter Steinberger** as a personal side project in November 2025, originally under the name **Clawdbot** (a pun on Claude that Anthropic's legal team took issue with). 
- It was briefly renamed **Moltbot** in late January 2026 before settling on **OpenClaw**. 
- In February 2026, Steinberger joined OpenAI, and a non-profit foundation was announced to steward the project going forward.

---

## Architecture: Three Layers

**Messaging Surfaces → Gateway Daemon → Agent Runtime (pi-mono) → LLM Providers**

Everything flows through a single long-lived Node.js Gateway process. No microservices. No distributed architecture. One process owns all state, sessions, and connections.

### Gateway Subsystems

The Gateway runs eight core subsystems in parallel:
**(HHASPCCC)**
- **Channel Bridges** — persistent connections to each messaging platform
- **Session Manager** — owns all conversation state and DM scope rules
- **Command Queue** — lane-aware FIFO that prevents concurrent agent collisions
- **Plugin System** — loads and sandboxes skill modules
- **Hooks Engine** — receives inbound webhooks from external services
- **Cron Scheduler** — fires scheduled and heartbeat tasks
- **Heartbeat System** — proactive task execution engine
- **Auth + Trust** — device pairing and token management

### Agent Runtime (pi-mono)

The embedded runtime that does the actual inference work (pi-mono was contributed by Mario Zechner):
**(PTCMSSSS)**
- **Prompt Assembly** — builds a dynamic system prompt from many sources each run
- **Tool Execution** — runs tools between inference rounds (the agentic loop)
- **Compaction Pipeline** — manages context window as conversations grow
- **Memory Search** — semantic retrieval over persistent memory
- **Streaming Engine** — streams deltas in real time to the client
- **Sub-Agent Spawner** — creates and coordinates child agent sessions
- **Skill Loader** — reads and injects skill definitions on demand
- **Sandbox Manager** — enforces isolation boundaries around tool execution

### LLM Providers

Channels and models are fully decoupled. Swap providers without rearchitecting:

- Anthropic (Claude)
- OpenAI (GPT-4.5, GPT-5, etc.)
- Google (Gemini)
- AWS Bedrock
- Local models via Ollama (Qwen 3, Llama 4, Mistral Large 2 — auto-detects Metal/CUDA)

---

## Installation

**Requirements:** Node 24 (recommended) or Node 22.19+ minimum. macOS, Windows, or Linux.

```bash
npm install -g openclaw@latest
# or
pnpm add -g openclaw@latest

openclaw onboard --install-daemon
```

The `onboard` wizard: gateway setup → workspace creation → channel pairing → initial skill install.

---

## The Gateway Protocol (WebSocket)

The Gateway exposes a typed WebSocket API on port `127.0.0.1:18789` by default. All clients — CLI, macOS app, mobile nodes, automations — connect over this single WebSocket.

**Wire format:**
- Transport: WebSocket, text frames, JSON payloads
- First frame must be a `connect` handshake
- Requests: `{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
- Events: `{type:"event", event, payload, seq?, stateVersion?}`
- Idempotency keys required on all side-effecting methods (`send`, `agent`) for safe retries

**Connection lifecycle:**
```
Client                    Gateway
|---- req:connect ------->|
|<----- res (ok) ---------|  (hello-ok: presence + health snapshot)
|<----- event:presence ---|
|<----- event:tick -------|
|------ req:agent ------->|
|<----- res:agent ---------|  (ack: runId, status:"accepted")
|<----- event:agent -------|  (streaming deltas)
|<----- res:agent ---------|  (final: runId, status, summary)
```

---

## Device Pairing & Trust

All WebSocket clients declare a **device identity** on connect. Trust tiers:

- **Local connects** (loopback or same-host Tailnet) → can be auto-approved
- **Non-local connects** → must sign a challenge nonce, require explicit approval
- After pairing, device tokens are issued for reconnects
- Gateway auth token (`OPENCLAW_GATEWAY_TOKEN`) applies to all connections

Inbound DMs (**Direct Messages**) from new senders get a pairing code:
```bash
openclaw pairing approve <channel> <code>
```
Approved senders go on a local allowlist. Public inbound DMs require explicit opt-in (`dmPolicy="open"`).

---

## Channel Bridges

Each bridge translates platform-specific events into a normalized internal envelope. The Gateway holds exactly one session per platform per host.

| Platform | What it is | Protocol / SDK |
|---|---|---|
| WhatsApp | Chat/messaging via WhatsApp | **Baileys** — a WhatsApp Web protocol client library for Node.js |
| Telegram | Chat/messaging via Telegram | **grammY** — modern TypeScript/Node.js Telegram bot framework |
| Discord | Community chat and voice platform | discord.js / similar — popular Node.js Discord libraries |
| Slack | Team collaboration and chat platform | **@slack/web-api** / Bolt — official Slack SDKs for bots and apps |
| Signal | Encrypted messaging service | signal-cli or community bridges — CLI/bridge tools for Signal bots |
| iMessage | Apple messaging on macOS/iOS | macOS native integrations / community bridges |
| WebChat | Browser-based chat UI | Static UI over Gateway WS API |
| Matrix | Open standard decentralised chat | matrix-bot-sdk / matrix-js-sdk |
| Nostr | Decentralised pub/sub social/chat protocol | Nostr client libraries |
| IRC | Classic chat network protocol | IRC client libraries / adapters |
| Mattermost | Open source team chat platform | Mattermost SDKs / drivers |
| Teams | Microsoft team collaboration and chat | Microsoft Bot Framework / Teams SDK |
| Google Chat | Google Workspace chat service | Google Chat API / SDKs |
| LINE | Asian messaging platform | LINE Messaging API SDKs |
| WeChat | Chinese messaging and social platform | WeChat SDKs / web protocol bridges |
| QQ | Chinese messaging platform | QQ SDKs or community bridges |
| Zalo | Vietnamese chat and social app | Zalo SDKs |
| Zalo Personal | Personal version of Zalo chat | Personal Zalo bridges / community tools |
| Feishu | Chinese enterprise collaboration platform | Feishu (Lark) SDKs |
| Nextcloud Talk | Self-hosted chat/video meetings | Nextcloud Talk APIs / adapters |
| Synology Chat | Synology NAS chat application | Synology Chat APIs |
| Tlon | Specialized or emerging chat protocols | Platform-specific adapters |
| Twitch | Live streaming chat | tmi.js / Twitch chat adapters |
| Other | Miscellaneous chat platforms and bridges | Various official or community SDKs and protocol adapters |

---

## The Message → Action Lifecycle

**Step 1: Intake & Routing**

Channel bridge normalizes the message → Session Manager resolves a session key based on `dmScope`:
- `main` — all DMs share one session (continuity across channels/devices)
- `per-peer` — isolated by sender ID
- `per-channel-peer` — isolated by channel + sender (recommended for multi-user setups)

**Step 2: Command Queue**

Lane-aware FIFO that prevents agent collisions:

```
Global Lane (main)          maxConcurrent: 4 (configurable)
  Session Lane              concurrency: 1 (strict serial)
  Sub-agent Lane            concurrency: 8
  Cron Lane                 parallel with main
```

Queue modes — controls how new messages interact with an active run:
- `collect` (default) — coalesce queued messages into a single followup turn
- `steer` — inject into current run, cancelling pending tool calls at next boundary
- `followup` — wait for current run to finish, then start new turn
- `steer-backlog` — steer now AND preserve the message as a followup

**Step 3: Prompt Assembly**

The system prompt is assembled fresh for every run:

```
Tooling (available tools + JSON schemas)
+ Safety guardrails
+ Skills (name + description + file path only — model reads full SKILL.md on demand)
+ Self-update instructions
+ Workspace info
+ Current date/time (timezone-only, no live clock — keeps prompt cache-stable)
+ Reply tags + Heartbeat contract
+ Runtime metadata (host, OS, model, thinking level)
── Project Context ──
+ AGENTS.md    (operating instructions)
+ SOUL.md      (persona / tone)
+ TOOLS.md     (local tool notes)
+ IDENTITY.md  (agent name/vibe)
+ USER.md      (user profile)
+ HEARTBEAT.md (periodic task checklist)
```

Bootstrap files are truncated at `bootstrapMaxChars` (default 20,000 chars) to keep prompts lean and cache-friendly.

**Step 4: Inference & Streaming**

1. Resolves model + auth profile
2. Serializes runs via per-session + global queues
3. Streams assistant deltas as `event:agent` frames
4. Tool calls execute between inference rounds
5. Enforces timeout (default 600s)

Text deltas stream in real time. Tool start/update/end events emit on a separate `tool` stream. Block streaming chunks at 800–1200 chars, preferring paragraph breaks. `NO_REPLY` is a sentinel token filtered before outgoing payloads (enables silent turns).

---

## Core Tools (Always Available, No Skill Required)

| Tool | What it does |
|---|---|
| `read` / `write` / `edit` | File system operations |
| `exec` / `process` | Shell command execution + background process management |
| `browser` | Browser automation via Chrome DevTools Protocol (CDP) |
| `web_search` / `web_fetch` | Real-time web access |
| `message` | Cross-channel messaging |
| `cron` | Scheduled job creation and management |
| `memory_search` / `memory_get` | Semantic retrieval over persistent memory |
| `sessions_spawn` / `sessions_send` | Sub-agent orchestration |
| `nodes` | Paired device control (camera, screen, location, mic) |
| `canvas` | Render a live interactive canvas |
| `speak` / `listen` | Voice I/O on macOS, iOS, Android |
| `webhook_receive` | Receive inbound HTTP webhooks |

---

## Workspace & Memory

```
~/.openclaw/workspace/
  memory/        ← semantic memory accumulated over time
  sessions/      ← conversation transcripts
  skills/        ← installed skill modules
  scheduler/     ← cron job definitions
  plugins/       ← plugin state
  openclaw.db    ← SQLite (migrated from loose files in security hardening)
```

Memory is persistent and local-first. It builds a model of the user across every channel and conversation. It is also portable — the memory layer is readable by Codex, Cursor, and Manus so context flows between tools.

The SQLite migration replaced loose files with a typed relational schema, removing path traversal categories from the runtime.

---

## Proactive Behavior: Cron Jobs & Heartbeats

OpenClaw can initiate actions on its own schedule without being prompted. Configured via natural language instructions or the `HEARTBEAT.md` file.

Cron jobs run in their own lane with parallelism independent of the main session lane. The `HEARTBEAT.md` defines a contract — the model knows what it should proactively do between user messages (check inbox, monitor CI, track health metrics, watch benchmarks, etc.).

---

## Multi-Agent Routing

One Gateway can host multiple isolated agents, each with its own workspace, memory, and toolset:

```
Gateway
  ├── Agent: personal   (WhatsApp + iMessage)
  ├── Agent: work       (Slack + email)
  └── Agent: project-x  (Discord + GitHub webhooks)
```

Sub-agents can be spawned dynamically during a run using `sessions_spawn` and `sessions_send`. Sub-agent lane concurrency: 8 (independent of main lane's 4).

---

## Skills System

Skills are modular Markdown packages that extend agent capabilities. They live in **ClawHub** (`clawhub.io`), the community marketplace. As of April 2026, ClawHub hosts **44,000+** skills. Skills can be browsed and installed via the `clawhub` CLI:

```bash
# Install a skill from ClawHub
clawhub install <skill-name>

# Search by keyword
clawhub search "calendar email follow-up"

# List installed skills
clawhub list
```

A skill is a `SKILL.md` file (plus optional supporting code) that the agent reads on demand. Skills are not pre-loaded into every prompt — only their name/description/path is listed in the assembled prompt. The model calls `read` on the full `SKILL.md` when it needs the skill.

Skills are stored at `~/.openclaw/skills/` (global) or `.openclaw/skills/` (project-local).

As of the v2026322 security hardening release, the ClawHub mandate is in effect: direct GitHub URL installs are rejected with a security warning. All installs must flow through ClawHub. ClawHub also offers a VirusTotal scanning partnership (announced February 7, 2026) and runs ClawScan static analysis on submissions, with moderation tags: clean / suspicious / held / quarantined / revoked / malicious. Malicious and quarantined packages are blocked from download.

> **Security note:** Despite these controls, ClawHub remains an open submission registry. Always review a skill's source code and VirusTotal report before installing. See the Security section below.

---

## Security Architecture

**Proxyline** — process-global Node networking proxy. All egress flows through a configured proxy enforcing policy: blocks metadata addresses, private ranges, loopback canaries, non-whitelisted IPs. Moves control from per-call URL validation to structural egress policy.

**fs-safe** — root-bounded filesystem primitives across the core runtime and all plugins. Traversal and absolute-path writes outside the plugin workspace are refused at the library level.

**ClawHub trust ratings** — every package version gets trust evidence from ClawScan, VirusTotal, static analysis, metadata checks, source provenance, and manual moderation. Tags: clean / suspicious / held / quarantined / revoked / malicious. Malicious and quarantined are blocked from download.

### Known Vulnerabilities

**CVE-2026-25253 (ClawBleed)** — disclosed January 31, 2026, CVSS 8.8. One-click remote code execution through cross-site WebSocket hijacking. In affected versions before 2026.1.29, OpenClaw accepted a `gatewayUrl` from the query string, opened a WebSocket to it automatically, and transmitted a stored auth token — allowing any malicious website to silently connect to the local agent and chain the hijack into full code execution. Confirmed actively exploited in the wild. Fixed in 2026.1.29.

**CVE-2026-32922** — disclosed March 29, 2026, CVSS 9.9. A single API call could convert a pairing token into full administrative access with remote code execution capability. Described by ARMO as "the most severe vulnerability in OpenClaw's history." Fixed in 2026.3.28+.

**Claw Chain** (disclosed May 2026, Cyera — discovered by security researcher Vladimir Tokarev) — four chained CVEs affecting all versions before April 23, 2026:

- **CVE-2026-44112** (CVSS 9.6) — TOCTOU race condition in the OpenShell sandbox allowing sandbox escape and installation of persistent backdoors
- **CVE-2026-44113** (CVSS 7.7) — symbolic link swap enabling access to restricted system files outside the sandbox mount root
- **CVE-2026-44115** — heredoc shell expansion bypass allowing execution of otherwise-blocked commands via incomplete allowlist
- **CVE-2026-44118** — improperly validated `senderIsOwner` flag allowing any non-owner loopback client to impersonate an owner and gain control over gateway configuration, cron scheduling, and execution environment management

Between 65,000 and 180,000 OpenClaw servers were estimated to be publicly internet-facing at the time of disclosure. Fixed in version **2026.4.22**. The fix for CVE-2026-44118 issues separate owner and non-owner bearer tokens, with `senderIsOwner` now derived exclusively from the authenticating token.

**ClawHavoc campaign** — beginning January 27, 2026, threat actors flooded **ClawHub** (the official skill marketplace) with malicious skills disguised as productivity tools, trading bots, and AI integrations. Professional documentation and fake prerequisites tricked users into running external payloads. At peak, approximately 20% of all ClawHub skills were malicious. Payloads included Atomic macOS Stealer (AMOS), the Vidar infostealer, reverse shells, and API key harvesters. One malicious package accumulated 14,285 downloads before removal. Named by Koi Security on February 1, 2026. Prompted the v2026322 ClawHub-first mandate and verified skill screening (added March 26, 2026).

**Moltbook data exposure** — Moltbook, a third-party social network built for OpenClaw agent-to-agent communication, had its database publicly accessible without authentication, exposing 35,000 email addresses and 1.5 million agent API tokens in plaintext. This was a vulnerability in Moltbook's infrastructure, not OpenClaw's code directly.

### Security Checklist

```bash
# Always run latest (Claw Chain fixed in 2026.4.22; ClawBleed fixed in 2026.1.29)
npm install -g openclaw@latest

# Scan for risky configs
openclaw doctor

# Install skills only via ClawHub CLI
clawhub install <name>

# Check a skill's VirusTotal report on clawhub.io before installing
# Review agent.yaml egress policy before production deploy
# Run in Docker with non-root access and read-only filesystem for sensitive environments
# Never store crypto wallets, SSH keys, or password managers on the same machine
```

---

## Enterprise Adoption

In March 2026, NVIDIA announced **NemoClaw** at GTC 2026 — an enterprise security and privacy layer built on top of OpenClaw, developed with Cisco, CrowdStrike, Google, and Microsoft Security. It adds sandbox orchestration, privacy guardrails, and security hardening at the infrastructure level. Tencent offers **ClawPro**, a managed version with integrations tailored for the Chinese market. DigitalOcean offers a security-hardened 1-Click Deploy for self-hosters.

---

## Local LLM Support

Fully air-gapped deployments are supported via Ollama:

- Qwen 3, Llama 4, Mistral Large 2 — out of the box
- Auto-detects Metal (Apple Silicon) or CUDA and adjusts context window accordingly
- Enables compliance with healthcare and financial services requirements that prohibit external API calls

---

## OpenAI Compatibility

- Tool use schema aligned with OpenAI's latest function calling spec
- Automatic JSON schema transpilation — no manual adjustments for GPT-4.5 or GPT-5
- Parallel tool execution — agent dispatches multiple independent operations simultaneously
- SSE streaming fixed — partial JSON chunks no longer cause parse failures
- Automatic retry with exponential backoff, configurable via `openai.retry_policy`
- Works with Azure OpenAI Service, vLLM, and llama.cpp via standardized `base_url` handling (trailing slashes stripped automatically)

---

## BrowserChrome MCP

- Race conditions in CDP navigation fixed — agents wait for network idle before executing click operations
- Sessions stable beyond 24 hours without memory leaks or context loss
- Agents can now reliably interact with dynamic SPAs and pages with complex navigation

---

## Agent Configuration Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Operating instructions — what the agent should and shouldn't do |
| `SOUL.md` | Persona, tone, communication style |
| `TOOLS.md` | Notes on local tools available to this agent |
| `IDENTITY.md` | Agent name and vibe |
| `USER.md` | User profile — preferences, routines, ongoing context |
| `HEARTBEAT.md` | Periodic task checklist — defines proactive behavior |

All files truncated at `bootstrapMaxChars` (default 20,000 chars) during prompt assembly.

---

## CLI Reference

```bash
openclaw onboard                      # Interactive setup wizard
openclaw onboard --install-daemon     # Setup + install background daemon

openclaw daemon install               # Register as launchd/systemd service
openclaw daemon stop
openclaw daemon restart
openclaw daemon logs

openclaw doctor                       # Scan for risky configs and misconfigurations
openclaw pairing approve <channel> <code>  # Approve a new sender

clawhub install <name>                # Install a skill from ClawHub
clawhub search <query>                # Search skills by keyword or natural language
clawhub list                          # List installed skills
clawhub update --all                  # Update all installed skills
clawhub inspect <slug>                # Inspect a skill without installing
```

---

## Production Deployment Notes

- Default WebSocket port `127.0.0.1:18789` — never expose directly; put a reverse proxy in front
- Webhooks need a tunnel (ngrok, Cloudflare Tunnel) or reverse proxy to reach a local port
- For team deployments: use `per-channel-peer` dmScope to isolate user sessions
- Declare all allowed outbound IPs/domains in `agent.yaml` before go-live
- Prometheus + Grafana integration available via OpenTelemetry traces
- DigitalOcean offers a security-hardened 1-Click Deploy for cloud hosting
- Microsoft's security blog recommends against running OpenClaw on standard personal or corporate machines without additional hardening (February 2026)

---

## OpenClaw vs AutoGPT

| Feature | OpenClaw | AutoGPT Latest |
|---|---|---|
| Plugin security | ClawHub + VirusTotal + ClawScan | Unverified GitHub imports |
| State persistence | SQLite, ACID | File-based JSON, corruption-prone |
| Observability | Built-in dashboard + OpenTelemetry + Prometheus | External logging, manual integration |
| Local LLM | Native via Ollama, hardware acceleration | Via third-party bridges |
| Runtime security | Proxyline egress control + fs-safe | Host-level only |
| Multi-channel | 24+ messaging platforms | Limited |
| Subagents | ✅ Yes (concurrency: 8) | Limited |
| Voice I/O | ✅ macOS, iOS, Android | ❌ No |
| GitHub stars | 369K+ | Significantly fewer |
