# AGM Studio workspaces

Studio uses a **hybrid** model: one-time Setup (Connect → Install), then a durable **workspace cockpit**.

## Workspaces

| Id | Label | Path convention | Primary workflows |
|----|-------|-----------------|-------------------|
| `architecture` | Architecture | Template chapters (`arc42/`, `lean-service/`, …), `interfaces/`, `ops/`, `use-cases/`, `sources/`, `extensions/` | Adopt, Continue/Extend, Evolve, content-ingest |
| `knowledge` | Knowledge | `domain/` (+ optional KB under `extensions/` tagged for knowledge) | domain-work-*, domain-board-ingest |
| `concepts` | Concepts | `process/spikes/` with types `question`, `design`, `domain-*` | architecture-work-design; spike create/edit |
| `analyses` | Analyses | `process/spikes/` with type `analysis` | architecture-work-analysis; interrogate/query |
| `meta` | (shared state) | `entry-point.md`, `blueprint.md`, `context/`, `index.md`, `log.md` | Always included in context packs |

Reviews under `process/reviews/` remain reachable from Session / Architecture navigation; they are not a top-level workspace chip.

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
