# Workflow: bootstrap-adopt

| Field | Value |
|-------|-------|
| **Track** | Build |
| **Activity** | Communicate |
| **Mode** | Direct |
| **When** | First-time adoption; no `<doc-root>/blueprint.md` yet (or only empty Studio stubs) |
| **Role** | `bootstrap` |
| **Fresh session** | Required |

## Session prompt

```
AGM — Build · Adopt
Role: bootstrap

Adopt the Architecture Graph Method (AGM) into this application repository.
The human installed the scaffold via AGM Studio (browser write) or `agm scaffold` / `agm-install.sh`.
Execute Phase B–C in prompts/reference/adopt-procedure.md (or the bundled adopt-procedure).

Prerequisites: application repository open in the IDE; scaffold under the configured documentation root; human available for a short interview.

Use **Documentation root** / <doc-root> for every architecture path — do not hardcode docs/architecture/ if another root was set.

Core files (keep simple):
- <doc-root>/entry-point.md — start here (short facts + links). Put this in AI context.
- <doc-root>/blueprint.md — what's next (checklist + short session notes).
- <doc-root>/context/always-on.md — legacy only; merge leftover facts into entry-point.

Instructions:
1. If <doc-root>/blueprint.md already exists and is already filled (not just a Studio stub), stop and tell the human to paste the **Continue** session prompt (Build · Continue) from AGM Studio Run in a new chat instead.
2. Verify Phase A: <doc-root>/prompts/role-bootstrap.md must exist. Prefer prompts/core/system-prompt.md when present. If role-bootstrap is missing, stop — ask the human to finish Install in AGM Studio or run `agm scaffold` / install with the same --doc-root.
3. If an **Adoption parameters** / **Project parameters** block is present, fill entry-point.md and blueprint.md under <doc-root>; interview only for missing facts. Do not invent a third source of truth in always-on.
4. If **Architecture documentation areas (bootstrap)** is present, add blueprint checklist rows and doc stubs for each selected area per prompts/reference/doc-extensions.md (your Markdown only).
5. Bootstrap: follow <doc-root>/prompts/role-bootstrap.md — facts + links in entry-point.md, checklist in blueprint.md, first evidence-based template section under <doc-root>.
6. Ensure <doc-root>/process/spikes/ and <doc-root>/process/reviews/ are ready (README / _template). Prefer process/ for lifecycle artifacts.
7. Verify relative links. Append a short session note to <doc-root>/blueprint.md.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:TEMPLATE_SELECTED]], [[ANCHOR:PHASE_STATUS]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
