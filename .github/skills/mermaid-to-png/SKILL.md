---
name: mermaid-to-png
description: "Convert Mermaid diagram files such as .mmd into PNG images. Use when asked to render, export or convert Mermaid source to PNG."
argument-hint: "Path to the .mmd file, optional PNG output path and optional quality score (1-10)"
user-invocable: true
disable-model-invocation: false
---

# Convert Mermaid to PNG

Render Mermaid source files to PNG using Mermaid CLI (`mmdc`) with a user-selectable quality score. Keep the source file unchanged unless the user asks for diagram edits.

## Procedure

1. Identify the input `.mmd` file and any requested output path. If no output path is specified, write a `.png` beside the source using the same basename. This matches the blog image convention, for example `diagram.mmd` to `diagram.png`.
2. Check whether the output already exists. Do not overwrite an existing image without the user's approval. Ask before choosing a different output path if needed.
3. Read the requested quality score from the user's input. Accept whole numbers from 1 to 10 inclusive; reject values outside this range and ask the user to provide a valid score. If no score is provided, use quality 8. Map the score directly to Mermaid CLI's `--scale` option (quality 1 → `--scale 1`, quality 10 → `--scale 10`). State the selected quality and scale. This setting controls raster resolution, not diagram layout or visual design.
4. Check that Node.js and npm are available. This repository does not include Mermaid CLI as a dependency, so run it on demand with the selected scale:

   ```sh
   npx -p @mermaid-js/mermaid-cli mmdc -i "path/to/diagram.mmd" -o "path/to/diagram.png" --scale 8
   ```

   If Mermaid CLI is already installed, use `mmdc` directly. For repeated conversions, ask before adding it as a project dependency.

5. Before rendering, confirm with `mmdc --help` that the installed CLI supports `--scale`. Do not set width, height or size unless the user requests specific dimensions, since those options can change the rendered layout. For a requested theme, background or dimensions, consult `mmdc --help` and use only supported options alongside the selected scale.
6. Verify that the command succeeded, the output exists and is non-empty, and the PNG dimensions match a high-resolution render using an available image metadata tool. Inspect the image when a viewer is available to check that labels are legible and nothing is clipped. High scale preserves detail when zooming but cannot make an overcrowded diagram readable when shown at fit-to-screen size. If the diagram is still too dense at quality 10, explain the limitation and recommend splitting or editing the diagram source only with the user's approval. Report the output path and selected quality. If rendering fails, share the relevant error and diagnose the source or runtime without silently rewriting the `.mmd` file.

## Notes

- Quote paths so filenames containing spaces work.
- Mermaid CLI's `--scale` option and other options are documented in its official usage documentation: <https://github.com/mermaid-js/mermaid-cli#usage>.
