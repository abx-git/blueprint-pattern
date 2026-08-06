# Adoption procedure (agent reference)

Bundled into the standalone adoption prompt. **Preparation:** human installs the scaffold (AGM Studio browser write, or CLI). **Adoption session:** agent executes Phase B–C only.

## Phase 0 — Install (human, before first chat)

Install the scaffold **before** the first adoption chat. Use the **same documentation root** you will pass in Project parameters / `--doc-root` (default path if you leave Project parameters empty).

**AGM Studio (preferred):** open the Studio URL → Connect → bind the architecture folder with write access → Install → Write starter into folder. Then open the app repo in your AI tool and paste the Adopt prompt.

**CLI alternatives:**

```bash
npx @abx-hh/agm-cli scaffold --project "Order Service" --template arc42 --ai-tool cursor --doc-root <doc-root>/
```

```bash
./agm-install.sh --project "Order Service" --doc-root <doc-root>/ --template arc42 --ai-tool cursor
```

Install should provide:

- `prompts/core/system-prompt.md`, `prompts/reference/` (when using full CLI install)
- `<doc-root>/` scaffold: context, role prompts, template stubs, `process/spikes/` and `process/reviews/` (+ optional legacy `work/` templates)
- AI tool rules when using CLI install (Cursor `.cursor/rules/`, etc.) — Studio browser starter may omit IDE rules; remind the human if missing

Optional `--work-dir`: symlink `<doc-root>/process/spikes` (preferred) or legacy `<doc-root>/work` outside Git — [external-work.md](./external-work.md).

Do **not** invent a second documentation root. Always write under the configured `<doc-root>/`.

`blueprint.md` / `entry-point.md` may already exist as stubs from Studio; the adoption session owns filling them.

## Phase A — Verify scaffold (agent)

Confirm `<doc-root>/prompts/role-bootstrap.md` exists. Prefer `prompts/core/system-prompt.md` at repo root when present. If role-bootstrap is missing, stop and ask the human to finish Install with the same documentation root.

Do not re-download, clone, or duplicate files already installed.

## Phase B — Configure

If the session prompt includes **Architecture documentation areas (bootstrap)**, extend `blueprint.md` with checklist rows and stubs for each selected area (see [doc-extensions.md](./doc-extensions.md)). Do not skip areas the human selected.

If the session prompt includes **Project parameters** or **Adoption parameters** (Documentation root), fill these under `<doc-root>/`:

| File | Write |
|------|-------|
| `entry-point.md` | **Start here** — short facts (name, stack, source map) + links to chapters, `process/`, sources |
| `blueprint.md` | **What's next** — checklist rows for selected template, Spikes + Reviews tables, initial `[ ]` / `[~]` |
| `context/always-on.md` | Legacy stub only — merge leftover facts into entry-point |

Remind the human only if IDE rules are missing.

## Phase C — Bootstrap

Follow `<doc-root>/prompts/role-bootstrap.md`:

- Record template and facts in `entry-point.md`.
- Populate `blueprint.md` checklist; mark first in-progress item.
- Populate interfaces/ and the first high-value section from evidence only.
- Keep entry-point (map) and blueprint (checklist) in sync.
- Ensure `<doc-root>/process/spikes/` and `<doc-root>/process/reviews/` are ready for later SPK/REV items.
- Short session note + required anchors at end.

## Lifecycle after Build (phase 1)

| Phase | Action |
|-------|--------|
| **1 · Build** (continue) | `bootstrap-continue` until phases done → `review-milestone` |
| **2 · Evolve** | `refinement`, `maintenance` (+ git diff); ingest → `sources/` |
| **3 · Spike** | Architecture/Domain spikes under `process/spikes/` |
| **Review** (any phase) | `review-phase`, `review-maintenance` — report-only → `process/reviews/` |

Session prompts: [AGM Studio](https://abx-git.github.io/agm.github.io/) Run phase, or (if installed) `prompts/workflows/<id>.md` / MCP.

---

## Appendix A — Core prompt (installed to `prompts/core/system-prompt.md`)

See [system-prompt.md](../../prompts/core/system-prompt.md) in the pattern repository. CLI install copies it; Studio browser starter may not — do not duplicate in the adoption chat unless the file is missing and the human asks.

## Appendix B — Role prompt shape

Each `<doc-root>/prompts/role-*.md` file uses: `[SA:ROLE]`, `[SA:INPUTS]`, `[SA:STEPS]`, `[SA:QUALITY_GATES]`, `[SA:OUTPUT_CONTRACT]`, `[SA:STOP]` when installed from full templates. Studio starter roles may be shorter; still follow the session prompt and core rules.
