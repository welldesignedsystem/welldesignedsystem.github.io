++
---
title: "Blog Markdown Instructions"
description: "Use when writing or editing blog markdown files under content/english/blog. Enforces editorial rules and generation preferences for blog posts."
applyTo:
  - "content/english/blog/**/*.md"
scope: workspace
---

Purpose
-------

These instructions apply to all blog markdown files in the `content/english/blog/` tree. They encode the minimal, project-wide editorial preference for generated or edited blog content.

Rules
-----

- No Oxford comma: do not use the serial (Oxford) comma in lists. For example:

  - Wrong: "I bought apples, oranges, and bananas."
  - Correct: "I bought apples, oranges and bananas."

How to follow this when generating text
-------------------------------------

- When producing lists of three or more items, omit the comma before the final conjunction (`and`, `or`).
- Prefer concise sentences and avoid adding extra commas where not required by grammar.

Examples/prompts to test
-----------------------

- "Write a short intro paragraph about [topic] using plain language and no Oxford comma."
- "Convert the following paragraph to match the blog style: (paste paragraph). Ensure no Oxford comma is used."

Notes
-----

- This is an editorial preference for the blog content only. It does not modify code, data files or other parts of the site.
- If you need a stricter, automated enforcement (lint rule or CI check), I can add a Markdown lint configuration next.
