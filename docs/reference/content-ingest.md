# Content ingest — pasted external material

Procedure for workflow **`content-ingest`**. The human pastes Markdown, Confluence exports, specs, or notes; the agent **persists provenance** and **merges** structured facts into the architecture graph.

## Principles

| Rule | Rationale |
|------|-----------|
| **Provenance first** | Raw paste lives in `sources/` — never lose where information came from |
| **Distill, don't dump** | Template sections and `use-cases/` hold curated facts; `sources/` holds the import |
| **Traceability** | Every claim extracted from a source links back to `sources/YYYY-MM-DD-<slug>.md` |
| **Code wins conflicts** | When paste contradicts source code, document the conflict as an open assumption |
| **Redact before write** | Remove secrets, tokens, PII; ask the human if classification is unclear |
| **Notes ≠ truth** | Do not write pastes into `notes/` as a substitute for `sources/` + durable targets. Local `notes/` are human scratch (often not in Git) and are used by agents only when the human explicitly asks |
| **Spikes ≠ truth** | Concepts/Analyses (`process/spikes/`) are drafts — promote findings into lasting chapters only when the human asks; do not treat spike text as established architecture by default |

## Supported paste formats

| Type | Typical input | Normalization |
|------|---------------|---------------|
| `markdown` | `.md` files, GitHub wiki | Use as-is after frontmatter |
| `confluence-wiki` | Copy from Confluence UI | Strip `{panel}`, `{code}`, convert headings; keep macro text as blockquotes |
| `confluence-export` | HTML or storage-format XML | Extract title + body text; note images/macros lost |
| `plain-text` | Email, chat, notes | Wrap in fenced block; add structure headings if obvious |
| `spec` | OpenAPI snippet, requirements doc | Tag as spec; route facts to interfaces/ or constraints |
| `e2-board-snapshot` | E2 `.storm.json` (board-snapshot-v2) | Prefer workflow **`domain-board-ingest`**: store raw JSON + filtered projection; do not dump layout fields into template sections |
| `other` | PDF paste, slides | Preserve raw; mark extraction confidence in ingest file |

### E2 board snapshots

When the paste or file is an Event Storming Tool export (`format: event-storming-tool`):

1. Prefer **`domain-board-ingest`** over free-form `content-ingest` (structured Projection Manifest + human gate).
2. Persist raw board as `sources/YYYY-MM-DD-<slug>.storm.json` and a `source-ingest` note with `sourceType: e2-board-snapshot`.
3. Follow [e2-board-projection.md](./e2-board-projection.md) for substance vs noise, tiers, and AGM target mapping.
4. If the human insists on `content-ingest` only: still store provenance first; route domain facts via the same mapping table; never write `x`/`y`/`viewport` into architecture docs.

## File layout

```
<doc-root>/
├── sources/
│   ├── index.md          ← OKF index of all imports
│   ├── log.md            ← change log
│   └── YYYY-MM-DD-<slug>.md   ← type: source-ingest
├── use-cases/            ← optional distilled scenarios
│   ├── index.md
│   └── <slug>.md         ← type: use-case
└── <template>/           ← introduction, context, glossary, …
```

Scaffold `sources/` (and `use-cases/` when focus includes `use-cases`) at install or on first ingest.

## Ingest artifact (`type: source-ingest`)

Required frontmatter fields:

```yaml
---
type: source-ingest
title: "<short title>"
description: "One-line summary of what this import contains"
resource: "external://<source-label>"
tags: [ingest, <source-type>]
timestamp: "YYYY-MM-DD"
provenance:
  sourceLabel: "<human label>"
  sourceType: markdown | confluence-wiki | confluence-export | plain-text | spec | e2-board-snapshot | other
  ingestedAt: "YYYY-MM-DD"
  confidentiality: internal | external | public
  originalUrl: "<optional>"
---
```

Body structure:

1. **Summary** — 3–5 bullets of what the agent extracted (not a copy of the whole paste)
2. **Raw import** — fenced block or normalized Markdown (redacted)
3. **Extraction map** — table: fact → target file(s) updated
4. **Open assumptions** — conflicts, missing evidence, follow-ups

## Routing extracted content

| Material in paste | Primary targets |
|-------------------|-----------------|
| Use cases, actors, flows | `use-cases/<slug>.md`, `<template>/introduction.md`, `<template>/runtime.md` |
| Business terms | `<template>/glossary.md`, `context/on-demand.md` |
| External systems | `context/always-on.md`, `interfaces/imports.md`, `ecosystem-index.md` |
| Constraints, policies | `<template>/constraints.md`, `<template>/quality.md` |
| Integration contracts | `interfaces/exports.md`, `interfaces/imports.md` |
| Domain events / boundaries | `domain/events.md`, `domain/context-map.md` (if installed) |
| E2 board elements (filtered) | See [e2-board-projection.md](./e2-board-projection.md); prefer `domain-board-ingest` |
| Operational notes | `ops/pitfalls.md`, `ops/runbooks/` |

Update `entry-point.md` with links to new `sources/` and `use-cases/` entries. Append `sources/log.md` and session log in `blueprint.md`.

## Use-case artifact (`type: use-case`)

When the paste describes scenarios, create or update curated use-case files:

```yaml
---
type: use-case
title: "<scenario name>"
description: "<outcome in one sentence>"
resource: "repo://"
tags: [use-case]
timestamp: "YYYY-MM-DD"
source: "../sources/YYYY-MM-DD-<slug>.md"
actors: [<list>]
---
```

Sections: **Goal** · **Preconditions** · **Main flow** · **Alternates** · **Links** (runtime, interfaces, domain).

## Session output

Workflow emits [[ANCHOR:INGEST_SUMMARY]] — short table: source file → targets updated → open items.
