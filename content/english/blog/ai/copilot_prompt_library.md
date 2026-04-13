+++
date = '2026-04-10T13:00:00+10:00'
draft = false
title = 'GitHub Copilot Notes'
tags = ['GitHub', 'Copilot', 'AI', 'Prompting', 'DevTools', 'Agents', 'LLM']
summary = "GitHub Copilot's prompt library unlocks a structured, repeatable way to guide AI assistance across your codebase—covering custom instructions, reusable prompt files, agent mode, and extensible skills for end-to-end AI-driven workflows."
+++

Here we explore GitHub Copilot and it's prompt library—a powerful framework for structuring and reusing prompts to get consistent, high-quality AI assistance across codebase.

> Source: https://docs.github.com/copilot/tutorials/customization-library 

## What Is the Customization Library?

The three types of Customeization Library covered are:
- **Custom instructions** — persistent behavioral guidance injected into every interaction
- **Prompt files** — reusable, on-demand task prompts (public preview)
- **Custom agents** — specialized autonomous coding agents with a defined scope and tool access

---

## The Three Customization Types

### Custom Instructions

- Custom instructions are Markdown files whose content is automatically included in the context of every Copilot Chat interaction. 
- You do not invoke them — they are always active once in place. 

There are four scopes:

#### **Repository-wide instructions**:
- A single file at `.github/copilot-instructions.md`. 
- Applies to all files in the repository. 
- This is the most broadly supported form and works across IDEs, GitHub.com chat, and the coding agent.

#### **Path-specific instructions**:
- One or more files named `NAME.instructions.md` inside the `.github/` directory (optionally organized in subdirectories like `.github/instructions/`). 
- Each file must include a YAML frontmatter (_a way to identify metadata in Markdown files_) block with an `applyTo` glob pattern. 
- Instructions only activate when Copilot is working with files that match the pattern. 
- Currently supported in: **Copilot Chat in VS Code**, **Visual Studio**, and the **Copilot coding agent** (Not in JetBrains, Xcode, GitHub.com chat or mobile) as of April 2026.

```markdown
---
applyTo: "tests/**/*.py"
---
```

- Multiple patterns are separated by commas. 
- If both a path-specific file and `copilot-instructions.md` apply to the same file, instructions from both are used. 
- Avoid conflicting instructions between them — Copilot's behavior when instructions conflict is non-deterministic.

#### **Personal instructions** 
- Set on GitHub.com under your profile picture → "Personal instructions". 
- Apply only to you, only in Copilot Chat on GitHub.com. 
- Good for quick personal testing before rolling something out to a team.

#### **Organization instructions** 
- Set in organization settings on GitHub.com. 
- Apply to all organization members in Copilot Chat on GitHub.com. 
- Do not affect IDE interactions.

---

### Prompt Files

- Prompt files (currently **public preview**, subject to change) are reusable, on-demand task prompts stored in your repository. 
- Unlike custom instructions, they only run when you explicitly invoke them.
- File location: `.github/prompts/`  
- File extension: `.prompt.md`  
- Supported in: VS Code, Visual Studio, JetBrains IDEs only.
- **Frontmatter fields:**
  - `agent` — set to `'agent'` to run in agent mode
  - `description` — a human-readable label shown in the IDE
- **Dynamic input variables** use this syntax: `${input:variableName:placeholder text}`. 
  - When you invoke the prompt, Copilot pauses to ask you for each variable before running.
- **How to invoke in VS Code:** 
  - Open Copilot Chat, type `/filename` (the filename without `.prompt.md`). 
  - Or use the "Attach context" icon → "Prompt..." and select the file. 
  - You can optionally attach additional files for context alongside the prompt.

---

### Custom Agents

- Custom agents are specialized versions of the Copilot coding agent, configured with a defined persona, scope, and tool access. 
- They maintain their full configuration throughout an entire autonomous session — reading files, searching the codebase, editing files, and opening pull requests.
- The docs define the distinction: 
  - custom instructions shape all interactions broadly; 
  - prompt files execute a one-time task; 
  - custom agents are **selected for a specific task and maintain their configuration for the entire autonomous workflow**.
