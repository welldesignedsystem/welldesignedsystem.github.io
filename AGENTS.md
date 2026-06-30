# AGENTS.md — welldesignedsystem.github.io

Hugo static site (hugoplate theme, TailwindCSS v4, Hugo modules). Deployed to GitHub Pages via `.github/workflows/deploy.yml`.

## Commands

| Command                  | Purpose                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Hugo dev server (localhost:1313, live reload; **no drafts** — use `hugo server -D` for drafts)                   |
| `npm run build`          | Production build (gc, minify, template metrics, `--forceSyncStatic`)                                             |
| `npm run preview`        | Dev server, production env, template metrics                                                                     |
| `npm run format`         | Prettier only (with `prettier-plugin-go-template` + `prettier-plugin-tailwindcss`) — **no linter, no typecheck** |
| `npm run update-modules` | Update all Hugo module deps                                                                                      |

## CI / deploy

Push to `main` → GitHub Actions (Node 24, Hugo latest) → GitHub Pages. CI builds with `hugo --gc --minify --baseURL "$URL"` (not `npm run build`) — GitHub Pages injects the URL. CI uses `npm ci`.

**Tracked despite `.gitignore`** (CI needs them): `package-lock.json` and `hugo_stats.json` — do not delete.

## Content

- **Frontmatter is TOML** (`+++`), never YAML.
- Blog posts: `content/english/blog/{category}/{slug}.md`.
- Categories (9): `ai/`, `business-ideas/`, `containerization/`, `languages/`, `legacy/`, `roadmap/`, `security/`, `soft-skills/`, `system_design/`.
- `summaryLength = 10` — excerpts truncate at 10 words.
- No Oxford comma (see `.github/instructions/blog.instructions.md`).
- Goldmark renders raw HTML in markdown (`unsafe = true`).
- Code highlighting: `guessSyntax = true`, `solarized-light` style.

## Architecture

- **Theme**: `github.com/zeon-studio/hugoplate` — Hugo module (auto-downloaded). Module imports in `config/_default/module.toml`.
- **Asset pipeline**: TailwindCSS v4 via `@tailwindcss/cli` (no `tailwind.config.js`, no PostCSS). Entrypoint: `assets/css/custom.css`.
- **Custom plugins**: `tailwind-plugin/` (`tw-bs-grid.js`, `tw-theme.js`).
- **Required**: Hugo extended >= 0.151.0. Go and Node.js needed locally (CI uses Node 24, no `.nvmrc`).
- **Custom layouts**: only `layouts/shortcodes/` (`iframe`, `include`) — everything else inherited from the module.
- **Build output**: `public/` — generated, not committed.
- **Module quirk**: `hugo_stats.json` mounted with `disableWatch = true` — CSS rebuilds won't trigger on stat changes alone.

## See also

- `.github/copilot-instructions.md` — writing style, anti-hallucination rules
- `.github/instructions/blog.instructions.md` — blog editorial rules
- `.github/commit-instructions.md` — commit message format
