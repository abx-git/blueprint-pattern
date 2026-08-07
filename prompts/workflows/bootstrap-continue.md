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

Hard rule — non-durable sources:
- Do **not** read or promote <doc-root>notes/ unless the human explicitly asks in this session.
- Do **not** treat Concepts/Analyses under process/spikes/ as established architecture truth unless the human explicitly asks to promote specific findings.
- Prefer code, lasting Architecture/Knowledge chapters, and approved Inbox proposals.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
