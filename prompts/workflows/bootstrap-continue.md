# Workflow: bootstrap-continue

| Field | Value |
|-------|-------|
| **Track** | Build |
| **Activity** | Communicate |
| **Mode** | Direct |
| **When** | Resume blueprint checklist after Adopt has a usable entry-point |
| **Role** | `bootstrap` |
| **Fresh session** | Optional |

## Session prompt

```
AGM — Build · Continue
Role: bootstrap

Follow the AGM core prompt and <doc-root>/prompts/role-bootstrap.md.
Start with <doc-root>/entry-point.md (facts + links) → <doc-root>/blueprint.md (what's next).
Resume the next [~] or [ ] checklist item. Keep entry-point links current.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
