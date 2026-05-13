# Well Designed System

Hugo source for the `welldesignedsystem.github.io` GitHub Pages site.

## Deploying

The site is built by GitHub Actions using `.github/workflows/deploy.yml` and published through GitHub Pages.

After pushing to `main`, check the **Actions** tab for the `Deploy Hugo site to GitHub Pages` workflow. The site should only be considered stable after both the `build` and `deploy` jobs are green.

## GitHub Pages 404 Warning

If the repository is switched from public to private and back to public, GitHub Pages may temporarily lose or reset its active deployment state.

Symptoms:

- `https://welldesignedsystem.github.io/blog/` shows GitHub's generic `404 File not found` page.
- Re-running the Pages deployment fixes the site.
- Refreshing while the deployment is still in progress may briefly show the same 404 until GitHub finishes attaching and propagating the new Pages artifact.

Recovery checklist:

1. Go to **Settings** -> **Pages**.
2. Confirm **Build and deployment** uses **GitHub Actions**.
3. Go to **Actions** and run or re-run `Deploy Hugo site to GitHub Pages`.
4. Wait for the `deploy` job to finish successfully.
5. Hard refresh the site, or test in an incognito/private browser window.

This is usually a GitHub Pages deployment/propagation issue, not a missing Hugo route. The local Hugo build should generate `public/blog/index.html` for the blog index.
