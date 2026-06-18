# AGENTS.md — welldesignedsystem.github.io

Hugo static site (hugoplate theme, TailwindCSS v4, Hugo modules). Deployed to GitHub Pages via `.github/workflows/deploy.yml`.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Hugo dev server (localhost:1313, live reload; **no drafts** — use `hugo server -D` for drafts) |
| `npm run build` | Production build (gc, minify, template metrics) |
| `npm run preview` | Dev server, production env, template metrics |
| `npm run format` | Prettier only — **no linter, no typecheck** |
| `npm run update-modules` | Update all Hugo module deps |

**CI note:** deploy.yml builds with `hugo --gc --minify --baseURL "$URL"` (not `npm run build`) so GitHub Pages injects the URL. CI uses `npm ci`.

**Tracked despite `.gitignore`:** `package-lock.json` and `hugo_stats.json` — do not delete.

**No opencode.json** — no local OpenCode config.

## Content

- **Frontmatter is TOML** (`+++`), never YAML.
- Blog posts: `content/english/blog/{category}/{slug}.md`.
- Categories: `ai/`, `business-ideas/`, `containerization/`, `languages/`, `legacy/`, `roadmap/`, `security/`, `soft-skills/`, `system_design/`.
- No Oxford comma in blog text (see `.github/instructions/blog.instructions.md`).
- `summaryLength = 10` in `hugo.toml` — excerpts truncate at 10 words.
- Goldmark renders raw HTML in markdown (`unsafe = true`).
- Code highlighting uses `guessSyntax = true` with `solarized-light` style.

## Architecture

- **Theme**: `github.com/zeon-studio/hugoplate` — Hugo module (auto-downloads to `themes/hugoplate/`). Config in `config/_default/`.
- **Asset pipeline**: TailwindCSS v4 via `@tailwindcss/cli` (CSS config, no `tailwind.config.js`). Entrypoint: `assets/css/custom.css`.
- **Custom plugins**: `tailwind-plugin/` (tw-bs-grid.js, tw-theme.js).
- **Required**: Hugo extended >= 0.151.0 (per theme.toml). Go and Node.js needed locally.
- **Custom layouts**: only `layouts/shortcodes/` (`iframe`, `include`) — everything else inherited from the module.
- **Build output**: `public/` — generated, not committed.
- **Module quirk**: `hugo_stats.json` mounted with `disableWatch = true` — CSS rebuilds won't trigger on stat changes alone.

## CI / deploy

Push to `main` → GitHub Actions (Node 24, Hugo latest) → GitHub Pages.

## See also

- `.github/copilot-instructions.md` — writing style, anti-hallucination rules
- `.github/instructions/blog.instructions.md` — blog editorial rules
- `.github/commit-instructions.md` — commit message format
