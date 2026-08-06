# Architecture documentation areas

Human-selectable categories for **architecture content** in Studio / Assistant (multi-select). IDs pass as `DOC_FOCUS` to `agm-install.sh` and into adoption / Evolve prompts.

Studio maps focus areas into workspaces — see [studio-workspaces.md](./studio-workspaces.md).

## Agent-maintained graph (never selectable)

The human does **not** tick these. The agent creates and maintains them every session:

| File | Role |
|------|------|
| `entry-point.md` | Graph index — links to all content docs and sources |
| `blueprint.md` | Construction plan, phase status, session log |
| `context/always-on.md` | Session context, source code map |

When content areas change, the agent updates entry-point links and blueprint rows without the human selecting a special “area”.

`context/on-demand.md` is optional supplementary tables the agent fills when relevant areas are selected — not a separate human choice.

## Lifecycle

| Stage | What happens |
|-------|----------------|
| **Install** | Scaffold only (includes `domain/` for Knowledge workspace) |
| **Plan** | **Documentation focus:** checkboxes and/or optional free text |
| **Deepen** | Same checkboxes (synced) + optional text for this session → becomes `Scope` in prompt |
| **Adopt / Evolve** | Agent maintains graph files + selected content areas |

## Human-selectable categories

| ID | Label (UI) | Workspace | Content (examples) |
|----|------------|-----------|-------------------|
| `implementation` | Software structure & implementation | Architecture | Template building blocks / runtime; `work/` |
| `interfaces` | APIs & integration | Architecture | `interfaces/exports.md`, `imports.md` |
| `persistence` | Data & storage | Architecture | Template data sections |
| `security` | Security & compliance | Architecture | Constraints, quality, risks |
| `deployment` | Deployment & environments | Architecture | Template deployment, `ops/environments.md` |
| `observability` | Observability | Architecture | Runtime notes, `ops/troubleshooting.md` |
| `operations` | Operations & incidents | Architecture | `ops/` |
| `decisions` | Architecture decisions | Architecture | `<template>/decisions/` ADRs |
| `domain-glossary` | Domain language & glossary | Knowledge | Glossary sections in template / domain language |
| `domain-model` | DDD strategic & tactical model | Knowledge | `domain/` (context map, contexts/, events) |
| `ecosystem` | Multi-service landscape | Architecture | `ecosystem-index.md`, partner links |
| `external-sources` | External reference imports | Architecture | `sources/` (Confluence, wikis, specs — provenance) |
| `use-cases` | Use cases & scenarios | Architecture | `use-cases/`, introduction / runtime links |
| `extension:<slug>` | Custom extension | Architecture (or Knowledge if domain-shaped) | `extensions/<slug>/` — user-defined OKF docs |

Removed: `onboarding` (was entry-point — graph duty, not a content area).

## Custom extensions

Place optional areas under `extensions/<slug>/` with OKF frontmatter (`type` required). Link from `entry-point.md`, add a blueprint row, and select `extension:<slug>` (or free-text Scope) in Studio Session so prompts include that focus.

**Knowledge:** `domain-model` / `domain-glossary` feed the Knowledge workspace (`domain/`). Extra fachliche packs that are not DDD domain model may use `extensions/<slug>/`.

**Content ingest:** workflow `content-ingest` (Evolve) — paste material in Studio Session; procedure in [content-ingest.md](./content-ingest.md).

Comma-separated: `implementation,interfaces,operations,domain-model`
