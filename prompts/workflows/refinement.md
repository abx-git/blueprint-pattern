# Workflow: refinement

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Communicate |
| **Mode** | Direct |
| **When** | Targeted deepening of specific documentation sections (ongoing on large systems) |
| **Role** | `bootstrap` |
| **Fresh session** | Optional |

## Session prompt

```
AGM — Evolve · Refine
Role: bootstrap

Goal: <goal>

Scope: <scope> (from documentation focus checkboxes or optional text — architecture content only; never entry-point.md, blueprint.md, or always-on.md)

Follow <doc-root>prompts/role-bootstrap.md for evidence and link rules.
Start with entry-point.md → blueprint.md. Update only the scoped sections and blueprint states.
If **Architecture documentation areas (evolve)** is present, update those Markdown areas within the stated scope (not prompts/ or workflows).
Do not restart unrelated phases.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:PHASE_STATUS]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
