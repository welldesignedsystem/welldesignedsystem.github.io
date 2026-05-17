+++
date = '2026-05-17T12:00:00+10:00'
draft = false
title = 'LSP — Language Server Protocol'
tags = ['LSP', 'Language Server Protocol', 'Developer Tools', 'IDE', 'VSCode', 'JSON-RPC']
summary = "Comprehensive reference for the Language Server Protocol (LSP) — covering the M×N problem, JSON-RPC base protocol, lifecycle, capabilities, every language feature category, workspace features, building servers and clients with pygls and vscode-languageserver-node, LSIF, and popular implementations."
+++

The Language Server Protocol (LSP) defines the standard communication protocol between a code editor or IDE (the **client**) and a language-specific intelligence provider (the **server**). It standardises features like auto-complete, go-to-definition, find-all-references, diagnostics, rename, formatting and more across every editor and every programming language.

Current stable version: **LSP 3.17** (with 3.18 features under active adoption).  
Specification: [microsoft.github.io/language-server-protocol](https://microsoft.github.io/language-server-protocol/)

---

## LSP vs MCP: How They Work

LSP acts as a universal translator between your editor and the programming language you are using. Before LSP, every text editor had to be explicitly coded to understand every language. With LSP, if a language such as Rust provides an LSP server, any editor that supports LSP can offer Rust auto-complete, go-to-definition, diagnostics, formatting and other language-aware features.

MCP acts as a universal translator for AI agents. Before MCP, each AI application had to be custom-coded to connect with specific APIs, databases, file systems or developer tools. With MCP, an AI agent such as Claude can discover and query any service that runs an MCP server, using standardised instructions for actions like browsing files, running tests, fetching data or calling external tools.

The key difference is the user of the protocol. **LSP helps editors understand code. MCP helps AI agents understand and act on external systems.**

---

## The M×N Problem

### Before LSP

Before LSP, language intelligence was tightly coupled to the editor. If you wanted Python autocompletion in VSCode, you built a VSCode extension. If you also wanted it in Emacs, Vim, Sublime Text, and JetBrains, you built **four more separate implementations** — all of the same intelligence, just wrapped in each editor's specific extension API.

With *M* languages and *N* editors, the number of integrations required was **M × N**.

```
Python    →  VSCode extension
Python    →  Vim plugin
Python    →  Emacs package
Python    →  IntelliJ plugin

TypeScript → VSCode extension
TypeScript → Vim plugin
...
```

This was expensive, duplicated and inconsistent. Every team rebuilt the same parser, type-checker, symbol resolver and completion engine — differently, for each editor.

### After LSP

LSP converts the **M × N** problem into **M + N**:

- Language providers write **one language server** that implements LSP.
- Editor vendors write **one LSP client** that implements LSP.
- Any language server works with any editor client.

```
Python Language Server  ─┐
TypeScript Language Server ─┼──► LSP ──► VSCode
Rust Language Server ────┤          ──► Neovim
SQL Language Server ─────┘          ──► Emacs
                                    ──► Sublime Text
```

LSP is not restricted to programming languages. It can be used for any text-based language including specifications, configuration formats and domain-specific languages (DSLs).

---

## Architecture

### Client–Server Model

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│       Editor / IDE          │        │       Language Server         │
│   (Client / Language Client)│        │                              │
│                             │        │  - Parses source code         │
│  ┌──────────────────────┐   │        │  - Builds AST / type index    │
│  │  Extension / Plugin  │◄──┼──JSON-RPC──►  - Resolves symbols      │
│  │  (Language Client)   │   │        │  - Runs diagnostics           │
│  └──────────────────────┘   │        │  - Computes completions       │
│                             │        │  - Handles all features       │
└─────────────────────────────┘        └──────────────────────────────┘
```

- The **client** is the editor or IDE. It initiates the connection, notifies the server of user actions (opening files, typing), and renders results (squiggles, hover popups, completion lists).
- The **server** is a separate process running alongside the editor. It holds the language-specific intelligence: the parser, type-checker, symbol database, and formatter.
- Communication happens via **JSON-RPC 2.0** over a transport (most commonly stdio).
- The server is typically a child process launched by the editor; the editor manages its lifetime.

### Why a Separate Process?
- Language analysis can be CPU and memory intensive. Running it in a separate process isolates it from the editor's UI thread.
- Language servers are often written in the language they support (a Rust server written in Rust, a Python server written in Python). Inter-process communication via JSON-RPC makes this possible regardless of language mismatch.
- Conventional compilers/interpreters target complete, well-formed source code. Language servers must handle **partial, in-progress, syntactically invalid** code as the developer types — a fundamentally different design.

---

## Base Protocol

All LSP messages follow a simple HTTP-like wire format layered over JSON-RPC 2.0.

### Message Format

```
Content-Length: <number>\r\n
\r\n
<JSON payload>
```

Only `Content-Length` is required. `Content-Type` defaults to `application/vscode-jsonrpc; charset=utf-8`. The header and body are separated by `\r\n`.

**Example — client requests completions:**
```
Content-Length: 192\r\n
\r\n
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "textDocument/completion",
  "params": {
    "textDocument": { "uri": "file:///project/main.py" },
    "position": { "line": 10, "character": 15 }
  }
}
```

**Example — server responds:**
```
Content-Length: 156\r\n
\r\n
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "isIncomplete": false,
    "items": [
      { "label": "append", "kind": 2 },
      { "label": "extend", "kind": 2 }
    ]
  }
}
```

### Message Types

| Type | Direction | Has ID | Requires Response |
|---|---|---|---|
| **Request** | Either → Either | ✅ Yes | ✅ Yes |
| **Response** | Either → Either | ✅ (matches request) | — |
| **Notification** | Either → Either | ❌ No | ❌ No |

- **Requests** expect a response. The receiver must always send back either a result or an error.
- **Notifications** are fire-and-forget. No response is sent or expected.
- **Cancellation:** a client can cancel an in-flight request by sending a `$/cancelRequest` notification with the original request ID.

### Transport Options

| Transport | Description | Common Use |
|---|---|---|
| **stdio** | stdin/stdout of child process | Most common; simple, cross-platform |
| **TCP socket** | Connect to server over network | Remote development, containers |
| **Named pipe** | Platform-specific IPC | Windows common |
| **Node.js IPC** | Node-to-Node process channel | Node-based tooling |

### JSON-RPC Error Codes

| Code | Meaning |
|---|---|
| `-32700` | Parse error |
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |
| `-32002` | Server not initialised (LSP-specific) |
| `-32800` | Request cancelled (LSP-specific) |
| `-32801` | Content modified (LSP-specific) |

---

## Core Data Types

Understanding these primitives is essential — they appear in almost every LSP message.

```typescript
// A file reference — always a URI, never a path
interface TextDocumentIdentifier {
  uri: DocumentUri;   // e.g. "file:///home/user/project/main.py"
}