- File location: `.github/agents/`  
- File extension: `.agent.md`  
- Requirement: Must be committed to the repository's **default branch** to appear in the dropdown at `github.com/copilot/agents`.
- **Frontmatter:**
```yaml
---
name: agent-name
description: What this agent does (shown in the UI)
tools: ['read', 'search', 'edit']
---
```
- The `tools` array declares what actions the agent may take. The tools available and used in the library examples are `read`, `search`, and `edit`.
- The body of the file is the agent's system prompt. It defines the agent's role, capabilities, and explicit limitations. A well-designed agent profile always includes a clear "do NOT" section to prevent scope creep.
- **How to use a custom agent:**
  1. Commit the `.agent.md` file to the default branch
  2. Go to `https://github.com/copilot/agents`
  3. Select your repository, branch, and agent from the dropdowns
  4. Type a task and press Enter — the agent runs autonomously and creates a PR
  5. Track progress in real time via the session view

---

## File Location Reference

```
your-repo/
└── .github/
    ├── copilot-instructions.md          ← Repository-wide instructions (all surfaces)
    │
    ├── instructions/                    ← Optional subdirectory for path-specific files
    │   └── python-tests.instructions.md ← Requires applyTo: "glob" in frontmatter
    │                                       Supported: VS Code, Visual Studio, coding agent only
    │
    ├── prompts/
    │   ├── explain-code.prompt.md       ← Invoke with /explain-code in IDE chat
    │   └── create-readme.prompt.md      ← VS Code, Visual Studio, JetBrains only
    │
    └── agents/
        ├── readme-specialist.agent.md   ← Must be on default branch
        └── bug-fix-teammate.agent.md    ← Selected at github.com/copilot/agents
```

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

Directs Copilot to focus code reviews on security, performance, and code quality — with constructive, reasoned feedback. Includes an inline code example demonstrating the kind of readability improvement to suggest.

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

Always suggest changes to improve readability. For example, this suggestion seeks to make the code more readable and also makes the validation logic reusable and testable.

// Instead of:
if (user.email && user.email.includes('@') && user.email.length > 5) {
  submitButton.enabled = true;
} else {
  submitButton.enabled = false;
}

// Consider:
function isValidEmail(email) {
  return email && email.includes('@') && email.length > 5;
}

submitButton.enabled = isValidEmail(user.email);
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

## Example Pattern
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
```

---

#### 6. Pull Request Assistant
**Complexity:** Simple

A comprehensive instructions set for both writing PR descriptions and reviewing PRs. One of the most detailed examples in the library.

```markdown
When creating pull request descriptions or reviewing PRs:

## PR Description Template
**What changed**
- Clear summary of modifications and affected components
- Link to related issues or tickets

**Why**
- Business context and requirements
- Technical reasoning for approach taken

**Testing**
- [ ] Unit tests pass and cover new functionality
- [ ] Manual testing completed for user-facing changes
- [ ] Performance/security considerations addressed

**Breaking Changes**
- List any API changes or behavioral modifications
- Include migration instructions if needed

## Review Focus Areas
- **Security**: Check for hardcoded secrets, input validation, auth issues
- **Performance**: Look for database query problems, inefficient loops
- **Testing**: Ensure adequate test coverage for new functionality
- **Documentation**: Verify code comments and README updates

## Review Style
- Be specific and constructive in feedback
- Acknowledge good patterns and solutions
- Ask clarifying questions when code intent is unclear
- Focus on maintainability and readability improvements
- Always prioritize changes that improve security, performance, or user experience
- Provide migration guides for significant changes
- Update version compatibility information

### Deployment Requirements
- [ ] Database migrations and rollback plans
- [ ] Environment variable updates required
- [ ] Feature flag configurations needed
- [ ] Third-party service integrations updated
- [ ] Documentation updates completed

## Review Comment Format

Use this structure for consistent, helpful feedback:

**Issue:** Describe what needs attention
**Suggestion:** Provide specific improvement with code example
**Why:** Explain the reasoning and benefits

## Review Labels and Emojis
- 🔒 Security concerns requiring immediate attention
- ⚡ Performance issues or optimization opportunities
- 🧹 Code cleanup and maintainability improvements
- 📚 Documentation gaps or update requirements
- ✅ Positive feedback and acknowledgment of good practices
- 🚨 Critical issues that block merge
- 💭 Questions for clarification or discussion

Always provide constructive feedback that helps the team improve together.
```

---

#### 7. Issue Manager
**Complexity:** Simple | **Filename:** `issue-manager.instructions.md` (repository-wide or path-specific)

Instructions for writing well-structured GitHub issues — for bugs, feature requests, and issue responses — with clear titles, reproduction steps, acceptance criteria, and consistent triage templates.

```markdown
When creating or managing GitHub issues:

