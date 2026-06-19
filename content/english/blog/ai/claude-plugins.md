+++
date = '2026-05-14T12:44:47+10:00'
draft = false
title = 'Claude Code Plugins'
tags = ['Claude', 'Claude Code']
summary = "Claude Code plugins let you extend Claude Code with custom skills, agents, hooks, MCP servers, LSP servers, background monitors, output styles, and themes — and share them across projects and teams via marketplaces."
+++

## What Are Claude Code Plugins?

Plugins are self-contained packages that extend Claude Code with custom functionality. A plugin can bundle any combination of:

- **Skills** — reusable instructions Claude can invoke automatically or users can call manually
- **Agents** — custom agent definitions with their own system prompts, tool restrictions, and models
- **Hooks** — shell commands that fire automatically before or after Claude Code actions
- **MCP servers** — connections to external tools and data sources via the Model Context Protocol
- **LSP servers** — language server integrations for real-time code intelligence
- **Background monitors** — processes that watch logs or files and notify Claude as events arrive
- **Output styles and themes** — response style and UI colour customisations
- **Executables** — binaries added to the Bash tool's `PATH` while the plugin is active
- **Default settings** — configuration applied automatically when the plugin is enabled

Plugins are designed for sharing. Once packaged, teammates or the wider community can install them with a single `/plugin install` command via a marketplace.

---

## Plugins vs Standalone Configuration

Claude Code supports two ways to add custom skills, agents, and hooks. Choosing between them depends on whether you need to share the configuration.

| Approach                                                           | Skill name format    | Best for                                                                                                  |
| ------------------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------- |
| **Standalone** (`.claude/` directory)                              | `/hello`             | Personal workflows, project-specific customisation, quick experiments                                     |
| **Plugins** (directory, usually with `.claude-plugin/plugin.json`) | `/plugin-name:hello` | Sharing with teammates, distributing to the community, versioned releases, reuse across multiple projects |

**Use standalone configuration when:**

- You are customising Claude Code for a single project
- The configuration is personal and does not need to be shared
- You are experimenting with skills or hooks before packaging them
- You want short, unnamespaced skill names like `/hello` or `/deploy`

**Use plugins when:**

- You want to share functionality with your team or the broader community
- You need the same skills or agents available across multiple projects
- You want version control and easy updates for your extensions
- You are distributing through a marketplace
- You are comfortable with namespaced skill names like `/my-plugin:hello` (namespacing prevents conflicts between plugins)

> **Recommended workflow:** Start with standalone configuration in `.claude/` for fast iteration, then convert to a plugin when you are ready to share.

---

## Plugin Directory Structure

A plugin lives in its own directory. The `.claude-plugin/plugin.json` manifest is recommended for distributable plugins because it defines the plugin name, metadata, version, and optional component paths. Claude Code can also auto-discover components in default locations when the manifest is omitted.

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (recommended)
├── skills/                  # Skills as <name>/SKILL.md directories
├── commands/                # Legacy flat Markdown skills (use skills/ for new plugins)
├── agents/                  # Custom agent definitions
├── output-styles/           # Custom output styles
├── themes/                  # Colour themes
├── hooks/
│   └── hooks.json           # Event handlers
├── monitors/
│   └── monitors.json        # Background monitor configurations
├── bin/                     # Executables added to Bash tool PATH
├── scripts/                 # Helper scripts used by skills, hooks, or monitors
├── .mcp.json                # MCP server configurations
├── .lsp.json                # LSP server configurations
└── settings.json            # Default settings applied when plugin is enabled
```

> **Common mistake:** Do not put `commands/`, `agents/`, `skills/`, `output-styles/`, `themes/`, `monitors/`, or `hooks/` inside the `.claude-plugin/` directory. Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the plugin root level.

A `CLAUDE.md` file at the plugin root is not loaded as project context. Plugins contribute context through skills, agents, hooks, MCP servers, LSP servers, monitors, and settings. If you want instructions to enter Claude's context, put them in a skill or agent.

| Component     | Default Location             | Purpose                                                             |
| ------------- | ---------------------------- | ------------------------------------------------------------------- |
| Manifest      | `.claude-plugin/plugin.json` | Plugin metadata, versioning, and custom component paths             |
| Skills        | `skills/`                    | Skills with `<name>/SKILL.md` structure                             |
| Commands      | `commands/`                  | Legacy flat Markdown skills; use `skills/` for new plugins          |
| Agents        | `agents/`                    | Custom subagent Markdown files                                      |
| Output styles | `output-styles/`             | Response style definitions                                          |
| Themes        | `themes/`                    | CLI colour theme definitions                                        |
| Hooks         | `hooks/hooks.json`           | Hook configuration for lifecycle events                             |
| MCP servers   | `.mcp.json`                  | Model Context Protocol server definitions                           |
| LSP servers   | `.lsp.json`                  | Language server configurations                                      |
| Monitors      | `monitors/monitors.json`     | Background monitor definitions                                      |
| Executables   | `bin/`                       | Commands added to the Bash tool's `PATH` while the plugin is active |
| Settings      | `settings.json`              | Default plugin settings; currently `agent` and `subagentStatusLine` |

---

## Quickstart: Creating Your First Plugin

### Step 1 — Create the plugin directory

```bash
mkdir my-first-plugin
```

### Step 2 — Create the plugin manifest

The manifest at `.claude-plugin/plugin.json` defines your plugin's identity. Claude Code uses this metadata in the plugin manager. If you include a manifest, `name` is the only required field, but `description` and `version` are strongly recommended for shared plugins.

```bash
mkdir my-first-plugin/.claude-plugin
```

`my-first-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

