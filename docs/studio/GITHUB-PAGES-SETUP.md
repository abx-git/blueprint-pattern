# GitHub Pages — setup (AGM Review Studio)

The Review Studio is **not** served from the agm repo root. It is built from `docs/studio/` and deployed to:

| Item | Value |
|------|--------|
| **Pages repository** | [abx-git/agm.github.io](https://github.com/abx-git/agm.github.io) |
| **Live URL** | **https://abx-git.github.io/agm.github.io/** |
| **Source in this repo** | `docs/studio/` → `npm run build` → `dist/` |
| **CI status** | [Actions → Deploy AGM Review Studio](https://github.com/abx-git/agm/actions/workflows/pages.yml) |

Deploy uses an **SSH deploy key** (not a PAT). Org PATs often authenticate as `abx-git` and get **403** on `git push`.

**Not here:** [abx-git/agm/deployments](https://github.com/abx-git/agm/deployments) stays empty — Studio is pushed into `agm.github.io`, it is not a GitHub Environment deploy of the `agm` repo.

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

## 5. Troubleshooting

| Symptom | Check |
|---------|--------|
| `agm/deployments` empty | Expected — use Actions workflow above |
| Actions green, site 404/403 | Pages source on **agm.github.io** must be branch `main` / `/` |
| Actions fails in first ~15s | `ACTIONS_DEPLOY_KEY` missing/wrong, or deploy key not write-enabled on agm.github.io |
| Manual script pushes wrong place | `git remote -v` — `pages` must be `agm.github.io`, not `blueprint-pattern.github.io` |

## Local

```bash
./scripts/open-studio.sh
```
