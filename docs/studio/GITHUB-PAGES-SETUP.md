# GitHub Pages — setup (AGM Review Studio)

The Review Studio is **not** served from the agm repo root. It is built from `docs/studio/` and deployed to:

| Item | Value |
|------|--------|
| **Pages repository** | [abx-git/agm.github.io](https://github.com/abx-git/agm.github.io) |
| **Live URL** | **https://abx-git.github.io/agm.github.io/** |
| **Source in this repo** | `docs/studio/` → `npm run build` → `dist/` |
| **CI status** | [Actions → Deploy AGM Review Studio](https://github.com/abx-git/agm/actions/workflows/pages.yml) |
| **Jekyll off** | `docs/studio/public/.nojekyll` (copied into `dist/` by Vite; CI also `touch`es site-root `.nojekyll`) |

Deploy uses an **SSH deploy key** (not a PAT). Org PATs often authenticate as `abx-git` and get **403** on `git push`.

**Not here:** [abx-git/agm/deployments](https://github.com/abx-git/agm/deployments) stays empty — Studio is pushed into `agm.github.io`, it is not a GitHub Environment deploy of the `agm` repo.

Empty `public/.nojekyll` disables Jekyll on GitHub Pages so Vite’s `_assets/`-style folders and SPA paths are not stripped. Keep that file in git; do not delete it.

## 1. Enable Pages on the Pages repository

**https://github.com/abx-git/agm.github.io/settings/pages**

| Field | Value |
|-------|--------|
| **Source** | Deploy from a branch |
| **Branch** | `main` |
| **Folder** | `/` (root) |

If Source is “GitHub Actions” instead, the SSH push from this workflow will **not** publish the site (HTTP 404/403). Switch back to **Deploy from a branch**.

After a green Actions run you should see a commit like `Deploy AGM Review Studio from agm@……` on [agm.github.io/commits/main](https://github.com/abx-git/agm.github.io/commits/main).

## 2. Deploy key

Same as before: RSA deploy key on **agm.github.io** (write), private key as `ACTIONS_DEPLOY_KEY` on **agm**. See the historical notes in [docs/assistant/GITHUB-PAGES-SETUP.md](../assistant/GITHUB-PAGES-SETUP.md) for key generation steps.

Optional: `AGM_GHIO_DEPLOY` (fine-grained PAT with Pages admin on agm.github.io) so CI can enable Pages via API.

## 3. CI

`.github/workflows/pages.yml` on push to `main` when `docs/studio/**`, `docs/assistant/**`, or workflow prompts change:

1. `python3 scripts/sync-assistant-data.py`
2. `cd docs/studio && npm ci && npm run build`
3. rsync `docs/studio/dist/` (+ `.nojekyll`) to agm.github.io `main`
4. Best-effort HTTP check of the live URL

## 4. Manual publish

```bash
# Prefer HTTPS URL for the pages remote (not the old blueprint-pattern.github.io name)
git remote remove pages 2>/dev/null || true
git remote add pages https://github.com/abx-git/agm.github.io.git
./scripts/push-studio-to-pages.sh
```

## 5. Two-step publish (important)

A green **agm** Actions run only **pushes files** into `agm.github.io`. GitHub then runs a separate workflow on that repo:

**[agm.github.io → Actions → pages build and deployment](https://github.com/abx-git/agm.github.io/actions/workflows/pages-build-deployment.yml)**

Only when **that** run is green does https://abx-git.github.io/agm.github.io/ update. If it fails, the live site keeps the last successful publish (often days old).

## 6. Troubleshooting

| Symptom | Check |
|---------|--------|
| `agm` Actions green, site still old | Open [pages-build-deployment](https://github.com/abx-git/agm.github.io/actions/workflows/pages-build-deployment.yml) — look for a **red** run (“Timeout reached, aborting!”). Click **Re-run all jobs**. |
| `agm/deployments` empty | Expected — use Actions on **agm** + Pages builds on **agm.github.io** |
| Actions green, site 404/403 | Pages source on **agm.github.io** must be branch `main` / `/` |
| Deploy job waits then times out (~10 min) | Environment **github-pages** on agm.github.io: allow branch `main`; remove required reviewers / wait timers if any: [Environments](https://github.com/abx-git/agm.github.io/settings/environments) |
| Actions fails in first ~15s | `ACTIONS_DEPLOY_KEY` missing/wrong, or deploy key not write-enabled on agm.github.io |
| Manual script pushes wrong place | `git remote -v` — `pages` must be `agm.github.io`, not `blueprint-pattern.github.io` |
| Wrong URL | Live site is **https://abx-git.github.io/agm.github.io/** (project Pages). `https://abx-git.github.io/` is 404 unless you use a repo named `abx-git.github.io`. |

### Verify freshness

```bash
# Must match (same index-*.js hash). If raw is newer than live → Pages deploy failed.
curl -sS https://raw.githubusercontent.com/abx-git/agm.github.io/main/index.html | grep -o 'index-[^"]*\.js'
curl -sS https://abx-git.github.io/agm.github.io/ | grep -o 'index-[^"]*\.js'
```

## Local

```bash
./scripts/open-studio.sh
```