Manifest metadata fields:

| Field         | Type   | Description                                                                                                                                                   |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string | Required if a manifest is present. Unique kebab-case identifier and component namespace. Skills are prefixed with this, for example `/my-first-plugin:hello`. |
| `$schema`     | string | JSON Schema URL for editor autocomplete and validation. Ignored at plugin load time.                                                                          |
| `version`     | string | Optional version string. If set, users only receive updates when you bump it. If omitted and distributed via git, the commit SHA is used.                     |
| `description` | string | Short explanation shown in plugin listings and details views.                                                                                                 |
| `author`      | object | Author metadata, usually `name`, and optionally `email` and `url`.                                                                                            |
| `homepage`    | string | Documentation or product page URL.                                                                                                                            |
| `repository`  | string | Source repository URL.                                                                                                                                        |
| `license`     | string | SPDX-style license identifier such as `MIT` or `Apache-2.0`.                                                                                                  |
| `keywords`    | array  | Discovery tags for search and marketplace browsing.                                                                                                           |

Manifest component path fields:

| Field                   | Type                     | Description                                                                                                                        |
| ----------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `skills`                | string or array          | Extra skill directories. These are added alongside the default `skills/` directory.                                                |
| `commands`              | string or array          | Custom flat Markdown command files or directories. Replaces the default `commands/` scan unless you list `./commands/` explicitly. |
| `agents`                | string or array          | Custom agent files or directories. Replaces the default `agents/` scan unless you list it explicitly.                              |
| `hooks`                 | string, array, or object | Hook config path(s), or inline hook configuration.                                                                                 |
| `mcpServers`            | string, array, or object | MCP config path(s), or inline MCP server configuration.                                                                            |
| `outputStyles`          | string or array          | Output style files or directories. Replaces the default `output-styles/` scan unless listed explicitly.                            |
| `lspServers`            | string, array, or object | LSP config path(s), or inline LSP server configuration.                                                                            |
| `experimental.themes`   | string or array          | Theme files or directories. Replaces the default `themes/` scan unless listed explicitly.                                          |
| `experimental.monitors` | string or array          | Monitor config path(s). Monitors are still treated as experimental.                                                                |
| `userConfig`            | object                   | User-configurable values prompted when the plugin is enabled.                                                                      |
| `channels`              | array                    | Message channel declarations bound to plugin MCP servers.                                                                          |
| `dependencies`          | array                    | Other plugins this plugin requires, optionally with version constraints.                                                           |

Path rules are easy to trip over:

- All custom paths in `plugin.json` should be relative to the plugin root and start with `./`.
- `skills` extends the default `skills/` directory.
- `commands`, `agents`, `outputStyles`, `experimental.themes`, and `experimental.monitors` replace their default directories unless you list the default path explicitly.
- Hooks, MCP servers, and LSP servers have their own merge behaviour because they can be declared as paths or inline objects.

Use `userConfig` when a plugin needs per-user settings such as API endpoints, tokens, directories, or feature flags:

```json
{
  "userConfig": {
    "api_endpoint": {
      "type": "string",
      "title": "API endpoint",
      "description": "Your team's API endpoint",
      "required": true
    },
    "api_token": {
      "type": "string",
      "title": "API token",
      "description": "API authentication token",
      "sensitive": true
    }
  }
}
```

| `userConfig` Field | Required | Description                                                                   |
| ------------------ | -------: | ----------------------------------------------------------------------------- |
| `type`             |      Yes | One of `string`, `number`, `boolean`, `directory`, or `file`.                 |
| `title`            |      Yes | Label shown in the configuration dialog.                                      |
| `description`      |      Yes | Help text shown beneath the field.                                            |
| `sensitive`        |       No | Masks input and stores the value in secure storage instead of plain settings. |
| `required`         |       No | Fails validation when the value is empty.                                     |
| `default`          |       No | Value used when the user provides nothing.                                    |
| `multiple`         |       No | Allows an array of strings for `string` fields.                               |
| `min` / `max`      |       No | Bounds for `number` fields.                                                   |

Configured values can be referenced as `${user_config.KEY}` in MCP and LSP server configs, hook commands, and monitor commands. Non-sensitive values can also be substituted into skill and agent content.

Channels let a plugin declare message sources that inject content into the conversation, usually backed by a plugin-provided MCP server:

