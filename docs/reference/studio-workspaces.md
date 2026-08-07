# AGM Studio workspaces

Studio uses a **hybrid** model: one-time Setup (Connect → Install), then a durable **workspace cockpit**.

## Workspaces

| Id | Label | Path convention | Primary workflows |
|----|-------|-----------------|-------------------|
| `architecture` | Architecture | Template chapters (`arc42/`, `lean-service/`, …), `interfaces/`, `ops/`, `use-cases/`, `sources/`, `extensions/` | Adopt, Continue/Extend, Evolve, content-ingest |
| `knowledge` | Knowledge | `domain/` (+ optional KB under `extensions/` tagged for knowledge) | domain-work-*, domain-board-ingest |
| `inbox` | Inbox | `inbox/raw/`, `inbox/proposals/`, `inbox/done/` | inbox-analyze, inbox-refine, inbox-merge |
| `concepts` | Concepts | `process/spikes/` with types `question`, `design`, `domain-*` | architecture-work-design; spike create/edit |
| `analyses` | Analyses | `process/spikes/` with type `analysis` | architecture-work-analysis; interrogate/query |
| `meta` | (shared state) | `entry-point.md`, `blueprint.md`, `context/`, `index.md`, `log.md` | Always included in context packs |

Reviews under `process/reviews/` are **Verify reports** (AI quality checks of durable docs, report-only). In Studio they live under **Architecture → Verify reports**, not under Concepts.

## Inbox (multi-step ingest)

Incoming material that may touch Architecture, Knowledge, Concepts, Analyses, or periphery:

1. **Raw** — paste in Studio or drop files into `inbox/raw/`
2. **Analyze** — AI writes `inbox/proposals/*.md` (`type: inbox-proposal`, `status: draft`) with structured content + integration/link instructions — **no merge**
3. **Review** — human edits / Refine dialog; set `status: ready`
4. **Merge** — AI applies ready proposals into the graph, writes `sources/` provenance, moves proposal to `inbox/done/`

Procedure: [inbox-pipeline.md](./inbox-pipeline.md). Prefer Inbox over one-shot `content-ingest` when using Studio.

## State files (keep LLM context small)

| File | Role |
|------|------|
| `entry-point.md` | Always-on facts + link map — put in AI context first |
| `blueprint.md` | Checklist, SPK/REV registers, session notes |
| `context/always-on.md` | Supplementary always-on map (merge into entry-point when thin) |
| `context/on-demand.md` | Optional tables when a focus area needs more |

Studio’s **Session** workspace composes a visible **context pack** (Always + Plan + Focus + optional On-demand + pinned refs) and lists those paths in the copied prompt.

## Extensions

Custom architecture (or knowledge) areas live under:

```text
extensions/<slug>/
  index.md   # OKF concept with mandatory type
  …
```

- Link each extension from `entry-point.md` and register a blueprint row.
- In Session, selected extensions feed `DOC_FOCUS` / Scope (see [doc-extensions.md](./doc-extensions.md)).
- Prefer relative Markdown links only.

## Knowledge vs domain

Workspace **Knowledge** maps to `domain/` once those files exist. Day-1 Install writes only `entry-point.md` and `blueprint.md` — no empty `domain/` stubs. Domain files appear when domain work / Extend knowledge creates them. Additional KB folders may use `extensions/<slug>/` when they are not DDD domain model.

## Concepts vs Analyses

Both use `process/spikes/YYYY-MM-DD-<slug>/`. Studio filters by spike `type` in frontmatter / spike metadata:

- **Concepts:** `question`, `design`, `domain-question`, `domain-design`, …
- **Analyses:** `analysis` (and legacy analysis-shaped work under `work/` when readable)

No separate `process/analyses/` folder is required for Day-1.

## LLM bridge (P1 — not implemented)

Future handoff: Session writes or copies a prompt pack that a **local script** can send to a configured LLM API. Until then, copy-paste into an IDE AI chat is the only execution path. Studio itself stays a static browser app; prompts and control UI ship with the app, not as large installs on the user machine.

### Planned contract (sketch only)

1. Session composes the same prompt text used for clipboard.
2. Optional local script (user-installed) accepts stdin or a temp file path + config (API base URL, model, key via env).
3. Studio stores only a localStorage flag / script path hint — no secrets in the static app.
4. Copy-paste remains the default and fallback when no script is configured.