// A zero-based position in a text document
interface Position {
  line: number;       // 0-based line number
  character: number;  // 0-based UTF-16 code unit offset
}

// A contiguous range in a text document
interface Range {
  start: Position;
  end: Position;
}

// A location: file + range
interface Location {
  uri: DocumentUri;
  range: Range;
}

// A text edit to apply to a document
interface TextEdit {
  range: Range;
  newText: string;    // "" to delete; replaces the range
}

// Diagnostic severity
enum DiagnosticSeverity {
  Error       = 1,
  Warning     = 2,
  Information = 3,
  Hint        = 4,
}
```

**Important:** Positions are **zero-based** and use **UTF-16 code unit** offsets for the character field — not byte offsets, not code point offsets. This affects correct handling of multi-byte characters and emoji.

---

## Lifecycle — How a Session Works

The lifetime of a language server is managed entirely by the client. Every session follows the same lifecycle.

### 1. Launch
The client spawns the language server as a child process. No LSP messages are sent yet.

### 2. Initialize Handshake

The client sends `initialize` — the first and most important request. This is where both sides discover each other's capabilities.

```json
// Client → Server: initialize
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "processId": 12345,
    "rootUri": "file:///home/user/myproject",
    "workspaceFolders": [
      { "uri": "file:///home/user/myproject", "name": "myproject" }
    ],
    "clientInfo": { "name": "Visual Studio Code", "version": "1.89.0" },
    "locale": "en-AU",
    "capabilities": {
      "textDocument": {
        "completion": {
          "completionItem": {
            "snippetSupport": true,
            "commitCharactersSupport": true
          }
        },
        "hover": { "contentFormat": ["markdown", "plaintext"] },
        "publishDiagnostics": { "relatedInformation": true }
      },
      "workspace": {
        "applyEdit": true,
        "workspaceFolders": true,
        "configuration": true
      }
    }
  }
}
```

The server responds with `InitializeResult`, declaring its own capabilities:

```json
// Server → Client: initialize response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "serverInfo": { "name": "my-language-server", "version": "1.0.0" },
    "capabilities": {
      "textDocumentSync": {
        "openClose": true,
        "change": 2   // 1 = full, 2 = incremental
      },
      "completionProvider": {
        "triggerCharacters": [".", "("],
        "resolveProvider": true
      },
      "hoverProvider": true,
      "definitionProvider": true,
      "referencesProvider": true,
      "documentFormattingProvider": true,
      "renameProvider": { "prepareProvider": true },
      "diagnosticProvider": {
        "interFileDependencies": true,
        "workspaceDiagnostics": false
      }
    }
  }
}
```

### 3. Initialized Notification

After receiving the `InitializeResult`, the client sends an `initialized` notification. This signals to the server that the client has processed the capabilities and is ready for normal operation. The server can use this moment to register for dynamic capabilities or start background indexing.

```json
{ "jsonrpc": "2.0", "method": "initialized", "params": {} }
```

### 4. Normal Operation

All feature requests and notifications flow freely in both directions. The client keeps the server in sync with document state; the server pushes diagnostics and responds to requests.

### 5. Shutdown

The client sends a `shutdown` request. The server stops accepting new requests, flushes any pending work, and responds with `null`.

```json
// Client → Server
{ "jsonrpc": "2.0", "id": 99, "method": "shutdown", "params": null }
// Server → Client
{ "jsonrpc": "2.0", "id": 99, "result": null }
```

### 6. Exit

After receiving the shutdown response, the client sends an `exit` notification. The server terminates its process with exit code 0 (success) or 1 (if no shutdown was received first).

```json
{ "jsonrpc": "2.0", "method": "exit", "params": null }
```

**Rule:** The server must NOT receive any requests before `initialize` completes (except `exit`). Any such requests must return error code `-32002`.

---

## Capabilities

Not every language server supports every LSP feature. The **capabilities** system solves this cleanly: both sides declare what they support during `initialize`, and neither side sends messages for capabilities the other doesn't support.

### Capability Registration
- **Static registration:** declared in the `InitializeResult`. Fixed for the lifetime of the session.
- **Dynamic registration:** the server sends `client/registerCapability` after `initialized`, adding or changing capabilities at runtime. Allows the server to register only when relevant files are open, or after indexing completes.
- **Unregistration:** `client/unregisterCapability` removes a dynamically registered capability.

```json
// Server → Client: register for didSave notifications dynamically
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "client/registerCapability",
  "params": {
    "registrations": [{
      "id": "did-save-registration",
      "method": "textDocument/didSave",
      "registerOptions": {
        "includeText": true,
        "documentSelector": [{ "language": "python" }]
      }
    }]
  }
}
```

**Rule:** a server must not register a capability both statically and dynamically — doing so could result in double registration.

---

## Text Document Synchronization

The server needs an accurate, up-to-date view of every open document. The client keeps it in sync via notifications.

### Sync Modes

| Mode | Value | Description |
|---|---|---|
| `None` | 0 | Server does not want document sync |
| `Full` | 1 | Client sends the complete document text on every change |
| `Incremental` | 2 | Client sends only the changed ranges |

Most production servers use `Incremental` (mode 2) — sending the whole file on every keystroke is wasteful for large files.

### Document Sync Notifications

**`textDocument/didOpen`** — sent when the user opens a file:
```json
{
  "method": "textDocument/didOpen",
  "params": {
    "textDocument": {
      "uri": "file:///project/main.py",
      "languageId": "python",
      "version": 1,
      "text": "def hello():\n    pass\n"
    }
  }
}
```

**`textDocument/didChange`** — sent on every edit (incremental example):
```json
{
  "method": "textDocument/didChange",
  "params": {
    "textDocument": { "uri": "file:///project/main.py", "version": 2 },
    "contentChanges": [{
      "range": {
        "start": { "line": 1, "character": 4 },
        "end":   { "line": 1, "character": 8 }
      },
      "text": "    print('hello')"
    }]
  }
}
```

**`textDocument/didSave`** — sent when the user saves:
```json
{
  "method": "textDocument/didSave",
  "params": {
    "textDocument": { "uri": "file:///project/main.py" },
    "text": "def hello():\n    print('hello')\n"  // only if includeText capability
  }
}
```

**`textDocument/didClose`** — sent when the user closes the file:
```json
{
  "method": "textDocument/didClose",
  "params": {
    "textDocument": { "uri": "file:///project/main.py" }
  }
}
```

**`textDocument/willSave`** / **`textDocument/willSaveWaitUntil`** — before-save hooks. `willSaveWaitUntil` allows the server to return `TextEdit[]` applied before the save completes (useful for format-on-save).

**Document version numbers** increment with every change. The server uses them to detect stale responses. If a response is generated against version 3 but the document is now at version 5, the server can discard or re-compute the result.

---

## Language Features

### Diagnostics (Errors and Warnings)

Diagnostics are problems the server finds in the document — syntax errors, type errors, lint violations. They are pushed **proactively** by the server as a notification (not pulled by the client).

```json
// Server → Client: push diagnostics
{
  "method": "textDocument/publishDiagnostics",
  "params": {
    "uri": "file:///project/main.py",
    "version": 5,
    "diagnostics": [
      {
        "range": {
          "start": { "line": 3, "character": 0 },
          "end":   { "line": 3, "character": 10 }
        },
        "severity": 1,
        "code": "E501",
        "source": "pylint",
        "message": "Line too long (120 > 100 characters)",
        "relatedInformation": []
      }
    ]
  }
}
```

To clear all diagnostics for a file, the server sends an empty array: `"diagnostics": []`.

**Pull diagnostics (3.17+):** Alternatively, the client can pull diagnostics on demand via `textDocument/diagnostic` and `workspace/diagnostic`. This avoids spurious pushes when the client isn't actively displaying the file.

### Completion (`textDocument/completion`)

Invoked when the user triggers autocompletion (usually Ctrl+Space or a trigger character like `.`).

```json
// Client → Server: request completions
{
  "id": 2,
  "method": "textDocument/completion",
  "params": {
    "textDocument": { "uri": "file:///project/main.py" },
    "position": { "line": 5, "character": 12 },
    "context": {
      "triggerKind": 2,          // 1=invoked, 2=trigger char, 3=re-trigger
      "triggerCharacter": "."
    }
  }
}
```

**CompletionItem kinds:**

| Value | Kind | Value | Kind |
|---|---|---|---|
| 1 | Text | 10 | Unit |
| 2 | Method | 11 | Value |
| 3 | Function | 12 | Enum |
| 4 | Constructor | 13 | Keyword |
| 5 | Field | 14 | Snippet |
| 6 | Variable | 15 | Color |
| 7 | Class | 16 | File |
| 8 | Interface | 17 | Reference |
| 9 | Module | 18 | Folder |

**CompletionItem resolve:** if `resolveProvider: true`, the client may send `completionItem/resolve` for a selected item to fetch additional details (documentation, additionalTextEdits) that were too expensive to compute for the whole list.

```json
// Completion item with snippet
{
  "label": "forEach",
  "kind": 2,
  "detail": "forEach(callbackfn: (value: T) => void): void",
  "documentation": { "kind": "markdown", "value": "Calls a function for each element." },
  "insertTextFormat": 2,   // 2 = snippet
  "insertText": "forEach((${1:item}) => {\n\t${2}\n})"
}
```

### Hover (`textDocument/hover`)

Returns documentation or type information for the symbol under the cursor.

```json
// Request
{ "id": 3, "method": "textDocument/hover",
  "params": { "textDocument": {"uri": "..."}, "position": {"line": 5, "character": 3} } }

