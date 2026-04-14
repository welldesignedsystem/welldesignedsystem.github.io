+++
date = '2026-04-10T13:00:00+10:00'
draft = false
title = 'GitHub Copilot Notes'
tags = ['GitHub', 'Copilot', 'AI', 'Prompting', 'DevTools', 'Agents', 'LLM']
summary = "GitHub Copilot's prompt library unlocks a structured, repeatable way to guide AI assistance across your codebase—covering custom instructions, reusable prompt files, agent mode, and extensible skills for end-to-end AI-driven workflows."
+++

Here we explore GitHub Copilot and its prompt library—a powerful framework for structuring and reusing prompts to get consistent, high-quality AI assistance across a codebase.

> Source: https://docs.github.com/copilot/tutorials/customization-library

---

## What Are Customization Instructions?

The three types of Customization Instructions covered are:
- **Custom instructions** — persistent behavioral guidance injected into every interaction
- **Prompt files** — reusable, on-demand task prompts (public preview)
- **Custom agents** — specialized autonomous coding agents with a defined scope and tool access

> **Note (VS Code):** The VS Code docs also surface two additional customization types not covered in the GitHub docs library: **Agent Skills** and **Hooks**. These are described in their own sections below.

---

## The Three Customization Types

### Custom Instructions

Custom instructions are Markdown files whose content is automatically included in the context of every Copilot Chat interaction. You do not invoke them — they are always active once in place.

#### Instruction types by category

The VS Code docs distinguish two broad categories:

**Always-on instructions** — automatically included in every chat request. Best for project-wide coding standards, architecture decisions, and conventions that apply to all code. There are four types:

| Type | File | Scope |
|---|---|---|
| Repository-wide | `.github/copilot-instructions.md` | All files in the repo, all surfaces |
| `AGENTS.md` | `AGENTS.md` in workspace root or subfolders | All agents in the workspace (multi-agent support) |
| `CLAUDE.md` | `CLAUDE.md`, `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md`, or `CLAUDE.local.md` | Claude Code compatibility |
| Organization-level | Set in GitHub org settings | All org members in Copilot Chat on GitHub.com |

**File-based instructions** — conditionally applied based on glob patterns. Best for language-specific conventions, framework patterns, or rules that only apply to certain parts of your codebase:

| Type | File | Scope |
|---|---|---|
| Path-specific | `*.instructions.md` in `.github/instructions/` or custom locations | Files matching `applyTo` glob pattern |
| User-level | `~/.copilot/instructions/` or the instructions folder of your VS Code profile | Applies across all workspaces for that user |

---

#### 1. Repository-wide instructions (`.github/copilot-instructions.md`)

- A single file at `.github/copilot-instructions.md`.
- Applies to all files in the repository.
- The most broadly supported form — works across IDEs, GitHub.com chat, and the coding agent.

Use `copilot-instructions.md` for:
- Coding style and naming conventions that apply across the project
- Technology stack declarations and preferred libraries
- Architectural patterns to follow or avoid
- Security requirements and error handling approaches
- Documentation standards

---

#### 2. Path-specific instructions (`.instructions.md` files)

- One or more files named `NAME.instructions.md` inside the `.github/instructions/` directory (or other configured locations — see below).
- Each file has an optional YAML frontmatter block with supported fields:

| Field | Required | Description |
|---|---|---|
| `name` | No | Display name shown in the UI. Defaults to the file name. |
| `description` | No | Short description shown on hover in the Chat view. |
| `applyTo` | No | Glob pattern for automatic application (e.g. `**/*.py`). If omitted, the file is not applied automatically but can be manually attached. |

- Instructions only activate when Copilot is working with files that match the `applyTo` pattern.
- Multiple patterns are separated by commas.
- If both a path-specific file and `copilot-instructions.md` apply to the same file, instructions from both are used.
- Avoid conflicting instructions between them — Copilot's behavior when instructions conflict is non-deterministic.

**Supported in:** Copilot Chat in VS Code, Visual Studio, and the Copilot coding agent. _(Not supported in JetBrains, Xcode, GitHub.com chat, or mobile as of April 2026.)_

**Configuring custom file locations:** The default search location is `.github/instructions/`. You can configure additional locations via the `chat.instructionsFilesLocations` VS Code setting:

```json
"chat.instructionsFilesLocations": {
  ".github/instructions": true,
  ".claude/rules": true,
  "~/.copilot/instructions": false,
  "~/.claude/rules": false
}
```

VS Code searches all configured folders recursively, so you can organize files in subdirectories. For example:

```
.github/instructions/
  frontend/
    react.instructions.md
    accessibility.instructions.md
  backend/
    api-design.instructions.md
  testing/
    unit-tests.instructions.md
```

**Claude format compatibility:** For compatibility with Claude Code and other Claude-based tools, VS Code also detects `.instructions.md` files in `.claude/rules/` (workspace) and `~/.claude/rules/` (user). These use a `paths` property (array of globs) instead of `applyTo`.

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

**Referencing other files:** You can use standard Markdown links to reference other instruction files or URLs from within an instructions file (e.g. `Apply the [general coding guidelines](./general-coding.instructions.md) to all code.`).

**Referencing tools:** To reference agent tools in your instructions, use the `#tool:<tool-name>` syntax (e.g. `#tool:web/fetch`).

---

#### 3. `AGENTS.md` files

- VS Code automatically detects `AGENTS.md` at the workspace root and applies it to all chat requests — useful when you work with multiple AI agents and want a single instruction file recognized by all of them.
- Supports subfolder-level instructions using the experimental `chat.useNestedAgentsMdFiles` setting, which causes VS Code to search recursively in all subfolders for `AGENTS.md` files.
- Enable/disable support with the `chat.useAgentsMdFile` setting.

When to use `AGENTS.md` over `copilot-instructions.md`:
- You work with multiple AI coding agents and want one file recognized by all of them
- You want subfolder-level instructions in a monorepo

---

#### 4. `CLAUDE.md` files