## Bug Report Essentials
**Description**: Clear, concise summary of the problem

**Steps to Reproduce**: Numbered list of exact actions that cause the issue

**Expected vs Actual Behavior**: What should happen vs what actually happens

**Environment**: OS, browser/client, app version, relevant dependencies

**Additional Context**: Screenshots, error logs, or stack traces

## Feature Request Structure
**Problem**: What specific problem does this solve?

**Proposed Solution**: Brief description of the suggested approach

**Use Cases**: 2-3 concrete examples of when this would be valuable

**Success Criteria**: How to measure if the feature works

## Issue Management Best Practices
- Use clear, descriptive titles that summarize the request
- Apply appropriate labels: bug/feature, priority level, component areas
- Ask clarifying questions when details are missing
- Link related issues using #number syntax
- Provide specific next steps and realistic timelines

## Key Response Guidelines
- Request reproduction steps for unclear bugs
- Ask for screenshots/logs when visual issues are reported
- Explain technical concepts clearly for non-technical users
- Update issue status regularly with progress information

Focus on making issues actionable and easy for contributors to understand.
```

---

#### 8. Accessibility Auditor
**Complexity:** Intermediate | **Path-specific:** `**/*.html` | **Filename:** `accessibility.instructions.md`

A path-specific instructions file for HTML files. Directs Copilot to evaluate code for WCAG accessibility compliance — checking ARIA attributes, keyboard navigation, color contrast, semantic HTML, screen reader compatibility �� and to generate actionable remediation suggestions.

```markdown
---
applyTo: "**/*.html"
---

When reviewing or writing HTML code:

## Semantic HTML Foundation
- Use proper heading hierarchy (h1, h2, h3...) — never skip levels
- Use semantic tags: `<nav>`, `<main>`, `<article>`, `<aside>` instead of generic divs
- Use `<button>` for clickable elements, not `<div onclick>` or `<span>`
- Use `<form>`, `<label>`, `<fieldset>` for all form controls
- Ensure form labels are properly associated with inputs via `for` and `id`

## ARIA Attributes & Landmark Roles
- Add `role="navigation"`, `role="main"`, `role="complementary"` when semantic tags aren't available
- Use `aria-label` or `aria-labelledby` for icon buttons and unlabeled controls
- Use `aria-describedby` to provide additional context when needed
- Use `aria-current="page"` on navigation links pointing to current page
- Use `aria-expanded` on toggles that show/hide content
- Use `aria-live="polite"` for dynamic content updates (search results, notifications)
- Never use ARIA to fix incorrect HTML — use semantic HTML first

## Keyboard Navigation
- Every interactive element must be reachable via Tab key
- Ensure logical tab order (left-to-right, top-to-bottom)
- Use `tabindex="0"` only when necessary for custom interactive components
- Avoid positive `tabindex` values (creates confusing tab order)
- Provide `tabindex="-1"` for programmatically focusable elements
- Test with keyboard only: Tab, Shift+Tab, Enter, Space, Arrow keys

## Color Contrast & Visual Design
- Maintain at least 4.5:1 contrast ratio for text on background
- Maintain at least 3:1 contrast ratio for UI components and graphical objects
- Never rely on color alone to convey information — use text, patterns, or icons
- Test with color blindness simulators (Coblis, Color Oracle)

## Screen Reader Compatibility
- Write alt text for all images:
  - Decorative images: `alt=""` (empty)
  - Informative images: descriptive, concise text (under 125 characters)
  - Complex images/diagrams: provide a description link nearby or use `<figure>` with `<figcaption>`
  - Icons: describe the action or meaning, not the visual shape

Good alt text examples:
```
<!-- Incorrect (too literal) -->
<img src="chart.png" alt="Bar chart">

<!-- Correct (describes the data) -->
<img src="chart.png" alt="Sales revenue by quarter: Q1 $50K, Q2 $75K, Q3 $90K, Q4 $120K">

<!-- Icon example -->
<button><i class="icon-trash"></i></button> <!-- Missing alt/aria-label -->
<button aria-label="Delete item"><i class="icon-trash"></i></button> <!-- Correct -->
```

- Use `<caption>` and `<thead>/<tbody>/<tfoot>` for data tables
- Avoid using tables for layout — use CSS Grid or Flexbox instead
- Test with screen readers: NVDA (Windows), VoiceOver (Mac), JAWS