// Response
{ "id": 3, "result": {
  "contents": {
    "kind": "markdown",
    "value": "```python\ndef hello(name: str) -> str\n```\nReturns a greeting string."
  },
  "range": { "start": {"line": 5, "character": 0}, "end": {"line": 5, "character": 5} }
}}
```

### Go to Definition (`textDocument/definition`)

Returns the location where a symbol is defined. Can return a single `Location` or an array of `Location[]` (for languages with multiple definitions, e.g. TypeScript's `.d.ts` vs source).

Related methods:
- `textDocument/declaration` — go to declaration (e.g. header file in C/C++)
- `textDocument/typeDefinition` — go to the type's definition
- `textDocument/implementation` — go to concrete implementations of an interface

```json
// Response: single location
{ "id": 4, "result": {
  "uri": "file:///project/utils.py",
  "range": { "start": {"line": 42, "character": 4}, "end": {"line": 42, "character": 9} }
}}
```

### Find References (`textDocument/references`)

Returns all locations in the workspace where a symbol is referenced.

```json
// Request
{ "id": 5, "method": "textDocument/references",
  "params": {
    "textDocument": {"uri": "..."},
    "position": {"line": 5, "character": 3},
    "context": { "includeDeclaration": true }
  }
}
```

### Document Highlights (`textDocument/documentHighlight`)

Returns ranges in the **current document** to visually highlight — useful for showing all usages of a variable in the current file. Different from references, which spans the whole workspace.

### Signature Help (`textDocument/signatureHelp`)

Returns the parameters and documentation for a function call at the cursor position — the "tooltip" that appears when you open a function call's parentheses.

```json
{ "id": 6, "result": {
  "signatures": [{
    "label": "open(file: str, mode: str = 'r', encoding: str = None) -> IO",
    "documentation": "Open a file...",
    "parameters": [
      { "label": "file: str", "documentation": "Path to the file" },
      { "label": "mode: str = 'r'", "documentation": "File open mode" },
      { "label": "encoding: str = None", "documentation": "Text encoding" }
    ]
  }],
  "activeSignature": 0,
  "activeParameter": 1    // Highlights the second parameter
}}
```

### Code Actions (`textDocument/codeAction`)

Returns a list of quick-fix actions or refactorings available at the cursor position (e.g. "Add missing import", "Convert to f-string", "Extract method").

```json
// Request
{ "id": 7, "method": "textDocument/codeAction",
  "params": {
    "textDocument": {"uri": "..."},
    "range": {"start": {"line": 3, "character": 0}, "end": {"line": 3, "character": 5}},
    "context": {
      "diagnostics": [/* diagnostics in range */],
      "only": ["quickfix", "refactor"]   // Filter by kind
    }
  }
}

