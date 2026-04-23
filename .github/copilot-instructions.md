# Well Designed System Website

This is a personal website and blog built with Hugo, focused on technical content about system design, software architecture, and AI development. All contributors should understand the project structure and content conventions before making changes.

## Quick Start for Agents

- **Dev server:** `npm run dev` (runs Hugo on `localhost:1313`)
- **Build:** `npm run build` (production build with minification)
- **Content format:** TOML frontmatter (not YAML) — use `+++` delimiters
- **New blog post:** Copy the structure of existing posts in `content/english/blog/[category]/[post].md`
- **Verify accuracy:** Always check official docs before adding technical content; cite sources explicitly

---

## Project Structure

- **`content/english/`** — All site content organized by section
  - `blog/` — Blog posts grouped by category (ai/, languages/, system_design/, etc.)
  - `about/` — About page and author information
  - `pages/` — Static pages (contact, resume sections)
  - `authors/` — Author profiles
- **`config/`** — Hugo configuration (languages, menus, params, modules)
- **`assets/`** — CSS, images, JavaScript (auto-compiled via TailwindCSS)
- **`layouts/`** — Custom Hugo templates and shortcodes
- **`themes/hugoplate/`** — Base theme (TailwindCSS + Alpine.js)
- **`public/`** — Generated site output (do not edit)

## Build & Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Hugo dev server with live reload |
| `npm run build` | Production build with minification and metrics |
| `npm run preview` | Preview production build locally |
| `npm run format` | Run Prettier on all files (enforces style) |
| `npm run update-modules` | Update Hugo modules |

## Content Conventions

### Frontmatter Format (TOML)
All content files use TOML frontmatter with `+++` delimiters (not YAML):

```toml
+++
date = '2026-04-10T13:00:00+10:00'
draft = false
title = 'Page Title'
tags = ['Tag1', 'Tag2', 'Tag3']
summary = "Brief summary shown in listings"
+++
```

**Key fields:**
- `date` — ISO 8601 format with timezone
- `draft` — Set to `true` to hide from production
- `title` — Human-readable title
- `tags` — Array of tags (used for filtering and pages)
- `summary` — One-line summary (10 words max for consistency)

### Creating New Blog Posts

1. **Location:** `content/english/blog/[category]/[filename].md`
2. **Category folders:** ai/, languages/, system_design/, business-ideas/, containerization/, roadmap/, soft-skills/
3. **Filename:** Use lowercase with hyphens (e.g., `github-copilot-notes.md`)
4. **Structure:** Frontmatter → Brief intro → H2 sections → Code examples as needed

### Content Guidelines

- **Markdown links:** Use relative paths (e.g., `[text](../another-post.md)`)
- **Images:** Store in `assets/images/` and reference from content
- **Code blocks:** Specify language (markdown, bash, python, typescript, etc.)
- **Headings:** Start with H2 (`##`); H1 is title from frontmatter
- **Tables of contents:** Enabled automatically for posts with multiple H2/H3 sections (ordered by default)

---

## Writing Style & Grammar

Do not use Oxford comma's in the generated text. For example, instead of "I bought apples, oranges, and bananas," write "I bought apples, oranges and bananas."

---

## Accuracy & Anti-Hallucination Guidelines

When generating text, code examples, or documentation:

### Verification First
- Only include information you can verify from official sources, documentation, or the existing codebase
- Do not invent features, APIs, or capabilities that don't exist
- Do not speculate about how something works if you're uncertain
- If information is not in the provided context or sources, explicitly state that it's outside the scope

### When Information is Unclear or Missing
- Ask clarifying questions rather than making assumptions
- Say "I'm not sure about this specific detail" rather than guessing
- Reference the exact documentation or source you're using
- Note version numbers and dates when accuracy depends on them

### Code Examples
- Base all code examples on patterns you can find in the actual codebase or official documentation
- Include comments explaining non-obvious decisions
- If a pattern isn't used in the project, acknowledge this and explain why you're suggesting it
- Test examples mentally against the documented APIs before suggesting them

### Documentation & Statements
- Cite sources when making claims (e.g., "According to the GitHub docs...")
- Avoid saying "GitHub supports X" unless you've verified it in the docs
- For features with limited support, explicitly list what IS supported and what ISN'T
- Note any caveats, limitations, or version-specific information prominently

### What NOT to Do
- ❌ Do not invent method names, function signatures, or API endpoints
- ❌ Do not assume libraries are installed if they're not in package.json or go.mod
- ❌ Do not claim a feature works on a platform unless the docs confirm it
- ❌ Do not fill in missing details with "logical" guesses—ask or research first
- ❌ Do not cite sources you haven't actually verified
- ❌ Do not speculate about unreleased or future features

### Handling Uncertainty
When you encounter something you're not 100% certain about:
1. Say explicitly: "Source: "
2. Provide what you know with clear confidence levels
3. Suggest verifying with official sources when important
4. Ask the user for clarification if their use case is ambiguous 
