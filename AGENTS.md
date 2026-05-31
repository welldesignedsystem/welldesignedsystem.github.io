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

**CI note:** deploy.yml runs `hugo --gc --minify --baseURL "$URL"` directly (not `npm run build`) so GitHub Pages can inject the deployment URL. Uses `npm ci` — `package-lock.json` is tracked despite `.gitignore`.

## Content conventions

- **Frontmatter is TOML** (`+++`), never YAML.
- Blog posts: `content/english/blog/{category}/{slug}.md`.
- Categories: `ai/`, `business-ideas/`, `containerization/`, `languages/`, `legacy/`, `roadmap/`, `security/`, `soft-skills/`, `system_design/`.
- No Oxford comma in blog text (see `.github/instructions/blog.instructions.md`).
- New posts: copy frontmatter from an existing post, use ISO 8601 date with timezone.

## Architecture

- **Theme**: `github.com/zeon-studio/hugoplate` (Hugo module, not submodule). Config in `config/_default/`.
- **Asset pipeline**: TailwindCSS v4 via `@tailwindcss/cli` (CSS config, no `tailwind.config.js`).
- **Required**: Hugo **extended** (>= 0.151.0). Go and Node.js needed locally.
- **Custom layouts**: only `layouts/shortcodes/` (`iframe`, `include`) — everything else inherited.
- **Build output**: `public/` — generated, not committed.

## CI / deploy

- Push to `main` → GitHub Actions (Hugo + Node 24) → GitHub Pages.

## Reference files

- `.github/copilot-instructions.md` — agent guidance, writing style, anti-hallucination rules
- `.github/instructions/blog.instructions.md` — blog editorial rules (Copilot workspace rules file)
- `.github/commit-instructions.md` — commit message format
- `.github/agents/commit-reviewer.agent.md` — commit review agent definition
- `.github/agents/research.agent.md` — research agent definition
