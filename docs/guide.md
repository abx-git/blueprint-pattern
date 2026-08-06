# Architecture Graph Method (AGM) — Guide

Operational reference. **Start with [quickstart.md](./quickstart.md)** (~10 min).

Architecture documentation as a **Markdown link graph** in `docs/architecture/`, maintained with AI agents, versioned in Git.

**Golden path:** Install → Adopt → Continue → Maintain → Review. Copy session prompts from [AGM Studio](https://abx-git.github.io/agm.github.io/) (Session workspace). MCP `agm_trigger_workflow` uses **LLMLingua-2 compressed** prompts from `@abx-hh/agm-cli` ([install](./reference/agm-mcp-install.md)) — golden path on npm; extended workflows need the private pack ([agm/README.md](../agm/README.md)).

---

## Essential workflows (7)

| Intent | Workflow | Fresh chat? |
|--------|----------|-------------|
| First-time setup | `bootstrap-adopt` | Yes |
| Next doc chapter | `bootstrap-continue` | Yes |
| Deepen one section | `refinement` | Yes |
| Import pasted content | `content-ingest` | Yes |
| Code changed | `maintenance-diff-range` | Yes |
| After sync | `review-maintenance` | **Required** |
| Milestone / phase check | `review-phase` | **Required** |

Architect/Domain and other Advanced intents: [reference/extended-workflows.md](./reference/extended-workflows.md) (opt-in install `--full` / `--domain`).

---

## Setup (once)

1. **Install** — [AGM Studio](https://abx-git.github.io/agm.github.io/) Setup (Connect → Install) or `agm-install.sh` at app repo root (default = golden path). See [reference/install.md](./reference/install.md). Studio then opens the cockpit: Architecture · Knowledge · Concepts · Analyses · Session — [studio-workspaces.md](./reference/studio-workspaces.md).
2. **Adopt** — Session → copy adoption prompt → new chat. Agent fills `entry-point.md` (start here) and `blueprint.md` (what's next), plus the first chapter.
3. **CI** — enable [agm-integrity](./reference/ci-integrity.md) on the app repo.

**Templates at adopt:** `arc42` (multi-module, default) · `lean-service` (single service). Record choice in `entry-point.md`. Advanced: [reference/advanced-templates.md](./reference/advanced-templates.md).

Alternative: [adopt-standalone](../prompts/adopt-standalone.md) after manual install.

---

## Every session

1. Copy session prompt → **new chat** (never Verify in the write chat).
2. Put `entry-point.md` in AI context (or open it first). Agent follows its links; uses `blueprint.md` as the checklist.
3. Agent updates entry-point links and blueprint checkmarks before stop.

**Compaction:** new chat after ≥2 phases, ≥15 files, or ≥30 turns; resume from session notes in `blueprint.md`.

---

## File model

```
docs/architecture/
├── entry-point.md         ← start here: short facts + links (put in AI context)
├── blueprint.md           ← what's next: checklist + short session notes
├── context/always-on.md   ← legacy stub (prefer entry-point)
├── index.md + log.md      ← OKF per-folder index + change log
├── interfaces/            ← exports.md, imports.md
├── process/               ← lifecycle artifacts (not durable chapters)
│   ├── spikes/            ← SPK-NNN: YYYY-MM-DD-<slug>/ (notes + boards)
│   └── reviews/           ← REV-NNN: YYYY-MM-DD-<slug>/ (report + findings)
├── spikes/ · work/        ← legacy (read-compatible; prefer process/)
├── sources/               ← pasted imports (Confluence, specs) with provenance
├── use-cases/             ← distilled scenarios (optional)
└── arc42/                 ← or lean-service/, etc.
```

**Rule:** `entry-point.md` = start here (facts + map). `blueprint.md` = what's next. `index.md` = OKF folder index — don't conflate with entry-point.

**Local drafts:** To keep spike drafts off Git (per developer), install with `--work-dir` (symlink target for `process/spikes/` or legacy paths) or run [external-work.md](./reference/external-work.md) / `agm work-link`. Agents write under `process/spikes/`; only the storage location changes.

---

## Assistant UI labels

Tabs **Build** · **Evolve** · **Verify** plus collapsed **Advanced** are UI organization only — not a doctrine to memorize. One chat = one session = one workflow.

After a graph exists, Advanced holds Architect and Domain (DDD) intents. Install those packs with `--full` or `--domain` (see [install.md](./reference/install.md)).

---

## Terms

| Term | Meaning |
|------|---------|
| **Graph** | Linked Markdown under `docs/architecture/` |
| **Entry** | `entry-point.md` — start here (facts + links); put in AI context |
| **Blueprint** | `blueprint.md` — what's next (checklist + short session notes) |
| **Session** | One chat = one workflow |
| **Review** | Fresh-chat Verify — report only |
| **Core prompt** | [prompts/core/system-prompt.md](../prompts/core/system-prompt.md) |
| **AGM** | Architecture Graph Method — method and [repository](https://github.com/abx-git/agm) |

---

## Mechanisms

| Mechanism | Purpose |
|-----------|---------|
| Documentation API | Typed OKF Markdown the agent traverses |
| MCP transport | Code and docs on demand; traverse `interfaces/exports.md` and `imports.md` |
| Session discipline | `blueprint.md` progress + fresh Verify chats |
| Semantic anchors | `LINK_CHECK`, `CHANGED_FILES`, `SPIKE` (alias `WORK_ITEM`), `VERDICT`, … |
| CI link check | Broken relative links fail PR |

---

## Verify: when to use which

| Workflow | When |
|----------|------|
| `review-maintenance` | After `maintenance-diff-range` or code sync |
| `review-phase` | After completing a blueprint checklist chapter |
| `review-milestone` | End of Build stage (extended catalog) |

---

## App layout reference

Architect / Domain spikes: traverse links first; create `process/spikes/YYYY-MM-DD-<slug>/` (index.md, notes.md, boards/); register `SPK-NNN` in `blueprint.md` ## Spikes with Track `architecture` or `domain`. Verify sessions write `process/reviews/YYYY-MM-DD-<slug>/` (`REV-NNN`). Legacy top-level `spikes/` + `work/` + `WRK-*` remain readable.

Day to day: (1) core prompt in IDE rules, (2) content in `docs/architecture/`, (3) session prompt per chat.

---

## Upgrading

### AGM platform (workflows, prompts) — safe

When a new AGM release adds workflows or updates procedures, **do not re-run install**. Use [upgrade.md](./reference/upgrade.md):

```bash
curl -fsSL https://raw.githubusercontent.com/abx-git/agm/main/scripts/agm-upgrade.sh | bash
# or: npx @abx-hh/agm-cli upgrade
```

Architecture content (`blueprint.md`, template chapters, `process/spikes/`, …) is preserved.

### Arc42-only wording → optional templates

No breaking change for existing arc42 adopters.

**If you already use arc42:** Keep `arc42/` layout. Add to `entry-point.md`:

```markdown
## Documentation template

Selected template: arc42
Rationale: <why arc42 fits this system>
```

Replace role prompts from [templates/architecture/prompts/](templates/architecture/prompts). Adopt the [core prompt](../prompts/core/system-prompt.md).

**Lighter template:** See [reference/advanced-templates.md](./reference/advanced-templates.md) for `c4-light`, `adr-first`, `lean-service`, `custom` migration steps.

**Human review:** Template changes are architectural decisions — record rationale in `entry-point.md` and run Verify in a fresh chat before removing old sections.

---

## Further reading

| Document | When |
|----------|------|
| [quickstart.md](./quickstart.md) | Mandatory first read |
| [reference/index.md](./reference/index.md) | Format specs and lookup |
| [reference/extended-workflows.md](./reference/extended-workflows.md) | Full workflow list |
| [ROADMAP.md](./ROADMAP.md) | Consolidation progress |
| [typical-dialog.md](./typical-dialog.md) | Sample sessions |
| [gen-ai-challenges.md](./gen-ai-challenges.md) | Governance summary (leads) |
| [reference/spec-driven-development.md](./reference/spec-driven-development.md) | AGM vs feature SDD |
| [case-studies.md](./case-studies.md) | Real-world applications |
| [article/agm-for-architects.md](./article/agm-for-architects.md) | Principles |
| [examples/sample-app/](./examples/sample-app/) | Multi-service example |