// Response
{ "id": 7, "result": [
  {
    "title": "Add missing import: os",
    "kind": "quickfix",
    "diagnostics": [/* the diagnostic this fixes */],
    "edit": {
      "changes": {
        "file:///project/main.py": [
          { "range": {"start": {"line":0,"character":0}, "end": {"line":0,"character":0}},
            "newText": "import os\n" }
        ]
      }
    }
  }
]}
```

**Code action kinds:**

| Kind | Meaning |
|---|---|
| `quickfix` | Fix a specific diagnostic |
| `refactor` | General refactoring |
| `refactor.extract` | Extract method, variable, etc. |
| `refactor.inline` | Inline a variable or method |
| `refactor.rewrite` | Rewrite / modernise syntax |
| `source` | Source-level actions |
| `source.organizeImports` | Sort and remove unused imports |
| `source.fixAll` | Apply all auto-fixable issues |

### Rename (`textDocument/rename`)

Renames a symbol across the entire workspace. Returns a `WorkspaceEdit` containing all the text changes needed.

**Prepare rename** (`textDocument/prepareRename`): optionally called first to validate that rename is possible at the cursor and return the current symbol name for the rename dialog.

```json
// Response from rename
{ "id": 8, "result": {
  "changes": {
    "file:///project/main.py": [
      { "range": {"start":{"line":5,"character":4},"end":{"line":5,"character":9}}, "newText": "greet" }
    ],
    "file:///project/test_main.py": [
      { "range": {"start":{"line":10,"character":10},"end":{"line":10,"character":15}}, "newText": "greet" }
    ]
  }
}}
```

### Document Formatting

| Method | Description |
|---|---|
| `textDocument/formatting` | Format the entire document |
| `textDocument/rangeFormatting` | Format a specific range |
| `textDocument/onTypeFormatting` | Format after a trigger character (e.g. `}`, `;`) |

```json
// Request: format whole document
{ "id": 9, "method": "textDocument/formatting",
  "params": {
    "textDocument": {"uri": "..."},
    "options": {
      "tabSize": 4,
      "insertSpaces": true,
      "trimTrailingWhitespace": true,
      "insertFinalNewline": true
    }
  }
}
// Response: list of TextEdits to apply
```

### Document Symbols (`textDocument/documentSymbol`)

Returns all symbols in the document for the outline / breadcrumb view — functions, classes, variables, imports. Can return a flat `SymbolInformation[]` or a tree `DocumentSymbol[]`.

**Symbol kinds:** File, Module, Namespace, Package, Class, Method, Property, Field, Constructor, Enum, Interface, Function, Variable, Constant, String, Number, Boolean, Array, Object, Key, Null, EnumMember, Struct, Event, Operator, TypeParameter.

### Workspace Symbols (`workspace/symbol`)

Searches for symbols across the entire workspace — used for the "Go to Symbol" global search in editors.

### Code Lens (`textDocument/codeLens`)

Returns **inline annotations** displayed in the editor above or inline with code — not edits, but clickable UI decorations. Examples: "3 references", "Run test", "Open in browser".

Resolved lazily via `codeLens/resolve` when the user hovers over them.

### Inlay Hints (`textDocument/inlayHint`) — 3.17+

Returns **inline hints** displayed within the code as virtual text that the user didn't write — parameter names, inferred type annotations, return types. Not editable. Different from code lens (inline vs above-line).

```json
// Example inlay hint showing inferred type
{
  "position": {"line": 5, "character": 8},
  "label": ": str",        // Virtual text shown after position
  "kind": 1,               // 1=Type, 2=Parameter
  "tooltip": "Inferred type: str",
  "paddingLeft": false,
  "paddingRight": true
}
```

### Inline Values (`textDocument/inlineValue`) — 3.17+

Returns values of expressions and variables to display inline during **debugging** — "what is this variable right now?" displayed next to the code.

### Semantic Tokens (`textDocument/semanticTokens`)

Provides rich, language-aware syntax highlighting. Standard syntax highlighting is regex-based; semantic tokens let the server annotate tokens with semantic meaning (e.g. "this identifier is a local variable", "this is a class name", "this string is a format string").

Returns a compact encoded array for efficiency. Supports full document (`semanticTokens/full`), delta (`semanticTokens/full/delta`), and range requests.

### Folding Ranges (`textDocument/foldingRange`)

Returns regions the editor can collapse — functions, classes, comments, `#region` blocks.

