# GitHub Pages Publishing Design

## Goal

Publish the existing static knowledge-base project as a public GitHub repository and make the website directly accessible through GitHub Pages.

## Repository

- Owner: `viking21alex`
- Repository: `alex-ai-chain-map`
- Visibility: public
- Default branch: `main`
- Remote: `https://github.com/viking21alex/alex-ai-chain-map.git`

## Static-site entry

The existing application remains in `dashboard.html`. A root-level `index.html` provides the GitHub Pages entry point and redirects visitors to `dashboard.html`. The redirect uses a relative URL so it works both on GitHub Pages under `/alex-ai-chain-map/` and on a local static server.

No build process or third-party hosting dependency is introduced.

## Publishing configuration

GitHub Pages will deploy from the repository's `main` branch and root directory. The expected public URL is:

`https://viking21alex.github.io/alex-ai-chain-map/`

## Validation

- An automated test verifies that `index.html` exists and points to `dashboard.html`.
- The existing application test suite must continue to pass.
- After pushing, GitHub must show the repository as public.
- The Pages settings or deployment status must identify `main / root` as the source.
- The public URL must return the site entry page after deployment completes.

## Failure handling

If Git authentication is not available locally, publishing stops before changing the remote branch and the user completes the Git credential prompt. If Pages deployment is still pending, the repository publication is reported separately from the website deployment status.