VS Code automatically detects `CLAUDE.md` and applies it as always-on instructions, similar to `AGENTS.md`. This is specifically for compatibility with Claude Code or other Claude-based tools so a single file works across all of them.

VS Code searches for `CLAUDE.md` in these locations:

| Location | Description |
|---|---|
| Workspace root | `CLAUDE.md` at the root of your workspace |
| `.claude` folder | `.claude/CLAUDE.md` in your workspace |
| User home | `~/.claude/CLAUDE.md` for personal instructions across all projects |
| Local variant | `CLAUDE.local.md` for local-only instructions (not committed to version control) |

Enable/disable support with the `chat.useClaudeMdFile` setting.

---

#### 5. Personal instructions

- Set on GitHub.com under your profile picture → "Personal instructions".
- Apply only to you, only in Copilot Chat on GitHub.com.
- Good for quick personal testing before rolling something out to a team.

---

#### 6. Organization instructions

- Set in GitHub organization settings on GitHub.com.
- Apply to all organization members in Copilot Chat on GitHub.com.
- Do not affect IDE interactions.
- Enable discovery of org-level instructions in VS Code by setting `github.copilot.chat.organizationInstructions.enabled` to `true`.
- Learn how to add org-level instructions at the [GitHub documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-organization-instructions).

---
## VS Code Copilot possibilities 

#### Instruction priority (VS Code)

When multiple types of custom instructions exist, they are all provided to the AI. When conflicts occur, higher-priority instructions take precedence:

1. Personal instructions (user-level) — highest priority
2. Repository instructions (`.github/copilot-instructions.md` or `AGENTS.md`)
3. Organization instructions — lowest priority

---

#### Syncing user instructions across devices

VS Code can sync your user instructions files across multiple devices using Settings Sync. Run **Settings Sync: Configure** from the Command Palette and enable **Prompts and Instructions** from the sync list.

---

#### Generating instructions with AI

**Generate workspace-wide instructions:** Type `/init` in the chat input to analyze your workspace and generate a `.github/copilot-instructions.md` tailored to your project. VS Code discovers existing AI conventions, analyzes your project structure, and generates comprehensive instructions.

**Generate a targeted instructions file:** Type `/create-instruction` and describe the convention you want to enforce (e.g. "always use tabs and single quotes in this project"). The agent asks clarifying questions and generates an `.instructions.md` file with the appropriate `applyTo` pattern.

