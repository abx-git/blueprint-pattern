# Workflow: maintenance-diff-range

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Sync |
| **Mode** | Direct |
| **When** | After code changes; agent fetches `git diff` between two refs (CI-friendly) |
| **Role** | `maintenance` |
| **Fresh session** | Optional |

## Session prompt

```
AGM — Evolve · Sync (git range)
Role: maintenance

## Diff range (substitute before run — pipeline: env DIFF_FROM / DIFF_TO)
DIFF_FROM=<diff-from>
DIFF_TO=<diff-to>

Instructions:
1. Start with <doc-root>entry-point.md → <doc-root>blueprint.md → <doc-root>prompts/role-maintenance.md.
2. Obtain the code diff between DIFF_FROM and DIFF_TO yourself — do not ask the human to paste it:
   a) If a Git MCP server is connected, use its diff/compare tool with the same refs.
   b) Otherwise run at repository root: git diff ${DIFF_FROM}..${DIFF_TO}
   c) If the range is a PR merge base, use three-dot when appropriate: git diff ${DIFF_FROM}...${DIFF_TO}
3. If the diff is empty, stop and report; do not update architecture docs.
4. Classify changes and update only architecture docs impacted by this diff.
5. If **Architecture documentation areas (evolve)** is present, update those architecture Markdown files when the diff affects them.

Output [[ANCHOR:CHANGE_CLASSIFICATION]], [[ANCHOR:CHANGED_DOCS]], [[ANCHOR:INTERFACE_IMPACT]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