### Selection Ranges (`textDocument/selectionRange`)

Returns a hierarchy of syntactically meaningful ranges from the cursor outward — enables "expand selection" commands that grow from identifier → expression → statement → block → function → file.

### Document Link (`textDocument/documentLink`)

Finds URLs and file references embedded in the document (e.g. in comments or string literals) and returns them as clickable links.

### Document Color (`textDocument/documentColor` / `textDocument/colorPresentation`)

Identifies color values in the document (e.g. CSS hex codes, `rgb()`) and returns them for display as color swatches and editing via a color picker.

### Call Hierarchy (`textDocument/prepareCallHierarchy`) — 3.16+

Prepares a call hierarchy for a symbol, then resolves incoming calls (`callHierarchy/incomingCalls`) and outgoing calls (`callHierarchy/outgoingCalls`) — the "who calls this?" and "what does this call?" views.

### Type Hierarchy (`textDocument/prepareTypeHierarchy`) — 3.17+

Like call hierarchy but for type relationships — supertypes and subtypes of a class or interface.

### Linked Editing Ranges (`textDocument/linkedEditingRange`) — 3.16+

Returns ranges that should be edited together — useful for HTML tag pairs (changing `<div>` simultaneously updates `</div>`).

---

## Workspace Features

### Workspace Folders

Multi-root workspaces (multiple unrelated folders open simultaneously) are managed via workspace folders. The server is notified when folders are added or removed:

```json
{ "method": "workspace/didChangeWorkspaceFolders",
  "params": {
    "event": {
      "added": [{ "uri": "file:///new-project", "name": "new-project" }],
      "removed": []
    }
  }
}
```

### Configuration (`workspace/configuration`)

The server can request configuration settings from the client:

```json
// Server → Client
{ "id": 20, "method": "workspace/configuration",
  "params": {
    "items": [
      { "scopeUri": "file:///project/src/main.py", "section": "python.linting" },
      { "section": "python.formatting" }
    ]
  }
}
```

The client responds with the current values from its settings store.

### Configuration Change Notification

```json
{ "method": "workspace/didChangeConfiguration",
  "params": { "settings": { "python": { "linting": { "enabled": true } } } }
}
```

### File Operations

The server can intercept workspace-level file operations — useful for updating imports when files are moved or renamed.

| Notification / Request | Trigger |
|---|---|
| `workspace/willCreateFiles` (Request) | Before files are created |
| `workspace/didCreateFiles` | After files are created |
| `workspace/willRenameFiles` (Request) | Before files are renamed |
| `workspace/didRenameFiles` | After files are renamed |
| `workspace/willDeleteFiles` (Request) | Before files are deleted |
| `workspace/didDeleteFiles` | After files are deleted |

`willXxx` requests allow the server to return a `WorkspaceEdit` applied atomically with the operation (e.g. update all import paths when a file is renamed).

### Apply Edit (`workspace/applyEdit`)

The server requests the client to apply a `WorkspaceEdit`:

```json
{ "id": 30, "method": "workspace/applyEdit",
  "params": {
    "label": "Organise imports",
    "edit": {
      "changes": { "file:///project/main.py": [ /* TextEdit[] */ ] }
    }
  }
}
```

### Execute Command (`workspace/executeCommand`)

The server registers commands (via `executeCommandProvider`); the client can trigger them. Commands can do anything — run a tool, open a browser, modify files via `workspace/applyEdit`.

---

## Window Features

### Show Message (`window/showMessage`)

The server sends a message to be displayed as a toast or dialog:

```json
{ "method": "window/showMessage",
  "params": { "type": 3, "message": "Indexing complete." }
  // type: 1=Error, 2=Warning, 3=Info, 4=Log
}
```

`window/showMessageRequest` adds action buttons and expects a response.

### Log Message (`window/logMessage`)

Sends a message to the client's output/log panel (not shown to the user directly):

```json
{ "method": "window/logMessage",
  "params": { "type": 4, "message": "Parsing /project/src/main.py" }
}
```

### Progress Reporting

For long-running operations (indexing, finding all references across a large codebase), the server sends progress updates.

```json
// 1. Server creates a progress token
{ "id": 50, "method": "window/workDoneProgress/create",
  "params": { "token": "indexing-token" } }

// 2. Report progress
{ "method": "$/progress",
  "params": { "token": "indexing-token",
    "value": { "kind": "report", "percentage": 45, "message": "Indexed 45%" } } }

// 3. Signal completion
{ "method": "$/progress",
  "params": { "token": "indexing-token",
    "value": { "kind": "end", "message": "Indexing complete" } } }
```