**Extract instructions from conversation:** Ask "extract an instruction from this" mid-conversation to capture a correction as a project convention (e.g. after you corrected the agent's import style).

The official recommended prompt for `/init` from the GitHub Docs is:

```
Your task is to "onboard" this repository to a coding agent by adding a
.github/copilot-instructions.md file. It should contain information describing
how the agent, seeing the repo for the first time, can work most efficiently.

## Goals
- Document existing project structure and tech stack.
- Ensure established practices are followed.
- Minimize bash command and build failures.

## Limitations
- Instructions must be no longer than 2 pages.
- Instructions should be broadly applicable to the entire project.

## Guidance
Ensure you include the following:
- A summary of what the app does.
- The tech stack in use
- Coding guidelines
- Project structure
- Existing tools and resources

## Steps to follow
- Perform a comprehensive inventory of the codebase. Search for and view:
  - README.md, CONTRIBUTING.md, and all other documentation files.
  - Search the codebase for indications of workarounds like 'HACK', 'TODO', etc.
- All scripts, particularly those pertaining to build and repo or environment setup.
- All project files.
- All configuration and linting files.

## Validation
Use the newly created instructions file to implement a sample feature. Use
learnings from any failures or errors to further refine the instructions file.
```

---

#### Diagnostics: why isn't my instructions file being applied?

Use the chat customization diagnostics view to see all loaded instruction files and any errors. Right-click in the Chat view and select **Diagnostics**.

Common reasons instructions fail to apply:
- Wrong file location — `.github/copilot-instructions.md` must be in `.github/` at the workspace root. `*.instructions.md` files must be in a folder listed in `chat.instructionsFilesLocations` (or its subdirectories).
- `applyTo` glob doesn't match the files being worked on. Check the **References** section in the chat response to confirm which instructions were used.
- Relevant settings are disabled. Check: `chat.includeApplyingInstructions` (pattern-based), `chat.includeReferencedInstructions` (Markdown-linked instructions), `chat.useAgentsMdFile` (AGENTS.md).

---

### Prompt Files

Prompt files (currently **public preview**, subject to change) are reusable, on-demand task prompts stored in your repository. Unlike custom instructions, they only run when you explicitly invoke them.

- **File location:** `.github/prompts/`
- **File extension:** `.prompt.md`
- **Supported in:** VS Code, Visual Studio, JetBrains IDEs only.

**Frontmatter fields:**

| Field | Description |
|---|---|
| `mode` | `'ask'` (default chat), `'edit'` (edit mode), or `'agent'` (agent mode) |
| `description` | A human-readable label shown in the IDE |
| `tools` | Array of tools available to the prompt when running in agent mode |

> **Note:** The original GitHub docs library used `agent: 'agent'` in the frontmatter. The current VS Code docs use `mode: 'agent'` (or `'ask'`/`'edit'`). Use `mode` in new files.

**Dynamic input variables** use this syntax: `${input:variableName:placeholder text}`. When you invoke the prompt, Copilot pauses to ask you for each variable before running.

**How to invoke in VS Code:**
- Open Copilot Chat, type `/filename` (the filename without `.prompt.md`).
- Or use the "Attach context" icon → "Prompt..." and select the file.
- Or type `/instructions` in the chat input to open the Configure Instructions and Rules menu.
- You can optionally attach additional files for context alongside the prompt.

**Generate a prompt file with AI:** Type `/create-prompt` in chat and describe the workflow you want to automate. The agent generates a `.prompt.md` file for you.

**Referencing instructions from prompt files:** Prompt files can reference instructions files using Markdown links, keeping prompts clean and avoiding duplication.

---

### Custom Agents

Custom agents are specialized versions of the Copilot coding agent, configured with a defined persona, scope, and tool access. They maintain their full configuration throughout an entire autonomous session — reading files, searching the codebase, editing files, and opening pull requests.

The distinction:
- Custom instructions shape all interactions broadly
- Prompt files execute a one-time task
- Custom agents are **selected for a specific task and maintain their configuration for the entire autonomous workflow**

**File location:**
- Repository agents: `.github/agents/` (must be committed to the default branch to appear in the UI at `github.com/copilot/agents`)
- VS Code local/user agents: configured via `chat.agentFilesLocations` setting

**File extension:** `.agent.md`

> **Note:** Custom agents were previously called "custom chat modes" in VS Code (files named `.chatmode.md`). The terminology was updated to `.agent.md`. If you have existing `.chatmode.md` files, rename them to `.agent.md`.

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
| `tools` | Array of tools the agent may use. Available tools include `read`, `search`, `edit`, `web/fetch`, `search/codebase`, `search/usages`, and others. |
| `model` | Optional. Specify preferred model(s) in priority order. |
| `handoffs` | Optional. Define transitions to other agents. `send: true` auto-submits the handoff prompt; `send: false` pre-fills it for the user to review. |

The body of the file is the agent's system prompt. It defines the agent's role, capabilities, and explicit limitations. A well-designed agent profile always includes a clear "do NOT" section to prevent scope creep.

**How to use a custom agent (GitHub cloud agent):**
1. Commit the `.agent.md` file to the default branch
2. Go to `https://github.com/copilot/agents`
3. Select your repository, branch, and agent from the dropdowns
4. Type a task and press Enter — the agent runs autonomously and creates a PR
5. Track progress in real time via the session view

**How to use a custom agent (VS Code):**
1. Select the agent from the agents dropdown in the Chat view
2. Type a task and start the session

**Enable org-level custom agents in VS Code:** Set `github.copilot.chat.organizationCustomAgents.enabled` to `true`.

**VS Code settings for custom agents**
For local or repo-shared custom agents, add these settings to `.vscode/settings.json` or your user settings file:

```json
{
  "github.copilot.chat.organizationCustomAgents.enabled": true,
  "chat.agentFilesLocations": [
    ".github/agents"
  ],
  "github.copilot.chat.commitMessageGeneration.instructions": [
    { "file": ".github/commit-instructions.md" }
  ]
}
```

- `github.copilot.chat.organizationCustomAgents.enabled`: enables discovery of org-level custom agents in VS Code
- `chat.agentFilesLocations`: points VS Code to local or workspace agent files
- `github.copilot.chat.commitMessageGeneration.instructions`: example of a similar config style using a repo file reference

If you also want org-level instructions enabled, add:

```json
{
  "github.copilot.chat.organizationInstructions.enabled": true
}
```

**Generate an agent with AI:** Type `/create-agent` in chat and describe the agent's role to generate a `.agent.md` file.

---

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

## Comparison of Customization Types - Prompts File vs. Agent Skills

| Feature | Prompt File (`.prompt.md`) | Agent Skill (`SKILL.md`) |
|---|---|---|
| **File location** | `.github/prompts/` | `skills/<skill-name>/SKILL.md` |
| **How it's triggered** | Manually invoked via `/filename` in chat | Auto-invoked by Copilot based on intent matching, or manually via `/skill-name` |
| **Purpose** | One-off, on-demand task execution | Reusable capability packaged for sharing across tools |
| **Scope** | Single task run per invocation | Persistent capability available across sessions |
| **Supports input variables** | Yes — `${input:varName:placeholder}` syntax | No |
| **IDE support** | VS Code, Visual Studio, JetBrains only | VS Code, GitHub Copilot CLI, coding agent, Claude Code |
| **Frontmatter: mode** | ✅ (`ask`, `edit`, `agent`) | ❌ |
| **Frontmatter: tools** | ✅ | ❌ |
| **Frontmatter: model** | ✅ | ❌ |
| **Frontmatter: user-invocable** | ❌ | ✅ |
| **Frontmatter: disable-model-invocation** | ❌ | ✅ |
| **Progressive loading** | No | Yes — only `name`/`description` loaded at startup; full body loaded on demand |
| **Generate with AI** | `/create-prompt` | `/create-skill` |
| **Status** | Public preview | GA (open standard) |

---

## All 19 Library Examples

### Custom Instructions (9 examples)

---

#### 1. Your First Custom Instructions
**Complexity:** Simple

A minimal introduction demonstrating the impact instructions have on code generation.

```markdown
When writing functions, always:
- Add descriptive JSDoc comments
- Include input validation
- Use early returns for error conditions
- Add meaningful variable names
- Include at least one example usage in comments
```

**How to test:** Add as personal instructions on GitHub.com (profile picture → Personal instructions), then ask: `Create a JavaScript function that calculates the area of a circle`. Without instructions you get a bare function. With them, Copilot adds JSDoc, input validation, early returns, and an example usage comment.

---

#### 2. Concept Explainer
**Complexity:** Simple

Instructs Copilot to explain technical concepts progressively — starting from analogies, building toward technical detail, and always connecting theory to real problems.

```markdown
When explaining technical concepts:

## Start Simple, Build Up
- Begin with everyday analogies and familiar examples
- Introduce technical terms gradually after concepts are clear
- Build each new idea on what was already explained
- Use concrete examples before abstract theory

## Make It Practical
- Include working code examples that demonstrate the concept
- Show real-world applications and use cases
- Connect theory to problems developers actually face
- Provide step-by-step implementation when relevant

## Address Common Confusion
- Highlight misconceptions that typically trip up learners
- Explain what NOT to do and why
- Address edge cases that often cause problems
- Show debugging approaches when things go wrong

## Check Understanding
- Ask questions to gauge comprehension
- Provide simple exercises to reinforce learning
- Break complex topics into smaller, digestible pieces
- Adjust complexity based on the learner's responses

Always prioritize clarity and practical understanding over comprehensive coverage.
```

---

#### 3. Debugging Tutor
**Complexity:** Simple

Tells Copilot to act as a debugging teacher — guiding users through systematic methodology rather than handing them direct answers. Builds long-term problem-solving skills.

```markdown
When helping with debugging, guide users through:

## Systematic Approach
- Start by reproducing the issue consistently
- Read error messages carefully—they contain crucial clues
- Use print statements or debugger to trace execution flow
- Test one change at a time to isolate what fixes the problem

## Key Debugging Questions
- What exactly is happening vs. what you expected?
- When did this problem start occurring?
- What was the last change made before the issue appeared?
- Can you create a minimal example that reproduces the problem?

## Common Investigation Steps
1. Check logs and error messages for specific details
2. Verify inputs and outputs at each step
3. Use debugging tools (breakpoints, step-through)
4. Search for similar issues in documentation and forums

## Teaching Approach
- Ask leading questions rather than giving direct answers
- Encourage hypothesis formation: "What do you think might cause this?"
- Guide toward systematic elimination of possibilities
- Help build understanding of the underlying problem, not just quick fixes
- Focus on teaching debugging methodology that users can apply independently to future problems
- Encourage defensive programming techniques to prevent common error categories
- Teach how to build automated tests that catch regressions and edge cases

## Teaching Through Debugging
- Use debugging sessions as opportunities to reinforce programming concepts
- Explain the reasoning behind each debugging step and decision
- Help learners understand code execution flow and data transformations
- Connect debugging exercises to broader software engineering principles
- Build pattern recognition skills for common problem categories

Always encourage curiosity and questioning rather than providing quick fixes, building long-term debugging skills and confidence.
```

---

#### 4. Code Reviewer
**Complexity:** Simple

Directs Copilot to focus code reviews on security, performance, and code quality — with constructive, reasoned feedback.

```markdown
When reviewing code, focus on:

## Security Critical Issues
- Check for hardcoded secrets, API keys, or credentials
- Look for SQL injection and XSS vulnerabilities
- Verify proper input validation and sanitization
- Review authentication and authorization logic

## Performance Red Flags
- Identify N+1 database query problems
- Spot inefficient loops and algorithmic issues
- Check for memory leaks and resource cleanup
- Review caching opportunities for expensive operations

## Code Quality Essentials
- Functions should be focused and appropriately sized
- Use clear, descriptive naming conventions
- Ensure proper error handling throughout

## Review Style
- Be specific and actionable in feedback
- Explain the "why" behind recommendations
- Acknowledge good patterns when you see them
- Ask clarifying questions when code intent is unclear

Always prioritize security vulnerabilities and performance issues that could impact users.
```

---

#### 5. GitHub Actions Helper
**Complexity:** Simple | **Path-specific:** `.github/workflows/**/*.yml`

A path-specific file that activates only when Copilot works with GitHub Actions workflow YAML files. Enforces security (secret handling, SHA-pinning), performance (caching, timeouts), and best-practice patterns.

```markdown
---
applyTo: ".github/workflows/**/*.yml"
---

When generating or improving GitHub Actions workflows:

## Security First
- Use GitHub secrets for sensitive data, never hardcode credentials
- Pin third-party actions to specific commits by using the SHA value
  (e.g., `- uses: owner/some-action@a824008085750b8e136effc585c3cd6082bd575f`)
- Configure minimal permissions for GITHUB_TOKEN required for the workflow

## Performance Essentials
- Cache dependencies with `actions/cache` or built-in cache options
- Add `timeout-minutes` to prevent hung workflows
- Use matrix strategies for multi-environment testing

## Best Practices
- Use descriptive names for workflows, jobs, and steps
- Include appropriate triggers: `push`, `pull_request`, `workflow_dispatch`
- Add `if: always()` for cleanup steps that must run regardless of failure
```

---

#### 6. Pull Request Assistant
**Complexity:** Simple

A comprehensive instructions set for both writing PR descriptions and reviewing PRs.

---

#### 7. Issue Manager
**Complexity:** Simple

Instructions for writing well-structured GitHub issues — for bugs, feature requests, and issue responses — with clear titles, reproduction steps, acceptance criteria, and consistent triage templates.

---

#### 8. Accessibility Auditor
**Complexity:** Intermediate | **Path-specific:** `**/*.html`

A path-specific instructions file for HTML files. Directs Copilot to evaluate code for WCAG accessibility compliance — checking ARIA attributes, keyboard navigation, color contrast, semantic HTML, screen reader compatibility — and to generate actionable remediation suggestions.

---

#### 9. Testing Automation
**Complexity:** Advanced | **Path-specific:** `tests/**/*.py`

The most advanced custom instructions example in the library. Path-specific for Python test files. Embeds a concrete pytest code pattern directly in the instructions to teach Copilot the exact conventions to follow.

```markdown
---
applyTo: "tests/**/*.py"
---

When writing Python tests:

## Test Structure Essentials
- Use pytest as the primary testing framework
- Follow AAA pattern: Arrange, Act, Assert
- Write descriptive test names that explain the behavior being tested
- Keep tests focused on one specific behavior

## Key Testing Practices
- Use pytest fixtures for setup and teardown
- Mock external dependencies (databases, APIs, file operations)
- Use parameterized tests for testing multiple similar scenarios
- Test edge cases and error conditions, not just happy paths

## Example Test Pattern
import pytest
from unittest.mock import Mock, patch

class TestUserService:
    @pytest.fixture
    def user_service(self):
        return UserService()

    @pytest.mark.parametrize("invalid_email", ["", "invalid", "@test.com"])
    def test_should_reject_invalid_emails(self, user_service, invalid_email):
        with pytest.raises(ValueError, match="Invalid email"):
            user_service.create_user({"email": invalid_email})

    @patch('src.user_service.email_validator')
    def test_should_handle_validation_failure(self, mock_validator, user_service):
        mock_validator.validate.side_effect = ConnectionError()

        with pytest.raises(ConnectionError):
            user_service.create_user({"email": "test@example.com"})
```

---

### Prompt Files (6 examples)

All stored in `.github/prompts/*.prompt.md`. Available in VS Code, Visual Studio, and JetBrains only.

---

#### 10. Your First Prompt File
**Complexity:** Simple | **Filename:** `explain-code.prompt.md`

```markdown
---
mode: 'agent'
description: 'Generate a clear code explanation with examples'
---

Explain the following code in a clear, beginner-friendly way:

Code to explain: ${input:code:Paste your code here}
Target audience: ${input:audience:Who is this explanation for? (e.g., beginners, intermediate developers, etc.)}

Please provide:

* A brief overview of what the code does
* A step-by-step breakdown of the main parts
* Explanation of any key concepts or terminology
* A simple example showing how it works
* Common use cases or when you might use this approach

Use clear, simple language and avoid unnecessary jargon.
```

**How to test:** Save the file, open Copilot Chat in VS Code, type `/explain-code`. Copilot switches to agent mode and prompts you for the `code` and `audience` variables.

Key concepts demonstrated: `${input:variableName:placeholder}` syntax, `mode: 'agent'` frontmatter, the `description` field.

---

#### 11. Create README
**Complexity:** Simple | **Filename:** `create-readme.prompt.md`

Reusable across repositories. Copilot scans the codebase and generates a structured README covering: project description, prerequisites, installation, usage examples, contributing guide, and license section.

---

#### 12. Onboarding Plan
**Complexity:** Simple | **Filename:** `onboarding-plan.prompt.md`

Generates a personalized onboarding plan for a new team member joining a project.

---

#### 13. Document API
**Complexity:** Advanced | **Filename:** `document-api.prompt.md`

Generates comprehensive API documentation from source code. Covers endpoint descriptions, request/response schemas, authentication requirements, error codes, and usage examples.

---

#### 14. Review Code
**Complexity:** Advanced | **Filename:** `review-code.prompt.md`

Performs a structured code review with actionable feedback. Analyzes for correctness, performance, security vulnerabilities, readability, test coverage gaps, and adherence to conventions.

---

#### 15. Generate Unit Tests
**Complexity:** Intermediate | **Filename:** `generate-unit-tests.prompt.md`

Takes source code as input and generates unit tests covering happy paths, edge cases, boundary conditions, and error scenarios.

---

### Custom Agents (4 examples)

All stored in `.github/agents/*.agent.md`. Must be on the **default branch**. Used at `github.com/copilot/agents`.

---

#### 16. Your First Custom Agent — README Specialist
**Complexity:** Simple | **Filename:** `readme-specialist.agent.md`

```markdown
---
name: readme-specialist
description: Specialized agent for creating and improving README files and project documentation
tools: ['read', 'search', 'edit']
---

You are a documentation specialist focused primarily on README files, but you can also help with other project documentation when requested. Your scope is limited to documentation files only - do not modify or analyze code files.

**Primary Focus - README Files:**
- Create and update README.md files with clear project descriptions
- Structure README sections logically: overview, installation, usage, contributing
- Write scannable content with proper headings and formatting
- Add appropriate badges, links, and navigation elements
- Use relative links (e.g., `docs/CONTRIBUTING.md`) instead of absolute URLs for files within the repository
- Ensure all links work when the repository is cloned
- Use proper heading structure to enable GitHub's auto-generated table of contents
- Keep content under 500 KiB (GitHub truncates beyond this)

**Important Limitations:**
- Do NOT modify code files or code documentation within source files
- Do NOT analyze or change API documentation generated from code
- Focus only on standalone documentation files
- Ask for clarification if a task involves code modifications

Always prioritize clarity and usefulness. Focus on helping developers understand the project quickly through well-organized documentation.
```

---

#### 17. Implementation Planner
**Complexity:** Simple | **Filename:** `implementation-planner.agent.md`

Breaks down a feature request or user story into actionable implementation tasks and creates a detailed plan. The agent focuses on planning only — it does not write code.

---

#### 18. Bug Fix Teammate
**Complexity:** Simple | **Filename:** `bug-fix-teammate.agent.md`

Identifies critical bugs in the project and implements targeted, minimal fixes.

---

#### 19. Cleanup Specialist
**Complexity:** Simple | **Filename:** `cleanup-specialist.agent.md`

Cleans up messy code across both code and documentation files without changing any external behavior.

---

## VS Code-Specific Customization Types (Not in the GitHub Library)

The VS Code docs expose two additional customization types beyond what the 19 GitHub library examples cover.

### Agent Skills

Agent skills are reusable capabilities that can be packaged and shared across VS Code, GitHub Copilot CLI, and the GitHub Copilot coding agent. Generate a skill file with `/create-skill` in chat.

### Hooks

Hooks execute custom commands at specific events in the agent workflow — for automation and policy enforcement. Generate a hook file with `/create-hook` in chat.

### VS Code Chat Customizations editor

All customization types are discoverable and manageable in one place via the **Chat Customizations editor** (Preview). Open it by running **Chat: Open Chat Customizations** from the Command Palette (⇧⌘P / Ctrl+Shift+P).

The editor lets you:
- View all active instructions, prompt files, agents, skills, and hooks
- Create new files for each type using the dropdown
- Switch between agent types (local agents, Copilot CLI, Claude agent) to manage their customizations separately
- View the source of any instruction file (hover over it in the list)

You can also use slash commands in chat to generate any type of customization file directly:

| Command | Output |
|---|---|
| `/init` | Workspace-wide `copilot-instructions.md` |
| `/create-instructions` | Targeted `.instructions.md` file |
| `/create-prompt` | `.prompt.md` file |
| `/create-agent` | `.agent.md` file |
| `/create-skill` | Agent skill file |
| `/create-hook` | Hook file |

---

## Complete Frontmatter Field Reference

Every customization file type uses YAML frontmatter. Here is the full verified reference for all fields across all file types, sourced from the official VS Code docs, GitHub Docs, and the Agent Skills spec.

---

### `.instructions.md` — Instruction Files

| Field | Required | Description |
|---|---|---|
| `name` | No | Display name shown in the UI. Defaults to the filename. |
| `description` | No | Short description shown on hover in the Chat view. |
| `applyTo` | No | Glob pattern (comma-separated for multiple) for automatic application relative to workspace root. Use `**` to apply to all files. If omitted, the file is not applied automatically but can be manually attached. |

> **Claude format note:** When using `.instructions.md` files in the `.claude/rules/` directory (Claude Code compatibility), use `paths` instead of `applyTo`. `paths` accepts an array of glob patterns and defaults to `**` when omitted.

**Full example:**
```yaml
---
name: 'TypeScript Standards'
description: 'Coding conventions for TypeScript and React files'
applyTo: '**/*.{ts,tsx}'
---
```

---

### `.prompt.md` — Prompt Files

| Field | Required | Description |
|---|---|---|
| `description` | No | Short description shown in the IDE picker. |
| `name` | No | The slash command name used after `/` in chat. Defaults to the filename without `.prompt.md`. |
| `argument-hint` | No | Hint text shown in the chat input field to guide users on how to interact with the prompt (e.g. `component-name`). |
| `mode` | No | The agent mode: `ask` (default chat), `edit` (edits mode), `agent` (full agent mode), or the name of a custom agent. Defaults to current mode; defaults to `agent` if `tools` are specified. **Note:** older examples used `agent: 'agent'` — `mode` is the current field name. |
| `model` | No | The language model to use (e.g. `GPT-4o`, `Claude Sonnet 4.5 (copilot)`). Defaults to the model currently selected in the model picker. |
| `tools` | No | Array of tool names available for this prompt. Can include built-in tools, tool sets, MCP tools, or extension-contributed tools. To include all tools from an MCP server, use `<server-name>/*` format. If a listed tool is unavailable, it is ignored. |

> **`argument-hint` note:** This field is officially documented for prompt files and is used across the Copilot CLI, Claude Code, and VS Code. It provides hint text in the chat input showing the expected argument format. It is **not** the same as `${input:varName}` variable substitution — it's purely a UI label.

> **`mode` vs `agent`:** The old `agent: 'agent'` frontmatter still appears in many examples but `mode` is the current official field. `mode` supports four values: `ask`, `edit`, `agent`, and a custom agent name.

**Full example:**
```yaml
---
name: create-component
description: 'Generate a new React form component'
argument-hint: component-name
mode: agent
model: GPT-4o
tools: ['search/codebase', 'vscode/askQuestions', 'edit']
---
```

---

### `.agent.md` — Custom Agents (VS Code)

| Field | Required | Description |
|---|---|---|
| `name` | No | Display name in the UI. Defaults to the filename. |
| `description` | Yes | Short description of the agent's role, shown in dropdowns. |
| `tools` | No | Array of tools the agent may use. If omitted, all tools are available. Unavailable tools are ignored. |
| `model` | No | Preferred model or array of models tried in order (e.g. `['Claude Opus 4.5', 'GPT-5.2']`). |
| `handoffs` | No | Array of agent transition definitions (see below). VS Code / IDE only — ignored by GitHub.com cloud agent. |

**`handoffs` sub-fields:**

| Sub-field | Required | Description |
|---|---|---|
| `label` | Yes | Button label shown in the Chat view. |
| `agent` | Yes | Target agent name or `agent` for the default coding agent. |
| `prompt` | No | Pre-filled prompt text sent to the target agent. |
| `send` | No | `true` to auto-submit the prompt; `false` (default) to pre-fill it for user review. |

> **`argument-hint` on agents:** The field exists in the shared agent/command format used across Copilot CLI and Claude Code plugins, but it is **not** a documented VS Code custom agent field and is noted as unsupported in Copilot cloud agents on GitHub.com.

**Full example:**
```yaml
---
name: Planner
description: Generate an implementation plan for new features or refactoring existing code.
tools: ['web/fetch', 'search/codebase', 'search/usages']
model: ['Claude Opus 4.5', 'GPT-5.2']
handoffs:
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
---
```

---

### `.agent.md` — Custom Agents (GitHub.com Cloud Agent)

The GitHub Docs define a separate set of fields for `.agent.md` files used on GitHub.com (at `github.com/copilot/agents`). These differ from VS Code in two key ways: `mcp-servers` is supported, and `argument-hint`/`handoffs` are not.

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Agent name, used for deduplication across levels. |
| `description` | Yes | Short description shown in the GitHub UI. |
| `tools` | No | Array of tool names the agent may use. If omitted, all available tools are enabled. |
| `mcp-servers` | No | YAML block defining MCP servers for the agent (cloud agent only). Supports env var/secret substitution using `${{ secrets.NAME }}` and `${{ vars.NAME }}` syntax. |

> **`argument-hint` and `handoffs` are explicitly NOT supported** for the GitHub.com cloud agent. Per the GitHub Docs: "The `argument-hint` and `handoffs` properties from VS Code and other IDE custom agents are currently not supported for Copilot cloud agent on GitHub.com. They are ignored to ensure compatibility."

> **Body length limit:** The agent system prompt body can be a maximum of **30,000 characters** for the GitHub.com cloud agent.

**Full example (cloud agent with MCP):**
```yaml
---
name: my-custom-agent-with-mcp
description: Custom agent with an MCP server configured
tools: ['tool-a', 'tool-b', 'custom-mcp/tool-1']
mcp-servers:
  custom-mcp:
    type: 'local'
    command: 'some-command'
    args: ['--arg1', '--arg2']
    tools: ["*"]
    env:
      ENV_VAR_NAME: ${{ secrets.COPILOT_MCP_ENV_VAR_VALUE }}
---
```

---

### `SKILL.md` — Agent Skills

| Field | Required | Description |
|---|---|---|
| `name` | Yes | The skill name. **Must match the parent directory name exactly** (e.g. if the directory is `skills/my-skill/`, name must be `my-skill`). Skills with a mismatched name are not loaded. |
| `description` | Yes | Describes what the skill does and when to use it. This is what Copilot reads at startup to decide when to activate the skill — write it as trigger guidance. |
| `user-invocable` | No | Controls whether the skill appears in the `/` slash command menu. Default: `true`. |
| `disable-model-invocation` | No | When `true`, prevents Copilot from automatically invoking the skill based on intent matching. Users can still trigger it manually via `/skill-name`. Default: `false`. |

> **Progressive disclosure:** At startup, only `name` and `description` are loaded (level 1). When relevant, the full SKILL.md body is loaded (level 2). Additional files in the skill directory are only loaded if referenced in the body (level 3). This keeps context usage efficient regardless of how many skills are installed.

> **Open standard:** Skills work across GitHub Copilot in VS Code, GitHub Copilot CLI, the Copilot coding agent, and Claude Code.

**Full example:**
```yaml
---
name: webapp-testing
description: Guide for testing web applications using Playwright. Use this when asked to create or run browser-based tests.
user-invocable: true
disable-model-invocation: false
---
```

---

### Field Cross-Reference: Which fields work where

| Field | `.instructions.md` | `.prompt.md` | `.agent.md` (VS Code) | `.agent.md` (GitHub.com) | `SKILL.md` |
|---|:---:|:---:|:---:|:---:|:---:|
| `name` | ✅ | ✅ | ✅ | ✅ | ✅ (required, must match dir) |
| `description` | ✅ | ✅ | ✅ | ✅ | ✅ (required) |
| `applyTo` | ✅ | — | — | — | — |
| `mode` | — | ✅ | — | — | — |
| `model` | — | ✅ | ✅ | — | — |
| `tools` | — | ✅ | ✅ | ✅ | — |
| `argument-hint` | — | ✅ | ⚠️ CLI/Claude only | ❌ ignored | — |
| `handoffs` | — | — | ✅ | ❌ ignored | — |
| `mcp-servers` | — | — | — | ✅ | — |
| `user-invocable` | — | — | — | — | ✅ |
| `disable-model-invocation` | — | — | — | — | ✅ |

> ⚠️ = defined in the broader cross-agent spec but not a first-class VS Code IDE field

---

### Input variable syntax (prompt files and instructions body)

Two syntaxes exist for accepting user input:

**1. `${input:varName}` / `${input:varName:placeholder}` syntax**
Used in the body of `.prompt.md` files (and supported in instruction bodies). When the prompt is invoked, Copilot pauses and asks for each variable.

```markdown
Explain ${input:code:Paste your code here} to a ${input:audience:beginner or expert}.
```

**2. `vscode/askQuestions` tool**
An alternative approach: add `vscode/askQuestions` to the `tools` array in frontmatter, then reference `#tool:vscode/askQuestions` in the body to ask the user for input interactively during execution.

```yaml
tools: ['vscode/askQuestions', 'edit']
```
```markdown
Use #tool:vscode/askQuestions to ask for the component name and fields if not provided.
```

---

## Important Caveats

**Prompt files are public preview** as of April 2026, subject to change, and only work in VS Code, Visual Studio, and JetBrains.

**Path-specific instructions** (using `applyTo`) are only supported in Copilot Chat in VS Code, Visual Studio, and the coding agent. JetBrains and Xcode support only the single `copilot-instructions.md` file.

**`AGENTS.md` and `CLAUDE.md`** are VS Code-specific always-on instruction formats. `AGENTS.md` is useful for multi-agent setups; `CLAUDE.md` is for Claude Code compatibility.

**Custom instructions are not taken into account for inline suggestions** as you type in the editor. They only apply to Copilot Chat interactions.

**Personal and organization instructions** only apply to Copilot Chat on GitHub.com. They do not affect any IDE.

**Custom agents require the coding agent feature** to be enabled for your organization. The `.agent.md` file must be merged to the default branch before it appears in the UI.

**Settings-based `codeGeneration` and `testGeneration` instructions are deprecated** in VS Code 1.102. Use file-based instructions instead.

**When both a path-specific file and `copilot-instructions.md` apply to the same file, both sets of instructions are used.** Avoid writing conflicting instructions across them.

**Base branch used for PR reviews:** Copilot code review uses instructions from the base branch of the PR (e.g. `main`), not the feature branch.

---

## Community Examples

Beyond the 19 official examples, GitHub maintains a community repository with additional material:

- **Awesome GitHub Copilot Customizations:** https://github.com/github/awesome-copilot
  - Instructions by language/scenario: `docs/README.instructions.md`
  - Prompt files: `docs/README.prompts.md`
  - Custom agents: `agents/` directory

---

# Best Practices & Design Patterns

> Sources:
> - https://docs.github.com/en/copilot/tutorials/use-custom-instructions (official GitHub Docs tutorial)
> - https://github.blog/ai-and-ml/github-copilot/5-tips-for-writing-better-custom-instructions-for-copilot/ (official GitHub Blog, September 2025)
> - https://awesome-copilot.github.com/learning-hub/defining-custom-instructions/ (GitHub's own Awesome Copilot community hub)
> - https://code.visualstudio.com/docs/copilot/customization/custom-instructions (VS Code official docs, March 2026)

---

## Important caveat before reading

Copilot is a probabilistic AI system. The same instructions can produce different results on different runs. The goal of all these practices is to **tilt the scales** — to make the outcome you want more likely, not to guarantee it.

---

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
information like passwords or API keys, and also check for security issues.
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

An "imperfect" instructions file delivers far more impact than no file at all. Instruction files should evolve over time, just like documentation. Experiment, iterate, and don't overthink the initial version.

---

## Structuring the Content of `copilot-instructions.md`

The official GitHub Blog recommends five sections every instructions file should include:

### Section 1: Project overview

The header of your instructions file should be the elevator pitch for your project.

```markdown
# Contoso Companions

This is a website to support pet adoption agencies. Agencies can manage their
locations, available pets, and publicize events. Potential adopters can search
for pets in their area and submit adoption applications.
```

### Section 2: Tech stack

List the technologies in use — backend, frontend, testing. This prevents Copilot from generating code for the wrong framework.

```markdown
## Tech Stack

### Backend
- Flask for the API
- PostgreSQL with SQLAlchemy as the ORM

### Frontend
- Astro for core site and routing
- Svelte for interactivity
- TypeScript for all frontend code

### Testing
- pytest for Python unit tests
- Vitest for TypeScript
- Playwright for end-to-end tests
```

### Section 3: Coding guidelines

Explicit rules about how code should be written — naming conventions, formatting, patterns to use or avoid.

```markdown
## Coding Guidelines

- Always use type hints in any language that supports them
- JavaScript/TypeScript must use semicolons
- Unit tests are required and must pass before a PR can merge
- Follow RESTful API design principles
- Always follow good security practices
- Use scripts to perform actions when available
```

### Section 4: Project structure

List what's in each directory. This saves Copilot exploration time.

```markdown
## Project Structure

- server/     : Flask backend
  - models/   : SQLAlchemy ORM models
  - routes/   : API endpoints organized by resource
  - tests/    : Unit tests
- client/     : Astro/Svelte frontend
  - src/components/ : Reusable Svelte components
  - src/pages/      : Astro pages and routes
- scripts/    : Development, deployment, and testing scripts
- docs/       : Project documentation — kept in sync at all times
```

### Section 5: Available resources and tools

Point Copilot to scripts, MCP servers, and other tools it can use.

```markdown
## Resources

- scripts/start-app.sh     : Installs all libraries and starts the app
- scripts/test-project.sh  : Runs unit and end-to-end tests
- MCP servers:
  - Playwright: For generating tests or interacting with the site
  - GitHub: For interacting with the repository and backlog
```

---

## Organizing Instructions Across Multiple Files

### Pattern: Repository-wide + path-specific split

Use `copilot-instructions.md` for concerns that apply to the **entire codebase**, and path-specific `*.instructions.md` files for **language- or directory-specific** rules.

Recommended layout:

```
.github/
  copilot-instructions.md           ← General: security, error handling, docs

.github/instructions/
  python.instructions.md            ← Python-only (applyTo: "**/*.py")
  typescript.instructions.md        ← TypeScript-only (applyTo: "**/*.{ts,tsx}")
  frontend.instructions.md          ← React components (applyTo: "src/components/**/*.{tsx,jsx}")
  api.instructions.md               ← API routes (applyTo: "src/routes/**")
```

**Use `copilot-instructions.md` for:**
- General team standards
- Universal security requirements
- Cross-cutting concerns (error handling, logging philosophy)
- Documentation expectations

**Use path-specific files for:**
- Language-specific naming conventions and style
- Framework-specific patterns (React, Flask, etc.)
- Technology-specific security concerns
- Different rules for different parts of the codebase

### Recommended file structure template

```markdown
---
applyTo: "**/*.{js,ts}"   # Only needed for path-specific files
---

# [Technology or Domain] Guidelines

## Purpose
Brief statement of what this file covers and when these instructions apply.

## Naming Conventions
- Rule 1
- Rule 2

## Code Style
- Style rule 1

## Error Handling
- How to handle errors
- What to avoid

## Security Considerations
- Security rule 1

## Testing Guidelines
- Testing expectation 1
```

---

## Testing and Iterating on Instructions

### Start minimal, iterate

1. Begin with 10–20 instructions covering your most important standards
2. Open a pull request and request a Copilot review
3. Observe which instructions Copilot follows reliably and which it misses
4. Add one new instruction at a time, test with a real PR, then refine

### Signs an instruction is not working

- It's vague or ambiguous — rewrite it to be specific and imperative
- The file is too long — the instruction may be past the 4,000-character limit
- Instructions conflict with each other — review and prioritize

### Avoiding common anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| `applyTo: '**'` for language-specific rules | Rules bleed into unrelated files | Scope to the relevant extension: `applyTo: '**/*.py'` |
| Instructions referencing deprecated libraries | Copilot generates outdated code | Review and update instructions when dependencies change |
| 2,000-line instruction file | Instructions past the 4,000-character limit are ignored by code review | Break into multiple focused files |
| Conflicting instructions across files | Non-deterministic behavior | Design complementary instructions; more specific patterns take priority |

---

## Custom Agent Design Patterns

### Always define explicit scope limits

Every agent profile in the official library includes a clear "do NOT" section. Without explicit scope limits, agents can drift into unintended areas of the codebase.

```markdown
**Important Limitations:**
- Do NOT modify code files or code documentation within source files
- Do NOT analyze or change API documentation generated from code
- Focus only on standalone documentation files
- Ask for clarification if a task involves code modifications
```

### Define escalation behavior

Agents should know what to do when they encounter something outside their scope rather than proceeding silently.

### Keep the tools array minimal

Only declare the tools the agent actually needs. An agent that only needs to read and search should not include `edit`.

### Use model preferences and handoffs for multi-agent workflows

Use the `model` field to specify preferred models in priority order. Use `handoffs` to create guided workflows between agents — for example, transitioning from a planning agent directly into an implementation agent with pre-filled context.

```yaml
handoffs:
  - label: Implement Plan
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false    # pre-fills the prompt for user review
```

### Separate planning agents from implementation agents

Having separate agents for planning and implementation makes each one more predictable and easier to review. The library's Implementation Planner demonstrates this: an agent that only reads the codebase and produces a plan, but never writes code.

---

## Key Hard Limits (from the Docs)

These are confirmed technical constraints, not style recommendations:

- **4,000 characters**: The maximum Copilot code review reads from any instruction file. Instructions beyond this are silently ignored for PR reviews. (Does not apply to Copilot Chat or the coding agent.)
- **~1,000 lines**: Recommended soft limit for any instruction file before quality starts degrading.
- **No external URL following**: Copilot cannot fetch external links in instructions. Copy relevant content directly into the file.
- **Both files applied when overlap occurs**: When a path-specific `.instructions.md` file and `copilot-instructions.md` both match the same file, both sets of instructions are used. Avoid writing contradictory instructions across them.
- **Base branch used for PR reviews**: Copilot code review uses the instructions from the base branch of the PR (e.g. `main`), not the feature branch. New instruction files must be merged before they affect reviews.
- **Inline suggestions unaffected**: Custom instructions do not apply to inline code suggestions (autocomplete). They apply to Copilot Chat interactions only.
