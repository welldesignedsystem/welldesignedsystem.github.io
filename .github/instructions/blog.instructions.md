## ++

title: "Blog Markdown Instructions"
description: "Use when writing or editing blog markdown files under content/english/blog. Enforces editorial rules and generation preferences for blog posts."
applyTo:

- "content/english/blog/\*_/_.md"
  scope: workspace

---

## Purpose

These instructions apply to all blog markdown files in the `content/english/blog/` tree. They encode the minimal, project-wide editorial preference for generated or edited blog content.

## Rules

- Oxford Comma:
  - No Oxford comma: do not use the serial (Oxford) comma in lists. For example:
    - Wrong: "I bought apples, oranges, and bananas."
    - Correct: "I bought apples, oranges and bananas."
  - This is an editorial preference for the blog content only. It does not modify code, data files or other parts of the site.

## Frontmatter

When creating a new blog post, include TOML frontmatter using +++ delimiters. Example:

```frontmatter
++
date = '2025-12-22T12:44:47+10:00'
draft = false
title = 'Anomaly Detection'
tags = ['Anomaly Detection', 'Outlier Detection', 'Machine learning']
summary = "Comprehensive Guide to mastering Anomaly Detection in Machine Learning"
++
```