---

## Building a Language Server

### Python — pygls

**pygls** ("pie glass") is the standard Python LSP framework. It handles all JSON-RPC plumbing; you register feature handlers using a decorator API.

```bash
pip install pygls
```

```python
from pygls.lsp.server import LanguageServer
from lsprotocol import types

# 1. Create the server
server = LanguageServer("my-language-server", "v1.0.0")

# 2. Handle document open/change
@server.feature(types.TEXT_DOCUMENT_DID_OPEN)
def did_open(params: types.DidOpenTextDocumentParams):
    validate_document(server, params.text_document.uri)

@server.feature(types.TEXT_DOCUMENT_DID_CHANGE)
def did_change(params: types.DidChangeTextDocumentParams):
    validate_document(server, params.text_document.uri)

# 3. Push diagnostics
def validate_document(ls: LanguageServer, uri: str):
    document = ls.workspace.get_text_document(uri)
    diagnostics = []

    for line_no, line in enumerate(document.lines):
        if len(line) > 100:
            diagnostics.append(types.Diagnostic(
                range=types.Range(
                    start=types.Position(line=line_no, character=100),
                    end=types.Position(line=line_no, character=len(line)),
                ),
                message=f"Line too long ({len(line)} > 100 characters)",
                severity=types.DiagnosticSeverity.Warning,
                source="my-linter",
            ))

    ls.publish_diagnostics(uri, diagnostics)

# 4. Completions
@server.feature(
    types.TEXT_DOCUMENT_COMPLETION,
    types.CompletionOptions(trigger_characters=["."]),
)
def completions(params: types.CompletionParams):
    document = server.workspace.get_text_document(params.text_document.uri)
    current_line = document.lines[params.position.line].strip()

    items = []
    if current_line.endswith("hello."):
        items = [
            types.CompletionItem(label="world", kind=types.CompletionItemKind.Text),
            types.CompletionItem(label="friend", kind=types.CompletionItemKind.Text),
        ]
    return types.CompletionList(is_incomplete=False, items=items)

# 5. Hover
@server.feature(types.TEXT_DOCUMENT_HOVER)
def hover(params: types.HoverParams):
    return types.Hover(
        contents=types.MarkupContent(
            kind=types.MarkupKind.Markdown,
            value="**Example hover.** This is the hovered symbol."
        )
    )

# 6. Go to definition
@server.feature(types.TEXT_DOCUMENT_DEFINITION)
def definition(params: types.DefinitionParams):
    return types.Location(
        uri=params.text_document.uri,
        range=types.Range(
            start=types.Position(line=0, character=0),
            end=types.Position(line=0, character=5)
        )
    )

# 7. Start the server (over stdio)
if __name__ == "__main__":
    server.start_io()
```

**Transport options in pygls:**
```python
server.start_io()           # stdio — most common
server.start_tcp("127.0.0.1", 2087)   # TCP socket
server.start_ws("127.0.0.1", 2087)   # WebSocket
```

**Async handlers:**
```python
@server.feature(types.TEXT_DOCUMENT_COMPLETION)
async def completions(params: types.CompletionParams):
    # Safe to use await here
    results = await fetch_completions_from_db(params)
    return types.CompletionList(is_incomplete=False, items=results)
```

---

### TypeScript/Node.js — vscode-languageserver-node

Microsoft's official Node.js framework. Includes the client library (`vscode-languageclient`) for VSCode extensions and the server library (`vscode-languageserver`).

```bash
npm install vscode-languageserver vscode-languageserver-textdocument
```

```typescript
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

// 1. Create connection and document manager
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// 2. Initialize: declare capabilities
connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ["."] },
      hoverProvider: true,
      definitionProvider: true,
    },
  };
});

// 3. Push diagnostics on every change
documents.onDidChangeContent((change) => {
  validateDocument(change.document);
});

function validateDocument(document: TextDocument) {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    if (line.length > 100) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: { line: i, character: 100 },
          end: { line: i, character: line.length },
        },
        message: `Line too long (${line.length} > 100 characters)`,
        source: "my-linter",
      });
    }
  });

  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

// 4. Handle completion
connection.onCompletion(
  (params: TextDocumentPositionParams): CompletionItem[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const line = doc.getText({
      start: { line: params.position.line, character: 0 },
      end: params.position,
    });

    if (line.trimEnd().endsWith("hello.")) {
      return [
        { label: "world", kind: CompletionItemKind.Text },
        { label: "friend", kind: CompletionItemKind.Text },
      ];
    }
    return [];
  }
);

// 5. Start
documents.listen(connection);
connection.listen();
```

---

## Building a Language Client (VSCode Extension)

The client side of an LSP integration is a VSCode extension that starts the server and connects the `LanguageClient`.

```typescript
// extension.ts (client side)
import * as path from "path";
import { ExtensionContext } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));

  const serverOptions: ServerOptions = {
    run:   { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc,
             options: { execArgv: ["--nolazy", "--inspect=6009"] } },
  };

  const clientOptions: LanguageClientOptions = {
    // Which files trigger this language server
    documentSelector: [{ scheme: "file", language: "mylanguage" }],
    synchronize: {
      // Watch these files for changes and notify the server
      fileEvents: workspace.createFileSystemWatcher("**/.myrc"),
    },
  };

  client = new LanguageClient("myLanguageServer", "My Language Server", serverOptions, clientOptions);
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
```

**Enable LSP tracing for debugging:**
```json
// settings.json
{ "myLanguage.trace.server": "verbose" }
```

---

## Popular Language Servers

