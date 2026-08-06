# AGM — 10-minute quickstart

**Thesis:** Architecture documentation is a small Markdown wiki next to the code — start from `entry-point.md`.

**AGM in one sentence:** Repo-local Markdown with links, a checklist in `blueprint.md`, kept current with short AI sessions.

*(Source: [github.com/abx-git/agm](https://github.com/abx-git/agm).)*

---

## Golden path

One onboarding path — everything else is advanced.

| Step | What you do | Workflow |
|------|-------------|----------|
| **Install** | Connect folder in Studio Setup, write starter (includes `domain/`) | [AGM Studio](https://abx-git.github.io/agm.github.io/) |
| **Adopt** | Session → copy prompt → new chat — fill entry-point + first chapter | `bootstrap-adopt` |
| **Continue** | Session → Extend — next checklist item | `bootstrap-continue` |
| **Maintain** | Session → Sync — sync docs with code | `maintenance-diff-range` |
| **Import** | Session → Import — paste Confluence, specs, use cases | `content-ingest` |
| **Review** | **Fresh chat** — report only, never same chat as write | `review-maintenance` |

After Setup, Studio is a **cockpit**: Architecture · Knowledge (`domain/`) · Concepts · Analyses · Session (context pack + copy-paste). Details: [reference/studio-workspaces.md](./reference/studio-workspaces.md).

Copy the session prompt from Studio Session (or `prompts/workflows/<id>.md`) into a new chat. **Default:** copy-paste. **Optional:** MCP `agm_trigger_workflow` — golden path works with the public starter pack ([agm/README.md](../agm/README.md)).

**Install vs `agm init`:** use Studio Install or `agm-install.sh` for the full scaffold; `agm init` creates only the core files — [reference/install.md](./reference/install.md).

```bash
curl -fsSL https://raw.githubusercontent.com/abx-git/agm/main/scripts/agm-install.sh | bash -s -- \
  --project "my-app" --template arc42
```

Default install = golden path (7 workflows). Add `--full` for Architect + Domain packs. Details: [reference/install.md](./reference/install.md).

Templates at adopt time: **`arc42`** (multi-module, default) or **`lean-service`** (single service). Others → [guide.md](./guide.md) advanced section.

---

## Two core files (+ OKF helpers)

```
docs/architecture/
├── entry-point.md         ← start here: short facts + links (put in AI context)
├── blueprint.md           ← what's next: checklist + short session notes
├── context/always-on.md   ← legacy stub (prefer entry-point)
├── domain/                ← Knowledge workspace (DDD)
├── process/spikes/        ← Concepts & Analyses (by spike type)
├── extensions/            ← optional custom areas
└── index.md + log.md      ← OKF: per-folder disclosure + change log
```

**Rule:** `entry-point.md` = start here. `blueprint.md` = what's next. `index.md` = OKF folder index — don't conflate with entry-point.

Concepts and analyses live under `process/spikes/` (Studio filters by type; see [guide.md](./guide.md)). Also traverse `interfaces/exports.md` and `interfaces/imports.md` when relevant.

---

## Why this beats context dumps

```text
Traditional                         AGM
───────────                         ───
Paste repo / long chat history  →   Open entry-point.md in AI context
Similarity search (RAG)         →   Follow links from entry-point.md
Stale wiki                      →   git diff → maintenance-diff-range
Same chat writes + reviews      →   Fresh chat for Verify
```

Habit: **entry-point in context** · **follow links** · **tick blueprint** · **fresh chat for Verify**.

The docs also guide implementation: spikes + `interfaces/` inform code sessions; **Maintenance** syncs docs after merge. Distinction from feature-spec tools (e.g. Kiro): [reference/spec-driven-development.md](./reference/spec-driven-development.md).

---

## Essential workflows (6)

| When | Workflow | Fresh chat? | You get |
|------|----------|-------------|---------|
| First setup | `bootstrap-adopt` | Yes | `blueprint.md`, `entry-point.md`, first section |
| Next chapter | `bootstrap-continue` | Yes | One more template section |
| Deepen a section | `refinement` | Yes | Richer view for one file |
| Code changed | `maintenance-diff-range` | Yes | Doc sync from git range |
| After sync | `review-maintenance` | **Required** | Report in `work/`, no edits |
| After a phase | `review-phase` | **Required** | Report in `work/`, no edits |

Public MCP starter ships these six only. Architect/Domain (query, design, DDD, …): Assistant **Advanced** after a graph exists — install with `--full` / `--domain`. Catalog: [reference/extended-workflows.md](./reference/extended-workflows.md).

---

## Phase states and anchors

Progress in `blueprint.md` uses `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked.

Agents output semantic anchors before stopping (session checklist):

| Anchor | Meaning |
|--------|---------|
| `LINK_CHECK` | `pass` or `fail` — relative links valid |
| `CHANGED_FILES` | Files touched this session |
| `WORK_ITEM` | New/updated `work/` + WRK entry |
| `VERDICT` / `FINDINGS` | Review outcome (Verify only) |
| `OPEN_QUESTIONS` | Unresolved assumptions |

**Compaction:** new chat after long sessions (≥2 phases, ≥15 files, or ≥30 turns); resume from `blueprint.md` session log.

**CI:** enable [`agm-integrity`](https://github.com/abx-git/agm/blob/main/.github/workflows/agm-integrity.yml) on your app repo — broken links fail the PR.

---

## Human responsibilities

- Approve blueprint phases before marking `[x]`
- Run Verify in a **fresh chat** (never the write/sync chat)
- Ship doc updates in the **same PR** as architectural code changes

---

## What AGM does not solve

- **Model hallucination** — graph traversal reduces it; humans still validate claims
- **Secrets in prompts** — never paste credentials; redact diffs
- **Live production state** — static docs ≠ metrics, logs, or runtime topology
- **Org ownership** — without PR rules and named owners, the graph goes stale
- **Parallel agents on one blueprint** — one doc-writing agent per app at a time

Details: [gen-ai-challenges.md](./gen-ai-challenges.md) (leads / governance).

---

## Further reading

[guide.md](./guide.md) · [reference/extended-workflows.md](./reference/extended-workflows.md) · [reference/spec-driven-development.md](./reference/spec-driven-development.md) · [ROADMAP.md](./ROADMAP.md) · [typical-dialog.md](./typical-dialog.md) · [architects article](./article/agm-for-architects.md) · [sample app](./examples/sample-app/) · [MCP/CLI](../agm/README.md)
