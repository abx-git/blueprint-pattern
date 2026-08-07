# Adoption procedure (agent reference)

Bundled into the standalone adoption prompt. **Preparation:** human installs the scaffold (AGM Studio browser write, or CLI). **Adoption session:** agent executes Phase B–C only.

## Phase 0 — Install (human, before first chat)

Install the scaffold **before** the first adoption chat. Use the **same documentation root** you will pass in Project parameters / `--doc-root` (default path if you leave Project parameters empty).

**AGM Studio (preferred):** open the Studio URL → Connect → bind the architecture folder with write access → Install → write **entry-point.md** + **blueprint.md** only. Then open the app repo in your AI tool and paste the Adopt prompt.

**CLI alternatives:**

```bash
npx @abx-hh/agm-cli scaffold --project "Order Service" --template arc42 --ai-tool cursor --doc-root <doc-root>/
```

```bash
./agm-install.sh --project "Order Service" --doc-root <doc-root>/ --template arc42 --ai-tool cursor
```

**Studio Install provides:** `<doc-root>/entry-point.md` and `<doc-root>/blueprint.md` only. Prompts stay in AGM Studio. Chapters, domain/, and process artifacts are created when Adopt / Extend / Studio actions produce them.

**CLI install may additionally provide:**

- `prompts/core/system-prompt.md`, `prompts/reference/`, `<doc-root>/prompts/role-*.md`
- template stubs and process templates
- AI tool rules (Cursor `.cursor/rules/`, etc.)

Optional `--work-dir`: symlink `<doc-root>/process/spikes` (preferred) or legacy `<doc-root>/work` outside Git — [external-work.md](./external-work.md).

Do **not** invent a second documentation root. Always write under the configured `<doc-root>/`.

`blueprint.md` / `entry-point.md` from Studio are expected stubs; the adoption session **fills** them and creates the first real chapter.

## Phase A — Verify scaffold (agent)

**Studio path** (Project parameters / Studio prompt notes present): require only that `<doc-root>/entry-point.md` and `<doc-root>/blueprint.md` exist (or can be created). Do **not** stop for missing `prompts/role-bootstrap.md` or `prompts/core/system-prompt.md`.

**CLI path:** if those prompt files exist, use them; if the human used a full CLI install and role-bootstrap is missing, ask them to finish install.

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

Follow on-disk `prompts/role-bootstrap.md` when present; otherwise follow the Adopt session prompt (Studio):

- Record template and facts in `entry-point.md`.
- Populate `blueprint.md` checklist; mark first in-progress item.
- Create and populate the first high-value section from evidence only (no empty stubs).
- Keep entry-point (map) and blueprint (checklist) in sync.
- Create `process/spikes/` / `process/reviews/` only when a spike/review starts — not by default in Adopt.
- Do **not** read or promote `notes/` unless the human explicitly asks. Do **not** treat Concepts/Analyses spikes as lasting architecture truth unless the human explicitly asks to promote findings.
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