## Form Accessibility
- Label every form input with `<label for="inputId">` or `aria-label`
- Group related inputs with `<fieldset>` and `<legend>`
- Mark required fields with `required` attribute and visual indicator
- Provide clear error messages linked to form fields via `aria-describedby`
- Use `type="email"`, `type="tel"`, `type="date"` for native mobile keyboards
- Ensure form validation messages are announced to screen readers

## Links & Buttons
- Avoid ambiguous link text like "Click here", "Read more"
- Use descriptive link text: "Download project requirements", "GitHub repository"
- If context is unclear, add `aria-label` or use `<span class="sr-only">` for off-screen context
- Use `<button>` for actions that trigger scripts; use `<a>` for navigation
- Ensure all buttons are keyboard accessible and have focus styles

## Motion & Animation
- Respect `prefers-reduced-motion` media query:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

- Auto-playing videos/audio must have a pause button that's immediately discoverable
- Use `aria-busy="true"` during loading states

## CI/CD Testing Integration
- Add axe-core checks to automated tests:
```javascript
const { axe } = require('jest-axe');

it('should not have accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

- Run Lighthouse accessibility audit in CI pipelines
- Test with real assistive technologies in QA process

## Accessibility as Standard Practice
- Include accessibility in Definition of Done
- Test every new feature with keyboard and screen reader
- Document accessibility decisions in code comments
- Build inclusive by default, don't add accessibility as an afterthought

Always prioritize accessibility — it benefits everyone, including users with situational disabilities (bright sunlight, noisy environments, temporary injuries).
```


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

What makes this "Advanced": it combines path-specificity with the AAA pattern, pytest fixtures, parameterized testing, and mocking — all demonstrated in an embedded code example within the instructions themselves.

---

### Prompt Files (6 examples)

All stored in `.github/prompts/*.prompt.md`. Available in VS Code, Visual Studio, and JetBrains only.

---

#### 10. Your First Prompt File
**Complexity:** Simple | **Filename:** `explain-code.prompt.md`

Introductory example. Generates a beginner-friendly explanation of any code snippet.

