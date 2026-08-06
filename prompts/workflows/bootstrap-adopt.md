# Workflow: bootstrap-adopt

| Field | Value |
|-------|-------|
| **Track** | Build |
| **Activity** | Communicate |
| **Mode** | Direct |
| **When** | First-time adoption after Studio Install (entry-point + blueprint stubs) or CLI scaffold |
| **Role** | `bootstrap` |
| **Fresh session** | Required |

## Session prompt

```
AGM — Build · Adopt
Role: bootstrap

Adopt the Architecture Graph Method (AGM) into this application repository.
The human installed a minimal starter via AGM Studio (entry-point.md + blueprint.md) or a fuller CLI scaffold.
Execute Phase B–C in prompts/reference/adopt-procedure.md (or the bundled adopt-procedure).

Prerequisites: application repository open in the IDE; documentation root present; human available for a short interview.

Use **Documentation root** / <doc-root> for every architecture path — do not hardcode docs/architecture/ if another root was set.

Core files (keep simple):
- <doc-root>/entry-point.md — start here (short facts + links). Put this in AI context.
- <doc-root>/blueprint.md — what's next (checklist + short session notes).
- <doc-root>/context/always-on.md — legacy only; merge leftover facts into entry-point if present.

Studio note: Session/role instructions are in this prompt. Do not require prompts/role-*.md or prompts/core/system-prompt.md (Studio does not install them).

Instructions:
1. Treat existing entry-point.md / blueprint.md from Studio Install as expected stubs — fill and enrich them. Stop and tell the human to paste **Extend docs** (Build · Continue) from AGM Studio only if adoption is already done: a template chapter already has real evidence-based content and the blueprint shows meaningful progress beyond the Install stub.
2. Phase A (Studio path): if Project parameters / Studio notes are present, skip on-disk role/system-prompt checks. Use prompts/role-bootstrap.md only when it already exists (CLI install).
3. If an **Adoption parameters** / **Project parameters** block is present, fill entry-point.md and blueprint.md under <doc-root>; interview only for missing facts. Do not invent a third source of truth in always-on.
4. If **Architecture documentation areas (bootstrap)** is present, add blueprint checklist rows for each selected area (planned paths only — create each file when that work runs, not empty stubs).
5. Bootstrap (inline role): facts + links in entry-point.md, checklist in blueprint.md, then create and fill the first high-value template section from evidence only.
6. Do not pre-create empty domain/, process/_template/, or unused chapter files.
7. Verify relative links among files that exist. Append a short session note to <doc-root>/blueprint.md.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:TEMPLATE_SELECTED]], [[ANCHOR:PHASE_STATUS]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