```json
{
  "channels": [
    {
      "server": "telegram",
      "userConfig": {
        "bot_token": {
          "type": "string",
          "title": "Bot token",
          "description": "Telegram bot token",
          "sensitive": true
        },
        "owner_id": {
          "type": "string",
          "title": "Owner ID",
          "description": "Your Telegram user ID"
        }
      }
    }
  ]
}
```

The `server` value must match a key in the plugin's `mcpServers`. Channel-level `userConfig` uses the same schema as top-level `userConfig`.

Dependencies let one plugin require another:

```json
{
  "name": "deploy-kit",
  "version": "3.1.0",
  "dependencies": [
    "audit-logger",
    { "name": "secrets-vault", "version": "~2.1.0" }
  ]
}
```

| Dependency Field | Required | Description                                                                                                         |
| ---------------- | -------: | ------------------------------------------------------------------------------------------------------------------- |
| `name`           |      Yes | Plugin name. By default, resolved within the same marketplace.                                                      |
| `version`        |       No | Semver range such as `~2.1.0`, `^2.0`, `>=1.4`, or `=2.1.0`.                                                        |
| `marketplace`    |       No | Marketplace to resolve the dependency from. Cross-marketplace dependencies must be allowed by the root marketplace. |

Use `claude plugin tag --push` when publishing versioned releases. For git-backed marketplaces, dependency constraints resolve against tags named `{plugin-name}--v{version}`.

### Step 3 — Add a skill

Skills live in the `skills/` directory. Each skill is a folder whose name becomes the skill name, prefixed by the plugin namespace.

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`:

```markdown
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

### Step 4 — Test your plugin locally

Use the `--plugin-dir` flag to load your plugin for a session without installing it:

```bash
claude --plugin-dir ./my-first-plugin
```

Then invoke your skill:

```
/my-first-plugin:hello
```

Run `/help` to see your skill listed under the plugin namespace. Run `/reload-plugins` after any changes to pick them up without restarting.

### Step 5 — Add skill arguments

The `$ARGUMENTS` placeholder captures any text the user provides after the skill name, making skills dynamic:

```markdown
---
description: Greet the user with a personalized message
---

Greet the user named "$ARGUMENTS" warmly and ask how you can help them today.
```

Usage:

```
/my-first-plugin:hello Alex
```

---

## Plugin Components in Depth

### Skills

By default, skills can be model-invoked: Claude can select and use them based on task context, without the user needing to invoke them manually. Each skill is a folder inside `skills/` containing a `SKILL.md` file.

```
my-plugin/
└── skills/
    └── code-review/
        └── SKILL.md
```

A typical `SKILL.md`:

```markdown
---
description: Reviews code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
---

When reviewing code, check for:

1. Code organisation and structure
2. Error handling
3. Security concerns
4. Test coverage
```

The `description` frontmatter field is what Claude reads to decide when to invoke the skill. Use `disable-model-invocation: true` for manual-only skills, especially workflows with side effects such as deploys or commits. Use `user-invocable: false` for background knowledge that Claude may use but users should not call from the slash menu.

Skill frontmatter fields:

| Field                      |    Required | Description                                                                                                                                     |
| -------------------------- | ----------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                     |          No | Display name for the skill. If omitted, Claude uses the directory name. Use lowercase letters, numbers and hyphens.                             |
| `description`              | Recommended | What the skill does and when Claude should use it. If omitted, Claude falls back to the first paragraph of the Markdown body.                   |
| `when_to_use`              |          No | Extra invocation guidance, such as trigger phrases or example requests. Appended to `description` in the skill listing.                         |
| `argument-hint`            |          No | Autocomplete hint for expected arguments, such as `[issue-number]` or `[filename] [format]`.                                                    |
| `arguments`                |          No | Named positional arguments for `$name` substitution in the skill body. Accepts a space-separated string or YAML list.                           |
| `disable-model-invocation` |          No | Set to `true` to prevent Claude from loading or invoking the skill automatically. Useful for manual commands such as deploys.                   |
| `user-invocable`           |          No | Set to `false` to hide the skill from the slash menu while still allowing Claude to invoke it automatically.                                    |
| `allowed-tools`            |          No | Tools Claude may use without asking while this skill is active. Accepts a space-separated string or YAML list.                                  |
| `model`                    |          No | Model override while the skill is active. Accepts the same values as `/model`, or `inherit`.                                                    |
| `effort`                   |          No | Reasoning effort override while the skill is active. Common values are `low`, `medium`, `high`, `xhigh`, and `max`, depending on model support. |
| `context`                  |          No | Set to `fork` to run the skill in a forked subagent context instead of the main conversation.                                                   |
| `agent`                    |          No | Subagent type to use when `context: fork` is set. Can reference built-in or custom agents.                                                      |
| `hooks`                    |          No | Hooks scoped to this skill's lifecycle. Uses the same hook configuration format as Claude Code hooks.                                           |
| `paths`                    |          No | Glob patterns that limit when Claude activates the skill automatically. Accepts a comma-separated string or YAML list.                          |
| `shell`                    |          No | Shell for inline `!` commands and code blocks. Supports `bash` by default and `powershell` when enabled.                                        |