```markdown
---
agent: 'agent'
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

**How to test:** Save the file, open Copilot Chat in VS Code, type `/explain-code`. Copilot switches to agent mode and prompts you for the `code` and `audience` variables. Example input: `The code is function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }. The audience is beginners.`

Key concepts demonstrated: `${input:variableName:placeholder}` syntax, `agent: 'agent'` frontmatter, the `description` field.

---

#### 11. Create README
**Complexity:** Simple | **Filename:** `create-readme.prompt.md`

Reusable across repositories. Copilot scans the codebase and generates a structured README covering: project description, prerequisites, installation, usage examples, contributing guide, and license section.

---

#### 12. Onboarding Plan
**Complexity:** Simple | **Filename:** `onboarding-plan.prompt.md`

Generates a personalized onboarding plan for a new team member joining a project. Takes the repository context and a developer's background as inputs and produces a structured checklist: repo overview, key architecture decisions, local setup, coding conventions, and suggested first tasks.

---

#### 13. Document API
**Complexity:** Advanced | **Filename:** `document-api.prompt.md`

Generates comprehensive API documentation from source code. Covers endpoint descriptions, request/response schemas, authentication requirements, error codes, and usage examples.

---

#### 14. Review Code
**Complexity:** Advanced | **Filename:** `review-code.prompt.md`

Performs a structured code review with actionable feedback. Analyzes for correctness, performance, security vulnerabilities, readability, test coverage gaps, and adherence to conventions. Outputs findings with severity levels and suggested fixes.

---

#### 15. Generate Unit Tests
**Complexity:** Intermediate | **Filename:** `generate-unit-tests.prompt.md`

Takes source code as input and generates unit tests covering happy paths, edge cases, boundary conditions, and error scenarios. Adapts to the language and testing framework detected in the repository.

---

### Custom Agents (4 examples)

All stored in `.github/agents/*.agent.md`. Must be on the **default branch**. Used at `github.com/copilot/agents`.

---

#### 16. Your First Custom Agent — README Specialist
**Complexity:** Simple | **Filename:** `readme-specialist.agent.md`

The introductory custom agent example. Specializes in README and documentation files, with an explicit hard boundary against ever touching code files.

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

**Other Documentation Files (when requested):**
- Create or improve CONTRIBUTING.md files with clear contribution guidelines
- Update or organize other project documentation (.md, .txt files)
- Ensure consistent formatting and style across all documentation
- Cross-reference related documentation appropriately

**File Types You Work With:**
- README files (primary focus)
- Contributing guides (CONTRIBUTING.md)
- Other documentation files (.md, .txt)
- License files and project metadata

**Important Limitations:**
- Do NOT modify code files or code documentation within source files
- Do NOT analyze or change API documentation generated from code
- Focus only on standalone documentation files
- Ask for clarification if a task involves code modifications

Always prioritize clarity and usefulness. Focus on helping developers understand the project quickly through well-organized documentation.
```

**Sample task:** `Please review and improve our README.md file.`

Design patterns worth noting: explicit "do NOT" limitations, primary vs secondary focus, practical technical constraints embedded in the instructions (500 KiB limit, relative link preference), and defined escalation behavior.

---

#### 17. Implementation Planner
**Complexity:** Simple | **Filename:** `implementation-planner.agent.md`

Breaks down a feature request or user story into actionable implementation tasks and creates a detailed plan. Reads the codebase to understand existing patterns, then produces: task breakdown, order of operations, affected files, suggested approach, and potential risks. The agent focuses on planning — it does not write code.

---

#### 18. Bug Fix Teammate
**Complexity:** Simple | **Filename:** `bug-fix-teammate.agent.md`

Identifies critical bugs in the project and implements targeted, minimal fixes. Searches for error patterns and failing tests, diagnoses root causes, and applies the smallest safe change needed. Explains each fix it makes.

---

#### 19. Cleanup Specialist
**Complexity:** Simple | **Filename:** `cleanup-specialist.agent.md`

Cleans up messy code across both code and documentation files — removing duplication, fixing inconsistent naming, eliminating dead code, and closing documentation gaps — without changing any external behavior. Produces a summary of what was cleaned up.

---

## Important Caveats

**Prompt files are public preview** as of April 2026, subject to change, and only work in VS Code, Visual Studio, and JetBrains.

**Path-specific instructions** (using `applyTo`) are only supported in Copilot Chat in VS Code, Visual Studio, and the coding agent. JetBrains and Xcode support only the single `copilot-instructions.md` file.

**Personal and organization instructions** only apply to Copilot Chat on GitHub.com. They do not affect any IDE.

**Custom agents require the coding agent feature** to be enabled for your organization. The `.agent.md` file must be merged to the default branch before it appears in the UI.

**When both a path-specific file and `copilot-instructions.md` apply to the same file, both sets of instructions are used.** Avoid writing conflicting instructions across them.

---

## Community Examples

Beyond the 19 official examples, GitHub maintains a community repository with additional material:

- **Awesome GitHub Copilot Customizations:** https://github.com/github/awesome-copilot
  - Instructions by language/scenario: `docs/README.instructions.md`
  - Prompt files: `docs/README.prompts.md`
  - Custom agents: `agents/` directory


# Best Practices & Design Patterns

> Sources:
> - https://docs.github.com/en/copilot/tutorials/use-custom-instructions (official GitHub Docs tutorial)
> - https://github.blog/ai-and-ml/github-copilot/5-tips-for-writing-better-custom-instructions-for-copilot/ (official GitHub Blog, September 2025)
> - https://awesome-copilot.github.com/learning-hub/defining-custom-instructions/ (GitHub's own Awesome Copilot community hub)

---

## Important caveat before reading

Copilot is a probabilistic AI system. The same instructions can produce different results on different runs. The goal of all these practices is to **tilt the scales** — to make the outcome you want more likely, not to guarantee it. No instruction file produces perfect results 100% of the time.

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
- **Bullet points** for rules — they're easier to scan than paragraphs
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

### 3. Provide concrete code examples

Examples eliminate ambiguity. Include code snippets showing both the pattern to avoid and the pattern to prefer. The official docs show this directly in the Code Reviewer example from the library:

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

### 4. Be specific, not vague

Vague instructions do not help and the official docs specifically call these out as **not supported** for code review:

- ❌ `Be more accurate`
- ❌ `Don't miss any issues`
- ❌ `Be consistent in your feedback`

These add noise without improving results — Copilot is already optimized to do these things. Instead, write instructions about specific patterns in your codebase.

### 5. Avoid instructions Copilot cannot follow

From the official docs, the following types of instructions are **not currently supported** for Copilot code review:

- Instructions that change formatting: `Use bold text for critical issues`, `Add emoji to comments`
- Instructions that modify the PR overview comment: `Include a summary of security issues in the PR overview`
- Instructions that change core function: `Block a PR from merging unless all Copilot comments are addressed`
- Instructions referencing external URLs: `Review code according to standards at https://example.com`
  - Workaround: Copy the relevant content directly into your instruction file
- Instructions about self-improvement: `Be consistent`, `Don't miss any issues`

### 6. Don't let perfect be the enemy of good

From the official GitHub Blog: an "imperfect" instructions file delivers far more impact than no file at all. Instruction files should evolve over time, just like documentation. Experiment, iterate, and don't overthink the initial version.

---

## Structuring the Content of `copilot-instructions.md`

The official GitHub Blog recommends five sections every instructions file should include. These are **recommendations**, not requirements:

### Section 1: Project overview

The header of your instructions file should be the elevator pitch for your project — what it is, who uses it, what the key features are. A few sentences is enough.

```markdown
# Contoso Companions

This is a website to support pet adoption agencies. Agencies can manage their
locations, available pets, and publicize events. Potential adopters can search
for pets in their area and submit adoption applications.
```

### Section 2: Tech stack

List the technologies in use — backend, frontend, testing. Include brief notes on how they're used if non-obvious. This prevents Copilot from generating code for the wrong framework.

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

List what's in each directory. This saves Copilot exploration time and lets you add context about what each folder contains.

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

Point Copilot to scripts, MCP servers, and other tools it can use. This increases accuracy when Copilot is operating autonomously.

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

Use `copilot-instructions.md` for concerns that apply to the **entire codebase**, and path-specific `*.instructions.md` files for **language- or directory-specific** rules. This prevents Python rules from applying to TypeScript files and vice versa.

The official docs recommend this layout:

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

From the official GitHub Docs tutorial, this is the recommended template for any instruction file:

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
- Style rule 2

```javascript
// Example showing correct pattern
```

## Error Handling
- How to handle errors
- What patterns to use
- What to avoid

## Security Considerations
- Security rule 1
- Security rule 2

## Testing Guidelines
- Testing expectation 1
- Testing expectation 2

## Performance
- Performance consideration 1
- Performance consideration 2
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
| Conflicting instructions across files | Non-deterministic behavior | Design complementary instructions, more specific patterns take priority |

---

## Custom Agent Design Patterns

### Always define explicit scope limits

Every agent profile in the official library includes a clear "do NOT" section. The README Specialist example demonstrates this pattern:

```markdown
**Important Limitations:**
- Do NOT modify code files or code documentation within source files
- Do NOT analyze or change API documentation generated from code
- Focus only on standalone documentation files
- Ask for clarification if a task involves code modifications
```

Without explicit scope limits, agents can drift into unintended areas of the codebase.

### Define escalation behavior

Agents should know what to do when they encounter something outside their scope rather than proceeding silently:

```markdown
- Ask for clarification if a task involves code modifications
```

### Keep the tools array minimal

Only declare the tools the agent actually needs. The tools available are `read`, `search`, and `edit`. An agent that only needs to read and search should not include `edit`.

### Separate planning agents from implementation agents

The library's Implementation Planner example demonstrates this: an agent that only reads the codebase and produces a plan, but never writes code. This is a deliberate design choice — having separate agents for planning and implementation makes each one more predictable and easier to review.

---

## Using Copilot to Write Its Own Instructions

The official GitHub Blog recommends using Copilot agent mode to generate your initial `copilot-instructions.md`. The official recommended prompt from the GitHub Docs is:

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

This approach lets Copilot scan the repository and produce a well-structured starting point, which you then edit and refine.

---

## Key Hard Limits (from the Docs)

These are confirmed technical constraints, not style recommendations:

- **4,000 characters**: The maximum Copilot code review reads from any instruction file. Instructions beyond this are silently ignored for PR reviews. (Does not apply to Copilot Chat or the coding agent.)
- **~1,000 lines**: Recommended soft limit for any instruction file before quality starts degrading.
- **No external URL following**: Copilot cannot fetch external links in instructions. Copy relevant content directly into the file.
- **Both files applied when overlap occurs**: When a path-specific `.instructions.md` file and `copilot-instructions.md` both match the same file, both sets of instructions are used. Avoid writing contradictory instructions across them.
- **Base branch used for PR reviews**: Copilot code review uses the instructions from the base branch of the PR (e.g., `main`), not the feature branch. New instruction files must be merged before they affect reviews.
