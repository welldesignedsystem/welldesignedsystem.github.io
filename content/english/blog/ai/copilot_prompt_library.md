+++
date = '2026-01-01T13:00:00+10:00'
draft = false
title = 'GitHub Copilot Prompt Library'
tags = ['GitHub', 'Copilot', 'AI', 'Prompting', 'DevTools', 'Agents', 'LLM']
summary = "GitHub Copilot's prompt library unlocks a structured, repeatable way to guide AI assistance across your codebase—covering custom instructions, reusable prompt files, agent mode, and extensible skills for end-to-end AI-driven workflows."
+++

A first-class prompt engineering system baked directly into your IDE. Define how Copilot thinks, what it knows about your project, and what it can *do*—all through version-controlled files living alongside your code.

---

### The Core Mental Model

Copilot's prompt library is built around three layers that stack on top of each other:

1. **Custom Instructions** — persistent context that shapes *every* interaction
2. **Prompt Files** — reusable, parameterised prompts for specific tasks
3. **Agent Mode + Skills** — autonomous multi-step execution with tool access

Understanding this hierarchy is the key to getting repeatable, high-quality output at scale.

---

### Custom Instructions

Custom instructions let you inject persistent context into every Copilot Chat conversation without repeating yourself. Think of them as a standing system prompt for your project.

**`.github/copilot-instructions.md`** is the magic file. Drop it in your repo root and Copilot reads it automatically in VS Code, Visual Studio, and JetBrains IDEs (with the Copilot plugin).

```markdown
# Project: Payments API

## Stack
- Java 21 / Spring Boot 3.3
- PostgreSQL 16 via Spring Data JPA + Hibernate
- JUnit 5 + Mockito for unit tests, Testcontainers for integration

## Conventions
- All monetary values are stored as `BigDecimal` or integer cents—never `double` or `float`
- Use Java `record` types for DTOs and value objects
- Use `Optional<T>` for nullable return values—never return `null` from service methods
- Database migrations managed by Flyway in `src/main/resources/db/migration` with `V{timestamp}__description.sql` naming
- Always add Javadoc to public methods and classes

## Testing
- Every new service method needs a unit test using JUnit 5 and Mockito
- Integration tests use Testcontainers and live in `src/test/java/.../integration`
- Use `@DisplayName` annotations to describe test intent in plain English
- Use `@Nested` classes to group related test cases

## What to avoid
- Do not use `java.util.Date` or `java.util.Calendar`—use `java.time.*`
- Do not use field injection (`@Autowired` on fields)—use constructor injection
- Do not use raw types—always parameterise generics
```

**Best practices:**

- Keep it under ~500 words. Copilot has a context window, not infinite patience.
- Write it for the AI, not for humans—be directive, not descriptive.
- Commit it to source control. The whole team benefits automatically.
- Separate *what the project is* from *how to write code for it*. Both matter.

**Multiple instruction files (VS Code `>=1.99`):**

You can now define instructions per-concern using the `github.copilot.chat.codeGeneration.instructions` setting, pointing to multiple `.md` files:

```json
"github.copilot.chat.codeGeneration.instructions": [
  { "file": ".github/instructions/stack.md" },
  { "file": ".github/instructions/testing.md" },
  { "file": ".github/instructions/style.md" },
  { "file": ".github/instructions/spring.md" }
]
```

This is especially useful in monorepos where different packages have different conventions.

---

### Prompt Files (`.prompt.md`)

Prompt files are reusable, shareable, parameterised prompts stored as Markdown. They let you encode your team's best prompts into version-controlled artifacts—no more copying and pasting the same prompt into chat.

**Location:** `.github/prompts/` (or any folder, configured via settings)

**File extension:** `.prompt.md`

**Anatomy of a prompt file:**

```markdown
---
mode: 'ask'           # ask | edit | agent
model: 'gpt-4o'       # optional model override
tools: []             # tools available in agent mode
description: 'Scaffold a new REST endpoint following project conventions'
---

# New REST Endpoint

Create a new REST endpoint for `${input:resource}` (e.g. `users`, `orders`).

## Requirements
- Controller at `src/main/java/.../controller/${input:Resource}Controller.java`
  annotated with `@RestController` and `@RequestMapping("/${input:resource}s")`
- Service interface + implementation at `src/main/java/.../service/${input:Resource}Service.java`
  and `${input:Resource}ServiceImpl.java`
- Spring Data JPA repository at `src/main/java/.../repository/${input:Resource}Repository.java`
- Request/response DTOs as Java `record` types in `.../dto/`
- Bean Validation annotations (`@NotNull`, `@Size`, etc.) on all request records
- JUnit 5 + Mockito unit test for the service implementation

## Reference files
Use [src/main/java/.../controller/ProductController.java](../src/main/java/.../controller/ProductController.java) as the canonical example.

Follow all conventions in [copilot-instructions.md](../copilot-instructions.md).
```

