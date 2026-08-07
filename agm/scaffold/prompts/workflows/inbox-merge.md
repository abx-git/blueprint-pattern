# Workflow: inbox-merge

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Inbox |
| **Mode** | Direct |
| **When** | One or more `inbox/proposals/` files are `status: ready` and should be merged into the AGM graph |
| **Role** | `bootstrap` |
| **Fresh session** | Recommended |
| **Prerequisite** | Proposal(s) with `status: ready`; human confirmed merge scope |

## Session prompt

```
AGM — Evolve · Inbox · Merge
Role: bootstrap

Proposal paths (optional; default = all inbox/proposals with status: ready): <proposal-paths>
Scope note: <optional limits>

Instructions:
1. Read <doc-root>entry-point.md → <doc-root>blueprint.md → inbox-pipeline procedure → content-ingest routing tables.
2. Select proposals under <doc-root>inbox/proposals/ with status: ready (or only <proposal-paths>). Skip draft/blocked. If none ready, stop and tell the human.
3. For each selected proposal:
   a. Apply Integration & linking instructions: create/update target files (architecture chapters, domain/, spikes, extensions/, ops/, use-cases/, …). Prefer relative links. Do not invent empty stubs beyond what the plan requires.
   b. Create or update <doc-root>sources/YYYY-MM-DD-<slug>.md (type: source-ingest) with provenance pointing to inbox/raw/… and the proposal; update sources/index.md and sources/log.md (create sources/ if missing).
   c. Move the proposal to <doc-root>inbox/done/ (same basename). Record merge in inbox/log.md. Update inbox/index.md.
   d. Link every extracted claim back to the sources/ file where practical.
4. Update entry-point.md links and blueprint.md checklist/session log for areas touched.
5. Cross-check code via entry-point / always-on source map when claims imply implementation; leave unresolved conflicts as open assumptions in the sources/ note or a spike — do not silently overwrite code-backed facts.
6. Hard rule — non-durable sources: Do **not** read or merge <doc-root>notes/ unless the human explicitly asks. Do **not** treat existing Concepts/Analyses spikes as established truth when writing lasting chapters — only apply what the **approved proposal** plans (spikes as targets are OK when the proposal says so).
7. Verify relative links for files you changed.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:INGEST_SUMMARY]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
