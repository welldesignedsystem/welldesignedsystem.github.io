---
name: mermaid-to-png
description: "Convert Mermaid diagram files such as .mmd into PNG images. Use when asked to render, export or convert Mermaid source to PNG."
argument-hint: "Path to the .mmd file and optional PNG output path"
user-invocable: true
disable-model-invocation: false
---

# Convert Mermaid to PNG

Render Mermaid source files to PNG using Mermaid CLI (`mmdc`). Keep the source file unchanged unless the user asks for diagram edits.

## Procedure

1. Identify the input `.mmd` file and any requested output path. If no output path is specified, write a `.png` beside the source using the same basename. This matches the blog image convention, for example `diagram.mmd` to `diagram.png`.
2. Check whether the output already exists. Do not overwrite an existing image without the user's approval. Ask before choosing a different output path if needed.
3. Check that Node.js and npm are available. This repository does not include Mermaid CLI as a dependency, so run it on demand:

   ```sh
   npx -p @mermaid-js/mermaid-cli mmdc -i "path/to/diagram.mmd" -o "path/to/diagram.png"
   ```

   If Mermaid CLI is already installed, use `mmdc` directly. For repeated conversions, ask before adding it as a project dependency.

4. If the user requests a theme, background or dimensions, consult `mmdc --help` and add only the relevant supported options. Otherwise, use the CLI defaults.
5. Verify that the command succeeded and that the output exists and is non-empty, for example with `test -s "path/to/diagram.png"`. Report the output path. If rendering fails, share the relevant error and diagnose the source or runtime without silently rewriting the `.mmd` file.

## Notes

- Quote paths so filenames containing spaces work.
- Use Mermaid CLI's official usage documentation for less common options: <https://github.com/mermaid-js/mermaid-cli#usage>.
