# Workflow: maintenance

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Sync |
| **Mode** | Direct |
| **When** | After code changes; same PR or follow-up session |
| **Role** | `maintenance` |
| **Fresh session** | Optional |

## Session prompt

```
AGM — Evolve · Sync
Role: maintenance

Start with <doc-root>/entry-point.md → <doc-root>/blueprint.md → <doc-root>/prompts/role-maintenance.md.

Git diff:
<paste git diff or PR diff summary>

Update only architecture docs impacted by this diff.
If **Architecture documentation areas (evolve)** is present, update those architecture Markdown files when the diff affects them.

Output [[ANCHOR:CHANGE_CLASSIFICATION]], [[ANCHOR:CHANGED_DOCS]], [[ANCHOR:INTERFACE_IMPACT]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