**Variable interpolation:**

| Syntax | Behaviour |
|---|---|
| `${input:variableName}` | Prompts the user for a value at run time |
| `${input:variableName:default}` | Same, with a default value pre-filled |
| `${workspaceFolder}` | Absolute path to the workspace root |
| `${file}` | Currently active file |
| `${selectedText}` | Current editor selection |

**Referencing other files:**

Prompt files can embed other files using relative Markdown links. Copilot pulls the content into context automatically:

```markdown
Refactor the following service to match the patterns in
[src/services/userService.ts](../src/services/userService.ts).

Apply the error handling style from
[docs/error-handling.md](../../docs/error-handling.md).
```

**Running a prompt file:**

- Open Command Palette → `Chat: Run Prompt File`
- Or right-click a `.prompt.md` → `Run in Copilot Chat`
- Or reference it inside chat: `#file:.github/prompts/new-endpoint.prompt.md`

---

### Mode: `ask` vs `edit` vs `agent`

The `mode` frontmatter key controls how Copilot behaves when the prompt runs.

**`ask` (default):** Conversational. Copilot responds with text, code blocks, and explanations but does not touch files. Best for: exploration, architecture discussions, code review, explaining concepts.

**`edit`:** Copilot directly edits files in your workspace. You review a diff before accepting. Best for: targeted refactors, applying a consistent change across multiple files, code generation with predictable scope.

```markdown
---
mode: 'edit'
description: 'Add OpenTelemetry tracing spans to all service methods'
---

Add OpenTelemetry tracing to every public method in ${file}.

- Inject `OpenTelemetry openTelemetry` via constructor and obtain a `Tracer`
  with `openTelemetry.getTracer(getClass().getName())`
- Wrap each method body in `tracer.spanBuilder("ServiceName.methodName").startSpan()`
  and use a try-with-resources or try/finally to call `span.end()`
- In catch blocks, call `span.setStatus(StatusCode.ERROR, e.getMessage())`
  and `span.recordException(e)`
- Do not change method signatures or return types
```

**`agent`:** Copilot operates autonomously across multiple steps—reading files, running terminal commands, calling tools, and iterating until the task is complete. This is the most powerful mode and the one that benefits most from tight instructions. Best for: scaffolding features end-to-end, running test suites and fixing failures, database migrations, multi-file refactors.

---

### Agent Mode

Agent mode transforms Copilot from a suggestion engine into an autonomous development loop. It can:

- Read and write arbitrary files in your workspace
- Execute terminal commands (with your confirmation, by default)
- Call registered MCP tools and Copilot Extensions
- Iterate—run tests, see failures, fix them, repeat—until a goal is met

**Enabling agent mode:**

```json
// settings.json
"github.copilot.chat.agent.enabled": true
```

Open the Chat panel, switch the mode dropdown from **Ask** / **Edit** to **Agent**.

**Prompt design for agent mode:**

Agent prompts need to be more explicit about *definition of done* than ask/edit prompts. Copilot will keep iterating, so give it a clear stopping condition.

```markdown
---
mode: 'agent'
description: 'Implement the invoicing feature end-to-end'
tools: ['codebase', 'terminal', 'github']
---

Implement the `invoicing` feature according to the spec in
[docs/specs/invoicing.md](../docs/specs/invoicing.md).

## Steps (execute in order)
1. Create the JPA entity and Spring Data repository
2. Write the Flyway migration SQL in `src/main/resources/db/migration/`
3. Implement the service interface and `@Service` implementation with constructor injection
4. Implement the `@RestController` with Bean Validation on request bodies
5. Write JUnit 5 + Mockito unit tests for the service—all must pass before continuing
6. Write Testcontainers integration tests for the repository layer

## Definition of done
- `./mvnw test` exits 0 with no skipped tests
- `./mvnw checkstyle:check` exits 0
- `./mvnw compile` produces no warnings about raw types or unchecked casts

Do not ask for confirmation between steps unless you encounter an ambiguity
not resolvable from existing code patterns.
```