After installing or reloading a plugin, run `/reload-plugins` to activate the skills.

For full skill authoring details including progressive disclosure and tool restrictions, see [Extend Claude with skills](https://code.claude.com/docs/en/skills).

---

### Agents

Plugins can define custom subagents in the `agents/` directory. Agents have their own system prompts, tool restrictions, and model selections. Claude can invoke them automatically when appropriate, and users can also select them from `/agents`.

Example `agents/security-reviewer.md`:

```markdown
---
name: security-reviewer
description: Reviews code for security risks and unsafe patterns
model: sonnet
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
---

Review code for security issues, risky dependencies, exposed secrets, and unsafe defaults.
Return findings with file references and concrete remediation steps.
```

Agent frontmatter fields:

| Field             | Required | Description                                                                                                                                      |
| ----------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            |      Yes | Unique agent identifier. Use lowercase letters and hyphens. In plugins, nested folders become part of the scoped agent identifier.               |
| `description`     |      Yes | When Claude should delegate to this agent. Write this as routing guidance, not marketing copy.                                                   |
| `tools`           |       No | Allowlist of tools the agent can use. If omitted, the agent inherits the available tools from the main conversation.                             |
| `disallowedTools` |       No | Denylist of tools to remove from the inherited or specified tool list. If both `tools` and `disallowedTools` are set, denied tools are removed.  |
| `model`           |       No | Model for the agent, such as `sonnet`, `opus`, `haiku`, a full model ID, or `inherit`. Defaults to `inherit`.                                    |
| `effort`          |       No | Reasoning effort while this agent is active. Common values are `low`, `medium`, `high`, `xhigh`, and `max`, depending on model support.          |
| `maxTurns`        |       No | Maximum number of agentic turns before the agent stops.                                                                                          |
| `skills`          |       No | Skills to preload into the agent's context at startup. The full skill content is injected, not just the description.                             |
| `memory`          |       No | Persistent memory scope for cross-session learning. Supported scopes are `user`, `project`, and `local`.                                         |
| `background`      |       No | Set to `true` to always run this agent as a background task. Defaults to `false`.                                                                |
| `isolation`       |       No | Set to `worktree` to run the agent in an isolated temporary git worktree.                                                                        |
| `color`           |       No | Display colour in task lists and transcripts. Supported values include `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, and `cyan`. |
| `initialPrompt`   |       No | First user turn automatically submitted when the agent runs as the main session agent through `--agent` or plugin `settings.json`.               |
| `permissionMode`  |       No | Permission mode for non-plugin agents. Ignored for plugin agents.                                                                                |
| `mcpServers`      |       No | MCP servers scoped to non-plugin agents. Ignored for plugin agents.                                                                              |
| `hooks`           |       No | Lifecycle hooks scoped to non-plugin agents. Ignored for plugin agents.                                                                          |

For security reasons, plugin-shipped agents ignore `hooks`, `mcpServers`, and `permissionMode`. If you need those fields, copy the agent into `.claude/agents/` or `~/.claude/agents/` instead of shipping it from a plugin.

You can set a default agent in the plugin's `settings.json`:

```json
{
  "agent": "security-reviewer"
}
```

This activates the `security-reviewer` agent as the main thread when the plugin is enabled. Settings in `settings.json` take priority over `settings` declared in `plugin.json`. Unknown keys are silently ignored.

Currently, only the `agent` and `subagentStatusLine` keys are supported in plugin `settings.json`.

---

### Hooks

Hooks let you run shell commands automatically before or after Claude Code actions. Define them in `hooks/hooks.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix"
          }
        ]
      }
    ]
  }
}
```

The hook command receives hook input as JSON on stdin. Use `jq` to extract fields like the file path. The format is the same as standalone hooks in `settings.json`, so existing hooks migrate directly.

Common hook events:

| Event                 | When It Fires                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | When a session begins or resumes                                                                                |
| `Setup`               | When Claude Code starts with setup-only modes such as `--init-only`, `--init`, or `--maintenance` in print mode |
| `UserPromptSubmit`    | After the user submits a prompt, before Claude processes it                                                     |
| `UserPromptExpansion` | When a user-typed command expands into a prompt before it reaches Claude                                        |
| `PreToolUse`          | Before a tool call executes; can block or shape behaviour                                                       |
| `PermissionRequest`   | When a permission dialog appears                                                                                |
| `PermissionDenied`    | When a tool call is denied by auto mode                                                                         |
| `PostToolUse`         | After a tool call succeeds                                                                                      |
| `PostToolUseFailure`  | After a tool call fails                                                                                         |
| `PostToolBatch`       | After a batch of parallel tool calls finishes                                                                   |
| `Notification`        | When Claude Code sends a notification                                                                           |
| `SubagentStart`       | When a subagent starts                                                                                          |
| `SubagentStop`        | When a subagent finishes                                                                                        |
| `TaskCreated`         | When a task is created through `TaskCreate`                                                                     |
| `TaskCompleted`       | When a task is marked complete                                                                                  |
| `Stop`                | When Claude finishes responding                                                                                 |
| `StopFailure`         | When a turn ends due to an API error                                                                            |
| `TeammateIdle`        | When an agent-team teammate is about to go idle                                                                 |
| `InstructionsLoaded`  | When a `CLAUDE.md` or `.claude/rules/*.md` file is loaded into context                                          |
| `ConfigChange`        | When configuration changes during a session                                                                     |
| `CwdChanged`          | When the working directory changes                                                                              |
| `FileChanged`         | When a watched file changes on disk                                                                             |
| `WorktreeCreate`      | When a worktree is being created                                                                                |
| `WorktreeRemove`      | When a worktree is being removed                                                                                |
| `PreCompact`          | Before context compaction                                                                                       |
| `PostCompact`         | After context compaction                                                                                        |
| `Elicitation`         | When an MCP server requests user input during a tool call                                                       |
| `ElicitationResult`   | After the user responds to an MCP elicitation                                                                   |
| `SessionEnd`          | When the session terminates                                                                                     |

Hook handler types:

| Type       | Description                                                            |
| ---------- | ---------------------------------------------------------------------- |
| `command`  | Runs a shell command or script. The event JSON is passed on stdin.     |
| `http`     | Sends the event JSON to an HTTP endpoint as a POST request.            |
| `mcp_tool` | Calls a tool on an already-connected MCP server.                       |
| `prompt`   | Runs a single-turn model evaluation and expects a structured decision. |
| `agent`    | Spawns an agentic verifier with tools for more complex checks.         |

Hook handler fields:

| Field           |      Required | Description                                                                                   |
| --------------- | ------------: | --------------------------------------------------------------------------------------------- |
| `type`          |           Yes | One of `command`, `http`, `mcp_tool`, `prompt`, or `agent`.                                   |
| `if`            |            No | Permission-rule filter such as `Bash(git *)` or `Edit(*.ts)`. Evaluated on tool events.       |
| `timeout`       |            No | Seconds before cancellation. Defaults vary by handler type.                                   |
| `statusMessage` |            No | Spinner text displayed while the hook runs.                                                   |
| `once`          |            No | Runs once per session when declared in skill frontmatter. Ignored in plugin-level hook files. |
| `command`       | For `command` | Shell command or executable to run.                                                           |
| `args`          |            No | Argument vector for exec form. Prefer this when passing `${CLAUDE_PLUGIN_ROOT}` paths.        |
| `async`         |            No | Runs a command hook in the background.                                                        |
| `asyncRewake`   |            No | Runs in the background and wakes Claude on exit code `2`.                                     |
| `shell`         |            No | Shell for command hooks, usually `bash` or `powershell`.                                      |

Use hooks sparingly. They run with the user's local privileges, so a shared plugin should make side effects clear and keep commands auditable.

---

### MCP Servers

MCP (Model Context Protocol) server configurations go in `.mcp.json` at the plugin root, or inline in `plugin.json` under `mcpServers`. This connects Claude Code to external tools, APIs, and data sources — databases, GitHub, Slack, Jira, internal services and more — bundled as part of the plugin.

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_DATA}/db"
      }
    },
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

Plugin MCP servers start when the plugin is enabled and expose tools through Claude's normal MCP tool system. They can use `${CLAUDE_PLUGIN_ROOT}` for bundled files, `${CLAUDE_PLUGIN_DATA}` for persistent state, `${CLAUDE_PROJECT_DIR}` for project paths, and `${user_config.KEY}` for values collected from the user.

Use MCP when the plugin needs a durable integration surface: API calls, database queries, browser automation, ticketing systems, internal tools, or reusable tool contracts. Use hooks when you only need to react to Claude Code lifecycle events.

---

### LSP Servers

LSP (Language Server Protocol) plugins give Claude real-time code intelligence for a given language. Define them in `.lsp.json`:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

LSP server fields:

| Field                   | Required | Description                                                                     |
| ----------------------- | -------: | ------------------------------------------------------------------------------- |
| `command`               |      Yes | LSP binary to execute. It must be installed and available on the user's `PATH`. |
| `extensionToLanguage`   |      Yes | Maps file extensions such as `.go` or `.rs` to LSP language identifiers.        |
| `args`                  |       No | Arguments passed to the language server.                                        |
| `transport`             |       No | Communication transport. `stdio` is the default; `socket` is also supported.    |
| `env`                   |       No | Environment variables set when starting the server.                             |
| `initializationOptions` |       No | Options passed during LSP initialization.                                       |
| `settings`              |       No | Settings sent through `workspace/didChangeConfiguration`.                       |
| `workspaceFolder`       |       No | Workspace folder path for the server.                                           |
| `startupTimeout`        |       No | Maximum startup wait in milliseconds.                                           |
| `shutdownTimeout`       |       No | Maximum graceful shutdown wait in milliseconds.                                 |
| `restartOnCrash`        |       No | Whether Claude Code should restart the server after a crash.                    |
| `maxRestarts`           |       No | Maximum restart attempts before giving up.                                      |

For common languages (TypeScript, Python, Rust, and others), install the pre-built LSP plugins from the official marketplace instead of writing your own. Only create a custom LSP plugin when you need support for a language with no existing plugin. Users installing your LSP plugin must have the language server binary installed on their own machine.

| Official Plugin     | Language Server            | Install the Server                                     |
| ------------------- | -------------------------- | ------------------------------------------------------ |
| `pyright-lsp`       | Pyright for Python         | `pip install pyright` or `npm install -g pyright`      |
| `typescript-lsp`    | TypeScript Language Server | `npm install -g typescript-language-server typescript` |
| `rust-analyzer-lsp` | rust-analyzer              | Install `rust-analyzer` for your platform              |

---

### Background Monitors

Background monitors watch logs, files, or external status in the background and notify Claude as events arrive. Claude Code starts each monitor automatically when the plugin is active — you do not need to instruct Claude to start watching.

Monitors require Claude Code v2.1.105 or later. They run only in interactive CLI sessions, run unsandboxed at the same trust level as hooks, and are skipped when the Monitor tool is unavailable.

Define monitors in `monitors/monitors.json`:

```json
[
  {
    "name": "error-log",
    "command": "tail -F ./logs/error.log",
    "description": "Application error log"
  }
]
```

Each line written to stdout by `command` is delivered to Claude as a notification during the session. The full schema also supports a `when` trigger and variable substitution — see the [plugins reference](https://code.claude.com/docs/en/plugins-reference#monitors).

Monitor fields:

| Field         | Required | Description                                                                                                  |
| ------------- | -------: | ------------------------------------------------------------------------------------------------------------ |
| `name`        |      Yes | Identifier unique within the plugin. Prevents duplicate monitor processes on reload.                         |
| `command`     |      Yes | Long-running shell command executed from the session working directory.                                      |
| `description` |      Yes | Short summary shown in task panels and notification summaries.                                               |
| `when`        |       No | Start condition. Defaults to `always`; use `on-skill-invoke:<skill-name>` to start after a skill first runs. |

Monitor commands support `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, `${CLAUDE_PROJECT_DIR}`, `${user_config.KEY}` and environment variable substitutions. If a monitor script must run from the plugin directory, start the command with `cd "${CLAUDE_PLUGIN_ROOT}" && ...`.

---

### Output Styles and Themes

Plugins can include `output-styles/` and `themes/` directories. Output styles customise how Claude responds, while themes customise the CLI appearance. These are useful when a team wants consistent review formats, concise operational responses, or a shared visual theme.

When declaring custom paths in `plugin.json`, note that `commands`, `agents`, `outputStyles`, `themes`, and `monitors` replace their default directories unless you list the default path explicitly. `skills` are different: custom skill paths are added alongside the default `skills/` directory.

Example `themes/dracula.json`:

```json
{
  "name": "Dracula",
  "base": "dark",
  "overrides": {
    "claude": "#bd93f9",
    "error": "#ff5555",
    "success": "#50fa7b"
  }
}
```

Plugin themes appear in `/theme` alongside built-in themes. They are read-only while installed from the plugin; users can copy them into their own theme directory if they want to customise them.

Output styles are best for response conventions, not capability. Use a skill or agent when the plugin needs task-specific instructions, tools, or routing logic.

---

### Executables (`bin/`)

Any executables you place in the `bin/` directory are added to the Bash tool's `PATH` while the plugin is enabled. This lets you ship helper scripts or binaries that your hooks or skills depend on.

For example, a plugin can ship `bin/check-release`, then a skill or hook can call `check-release` directly. Keep executables self-contained, document required system dependencies, and prefer `${CLAUDE_PLUGIN_DATA}` for caches or installed dependencies that should survive plugin updates.

---

### Plugin Environment Variables

Claude Code provides useful variables for plugin components:

| Variable                | Use                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `${CLAUDE_PLUGIN_ROOT}` | Absolute path to the installed plugin version. Use this to reference bundled scripts and config files.           |
| `${CLAUDE_PLUGIN_DATA}` | Persistent data directory that survives plugin updates. Use for caches, dependencies, generated files, or state. |
| `${CLAUDE_PROJECT_DIR}` | Project root where Claude Code is running. Use this to reference project-local scripts or config.                |

Quote these paths in shell commands because project and plugin paths may contain spaces.

When a plugin updates during a session, hooks, MCP servers and LSP servers keep using the previous plugin version until `/reload-plugins` runs. Monitors usually require a fresh session to switch to the new version. Treat `${CLAUDE_PLUGIN_ROOT}` as read-only and versioned; write persistent state to `${CLAUDE_PLUGIN_DATA}` instead.

---

## Testing Plugins Locally

### Load a local directory

```bash
claude --plugin-dir ./my-plugin
```

### Load a zip archive (requires v2.1.128+)

```bash
claude --plugin-dir ./my-plugin.zip
```

### Load from a URL

```bash
claude --plugin-url https://example.com/my-plugin.zip
```

Multiple plugins can be loaded at once:

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
claude --plugin-url "https://example.com/a.zip https://example.com/b.zip"
```

**Precedence:** When a `--plugin-dir` plugin has the same name as an installed marketplace plugin, the local copy takes precedence for that session. This lets you iterate on a plugin you already have installed without uninstalling it first.

**Reloading:** Run `/reload-plugins` after making changes to reload skills, agents, hooks, MCP servers, and LSP servers without restarting Claude Code.

### Debugging

If a plugin is not working:

1. **Check the structure** — make sure `commands/`, `agents/`, `skills/`, and `hooks/` are at the plugin root, not inside `.claude-plugin/`
2. **Test components individually** — check each skill, agent, and hook separately
3. **Validate the plugin** — run `claude plugin validate ./my-plugin` or use `/plugin validate`
4. **Inspect what loaded** — run `claude plugin list` and `claude plugin details <name>`
5. **Use the CLI debugging tools** — see [Debugging and development tools](https://code.claude.com/docs/en/plugins-reference#debugging-and-development-tools)

Useful plugin CLI commands:

| Command                              | Purpose                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `claude plugin install <plugin>`     | Install a plugin from a known marketplace.                                         |
| `claude plugin uninstall <plugin>`   | Remove an installed plugin. Use `--keep-data` to preserve `${CLAUDE_PLUGIN_DATA}`. |
| `claude plugin prune`                | Remove auto-installed plugin dependencies no longer required by installed plugins. |
| `claude plugin enable <plugin>`      | Re-enable a disabled plugin.                                                       |
| `claude plugin disable <plugin>`     | Disable a plugin without uninstalling it.                                          |
| `claude plugin update <plugin>`      | Update a plugin to the latest available version.                                   |
| `claude plugin list`                 | List installed plugins, versions, marketplace sources, and enabled status.         |
| `claude plugin details <name>`       | Show component inventory and projected token cost.                                 |
| `claude plugin tag`                  | Create a release git tag from inside a plugin folder.                              |
| `claude plugin validate ./my-plugin` | Validate the manifest, frontmatter, and hook configuration.                        |

Common failure modes:

| Symptom                             | Likely Cause                                           | Fix                                                         |
| ----------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| Plugin does not load                | Invalid `plugin.json`                                  | Run `claude plugin validate ./my-plugin`.                   |
| Skill does not appear               | `skills/` or `commands/` is inside `.claude-plugin/`   | Move it to the plugin root.                                 |
| Hook does not fire                  | Event or matcher is wrong, or script is not executable | Check the event name and run `chmod +x` for scripts.        |
| MCP server fails                    | Plugin path is hard-coded or binary is missing         | Use `${CLAUDE_PLUGIN_ROOT}` and document required binaries. |
| LSP error says executable not found | Language server is not installed                       | Install the language server binary on the user's machine.   |
| Custom path ignored                 | Manifest path replaces the default directory           | Add the default path explicitly or remove the custom path.  |

---

## Installation Scopes

When installing a plugin, choose a scope based on who should receive it:

| Scope     | Settings file                 | Best for                                        |
| --------- | ----------------------------- | ----------------------------------------------- |
| `user`    | `~/.claude/settings.json`     | Personal plugins available across projects      |
| `project` | `.claude/settings.json`       | Team plugins shared through version control     |
| `local`   | `.claude/settings.local.json` | Project-specific plugins that should stay local |
| `managed` | Managed settings              | Organisation-managed plugins                    |

Examples:

```bash
claude plugin install formatter@team-marketplace
claude plugin install formatter@team-marketplace --scope project
claude plugin update formatter
claude plugin uninstall formatter --keep-data
```

---

## Converting Standalone Configuration to a Plugin

If you already have commands, skills, agents, or hooks in your project's `.claude/` directory, you can migrate them into a plugin.

### Step 1 — Create the plugin structure

```bash
mkdir -p my-plugin/.claude-plugin
```

`my-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "my-plugin",
  "description": "Migrated from standalone configuration",
  "version": "1.0.0"
}
```

### Step 2 — Copy your existing files

```bash
cp -r .claude/commands my-plugin/
cp -r .claude/agents my-plugin/   # if any
cp -r .claude/skills my-plugin/   # if any
```

### Step 3 — Migrate hooks

```bash
mkdir my-plugin/hooks
```

Copy the `hooks` object from your `.claude/settings.json` or `settings.local.json` into `my-plugin/hooks/hooks.json`. The format is identical.

### Step 4 — Test the migrated plugin

```bash
claude --plugin-dir ./my-plugin
```

Test each component: run your skills, check agents appear in `/agents`, and verify hooks trigger correctly. After confirming everything works, remove the originals from `.claude/` to avoid duplicates. The plugin version takes precedence when loaded.

### What changes after migration

| Standalone (`.claude/`)          | Plugin                           |
| -------------------------------- | -------------------------------- |
| Only available in one project    | Shareable via marketplaces       |
| Files in `.claude/commands/`     | Files in `plugin-name/commands/` |
| Hooks in `settings.json`         | Hooks in `hooks/hooks.json`      |
| Must be copied manually to share | Installed with `/plugin install` |

---

## Sharing and Distribution

### Prepare your plugin for release

1. Add a `README.md` with installation and usage instructions
2. Choose a versioning strategy:
   - **Set an explicit `version`** in `plugin.json` — users only receive updates when you bump the version
   - **Omit `version`** — if distributed via git, the commit SHA is used and every commit is treated as a new version
3. Create or use a marketplace for distribution
4. Have teammates test before a wider release

### Marketplace file

A marketplace is a catalog of plugins. Put its manifest at `.claude-plugin/marketplace.json` in the marketplace repository:

```json
{
  "name": "company-tools",
  "owner": {
    "name": "DevTools Team",
    "email": "devtools@example.com"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./plugins/formatter",
      "description": "Automatic code formatting on save",
      "version": "2.1.0"
    },
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deploy-plugin"
      },
      "description": "Deployment automation tools"
    }
  ]
}
```

Marketplace fields:

| Field                                 | Required | Description                                                                                   |
| ------------------------------------- | -------: | --------------------------------------------------------------------------------------------- |
| `name`                                |      Yes | Marketplace identifier used in install commands such as `/plugin install tool@company-tools`. |
| `owner`                               |      Yes | Maintainer information. `owner.name` is required; `owner.email` is optional.                  |
| `plugins`                             |      Yes | Array of plugin entries.                                                                      |
| `$schema`                             |       No | JSON Schema URL for editor support.                                                           |
| `description`                         |       No | Marketplace description.                                                                      |
| `version`                             |       No | Marketplace manifest version.                                                                 |
| `metadata.pluginRoot`                 |       No | Base directory prepended to relative plugin source paths.                                     |
| `allowCrossMarketplaceDependenciesOn` |       No | Other marketplaces that dependencies may come from.                                           |

Plugin entry fields:

| Field         | Required | Description                                                                                  |
| ------------- | -------: | -------------------------------------------------------------------------------------------- |
| `name`        |      Yes | Plugin identifier.                                                                           |
| `source`      |      Yes | Where Claude Code fetches the plugin from.                                                   |
| `description` |       No | Short plugin description.                                                                    |
| `version`     |       No | Plugin version. If set here or in `plugin.json`, users update only when the version changes. |
| `category`    |       No | Marketplace grouping for browsing.                                                           |
| `tags`        |       No | Search tags.                                                                                 |
| `strict`      |       No | Controls how marketplace metadata interacts with the plugin's own manifest.                  |

Plugin source types:

| Source           | Example                                                            | Notes                                                            |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Relative path    | `"./plugins/formatter"`                                            | Resolved relative to the marketplace root. Must start with `./`. |
| GitHub           | `{ "source": "github", "repo": "company/deploy-plugin" }`          | Supports optional `ref` or exact `sha`.                          |
| Git URL          | `{ "source": "url", "url": "https://git.example.com/plugin.git" }` | Useful for non-GitHub git hosts.                                 |
| Git subdirectory | `{ "source": "git-subdir", "url": "...", "path": "plugins/foo" }`  | Useful for monorepos.                                            |
| npm              | `{ "source": "npm", "package": "@company/claude-plugin" }`         | Installed through npm.                                           |

Users add a marketplace first, then install individual plugins:

```bash
claude plugin marketplace add acme-corp/claude-plugins
claude plugin marketplace list
claude plugin marketplace update
claude plugin install formatter@company-tools
```

Project teams can add known marketplaces and default plugins to `.claude/settings.json` so collaborators are prompted after trusting the repository:

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true,
    "deployment-tools@company-tools": true
  }
}
```

### Submit to the official Anthropic marketplace

- **Claude.ai:** [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
- **Console:** [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

Once listed, you can prompt Claude Code users to install your plugin directly from your CLI. See [Recommend your plugin from your CLI](https://code.claude.com/docs/en/plugin-hints).

For internal team plugins, host a private marketplace in a private repository. See [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces#private-repositories).

---

## Further Reading

| Topic                                 | Link                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Discover and install prebuilt plugins | [code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins)       |
| Full plugin technical reference       | [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference)     |
| Agent skills guide                    | [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)                           |
| Custom subagents                      | [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)                   |
| Hooks guide                           | [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)                             |
| MCP integration                       | [code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)                                 |
| Plugin marketplaces                   | [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) |
