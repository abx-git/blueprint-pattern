# Workflow: inbox-refine

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Inbox |
| **Mode** | Dialog |
| **When** | A proposal under `inbox/proposals/` needs clarification or restructuring before merge |
| **Role** | `bootstrap` |
| **Fresh session** | Optional |
| **Prerequisite** | At least one `inbox/proposals/*.md` (`type: inbox-proposal`) |

## Session prompt

```
AGM — Evolve · Inbox · Refine (dialog)
Role: bootstrap

Proposal path: <proposal-path>
Human notes: <notes>

═══════════════════════════════════════════════════════
PHASE 1 — REVIEW DIALOG (until human says "ready to write" or "end refine")
═══════════════════════════════════════════════════════

FORBIDDEN until Phase 2:
- Do not merge into architecture/domain/spikes/sources
- Do not move the proposal to inbox/done/
- Do not set status: ready unless the human explicitly asks

Clarify: missing targets, wrong workspace routing, link plan gaps, open questions, confidentiality.

═══════════════════════════════════════════════════════
PHASE 2 — WRITE PROPOSAL (after human confirms)
═══════════════════════════════════════════════════════

Instructions:
1. Read <doc-root>entry-point.md → blueprint.md → the proposal at <proposal-path> → inbox-pipeline procedure.
2. Update only that proposal (and inbox/log.md + brief blueprint note). Improve Structured content and Integration & linking instructions.
3. Set status to draft, ready, or blocked exactly as the human directed. Default remains draft if unclear.
4. Do not merge targets.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
