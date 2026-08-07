# AGM Studio

Unified static app for the Architecture Graph Method — iterative cockpit for architecture docs, domain knowledge, concepts, and analyses.

Live: https://abx-git.github.io/agm.github.io/

## Hybrid journey

| Stage | What you do |
|-------|-------------|
| **About** | What AGM is (method + Studio as front door) |
| **Start** | What you need + how the cockpit works |
| **Setup → Connect** | Project name, template, bind local architecture folder (write) |
| **Setup → Install** | Write Day-1 state only: `entry-point.md` + `blueprint.md` (no empty stubs) |
| **Cockpit** | Work in parallel workspaces (see below) |

After Setup is ready, Studio opens the **workspace cockpit** (not a single “Write” step). Click the **AGM Studio** brand anytime to return to **What is AGM**.

Chapters under the template folder, `domain/`, spikes, reviews, and `inbox/` are **created when the process needs them** (Adopt / Extend docs / Inbox / Concepts / Analyses) — not at Install.

## Workspace cockpit

| Workspace | Purpose | On disk (typical) |
|-----------|---------|-------------------|
| **Architecture** | Durable chapters, blueprint, extensions | Template folders, `extensions/`, state files |
| **Knowledge** | Domain / fachliche KB | `domain/` |
| **Inbox** | Incoming paste/files → proposal → merge | `inbox/raw/`, `proposals/`, `done/` |
| **Concepts** | Designs & spikes that need not ship | `process/spikes/` (non-analysis types) |
| **Analyses** | Implementation & flow investigations | `process/spikes/` with type `analysis` |
| **Prompt** | Compose a context pack + copy a prompt for AI chat | Prompts stay in the Studio app (not written into the docs folder) |
| **Setup** | Revisit folder binding / install | — |

Each workspace shares a navigator (tree, search, Markdown/Mermaid viewer, link graph, boards). State files (`entry-point.md`, `blueprint.md`, `context/`) keep LLM context small; Session composes an explicit **context pack** before copy-paste.

Details: [studio-workspaces.md](../reference/studio-workspaces.md).

## Spikes & reviews

Lifecycle artifacts live under `process/` (not durable chapters):

- Spike: `process/spikes/YYYY-MM-DD-<slug>/` with `index.md`, `notes.md`, `boards/*.storm.json`
  - Create lean boards in Studio, or **Import E2…** (Board Snapshot v2 `.storm.json`) into the spike
- Review: `process/reviews/YYYY-MM-DD-<slug>/` with `index.md`, `report.md`, `findings.md`

Concepts and Analyses both use spikes; Analyses filter on spike type `analysis`.

Legacy top-level `spikes/` + `work/` + `WRK-*` remain readable.

## LLM handoff (today)

Studio **does not call an LLM**. It personalizes a session prompt and you **copy → paste** into Cursor / Claude / Copilot on the same repo.

Coming later (P1): hand off the same prompt to an optional local bridge script (API call). Copy-paste remains the fallback.

## Run locally

```bash
./scripts/open-studio.sh
```

## License

MIT — © Andreas Bergmann, Hamburg, Germany. You may redistribute with attribution; see the repo [`LICENSE`](../../LICENSE).