**Terminal command approval:**

By default, Copilot asks before running each terminal command. You can pre-approve safe commands in settings:

```json
"github.copilot.chat.agent.autoApprove": ["./mvnw test", "./mvnw checkstyle:check", "./mvnw compile"]
```

---

### Agent Skills (Tools)

Skills—called *tools* in the API surface—are the capabilities an agent can invoke during a run. They're declared in the `tools` array of a prompt file's frontmatter.

**Built-in tools:**

| Tool | What it does |
|---|---|
| `codebase` | Semantic search and file reading across the whole repo |
| `terminal` | Execute shell commands |
| `github` | Read issues, PRs, commits, and repo metadata via the GitHub API |
| `browser` | Fetch and render web pages (where enabled) |
| `search` | Web search for documentation and external references |

**MCP (Model Context Protocol) tools:**

Copilot supports MCP servers, letting you connect any external tool. Register them in `.vscode/mcp.json`:

```json
{
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "linear-mcp-server"],
      "env": { "LINEAR_API_KEY": "${env:LINEAR_API_KEY}" }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    }
  }
}
```

Once registered, reference them in your prompt files:

```markdown
---
mode: 'agent'
tools: ['codebase', 'postgres', 'linear']
description: 'Triage failing queries reported in Linear and add DB indexes'
---

1. Fetch open Linear issues labelled `perf/slow-query`
2. For each issue, identify the slow JPQL or native query in the codebase
3. Query `pg_stat_statements` via the postgres tool to confirm high mean exec time
4. Add a covering index in a new Flyway migration under `src/main/resources/db/migration/`
5. Add the corresponding `@Index` annotation to the JPA entity
6. Comment on the Linear issue with the migration filename and expected improvement
```

**Copilot Extensions:**

Extensions are first-party skills published to the GitHub Marketplace—think of them as managed MCP tools. Reference them with the `@` mention in chat or declare them in prompt files. Examples: `@azure`, `@docker`, `@datastax`.

---

### Workspace Context (`#` References)

Beyond prompt files and instructions, Copilot can pull in context on demand using `#` symbols in chat:

| Reference | What it pulls in |
|---|---|
| `#file:path/to/file.ts` | Content of a specific file |
| `#selection` | Current editor selection |
| `#codebase` | Semantic search across the repo |
| `#terminalLastCommand` | Output of the last terminal command |
| `#terminalSelection` | Selected text in the integrated terminal |
| `#problems` | Current Problems panel (compiler errors, lint) |
| `#changes` | Current git diff (unstaged + staged) |
| `#testFailure` | Most recent test run failures |
| `#editor` | Full content of the active editor tab |

Combine these in prompt files for surgical context injection:

```markdown
---
mode: 'edit'
---

Fix the issues shown in #problems without changing the public method signatures.
Reference the existing test suite at #file:src/test/java/.../service/UserServiceTest.java
to understand expected behaviour.
```

---

### Organising a Production Prompt Library

A suggested structure for a real project:

```
.github/
├── copilot-instructions.md          # Global instructions (always active)
├── instructions/
│   ├── stack.md                     # Spring Boot, JPA, Flyway conventions
│   ├── testing.md                   # JUnit 5, Mockito, Testcontainers style
│   ├── security.md                  # Input validation, secrets, Spring Security rules
│   └── api-design.md               # REST conventions, error response shapes
└── prompts/
    ├── scaffold/
    │   ├── new-endpoint.prompt.md   # Controller + Service + Repository + DTO
    │   ├── new-entity.prompt.md     # JPA entity + Flyway migration
    │   └── new-exception.prompt.md  # Custom exception + @ControllerAdvice handler
    ├── review/
    │   ├── security-review.prompt.md
    │   ├── performance-review.prompt.md
    │   └── accessibility-review.prompt.md
    ├── ops/
    │   ├── incident-runbook.prompt.md
    │   └── deploy-checklist.prompt.md
    └── docs/
        ├── generate-readme.prompt.md
        └── changelog-entry.prompt.md
```

---

### Advantages
- Prompt files are version-controlled — diffs, blame, and PRs work as normal
- Custom instructions mean every team member gets consistent AI behaviour without configuration
- Agent mode + MCP turns Copilot into an end-to-end workflow engine, not just an autocomplete
- Prompt files are composable — reference other prompt files and docs to build complex behaviour from simple parts
- Works across VS Code, Visual Studio, JetBrains, and `gh copilot` CLI with the same file format
