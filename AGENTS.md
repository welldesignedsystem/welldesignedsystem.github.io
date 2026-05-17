# AGENTS.md — welldesignedsystem.github.io

Hugo static site (hugoplate theme, TailwindCSS v4, Hugo modules). Deployed to GitHub Pages via `.github/workflows/deploy.yml`.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Hugo dev server (localhost:1313, live reload) |
| `npm run build` | Production build (gc, minify, metrics) |
| `npm run format` | Prettier (only formatter — no linter/typecheck) |

## Content conventions

- **Frontmatter is TOML** (`+++` delimiters), not YAML. Common gotcha.
- Blog posts live in `content/english/blog/{category}/{slug}.md`.
- Categories: `ai/`, `languages/`, `system_design/`, `business-ideas/`, `containerization/`, `roadmap/`, `soft-skills/`, `security/`, `legacy/`.
- No Oxford comma in blog text (editorial rule, `.github/instructions/blog.instructions.md`).
- New posts: copy frontmatter from an existing post, use ISO 8601 `date` with timezone.

## Architecture

- **Theme**: `github.com/zeon-studio/hugoplate` (Hugo module, not submodule). Config in `config/_default/`.
- **Asset pipeline**: TailwindCSS v4 via `@tailwindcss/cli` (CSS-based config, no `tailwind.config.js`).
- **Required**: Hugo **extended** version (>= 0.151.0, enforced by `module.toml`). Go and Node.js needed locally.
- **Custom layouts**: only `layouts/shortcodes/` — everything else inherited from the theme.
- **Search**: Hugo module-based, indexed from `content/english/blog/`.

## CI / deploy

- Push to `main` → GitHub Actions builds (Hugo + Node 24) and deploys to GitHub Pages.
- Uses `npm ci` (clean install), not `npm install`.

## Existing instruction files (read these too)

- `.github/copilot-instructions.md` — detailed agent guidance, writing style, anti-hallucination rules
- `.github/instructions/blog.instructions.md` — blog post editorial rules
- `.github/commit-instructions.md` — commit message format
- `.github/agents/commit-reviewer.agent.md` — commit review agent definition
- `.github/agents/research.agent.md` — research agent definition
