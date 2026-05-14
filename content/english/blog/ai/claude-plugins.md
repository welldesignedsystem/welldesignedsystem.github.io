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

| Approach | Skill name format | Best for |
|---|---|---|
| **Standalone** (`.claude/` directory) | `/hello` | Personal workflows, project-specific customisation, quick experiments |
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

| Field | Purpose |
|---|---|
| `name` | Required if a manifest is present. Unique identifier and component namespace. Skills are prefixed with this (e.g., `/my-first-plugin:hello`). |
| `description` | Optional but recommended. Shown in the plugin manager when browsing or installing plugins. |
| `version` | Optional. If set, users only receive updates when you bump this field. If omitted and distributed via git, the commit SHA is used and every commit counts as a new version. |
| `author` | Optional. Useful for attribution. |

Additional manifest fields like `$schema`, `homepage`, `repository`, `license`, `dependencies`, and `userConfig` are also supported — see the [plugins reference](https://code.claude.com/docs/en/plugins-reference).

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

Plugin agents support fields such as `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, and `isolation`. The only valid `isolation` value is `worktree`. For security reasons, plugin-shipped agents do not support `hooks`, `mcpServers`, or `permissionMode`.

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

---

### MCP Servers

MCP (Model Context Protocol) server configurations go in `.mcp.json` at the plugin root. This connects Claude Code to external tools, APIs, and data sources — databases, GitHub, Slack, Jira, and more — bundled as part of the plugin.

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

For common languages (TypeScript, Python, Rust, and others), install the pre-built LSP plugins from the official marketplace instead of writing your own. Only create a custom LSP plugin when you need support for a language with no existing plugin. Users installing your LSP plugin must have the language server binary installed on their own machine.

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

---

### Output Styles and Themes

Plugins can include `output-styles/` and `themes/` directories. Output styles customise how Claude responds, while themes customise the CLI appearance. These are useful when a team wants consistent review formats, concise operational responses, or a shared visual theme.

When declaring custom paths in `plugin.json`, note that `commands`, `agents`, `outputStyles`, `themes`, and `monitors` replace their default directories unless you list the default path explicitly. `skills` are different: custom skill paths are added alongside the default `skills/` directory.

---

### Executables (`bin/`)

Any executables you place in the `bin/` directory are added to the Bash tool's `PATH` while the plugin is enabled. This lets you ship helper scripts or binaries that your hooks or skills depend on.

---

### Plugin Environment Variables

Claude Code provides useful variables for plugin components:

| Variable | Use |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | Absolute path to the installed plugin version. Use this to reference bundled scripts and config files. |
| `${CLAUDE_PLUGIN_DATA}` | Persistent data directory that survives plugin updates. Use for caches, dependencies, generated files, or state. |
| `${CLAUDE_PROJECT_DIR}` | Project root where Claude Code is running. Use this to reference project-local scripts or config. |

Quote these paths in shell commands because project and plugin paths may contain spaces.

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

---

## Installation Scopes

When installing a plugin, choose a scope based on who should receive it:

| Scope | Settings file | Best for |
|---|---|---|
| `user` | `~/.claude/settings.json` | Personal plugins available across projects |
| `project` | `.claude/settings.json` | Team plugins shared through version control |
| `local` | `.claude/settings.local.json` | Project-specific plugins that should stay local |
| `managed` | Managed settings | Organisation-managed plugins |

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

| Standalone (`.claude/`) | Plugin |
|---|---|
| Only available in one project | Shareable via marketplaces |
| Files in `.claude/commands/` | Files in `plugin-name/commands/` |
| Hooks in `settings.json` | Hooks in `hooks/hooks.json` |
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

### Submit to the official Anthropic marketplace

- **Claude.ai:** [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
- **Console:** [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

Once listed, you can prompt Claude Code users to install your plugin directly from your CLI. See [Recommend your plugin from your CLI](https://code.claude.com/docs/en/plugin-hints).

For internal team plugins, host a private marketplace in a private repository. See [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces#private-repositories).

---

## Further Reading

| Topic | Link |
|---|---|
| Discover and install prebuilt plugins | [code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins) |
| Full plugin technical reference | [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference) |
| Agent skills guide | [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) |
| Custom subagents | [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) |
| Hooks guide | [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks) |
| MCP integration | [code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp) |
| Plugin marketplaces | [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) |
