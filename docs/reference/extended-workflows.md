# Extended workflow catalog

**Advanced / opt-in** — beyond the [golden path](../quickstart.md) (7 workflows).

Copy session prompts from Assistant **Advanced** or `prompts/workflows/<id>.md`.

**Install:** `agm-install.sh --full` (or `--domain`) / `agm scaffold --full`. Default install does **not** ship these.

**MCP:** public starter = golden 6 only; extended prompts need the private pack ([agm/prompts-pack/README.md](../../agm/prompts-pack/README.md)).

Legacy workflow IDs are internal — pick intent in the Assistant UI.

---

## Build

| Intent | Workflow ID | Fresh chat |
|--------|-------------|------------|
| Bootstrap scaffold only | `bootstrap-init` | Recommended |
| Close build stage | `review-milestone` | **Required** |

Adoption alternative: [adopt-standalone](../../prompts/adopt-standalone.md)

---

## Evolve

| Intent | Workflow ID | Fresh chat |
|--------|-------------|------------|
| Sync after code change (paste diff) | `maintenance` | Yes |
| Import pasted external content | `content-ingest` | Yes |
| Inbox — analyze raw → proposal | `inbox-analyze` | Optional |
| Inbox — refine proposal (dialog) | `inbox-refine` | Optional |
| Inbox — merge ready proposals | `inbox-merge` | Recommended |

Procedure: [content-ingest.md](./content-ingest.md) · [inbox-pipeline.md](./inbox-pipeline.md) · Pipeline reference: [maintenance-pipeline](./maintenance-pipeline.md)

---

## Architect

| Intent | Workflow ID | Mode | Fresh chat |
|--------|-------------|------|------------|
| Explore solution (dialog) | `architecture-work-interrogate` | Dialog | Yes — Cursor **Chat** |
| Risks, coupling, quality | `architecture-work-analysis` | Direct | Yes |
| Drift, modularity, tech debt | `architecture-work-sustainable-analysis` | Direct | Yes |
| Scope analysis (dialog) | `architecture-work-sustainable-interrogate` | Dialog | Yes — Cursor **Chat** |
| Resume open WRK (architecture) | `architecture-work-continue` | Direct | Yes |

---

## Domain (DDD)

| Intent | Workflow ID | Mode | Fresh chat |
|--------|-------------|------|------------|
| Domain discovery | `domain-work-event-storm` | Dialog | Yes — Cursor **Chat** |
| Import E2 board snapshot | `domain-board-ingest` | Direct | Recommended |
| Subdomain investment map | `domain-work-subdomain-classification` | Direct | Yes |
| Answer domain question | `domain-work-query` | Direct | Yes |
| Context map | `domain-work-context-map` | Direct | Yes |
| Model / boundary design | `domain-work-design` | Direct | Yes |
| Integration patterns | `domain-work-integration-review` | Direct | Yes |
| Aggregates, invariants | `domain-work-tactical-review` | Direct | Yes |
| Ubiquitous language | `domain-work-language-audit` | Direct | Yes |
| Resume open WRK (domain) | `domain-work-continue` | Direct | Yes |

Reference: [ddd-work-report-formats](./ddd-work-report-formats.md) · [ddd-guardrails](./ddd-guardrails.md) · [e2-board-projection](./e2-board-projection.md)

---

## Verify

| Intent | Workflow ID | When |
|--------|-------------|------|
| Verify one blueprint phase | `review-phase` | Milestone — **fresh chat required** |
| Verify after maintenance | `review-maintenance` | After sync — **fresh chat required** |

Report-only — never in the same chat as the write/sync session.

---

## Quick picker

| I need to… | Start with |
|------------|------------|
| Clarify requirements or constraints | `architecture-work-interrogate` or `bootstrap-continue` (chapters 1–3) |
| Design structure or views | `architecture-work-design` |
| Evaluate an architecture | `architecture-work-analysis` or `review-phase` |
| Communicate to stakeholders | `refinement` or `bootstrap-continue` |
| Monitor implementation / drift | `maintenance-diff-range` or `architecture-work-sustainable-analysis` |
| Domain discovery | `domain-work-event-storm` |
| Import E2 board → domain graph | `domain-board-ingest` |
| Resume unfinished work | `architecture-work-continue` or `domain-work-continue` |

---

## Workflow metadata (internal)

Session prompts use **Track · Activity** headers. **Activity** (Clarify, Design, Evaluate, …) and **Mode** (Direct / Dialog) are metadata — adopters memorize **Track** only.

| Track | Role file | ID prefix |
|-------|-----------|-----------|
| Build | `role-bootstrap.md` | `bootstrap-*` |
| Evolve | `role-bootstrap.md` or `role-maintenance.md` | `refinement`, `maintenance*` |
| Architect | `role-architecture-work.md` | `architecture-work-*` |
| Domain | `role-domain-work.md` | `domain-work-*`, `domain-board-ingest` |
| Verify | `role-review.md` | `review-*` |

Optional Cursor integration (this repo only): `./scripts/agm-workflow.sh checkout <id>` writes `ACTIVE.md`.