| Language | Server | Notes |
|---|---|---|
| Python | **Pylsp** (Python LSP Server) | Community fork of python-language-server |
| Python | **Pyright** | Microsoft; strict type checking |
| Python | **Ruff LSP** | Extremely fast linter + formatter |
| TypeScript/JS | **typescript-language-server** | Wraps the TSServer |
| Rust | **rust-analyzer** | Official; replaces RLS |
| Go | **gopls** | Official Go team |
| Java | **eclipse.jdt.ls** | Eclipse-based |
| C/C++ | **clangd** | LLVM-based |
| C# | **OmniSharp** | Roslyn-based |
| Ruby | **solargraph** | Community |
| Lua | **lua-language-server** | Widely used in Neovim ecosystem |
| HTML/CSS/JSON | **vscode-html-languageservice** | Microsoft |
| YAML | **yaml-language-server** | Red Hat |
| SQL | **sqls** | Open source |
| Terraform | **terraform-ls** | HashiCorp official |
| Markdown | **marksman** | Wikilink-aware |
| Bash | **bash-language-server** | Community |

---

## LSP Clients (Editors)

| Editor | LSP Support |
|---|---|
| **Visual Studio Code** | Native; the original LSP client |
| **Neovim** | Built-in (`vim.lsp`) since v0.5; `nvim-lspconfig` for configuration |
| **Emacs** | `lsp-mode`, `eglot` (built-in since v29) |
| **Vim** | `vim-lsp`, `coc.nvim` |
| **Sublime Text** | LSP plugin |
| **Zed** | Native LSP |
| **Eclipse** | lsp4e |
| **IntelliJ / JetBrains** | lsp4intellij plugin |
| **Helix** | Native LSP |

---

## LSIF — Language Server Index Format

LSIF (pronounced "else if") is a companion standard to LSP designed for **static analysis tooling and code navigation on the web** — without a running language server or local source copy.

### The Problem LSIF Solves
LSP requires a live server process running alongside the editor, with access to the source files. For features like "go to definition" on GitHub or code navigation in a CI/CD diff view, you can't spin up a language server for every user.

LSIF precomputes the answers: it dumps the LSP responses for an entire codebase into a static JSON file at index time.

### How It Works
```
Source code → LSIF indexer → lsif.json → Code navigation tool
```

The LSIF file encodes a graph of:
- Every symbol and its definition range
- Every reference and what it refers to
- Every hover result for every symbol
- Relationships between symbols

Any tool that can read the LSIF file can serve code navigation without a live server.

### LSIF vs LSP

| | LSP | LSIF |
|---|---|---|
| **Purpose** | Live editing support | Static code navigation |
| **Requires** | Live server process + source access | Pre-built index file |
| **Use case** | IDE / editor | GitHub, code review, CI |
| **Latency** | Real-time | Pre-computed |
| **Dynamic** | ✅ Handles partial/invalid code | ❌ Snapshot only |

---

## Common Patterns and Design Considerations

### Pattern 1: Incremental Parsing with a Shadow Document
Maintain an in-memory shadow copy of every open document, updated incrementally on each `didChange`. Parse only the changed region when possible. Use a tree-sitter or similar incremental parser for speed.

```python
from tree_sitter import Language, Parser

parser = Parser()
parser.set_language(MY_LANGUAGE)

shadow_trees = {}   # uri → tree

@server.feature(types.TEXT_DOCUMENT_DID_CHANGE)
def did_change(params):
    uri = params.text_document.uri
    old_tree = shadow_trees.get(uri)
    changes = params.content_changes

    # Apply incremental update to tree-sitter
    new_tree = parser.parse(
        bytes(get_full_text(uri), "utf8"),
        old_tree,   # Pass old tree for incremental reparsing
    )
    shadow_trees[uri] = new_tree
    run_diagnostics(uri, new_tree)
```

### Pattern 2: Debounced Validation
Don't run expensive validation on every keystroke — debounce it. Validate 300–500ms after the last edit.

```python
import asyncio

pending_validations = {}

@server.feature(types.TEXT_DOCUMENT_DID_CHANGE)
async def did_change(params):
    uri = params.text_document.uri

    # Cancel any pending validation for this URI
    if uri in pending_validations:
        pending_validations[uri].cancel()

    # Schedule new validation after 400ms
    async def run():
        await asyncio.sleep(0.4)
        validate_document(server, uri)

    pending_validations[uri] = asyncio.ensure_future(run())
```

### Pattern 3: Background Indexing with Progress
Index the workspace in a background thread; report progress so the user knows what's happening.

```python
import threading

@server.feature(types.INITIALIZED)
def initialized(params):
    threading.Thread(target=index_workspace, daemon=True).start()

def index_workspace():
    token = "workspace-index"
    server.lsp.send_request(types.WINDOW_WORK_DONE_PROGRESS_CREATE,
                            types.WorkDoneProgressCreateParams(token=token))

    server.lsp.notify(types.PROGRESS,
        types.ProgressParams(token=token,
            value=types.WorkDoneProgressBegin(title="Indexing workspace", percentage=0)))

    files = list_all_source_files()
    for i, f in enumerate(files):
        parse_and_index(f)
        pct = int((i + 1) / len(files) * 100)
        server.lsp.notify(types.PROGRESS,
            types.ProgressParams(token=token,
                value=types.WorkDoneProgressReport(percentage=pct, message=f)))

    server.lsp.notify(types.PROGRESS,
        types.ProgressParams(token=token,
            value=types.WorkDoneProgressEnd(message="Indexing complete")))
```

### Pattern 4: Dynamic Capability Registration
Register for `didSave` only after a configuration check — avoids unnecessary notifications.

