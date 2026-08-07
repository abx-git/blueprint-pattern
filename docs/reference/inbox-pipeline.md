# Inbox pipeline — multi-step ingest

Procedure for workflows **`inbox-analyze`**, **`inbox-refine`**, and **`inbox-merge`**. Incoming material may affect Architecture, Knowledge, Concepts, Analyses, or peripheral areas (`extensions/`, `ops/`, …).

Studio workspace **Inbox** browses `inbox/` and can paste into `inbox/raw/`. Humans may also drop files directly into `inbox/raw/` and Refresh.

## Principles

| Rule | Rationale |
|------|-----------|
| **Intake before graph** | Raw material stays under `inbox/raw/` until a proposal exists |
| **Human gate** | Merge only proposals with `status: ready` |
| **No silent dumps** | Analyze writes structured proposals — never merge raw paste straight into chapters |
| **Provenance after merge** | Long-term source of truth for imports remains `sources/` (see [content-ingest.md](./content-ingest.md)) |
| **Relative links only** | Integration instructions must use repo-relative Markdown links |
| **Redact before write** | Secrets / PII out of raw and proposals |

## Layout

```text
<doc-root>/inbox/
  index.md
  log.md
  raw/           ← drop zone + Studio paste
  proposals/     ← Input files (type: inbox-proposal)
  done/          ← archived after successful merge
```

Create this tree on first write (Analyze or Studio paste). Do **not** pre-create empty inbox stubs at Install.

## Stages

```text
raw/  →  Analyze  →  proposals/  →  Review (+ optional Refine)  →  Merge  →  graph + sources/ + done/
```

1. **Analyze** (`inbox-analyze`) — Read new/unprocessed files in `inbox/raw/`. Write one proposal per logical intake (or one combined proposal when the human asks). **Do not** edit template chapters, `domain/`, or spikes in this stage.
2. **Review** — Human reads the proposal in Studio; may edit Markdown or run **`inbox-refine`** in an AI dialog. Set `status: ready` when merge is allowed; `blocked` when not.
3. **Merge** (`inbox-merge`) — Apply only `status: ready` proposals. Update targets + links, write `sources/` provenance, move proposal to `inbox/done/`, append `inbox/log.md` and `blueprint.md`.

## Proposal artifact (`type: inbox-proposal`)

```yaml
---
type: inbox-proposal
title: "<short title>"
description: "One-line summary"
status: draft   # draft | ready | blocked
timestamp: "YYYY-MM-DD"
raw:
  - "../raw/YYYY-MM-DD-<slug>.md"
targets: []     # planned relative paths under <doc-root>
tags: [inbox]
---
```

### Required body sections

1. **Summary** — 3–7 bullets of what arrived
2. **Structured content** — facts organized for AGM (tables/lists OK); not a raw dump
3. **Integration & linking instructions** — for each fact or cluster: target path(s), create vs update, relative links to add (entry-point, blueprint, chapter cross-links)
4. **Open questions** — conflicts with code/docs, missing evidence, confidentiality flags

Routing hints (Architecture, Knowledge, Concepts, …): reuse the tables in [content-ingest.md](./content-ingest.md). Concepts/Analyses that should not ship yet → `process/spikes/…` with appropriate `type`. Peripheral areas → `extensions/<slug>/` or `ops/` as needed.

## Merge outcomes

| Outcome | Location |
|---------|----------|
| Curated facts | Template chapters, `domain/`, `interfaces/`, `use-cases/`, spikes, extensions, … |
| Provenance | `sources/YYYY-MM-DD-<slug>.md` (`type: source-ingest`) linking back to `inbox/raw/…` and the done proposal |
| Proposal archive | `inbox/done/YYYY-MM-DD-<slug>.md` (set `status: merged` or keep history in log) |
| Indexes | `inbox/index.md`, `inbox/log.md`, `sources/index.md`, `entry-point.md`, `blueprint.md` |

## Relation to `content-ingest`

| | `content-ingest` | Inbox pipeline |
|--|------------------|----------------|
| Steps | Analyze + merge in one session | Separated; human gate |
| Raw | Immediately under `sources/` | First `inbox/raw/` |
| Scope | Mostly architecture content | Any workspace + periphery |

Prefer **Inbox** for new imports when Studio is used. Keep `content-ingest` for quick one-shot paste when the human explicitly chooses Sync/Import.

## Studio notes

- Paste UI writes `inbox/raw/YYYY-MM-DD-<slug>.md` only.
- Analyze / Refine / Merge prompts live in AGM Studio (Prompt workspace) — not as stubs in the docs folder.
- After the agent writes files, human **Refresh**es the folder index.
