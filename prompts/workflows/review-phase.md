# Workflow: review-phase

| Field | Value |
|-------|-------|
| **Track** | Verify |
| **Activity** | Evaluate |
| **Mode** | Direct |
| **When** | After each blueprint phase; verify one phase |
| **Role** | `review` |
| **Fresh session** | **Required** (no generation context) |

## Session prompt

```
AGM — Verify · Evaluate
Role: review

Start with <doc-root>/entry-point.md → <doc-root>/blueprint.md → <doc-root>/prompts/role-review.md.
Select next unreviewed phase in ## Reviews. Report-only — do not fix files.

Output [[ANCHOR:REVIEW_SCOPE]], [[ANCHOR:VERDICT]], [[ANCHOR:FINDINGS]], [[ANCHOR:TOP_RISKS]], [[ANCHOR:LINK_CHECK]] before stop.
Create <doc-root>/process/reviews/YYYY-MM-DD-<slug>/ from process/reviews/_template/ (index.md, report.md, findings.md). Assign next REV-NNN. Update ## Reviews and ## Guardrail findings in blueprint.md.
```