```python
@server.feature(types.INITIALIZED)
async def initialized(params):
    config = await server.get_configuration_async(
        types.ConfigurationParams(items=[types.ConfigurationItem(section="myServer")])
    )
    if config[0].get("validateOnSave"):
        server.lsp.send_request(
            types.CLIENT_REGISTER_CAPABILITY,
            types.RegistrationParams(registrations=[
                types.Registration(
                    id="did-save",
                    method=types.TEXT_DOCUMENT_DID_SAVE,
                    register_options=types.TextDocumentSaveRegistrationOptions(
                        document_selector=[{"language": "mylanguage"}],
                        include_text=True,
                    )
                )
            ])
        )
```

### Pattern 5: Workspace-Wide Rename Safety Check
Before executing rename, check all files to verify there are no conflicts.

```python
@server.feature(types.TEXT_DOCUMENT_PREPARE_RENAME)
def prepare_rename(params: types.PrepareRenameParams):
    # Return the current symbol range + name so the editor can pre-fill the rename dialog
    symbol_range = find_symbol_at(params.text_document.uri, params.position)
    if symbol_range is None:
        return None  # Not renameable
    return types.PrepareRenameResult(range=symbol_range, placeholder="current_name")

@server.feature(types.TEXT_DOCUMENT_RENAME)
def rename(params: types.RenameParams):
    all_references = find_all_references(params.text_document.uri, params.position)
    changes = {}
    for ref_loc in all_references:
        edits = changes.setdefault(ref_loc.uri, [])
        edits.append(types.TextEdit(range=ref_loc.range, new_text=params.new_name))
    return types.WorkspaceEdit(changes=changes)
```

---

## Troubleshooting

### Server Not Starting
- Verify the server executable or entry point exists at the configured path.
- Check stderr output of the server process — most startup errors appear there.
- Enable LSP logging in the editor (e.g. `myLanguage.trace.server: verbose` in VSCode).

### Positions Are Off
- LSP uses **zero-based, UTF-16 character offsets**. If your server uses 1-based lines or byte offsets, characters outside ASCII will be at wrong positions.
- Always convert between your internal representation and LSP positions carefully.

### Completions Not Appearing
- Verify `completionProvider` is declared in `InitializeResult`.
- Check trigger characters — the client only calls `textDocument/completion` after a trigger character or an explicit invocation.
- Completions must be returned quickly (< 100ms for good UX). Move expensive computation to `completionItem/resolve`.

### Diagnostics Not Showing
- Ensure `publishDiagnostics` is called with the correct URI (must match the `textDocument.uri` from `didOpen`).
- Send an empty array `[]` to clear old diagnostics — stale diagnostics linger if not cleared.
- Check the diagnostic `range` — invalid ranges are silently ignored by some clients.

### Memory Growing Without Bound
- Release document state in `textDocument/didClose`. The shadow document, AST, and any cached data for that URI should be discarded.
- Don't keep growing an in-memory index — use LRU eviction or disk-backed caches for large codebases.

### Request Ordering Issues
- Responses should be sent in roughly the same order as requests. An expensive `definition` request must not block a quick `completion` — use async handlers and process requests concurrently.
- The server must NOT reorder `definition` and `rename` for the same position — executing rename may invalidate the definition result.

---

## LSP Version History

| Version | Major Additions |
|---|---|
| 1.0 | Initial release (2016); basic features: completion, hover, definition, references, diagnostics |
| 2.0 | Workspace folders, dynamic registration, text document sync improvements |
| 3.0 | Code actions, document symbols, workspace symbols, formatting |
| 3.14 | Selection ranges, code lens |
| 3.15 | Progress reporting, partial results |
| 3.16 | Semantic tokens, call hierarchy, linked editing ranges, moniker support |
| 3.17 | Type hierarchy, inline values, inlay hints, notebook document support, pull diagnostics, meta model |
| 3.18 | Inline completions, dynamic text document content, multi-range formatting, snippets in workspace edits |

---

## Comparison: LSP vs Tree-sitter vs Traditional Plugins

| | LSP | Tree-sitter | Traditional IDE Plugin |
|---|---|---|---|
| **What it is** | Protocol for editor–server communication | Incremental parser library | Editor-specific extension |
| **Language** | Any (server can be any language) | C bindings (most languages) | Editor's extension language |
| **Works offline** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Editor portability** | ✅ Any LSP client | ✅ Any tree-sitter client | ❌ One editor only |
| **Handles invalid code** | ✅ Yes (server decides) | ✅ Yes (error recovery) | Varies |
| **Type inference** | ✅ Yes (server implements) | ❌ Not designed for it | Varies |
| **Formatting** | ✅ Yes | ❌ No | Varies |
| **Speed** | IPC overhead (ms) | In-process (μs) | In-process |
| **Best for** | Full language intelligence | Syntax highlighting, text objects | Deep IDE integration |

Many modern editors use both: tree-sitter for fast, always-on syntax highlighting and structural editing, plus LSP for semantic intelligence (type errors, completions, rename).

---

## Further Reading

- [Official LSP Specification 3.17](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
- [Official LSP Specification 3.18](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.18/specification/)
- [LSP Overview](https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/)
- [LSIF Specification](https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/)
- [pygls Documentation](https://pygls.readthedocs.io/)
- [pygls on GitHub](https://github.com/openlawlibrary/pygls)
- [vscode-languageserver-node on GitHub](https://github.com/microsoft/vscode-languageserver-node)
- [VSCode Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [langserver.org — community server registry](https://langserver.org/)
- [lsprotocol — Python types for LSP](https://pypi.org/project/lsprotocol/)
