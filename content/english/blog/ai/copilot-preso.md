+++
date = '2026-04-11T13:00:00+10:00'
draft = false
title = 'GitHub Copilot Preso'
tags = ['GitHub', 'Copilot', 'AI', 'Prompting', 'DevTools', 'Agents', 'LLM']
summary = "GitHub Copilot and customization instructions together unlocks a structured, repeatable way to guide AI assistance across your codebase—covering custom instructions, reusable prompt files, agent mode and extensible skills for end-to-end AI-driven workflows."
+++

GitHub Copilot and its customization instructions, a powerful framework for struct-ing and reusing prompts to get consistent, high-quality AI assistance across a codebase.

## Overall idea

![Mindmap](https://raw.githubusercontent.com/welldesignedsystem/marco-polo/refs/heads/main/misc/mindmap.svg)

## Introduction

- Today we are going to go thru a practical guide to using GitHub Copilot with structured customization.
- **custom instructions**, **prompt files**, **skills**, **agents** and **hooks** work together to make AI assisted ecosystem.

## How to choose a model

## Reference
- [Github Copilot Customization library](https://docs.github.com/copilot/tutorials/customization-library)
- [Visual Studio Code Customization](https://code.visualstudio.com/docs/copilot/customization/overview)
- [Important Cheat Sheet](https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features)

## Model Selection.

### Factors to consider
- **Speed v/s Quality/Task Complexity v/s Cost:** 
    - 🟢 **Fast/smaller models** — **Claude Haiku 4.5**, **GPT-4.1/5.4 mini**, **Gemini 3 Flash**, **Auto mode**
      - **situations:** Day-to-day coding, quick explanations, routine suggestions 
      - general code completition, renaming Variables, boilerplate, simple autocomplete

    - 🟡 **Balanced** — **Claude Sonnet 4.6**, **GPT-5.4**, **Gemini 3.1 Pro**
      - **situations:** Adding a new feature based on KnowledgeBases, fixing a reasonably hard bug
      - Moderate refactors, writing tests for existing code from A/Cs.

    - 🔴 **Quality** — **GPT-5.4/5.5**, **Claude Opus 4.6/4.7**, **Gemini 3.1 Pro**
      - **situations:** higher accuracy, complex reasoning, debugging or multi-step tasks
      - Larger model incur highes cost
      - very Complex refactoring (e.g. multi-layered auth system)
      - High-stakes logic (e.g. Debugging a complex Charge/Payment Processing module)
      - Multi-step debugging with cross-file reasoning
      - 3am bug fixing.
      - *Don't use cheaper models here — false economy, more retries = more tokens spent*

    - 💡 **Quota Tip:** set your editor's **default/auto model** to a 🟢 smaller model,
      and only switch up manually when the task genuinely demands it.

- **Specialization:** 
  - Some models are better at some specific tasks than others.
  - *Examples:*

    - 📝 **General Purpose & Coding** — **Claude Sonnet 4.6**, **GPT-5.4 mini**
      - Code mixed with technical writing or documentation
      - Architecture planning, code reviews, README generation
  
    - 🤖 **Agentic usecases** — **GPT-5.4-Codex**, **Grok Code Fast 1**
      - **automated PR creation**, Large-scale refactors

    - 🖼️ **Text & Image** — **Claude Sonnet 4.6**, **GPT-5.4/5.5**, **Gemini 3.1 Pro**, **Grok 4**
      - Screenshot → reproduce or debug as code
      - Diagram → generate tickets or architecture docs

    - 📄 **Text & PDF / Docs / Slides** — **Gemini 3.1 Pro**
      — *Gemini 3.1 Pro (superior model for most usecases 2x better for reasoning) is same price as Gemini 3 Pro (2M token context)*
      - invoice documents, Scanned documents, ppt slides, multi-page PDFs,
      - Extract structured data from charts or forms

    - 🎥 **Text & Video** — **Gemini 3.1 Pro**
      - Summarize a recorded standup or demo
      - Analyze a video walkthrough and generate action items

    - 🎨 **Image & Video Generation** — **Grok Imagine**, **GPT-5.4** (with DALL·E)
      - Product teasers, demo clips, UI mockup visuals

    - 🧩 **Mixed Multimodal** (text + image + video + code) — **Gemini 3.1 Pro**
      - Complex tasks spanning multiple input types simultaneously

- **Usecase:**
  - Some environments prohibit or cannot use AI-generated code entirely:
    - Air-gapped or classified environments block access to cloud-based AI APIs when it involves certification standards like **DO-178C / MIL-STD** which demands formal verifiable code.
  
https://docs.github.com/en/copilot/reference/ai-models/model-comparison

### Benchmarks and Comparisons
- [SWE-bench](https://www.swebench.com/): Evaluates models on software engineering tasks. Higher scores indicate better coding capabilities.
- [LiveBench](https://livebench.ai/#/?highunseenbias=true): General AI benchmarks for reasoning, math, coding, etc.
- [Official Comparison](https://docs.github.com/en/copilot/reference/ai-models/model-comparison): Refer to GitHub's AI Models Comparison for detailed metrics on available models.

### AI Benchmark Types

| Benchmark | Type | What it checks | When it matters |
|---|---|---|---|
| [**SWE-bench Verified Leadersboard**](https://www.swebench.com/) (SWE = Software Engineering; benchmark) | Coding | **1.** Can the **model fix real GitHub bugs**?<br/>  **2.** **Patches are applied and actual test suites run** — pass/fail, no subjectivity. | Choosing a model for software engineering agents, autonomous bug fixing, or code generation at scale. |
| [**Terminal-Bench**](https://www.tbench.ai/) (Terminal Environment Benchmark) | Agentic | Can the **model operate in a real terminal** — running shell commands, navigating file systems, executing scripts — to complete tasks end-to-end? | DevOps automation, CLI agents, any task where the model needs to operate a computer rather than just write code. |
| [**τ²-bench Retail / Telecom**](https://github.com/sierra-research/tau2-bench) (Tau-squared Bench) | Agentic | **1.** Can the **model act as a customer service agent** while a **simulated user actively participates**? <br/> **2.** **Tests** -> **policy compliance**, **tool use** and **back-and-forth coordination**. | Customer support bots, helpdesk agents, any product where the AI must guide a real human through a multi-step process. |
| [**MCP-Atlas**](https://labs.scale.com/leaderboard/mcp_atlas) (MCP = Model Context Protocol; Atlas is the benchmark name) | Agentic | **1.** Can the model correctly use external tools and APIs via the Model Context Protocol? <br/> **2.** Tests whether it picks the right tool, uses it correctly and handles the response. | Evaluating models for integration with real-world services — calendars, databases, search, etc. |
| [**OSWorld-Verified**](https://os-world.github.io/) (Operating System World; verified split) | Agentic | Can the **model control a real desktop GUI** — clicking, typing, navigating apps — to complete tasks a human would do on a computer? | Computer-use agents, RPA, browser and desktop automation. |
| [**ARC-AGI-2**](https://arcprize.org/arc-agi-2) (Abstraction and Reasoning Corpus for Artificial General Intelligence, version 2) | Reasoning | **1.** Can the model solve novel visual pattern puzzles it has never seen before? <br/> **2.** Designed to resist memorisation — tests raw general reasoning, not learned answers. | Measuring true generalisation ability. Hard to fake with training data. |
| [**GPQA Diamond**](https://github.com/idavidrein/gpqa) (Graduate-Level Google-Proof Q&A; Diamond is the hardest subset) | Knowledge | Can model solve **Expert-level science questions** (physics, chemistry, biology) written by PhD researchers — hard enough that most domain experts get them wrong. | Scientific research assistants, medical/legal tools, any use case requiring deep expert knowledge. |
| [**MMMLU**](https://huggingface.co/datasets/openai/MMMLU) (Multilingual Massive Multitask Language Understanding) | Knowledge | **Tests general world knowledge and multilingual ability** across **57 subjects**. | General-purpose assistants, multilingual products, baseline knowledge capability comparisons. |
| [**GDPval-AA**](https://artificialanalysis.ai/evaluations) (GDP = Gross Domestic Product; val = validation/evaluation; AA = Artificial Analysis) | Agentic | **1.** Evaluating AI Model Performance on Real-World Economically Valuable Task s<br/> **2.**  It tests AI models on real-world tasks across 44 occupations and 9 major industries. <br/> **3.** Models are given shell access and web browsing capabilities in an agentic loop via [Stirrup](https://artificialanalysis.ai/articles/stirrup-open-source-framework-agents) to solve tasks, with [Elo ratings derived](https://www.chess.com/terms/elo-rating-chess) from blind pairwise comparisons. | Comparing models holistically for autonomous agent deployments. |
| [**MMMU-Pro**](https://mmmu-benchmark.github.io/) (Massive Multi-discipline Multimodal Understanding, the Pro version) | Vision | **College-level questions** requiring both image **understanding and reasoning** — charts, diagrams, scientific figures. | Document analysis, research assistants, any product where the model reads images alongside text. |
| [**HLE**](https://lastexam.ai/) (Humanity's Last Exam) | Reasoning | **Extremely hard questions** across **all domains**, **near-impossible** even **for top human experts**. Tests the ceiling of model intelligence. | Frontier model comparisons, research tasks requiring the absolute highest level of reasoning. |

## Different Levels of Customization

Custom instructions are structured guidance that tells GitHub Copilot how to behave for a team, an individual, or a repository. Context Engineering.

### Organization instructions

- Apply to **all organization members** 
- maintained by admin in Copilot Chat on GitHub.com.
- discovery in VS Code -> `github.copilot.chat.organizationInstructions.enabled` to `true`.
- You might enforce VS Code settings via policy (Mobile Device Management(MDM) like Microsoft intune, Jamf, group policy, etc.)
- [Refer GitHub documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-organization-instructions).
- Usecases:
  - Never log sensitive user data
  - Follow OWASP Guidelines
  - comments should have personal information e.g. PII leak - vibe fix produces comment // fix for customer Joe whose birthday is on D0B is 29 Feb 1980 (leapyear).
 
---

### Personal instructions

- Applies to only you and helps quick personal preferences
- "All conversation with me must be in Spanish but use only English for any Code related stuffs like comments." a file got created - ~/.config/Code/User/prompts/communication.instructions.md
- To make it reflect in copilot - Set on GitHub.com under your profile picture → "Personal instructions".
- [Refer](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-personal-instructions)
- Usecases:
  - Always respond in particular language, tone or level of detail.
  - I am new to team give definition in brackets when you use a jargon.

---

### Repository-wide instructions (`.github/copilot-instructions.md`)

| File                                               | Scope                                                                              |
|----------------------------------------------------|------------------------------------------------------------------------------------|
| Repository-wide  `.github/copilot-instructions.md`  and/or `~/.copilot/copilot-instructions.md`| All files in the repo                                               |
| `AGENTS.md`         | In workspace root or subfolders, All agents in the workspace (multi-agent support). BIG PICTURE GUIDE about AGENTS involved |
| `CLAUDE.md`, `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md`, or `CLAUDE.local.md` | Claude Code compatibility                                                          |

- **Always-on instructions** — automatically included in every chat request. 
- Applies to all files in the repository.

Use `copilot-instructions.md` for:

**When to use:**
- Setting broad project standards 
  - security requirements
  - Technology stack and libraries - to avoid or use
  - naming conventions that apply across project
  - coding style
  - architecture patterns to avoid or use
  - error handling
  - Documentation standards
- Ensuring consistent behavior across all interactions

**When NOT to use:**
- For one-off tasks (use prompt files instead/skills/agents)
- This get carried in all conversations kept in context, keep it minimal
- When instructions should only apply conditionally (use path-specific or prompt files)

**Examples:**
- Injection Attacks: Always parameterize SQL queries — never concatenate user input into query strings
- XSS (Cross-Site Scripting): Never use `innerHTML`, `outerHTML`, or `document.write()` with user-supplied data
-  PII & Sensitive Data - Never log PII — no emails, names, phone numbers, IP addresses
- "Follow coding standards"
  - PEP 8 style guide for Python code
  - Google Java Style guide: google.github.io/styleguide/javaguide.html

---

### Path-specific instructions (`.instructions.md` files)

| Type | File | Scope |
|---|---|---|
| Path-specific | `*.instructions.md` in `.github/instructions/` or custom locations | Files matching `applyTo` glob pattern |
| User-level | `~/.copilot/instructions/` or the instructions folder of your VS Code profile | Applies across all workspaces for that user |

- **File-based instructions** — conditionally applied based on **glob patterns** *(simpler regex alternative - string with wildcard characters like * and ? used to match file paths or strings)*. 

- Each file has an optional YAML frontmatter block with supported fields:

| Field | Required | Description |
|---|---|---|
| `name` | No | Display name shown in the UI. Defaults to the file name. |
| `description` | No | Short description shown on hover in the Chat view. |
| `applyTo` | No | Glob pattern for automatic application (e.g. `**/*.py`). If omitted, the file is not applied automatically but can be manually attached. |

**Example:**
```markdown
---
name: 'Python Standards'
description: 'Coding conventions for Python files'
applyTo: '**/*.py'
---
# Python coding standards
- Follow the PEP 8 style guide.
- Use type hints for all function signatures.
- Write docstrings for public functions.
```
 
- Instructions only activate when Copilot is working with files that match the `applyTo` pattern. Running `/init` or working on other files does **not** load path-specific instruction files into context.
- **Context efficiency:** path-specific instructions load their **full contents** into context when matched and once the conversation continues copilot will not inject the instructions if it doesnt apply anymore. 
- Keep them minimal (max ~1,000 lines, ideally 200–300) to avoid overloading context. Focus only on non-obvious, project-specific conventions; *skip rules already enforced* by **linters** or **formatters**.
- Multiple patterns are separated by commas.
- If both a path-specific file and `copilot-instructions.md` apply to the same file, instructions from both are used.
- **Avoid conflicting instructions** between them — Copilot's behavior when instructions conflict is **non-deterministic.**
- **Referencing other files:** You can use standard Markdown links to reference other instruction files or URLs from within an instructions file (e.g. `Apply the [general coding guidelines](./general-coding.instructions.md) to all code.`).
- **Referencing tools:** To reference agent tools in your instructions, use the `#tool:<tool-name>` syntax (e.g. `#tool:web/fetch`).

---

### Prompt Files

Prompt files are reusable, on-demand task prompts stored in your repository. Unlike custom instructions, they only run when you explicitly invoke them.

- **File location:** `.github/prompts/`
- **File extension:** `.prompt.md`
- **Supported in:** VS Code, Visual Studio, JetBrains IDEs only.

**Frontmatter fields:**

| Field | Description |
|---|---|
| `agent` | `'ask'` (default chat), `'agent'` (agent mode), `'plan'` (planning mode), or the name of a custom agent |
| `description` | A human-readable label shown in the IDE |
| `tools` | Array of tools available to the prompt when running in agent mode |

**Dynamic input variables** commonly use this syntax: `${input:variableName:placeholder text}`. Most models understand this convention and ask for the missing values; for stricter interactive input, use the `vscode/askQuestion` tool.

**How to invoke in VS Code:**
- Open Copilot Chat, type `/filename` (the filename without `.prompt.md`).
- Or use the "Attach context" icon → "Prompt..." and select the file.
- Or type `/instructions` in the chat input to open the Configure Instructions and Rules menu.
- You can optionally attach additional files for context alongside the prompt.

**Generate a prompt file with AI:** Type `/create-prompt` in chat and describe the workflow you want to automate. The agent generates a `.prompt.md` file for you.

**Referencing instructions from prompt files:** Prompt files can reference instructions files using Markdown links, keeping prompts clean and avoiding duplication.

---

### Agent Skills
- Standardized approach, find the spec in [agentskills.io](https://agentskills.io/specification) 
- Agent Skills are reusable **capability files** that **teach compatible tools how to perform a specific task**.
- If Agent Skill is like a tool then Agent is like a tool box.
- Unlike prompt files, **skills can be automatically invoked based on intent** — **you don't need to explicitly call them every time**.
- **File location:** 
  - **Project Specific**
    - .github/skills/<<skill-name>>/SKILL.md
    - .claude/skills/<<skill-name>>/SKILL.md
    - .agents/skills/<<skill-name>>/SKILL.md
  - **Personal (Global)**
    - ~/.copilot/skills/<<skill-name>>/SKILL.md
    - ~/.claude/skills/<<skill-name>>/SKILL.md
    - ~/.agents/skills/<<skill-name>>/SKILL.md
- **File extension:** `.md` (always named `SKILL.md`)
- **Supported in:** GitHub Copilot cloud agent, Copilot CLI, VS Code agent mode, Claude Code and other compatible agent implementations.
- **Frontmatter fields:**

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Max 64 chars. Lowercase letters, numbers and hyphens only. Must not start/end with a hyphen or contain consecutive hyphens. Must match the parent directory name. |
| `description` | Yes | Max 1024 chars. Describes what the skill does and when to use it. Used for intent matching. |
| `license` | No | License name or reference to a bundled license file. |
| `compatibility` | No | Max 500 chars. Indicates environment requirements (intended product, system packages, network access, etc.). |
| `metadata` | No | Arbitrary key-value mapping for additional metadata. |
| `allowed-tools` | No | Space-separated string of pre-approved tools the skill may use. (Experimental) |
| `user-invocable` | No | Controls whether the skill appears in the slash command menu. |
| `disable-model-invocation` | No | Prevents automatic skill invocation based on intent matching when set to `true`. |

- Skills do **not** support prompt-file fields such as `agent`, `mode` or `model`. Skills also do not support dynamic input variables (`${input:...}`).
- **Progressive Loading/Progressive Disclosure:** Only the `name` and `description` frontmatter fields are loaded at startup (~100 tokens). The full skill body is loaded when the skill is activated and any referenced files (scripts, references, assets) are loaded only when required.

**How to invoke:**
- A compatible agent automatically invokes a skill when your intent matches the skill's `description`.
- Manual invocation via slash commands (`/skill-name`) is not part of the Agent Skills specification — support depends on the client implementation.

**When to use:**
- Encoding reusable, shareable expertise (e.g. "how we write migrations (mainframe cobol)", "our PR review checklist")
- Capabilities that should be available across sessions without manual invocation
- Sharing consistent workflows across team members or tools

**When NOT to use:**
- For one-off tasks (use prompt files instead)
- When you need dynamic user input or variables (use prompt files) - otherwise it depends on the client implementation.
- When you need to control mode, tools, or model settings (use prompt files)

**Example:**
```markdown
---
name: write-migration
description: Generates a database migration file following project conventions. Use when the user asks to create a migration or database schema change.
license: MIT
metadata:
  author: my-org
  version: "1.0"

---

# Write Migration

When asked to create a migration:
1. Use sequential numbering in the filename: `YYYYMMDD_description.sql`
2. Always include a rollback section.
3. Follow the schema conventions in `docs/schema.md`.
```

---

### AGENTS.md
- AGENTS.md is a simple, open format for guiding coding agents — think of it as a **README for agents**: a dedicated, predictable place to provide context and instructions to help AI coding agents work on your project.
- its not the actual agent itself its just the blue print for the agent. github's custom agent is the actual agent.
- Unlike `README.md` (which targets human contributors), AGENTS.md contains the extra detail agents need: build steps, test commands and conventions that might clutter a README.
- **File name:** `AGENTS.md` (placed at the repository root, or nested inside subpackages)
- - **No required fields.** AGENTS.md is plain Markdown. There is no frontmatter schema, no mandatory sections. You write whatever helps an agent work effectively on your project. Use any headings you like.
- **Status:** Open standard, [AGENTS.md](https://agents.md/) Agentic AI Foundation, under the Linux Foundation. [AGENTS.md github](https://github.com/agentsmd/agents.md). [Examples](https://agents.md/#examples)
- **Supported in:** OpenAI Codex, Amp, Cursor, Devin, Jules (Google), Factory, Aider, goose, opencode, Zed, Warp, VS Code, JetBrains Junie, Windsurf, RooCode, Gemini CLI, GitHub Copilot coding agent, Kilo Code, Semgrep, Augment Code, UiPath and others.
- Agent
- **Recommended sections to include:**
  - Project overview
  - Build and test commands
  - Code style guidelines
  - Testing instructions
  - Security considerations
  - Commit/PR conventions

- **Conflict resolution:**
  - The closest `AGENTS.md` to the file being edited takes precedence.
  - Explicit user chat prompts override everything.

- **Monorepo support:** Place a separate `AGENTS.md` inside each package. Agents automatically read the nearest file in the directory tree, so each subproject can have tailored instructions.

- **Example:**
```markdown
# AGENTS.md

## Setup commands

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Code style

- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible

## PR instructions

- Title format: `[<project_name>] <Title>`
- Always run `pnpm lint` and `pnpm test` before committing.
```

- **When to use:**
  - Providing project-specific context that any coding agent needs to work on your repo
  - Encoding build, test and style conventions once so every agent picks them up automatically
  - Monorepos where individual packages need different instructions

- **When NOT to use:**
  - When you need structured, schema-validated metadata (AGENTS.md has no schema)
  - When you need capability files that teach an agent *how* to perform a reusable task across projects (use Agent Skills / SKILL.md instead)

---

### Custom Agents
- Main differentiator is when you dont have a well defined structured series of step. 
- Custom agents are specialized versions of the Copilot coding agent, *configured with* a **defined persona**, **scope**, **memory** and **tool access**. 
- ability to **iterate**, **decide**, **select and use tools**, **use memory**, **Reason** 
- They maintain their **full configuration throughout an entire autonomous session** — reading files, searching the codebase, editing files and opening pull requests.
  - Custom agents are **selected for a specific task and maintain their configuration for the entire autonomous workflow**
- **File location:**
  - Repository agents: `.github/agents/` (must be committed to the default branch to appear in the UI at `github.com/copilot/agents`)
  - VS Code local/user agents: configured via `chat.agentFilesLocations` setting
- **File extension:** `.agent.md`

**Frontmatter fields:**

```yaml
---
name: agent-name
description: What this agent does (shown in the UI)
tools: ['read', 'search', 'edit']
model: ['Claude Opus 4.5', 'GPT-5.2']   # Optional: tries models in order
handoffs:                                  # Optional: transition to another agent
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
---
```

| Field | Description |
|---|---|
| `name` | Display name in the UI |
| `description` | Short description of the agent's role |
| `tools` | Array of tools the agent may use. See the [Default Available Tools for VS Code Custom Agents](#default-available-tools-for-vs-code-custom-agents) section for a complete list. |
| `model` | Optional. Specify preferred model(s) in priority order. |
| `handoffs` | Optional. Define transitions to other agents. `send: true` auto-submits the handoff prompt; `send: false` pre-fills it for the user to review. |

The body of the file is the agent's system prompt. It defines the agent's role, capabilities and explicit limitations. A well-designed agent profile **always includes a clear "do NOT" section to prevent scope creep.**

**How to use a custom agent (GitHub cloud agent):**
1. Commit the `.agent.md` file to the default branch
2. Go to `https://github.com/copilot/agents`
3. Select your repository, branch and agent from the dropdowns
4. Type a task and press Enter — the agent runs autonomously and creates a PR
5. Track progress in real time via the session view

**How to use a custom agent (GitHub cloud agent) or VS Code:**
- **GitHub cloud agent:** Commit the `.agent.md` file to the default branch, go to `https://github.com/copilot/agents`, select your repository, branch and agent from the dropdowns, then type a task and press Enter.
- **VS Code:** Select the agent from the agents dropdown in the Chat view, then type a task and start the session.

**Generate an agent with AI:** Type `/create-agent` in chat and describe the agent's role to generate a `.agent.md` file.

**When to use:**
- Complex multi-step tasks requiring sustained context
- When you need the AI to maintain a specific role throughout a workflow
- Code review, refactoring, or development tasks that span multiple files
- When you want to limit tool access for security or focus

**When NOT to use:**
- For simple one-off tasks (use prompt files)
- When you need broad behavioral guidance (use custom instructions)
- For capabilities that should be shared across tools (use skills)
- When the task doesn't require autonomy (use prompt files or skills)

**Where it works:** VS Code (local agents), GitHub.com (cloud agents via github.com/copilot/agents). Cloud agents work with the coding agent.

**Examples:**
- "Code review agent" for automated PR reviews
- "Bug fixer agent" for debugging workflows
- "Documentation specialist" for generating docs

---

### Agent Plugins
- instructions [here](https://code.visualstudio.com/docs/copilot/customization/agent-plugins#_configure-plugin-marketplaces)
- Agent plugins are prepackaged bundles of chat customizations that you can discover and install from [plugin marketplaces in Visual Studio Code](https://github.com/github/copilot-plugins). A single plugin can provide any combination of slash commands, agent skills, custom agents, hooks and MCP servers.
- Plugin is like an external ability Skill is more like an internal ability.
- Plugins work alongside your locally defined customizations. When you install a plugin, its commands, skills, agents, hooks and MCP servers appear in chat.
- **Note:** Agent plugins are currently in preview. Enable or disable support for agent plugins with the `chat.plugins.enabled` setting.
- **What plugins provide**
  - An agent plugin can bundle one or more of the following customization types:
    - **Slash commands**: additional commands you can invoke with `/` in chat
    - **Skills**: agent skills with instructions, scripts and resources that load on-demand
    - **Agents**: custom agents with specialized personas and tool configurations
    - **Hooks**: hooks that execute shell commands at agent lifecycle points
    - **MCP servers**: MCP servers for external tool integrations
  - For example, a testing plugin might include a `test-runner` skill with scripts, a `test-reviewer` agent with read-only tools and an MCP server for a test reporting dashboard.
- **Plugin directory structure**

    ```
    my-testing-plugin/
    ├── plugin.json              # Plugin metadata and configuration
    ├── skills/
    │   └── test-runner/
    │       ├── SKILL.md         # Testing skill instructions
    │       └── run-tests.sh     # Supporting script
    ├── agents/
    │   └── test-reviewer.agent.md # Code review agent
    ├── hooks/
    │   └── hooks.json           # Hook configuration
    ├── scripts/
    │   └── validate-tests.sh    # Hook script
    └── .mcp.json                # MCP server definitions
    ```

- [Creating plugin for Microsoft 365 Agent Plugin Toolkit](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension)
#### Discovering and installing plugins

1. Open the Extensions view (Ctrl+Shift+X) and enter `@agentPlugins` in the search field.
2. Browse the list of available plugins from your configured marketplaces.
3. Select Install to install a plugin in your user profile.

The first time you install a plugin from a new marketplace, VS Code shows a trust prompt. Review the marketplace source before confirming.

Alternatively, you can install a plugin directly from a Git repository URL by running **Chat: Install Plugin From Source** from the Command Palette.

#### Configuring plugin marketplaces

By default, VS Code discovers plugins from the [copilot-plugins](https://github.com/github/copilot-plugins) and [awesome-copilot](https://github.com/github/awesome-copilot) GitHub repositories. You can add additional marketplaces with the `chat.plugins.marketplaces` setting.

Marketplaces are Git repositories that contain plugin definitions. You can reference them in several formats:

- Shorthand: `owner/repo` for public GitHub repositories (e.g., `anthropics/claude-code`)
- HTTPS git remote: a full URL ending in `.git`
- SCP-style git remote: SSH-style references
- file URI: a `file:///` path to a marketplace repository already cloned on disk

**When to use:**
- Standardized workflows you want to trigger manually
- Tasks requiring user input or variables
- One-off automation (code generation, refactoring, analysis)
- When you want to share reusable task templates with your team

**When NOT to use:**
- For persistent behavior (use custom instructions)
- When the task should run automatically (use skills or hooks)
- For complex autonomous workflows (use custom agents)
- When you need to package capabilities for sharing across tools (use skills or plugins)

**Where it works:** VS Code, Visual Studio, JetBrains only. Not supported in GitHub.com chat or the coding agent.

**Examples:**
- "Generate unit tests for this function"
- "Refactor this code to use async/await"
- "Create a README for this project"

---

### MCP Servers in GitHub Copilot
- Model Context Protocol is an open standard protocol that provides a universal approach for applications to provide context to language models. 
- Configuring MCP Servers (`mcp.json`)
  - MCP servers are configured in `.vscode/mcp.json`. This file tells VS Code which servers to start and how to connect to them.

**Syntax:**

```json
{
  "servers": {
    "server-name": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@scope/mcp-server-name"],
      "env": {
        "API_KEY": "${input:apiKey}"
      }
    },
    "airbnb": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@openbnb/mcp-server-airbnb", "--ignore-robots-txt"]
    }
  }
}
```
- Once configured, reference it in an agent's tools array using `airbnb/*` or a specific tool name like `airbnb/search_listings`.

**Key fields:**

| Field | Description |
|---|---|
| `type` | Transport type: `http` (http streaming), `stdio` (local process) or `sse` (remote HTTP) |
| `command` | The executable to run |
| `args` | Arguments passed to the command |
| `env` | Environment variables — use `${input:varName}` for secrets prompted at runtime, or reference VS Code secrets |
 
---

### GitHub CLI + Copilot

The GitHub CLI (`gh`) brings Copilot directly into your terminal — useful when you're already working in the command line and don't want to context-switch to an IDE.
Install from here : **https://cli.github.com**

- `gh copilot suggest`
  - Translates a natural language description into a shell command.
  - ```bash
    gh copilot suggest "delete all merged git branches locally"
    ```
  - Copilot returns a command, explains it and asks whether to run it, copy it, or revise it. It will not execute anything without your confirmation.
  - Use this when:
    - You know *what* you want to do but not the exact command
    - You're working with unfamiliar CLI tools (`kubectl`, `ffmpeg`, `awk`)
    - You want a safe way to construct destructive commands before running them

 - `gh copilot explain`
    - Explains what a shell command does in plain English.
    - ```bash
      gh copilot explain "git rebase -i HEAD~3"
      ```
    - Use this when:
      - You've inherited a script and need to understand it before running it
      - You find a command in documentation and want a plain-English breakdown
      - You're onboarding someone to your runbooks

 - `gh alias`
    - ```bash
      gh alias set cs 'copilot suggest'
      gh alias set ce 'copilot explain'
      gh cs "compress all jpg files in this folder"
      gh ce "rsync -avz --delete src/ user@host:/var/www/"
      ```
> **Note:** `gh copilot` works on shell commands only — it has no awareness of your codebase, open files, or MCP servers. For anything requiring code context, use the IDE.

---

### Hooks

Hooks provide deterministic, code-driven automation. Unlike instructions or custom prompts that guide agent behavior, hooks execute your code at specific lifecycle points with guaranteed outcomes.

Hooks enable you to execute custom shell commands at strategic points in an agent's workflow, such as when an agent session starts or ends, or before and after a prompt is entered or a tool is called. Hooks receive detailed information about agent actions via JSON input, enabling context-aware automation.

The key distinction from instructions: writing _"please don't run dangerous commands"_ in a `.instructions.md` file is guidance. Returning `deny` from a `preToolUse` hook is enforcement — it fires every time, regardless of how the agent was prompted.

Generate a hook file with `/create-hook` in chat.

#### File Location

Copilot agents support hooks stored in JSON files in your repository at `.github/hooks/*.json`. The hooks configuration file must be present on your repository's default branch to be used by Copilot cloud agent. For GitHub Copilot CLI, hooks are loaded from your current working directory.

You can have multiple hook files — all `*.json` files in `.github/hooks/` are loaded. This lets you split hooks by concern (e.g. `security.json`, `formatting.json`, `audit.json`).

#### Hook Triggers

| Hook | When it fires | Primary use |
|---|---|---|
| `sessionStart` / `SessionStart` | When a new agent session begins or an existing one resumes | Initialize environments, validate project state, log session starts for auditing |
| `sessionEnd` / `Stop` | When the agent session completes or is terminated | Clean up temp resources, archive session logs, send notifications |
| `userPromptSubmitted` / `UserPromptSubmit` | When the user submits a prompt to the agent | Log requests for auditing and usage analysis |
| `preToolUse` / `PreToolUse` | **Before** the agent uses any tool (`bash`, `edit`, `view`, etc.) | Block dangerous commands, enforce security policies, require approval for sensitive operations |
| `postToolUse` / `PostToolUse` | **After** the agent uses a tool | Run formatters/linters after edits, validate outputs, trigger external integrations |
| `PreCompact` | Before VS Code compacts the chat context | Inject or preserve important context |
| `SubagentStart` / `SubagentStop` | When a VS Code subagent starts or stops | Log or coordinate multi-agent work |

> `preToolUse` / `PreToolUse` is the most powerful hook — it is the one that can **allow, deny, or ask** before a tool execution happens.

#### Configuration Format

Each hook file follows this structure:

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./scripts/my-hook.sh",
        "powershell": "./scripts/my-hook.ps1",
        "cwd": "scripts",
        "timeoutSec": 30
      }
    ],
    "postToolUse": [
      {
        "type": "command",
        "bash": "./scripts/post-edit.sh"
      }
    ]
  }
}
```

**Key fields:**

| Field | Description |
|---|---|
| `type` | Always `"command"` |
| `bash` | Shell script path for macOS/Linux |
| `powershell` | Script path for Windows |
| `cwd` | Working directory for the script (relative to repo root) |
| `timeoutSec` | Max seconds before the hook is killed (prevents hung sessions) |

#### Input: What Hooks Receive

Every hook script receives a JSON object on `stdin`. The shape varies by hook type, but `preToolUse` — the most commonly used — provides:

```json
{
  "timestamp": 1704614400000,
  "cwd": "/path/to/project",
  "toolName": "bash",
  "toolArgs": "{\"command\": \"rm -rf ./dist\"}"
}
```

Read it in your script with:

```bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')
```

#### Output: How Hooks Control the Agent

Hooks communicate back to the agent via `stdout` as JSON. All hooks support these top-level fields:

| Field | Type | Effect |
|---|---|---|
| `continue` | `boolean` | `false` stops the entire agent session |
| `stopReason` | `string` | Message shown to the user explaining why the session stopped |
| `systemMessage` | `string` | Injected into the model's context (e.g. to provide extra info) |

`preToolUse` additionally supports:

| Field | Type | Effect |
|---|---|---|
| `permissionDecision` | `"allow"` \| `"deny"` \| `"ask"` | Explicitly allow, block, or ask before the tool call |
| `permissionDecisionReason` | `string` | Shown to the model when the decision is `"deny"` |

> **Cloud-agent note:** GitHub's cloud-agent hook reference currently emphasizes `deny` as the supported enforcement decision for `preToolUse`; VS Code and Copilot CLI document `allow`, `deny` and `ask`.

**Exit codes** are the simplest control mechanism:
- Exit `0` — hook passed, agent continues normally
- Exit `2` — blocks the operation; `stderr` is shown to the model as context. No JSON output needed.
- Any non-zero exit — treated as an error

#### Example: Block Dangerous Shell Commands

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')

if [ "$TOOL_NAME" = "bash" ]; then
  # Block rm -rf on root or important dirs
  if echo "$TOOL_ARGS" | grep -qE 'rm -rf /(etc|usr|home|root)'; then
    echo '{"permissionDecision":"deny","permissionDecisionReason":"Refusing to delete system directories."}'
    exit 0
  fi
fi
```

#### Example: Auto-format After Every File Edit

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

if [ "$TOOL_NAME" = "edit" ] || [ "$TOOL_NAME" = "create" ]; then
  npx prettier --write .
fi
```

#### Example: Audit Log Every Tool Call

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
USER=${USER:-unknown}

echo "$TIMESTAMP,$USER,$TOOL_NAME" >> /var/log/copilot/usage.csv
```

#### Example: Run Linter Before Edits

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

if [ "$TOOL_NAME" = "edit" ] || [ "$TOOL_NAME" = "create" ]; then
  npm run lint-staged
  if [ $? -ne 0 ]; then
    echo '{"permissionDecision":"deny","permissionDecisionReason":"Code does not pass linting."}'
  fi
fi
```

#### Testing Hooks Locally

Before committing, validate your hook by piping test input directly:

```bash
# Pipe a test preToolUse payload into your script
echo '{"timestamp":1704614400000,"cwd":"/tmp","toolName":"bash","toolArgs":"{\"command\":\"ls\"}"}' | ./scripts/my-hook.sh

# Check the exit code
echo $?

# Validate the output is valid JSON
./scripts/my-hook.sh | jq .
```

Enable debug output in the script itself during development:

```bash
#!/bin/bash
set -x  # print every command as it runs
INPUT=$(cat)
echo "DEBUG: $INPUT" >&2
```

#### When to use

- **Security enforcement** — block commands like `rm -rf`, `DROP TABLE`, or writes to production config files before they execute
- **Compliance and auditing** — log every tool call, command, or file edit for traceability
- **Code quality gates** — run formatters or linters automatically after every file modification
- **Context injection** — add project-specific environment variables or state to the agent's context at session start
- **Approval workflows** — automatically approve safe operations and require human confirmation for sensitive ones

#### When NOT to use

- For guidance and conventions — use custom instructions or `copilot-instructions.md` instead
- For reusable task workflows — use prompt files or agent skills instead
- For simple one-off tasks where a prompt is sufficient

#### Security Considerations

Hooks execute shell commands with the same permissions as VS Code. Review hook configurations carefully, especially when using hooks from untrusted sources.

- **Review all hook scripts** before enabling them, especially in shared repositories
- **Use least privilege** — hooks should only access what they need
- **Validate and sanitize input** — hook scripts receive JSON from the agent; treat it as untrusted input
- **Never hardcode secrets** in hook scripts — use environment variables or secret storage
- Hooks committed to the repo go through code review like any other code. Rollbacks are a single `git revert`.

**Reference:** [About hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks) · [Hooks configuration reference](https://docs.github.com/en/copilot/reference/hooks-configuration) · [Agent hooks in VS Code](https://code.visualstudio.com/docs/copilot/customization/hooks)

---

### Copilot Spaces *(formerly Knowledge Bases)*

> **Note:** GitHub Copilot Knowledge Bases were retired on November 1, 2025 and fully replaced by Copilot Spaces. If you have existing knowledge bases, they can be migrated using the "Convert to Space" button under each knowledge base in your organization settings.

Copilot Spaces let you organize the context that Copilot uses to answer your questions. Spaces can include repositories, code, pull requests, issues, free-text content like transcripts or notes, images and file uploads. You can ask Copilot questions grounded in that context, or share the space with your team to support collaboration and knowledge sharing.

Unlike instruction files which shape *how* Copilot behaves, Spaces control *what Copilot knows* for a specific task or topic.

Anyone with a Copilot license, including Copilot Free, can create and use Spaces.

#### Creating a Space

To create a space, go to `https://github.com/copilot/spaces` and click **Create space**. Give your space a name, then choose whether the space is owned by you or by an organization you belong to.

Each space has two configuration fields:

- **Instructions** — Free text telling Copilot what to focus on within this space: its areas of expertise, what kinds of tasks it should help with and what it should avoid.
- **Sources** — The context Copilot searches when answering questions.

#### What You Can Add as Sources

You can add files, folders and entire GitHub repositories. You can also paste URLs of GitHub content including pull requests and issues, upload files directly from your local machine (images, text files, rich documents, spreadsheets), or type or paste free-text content such as transcripts or notes.

#### Two Source Attachment Strategies

How you attach a source significantly affects response quality:

| Strategy | How it works | Best for |
|---|---|---|
| **Attach a repository** | Copilot doesn't load the entire project into memory — it searches the repository and retrieves only the most relevant content for your question. | Large-scale use cases, answering questions across all documentation |
| **Attach individual files** | The file's full contents are loaded into Copilot's context window and considered for every query in that space. | When you want Copilot to consistently prioritize a specific document |

> **Tip:** You can add files to a space directly from the code view on GitHub without breaking your flow — at the top of any file, click the dropdown and select the space you want to add it to.

#### Using Spaces in Your IDE

You can leverage Copilot Spaces in your IDE using the GitHub MCP server to access context from your spaces. This allows you to leverage your curated context while coding without switching between your IDE and the web interface.

Spaces can only be used in **agent mode** in your IDE, since spaces are accessed via the GitHub MCP server. Open Copilot Chat, select **Agent** from the agent dropdown, then confirm that the `get_copilot_space` and `list_copilot_spaces` tools are listed and enabled under the GitHub MCP server entry.

Then reference your space naturally in a prompt:

```
Using the Copilot space 'Checkout Flow Redesign' owned by myorganization, summarize the implementation plan.
```

> **Note:** When using Spaces in your IDE, repository context and uploaded files are not supported. You will have access to text content, GitHub files, issues, pull requests and space instructions.

#### Use Cases

Create a space when you start working on a specific feature. Add the relevant code, a product specification and any supporting materials such as notes from a design review or mockup images.

Other strong use cases:

- **Standardize repetitive tasks** — Document the logic for tasks like tracking telemetry events once, then share it through a space to keep everyone consistent.
- **Scale institutional knowledge** — Create a space for topics where people tend to ask similar questions, such as how authentication or search works in your project.
- **Onboarding** — Give new team members instant access to curated project knowledge without requiring them to dig through repos.
- **Sharing best practices** — Generate code that follows security patterns, API standards and team preferences, or share SQL/KQL queries and telemetry schemas.

#### When to use

- Grounding Copilot in context that lives **outside** your current working files
- Knowledge that needs to be **shared across team members** without relying on repo files
- **Task-specific context** you want to assemble once and reuse (e.g. a feature redesign space with the spec, relevant code and meeting notes)
- Answering recurring questions about a subsystem (auth, payments, search)

#### When NOT to use

- When the context is already in your open workspace — use `#codebase` or `#file` instead
- For behavioral rules and coding conventions — use `copilot-instructions.md` or `.instructions.md` instead
- For reusable task workflows — use prompt files or agent skills instead

## File Location Reference

```
your-repo/
└── .github/
    ├── copilot-instructions.md                ← Repository-wide instructions (all surfaces)
    │
    ├── instructions/                           ← Default path-specific instructions folder
    │   ├── python.instructions.md             ← Requires applyTo: "**/*.py" in frontmatter
    │   ├── typescript.instructions.md         ← applyTo: "**/*.{ts,tsx}"
    │   ├── frontend/
    │   │   └── react.instructions.md          ← Organized in subdirectories
    │   └── testing/
    │       └── unit-tests.instructions.md
    │                                           VS Code, Visual Studio, coding agent only
    │
    ├── prompts/
    │   ├── explain-code.prompt.md             ← Invoke with /explain-code in IDE chat
    │   └── create-readme.prompt.md            ← VS Code, Visual Studio, JetBrains only
    │
    └── agents/
        ├── readme-specialist.agent.md         ← Must be on default branch
        └── bug-fix-teammate.agent.md          ← Selected at github.com/copilot/agents

AGENTS.md                                      ← Multi-agent always-on (workspace root)
CLAUDE.md                                      ← Claude Code compatibility (workspace root)
.claude/CLAUDE.md                              ← Alternative Claude.md location
CLAUDE.local.md                                ← Local-only, not committed to version control
```
---

## VS Code 

###  `/` Slash Commands — Built-in custom instructions Actions
You can also use slash commands in chat to generate any type of customization file directly:

| Command | Output |
|---|---|
| `/init` | Workspace-wide `copilot-instructions.md` |
| `/create-instructions` | Targeted `.instructions.md` file |
| `/create-prompt` | `.prompt.md` file |
| `/create-agent` | `.agent.md` file |
| `/create-skill` | Agent skill file |
| `/create-hook` | Hook file |

VS Code Copilot Chat uses three special prefix characters to structure prompts. Each serves a distinct purpose.

---

### `/` Slash Commands — Built-in Chat Actions

Slash commands are shorthand prompts for common coding tasks. Type `/` in the chat input to see the full list available in your current context. These are the **built-in** commands (separate from the file-generation commands like `/create-agent`):

| Command | What it does |
|---|---|
| `/explain` | Explains the selected code or a concept in plain English |
| `/fix` | Suggests a fix for a bug, error, or linting issue in the selection |
| `/tests` | Generates unit tests for the selected function or class |
| `/doc` | Adds documentation comments (JSDoc, docstrings, etc.) to the selected code |
| `/new` | Scaffolds a new project or file based on your description |
| `/newNotebook` | Creates a new Jupyter notebook based on your description |
| `/terminal` | Explains or suggests terminal/shell commands |
| `/search` | Searches the codebase semantically for relevant code |
| `/clear` | Clears the current chat session |
| `/help` | Shows available commands and how to use Copilot Chat |
| `/compact` | Summarises the conversation history to free up context window space. You can also add custom focus instructions: `/compact focus on the database schema decisions` |

> **Note:** Your custom prompt files (`.github/prompts/*.prompt.md`) also appear as slash commands — invoked as `/filename`. These appear at the top of the list when you type `/`. The file-generation commands (`/init`, `/create-agent`, etc.) listed in the customization section above are also slash commands, just scoped to creating configuration files.

---

### `#` Context Variables — Hash Mentions

`#`-mentions let you explicitly attach specific context to your prompt. Type `#` in the chat input to see the full list. Unlike implicit context (which Copilot infers automatically), `#`-mentions give you precise control over what goes into the prompt.

| Variable | What it attaches |
|---|---|
| `#file` | A specific file from your workspace. Opens a file picker. |
| `#codebase` | Triggers a semantic search across your entire workspace to find the most relevant files automatically |
| `#selection` | The current text selection in the active editor |
| `#editor` | The entire contents of the active editor |
| `#terminalSelection` | The current text selection in the integrated terminal |
| `#terminalLastCommand` | The last command run in the terminal and its output |
| `#problems` | Errors and warnings currently shown in the Problems panel |
| `#changes` | The diff of your current uncommitted source control changes |
| `#fetch` | Fetches content from a URL you provide and adds it as context |
| `#symbol` | A specific code symbol (function, class, variable) — opens a symbol picker |
| `#<filename>` | Type `#` followed by a filename directly (e.g. `#index.ts`) to attach that file |

---

### `@` Chat Participants — Specialist Agents

`@`-mentions invoke specialized chat participants — domain experts optimized for specific contexts. Type `@` in the chat input to see available participants.

| Participant | Specialty |
|---|---|
| `@workspace` | Answers questions about your entire project — file structure, search across files, architecture questions |
| `@vscode` | Answers questions about VS Code itself — settings, keybindings, extensions, commands |
| `@terminal` | Helps with shell commands and explains terminal errors |
| `@github` | GitHub-specific skills: queries PRs, issues, repositories and runs GitHub Actions awareness. Dynamically picks the right skill based on your question |

**Usage tips:**

- `@workspace` is the go-to for codebase questions: `@workspace where is the authentication logic?`
- `@vscode` for IDE help: `@vscode how do I configure the formatter to run on save?`
- `@github` for repo-level context: `@github what issues are assigned to me?` or `@github summarize the recent PRs`
- Third-party extensions can register their own `@` participants (e.g. `@docker`, `@databases`)

---

### Quick Reference

```
/command     → shorthand for a built-in task (explain, fix, tests, doc…)
/prompt-name → invoke your custom .prompt.md file
#item        → attach specific context (file, codebase, selection, terminal…)
@participant → invoke a specialist (workspace, vscode, terminal, github)
```

**Combining all three in one prompt:**

```
@workspace using the patterns in #file:src/api/auth.ts, /fix the issue in #selection
```

## Writing Effective Custom Instructions

### 1. Keep files short and focused

The most important rule from the official docs: **shorter instruction files are more reliably processed**.

- Copilot code review only reads the **first 4,000 characters** of any instruction file. Instructions beyond that limit are ignored entirely for code review purposes. (This limit does not apply to Copilot Chat or the coding agent.)
- For general quality, keep any single instruction file to a **maximum of around 1,000 lines**. Beyond this, response quality can deteriorate.
- Start with a minimal set of 10–20 specific instructions, then add more iteratively based on what actually works.

### 2. Use clear structure and formatting

Copilot processes well-structured Markdown better than narrative prose. Use:

- **Distinct headings** (`##`) to separate topics
- **Bullet points** for rules — easier to scan than paragraphs
- **Short, imperative directives** ("Use snake_case for variables") rather than long explanations

**Don't write this:**
```
When you're reviewing code, it would be good if you could try to look for
situations where developers might have accidentally left in sensitive
information like passwords or API keys and also check for security issues.
```

**Write this instead:**
```markdown
## Security

- Check for hardcoded secrets, API keys, or credentials
- Look for SQL injection and XSS vulnerabilities
- Verify proper input validation and sanitization
```

### 3. Include the reasoning behind rules

When instructions explain *why* a convention exists, the AI makes better decisions in edge cases. For example: _"Use `date-fns` instead of `moment.js` because moment.js is deprecated and increases bundle size."_

### 4. Provide concrete code examples

Examples eliminate ambiguity. Include code snippets showing both the pattern to avoid and the pattern to prefer.

```markdown
## Naming

Use intention-revealing names.

```javascript
// Avoid
const d = new Date();
const x = users.filter(u => u.active);

// Prefer
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
```
```

### 5. Be specific, not vague

Vague instructions do not help. The official docs specifically call these out as **not supported** for code review:

- ❌ `Be more accurate`
- ❌ `Don't miss any issues`
- ❌ `Be consistent in your feedback`

Instead, write instructions about specific patterns in your codebase.

### 6. Focus on non-obvious rules

Skip conventions that standard linters or formatters already enforce. Only document what's unique to your team or project.

### 7. Avoid instructions Copilot cannot follow

From the official docs, the following types of instructions are **not currently supported** for Copilot code review:

- Instructions that change formatting: `Use bold text for critical issues`, `Add emoji to comments`
- Instructions that modify the PR overview comment: `Include a summary of security issues in the PR overview`
- Instructions that change core function: `Block a PR from merging unless all Copilot comments are addressed`
- Instructions referencing external URLs: `Review code according to standards at https://example.com`
  - Workaround: Copy the relevant content directly into your instruction file
- Instructions about self-improvement: `Be consistent`, `Don't miss any issues`

### 8. Don't let perfect be the enemy of good

An "imperfect" instructions file delivers far more impact than no file at all. Instruction files should evolve over time, just like documentation. Experiment, iterate and don't overthink the initial version.

## Key Hard Limits (from the Docs)

These are confirmed technical constraints, not style recommendations:

- **4,000 characters**: The maximum Copilot code review reads from any instruction file. Instructions beyond this are silently ignored for PR reviews. (Does not apply to Copilot Chat or the coding agent.)
- **~1,000 lines**: Recommended soft limit for any instruction file before quality starts degrading.
- **No external URL following**: Copilot cannot fetch external links in instructions. Copy relevant content directly into the file.
- **Both files applied when overlap occurs**: When a path-specific `.instructions.md` file and `copilot-instructions.md` both match the same file, both sets of instructions are used. Avoid writing contradictory instructions across them.
- **Base branch used for PR reviews**: Copilot code review uses the instructions from the base branch of the PR (e.g. `main`), not the feature branch. New instruction files must be merged before they affect reviews.
- **Inline suggestions unaffected**: Custom instructions do not apply to inline code suggestions (autocomplete). They apply to Copilot Chat interactions only.
