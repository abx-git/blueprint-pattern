# Workflow: domain-board-ingest

| Field | Value |
|-------|-------|
| **Track** | Domain |
| **Activity** | Import |
| **Mode** | Direct |
| **When** | Project an E2 board snapshot (`board-snapshot-v2`) into the AGM domain graph |
| **Role** | `domain-work` |
| **Prerequisite** | Bootstrap phase 0 `[x] done`; `domain/` scaffold installed |
| **Fresh session** | Recommended |

## Session prompt

```
AGM — Domain · Import board snapshot
Role: domain-work

Source label: <source-label>
Goal: <e.g. Checkout process → events + BC-ORD model>
Intent views: <modelingMode list or "all Tier A">
Board path or paste: <path-to-.storm.json or pasted JSON>
Code cross-check: <yes | no>

Report format: prompts/reference/ddd-work-report-formats.md § Board ingest
Projection rules: prompts/reference/e2-board-projection.md

═══════════════════════════════════════════════════════
PHASE 1 — PROVENANCE (no domain graph mutation yet)
═══════════════════════════════════════════════════════

1. Start with <doc-root>entry-point.md → <doc-root>blueprint.md → <doc-root>prompts/role-domain-work.md → prompts/reference/e2-board-projection.md → prompts/reference/content-ingest.md.
2. Validate snapshot: format "event-storming-tool", version 2 (or note v1→v2 migration). Schema: https://abx-git.github.io/E2/schemas/board-snapshot-v2.schema.json
3. Redact secrets, credentials, and PII from labels/descriptions before writing files.
4. Create <doc-root>sources/ if missing. Persist:
   - Raw board: <doc-root>sources/YYYY-MM-DD-<slug>.storm.json
   - Ingest note: <doc-root>sources/YYYY-MM-DD-<slug>.md (type: source-ingest, sourceType: e2-board-snapshot)
5. Update sources/index.md and sources/log.md. Do not update domain/ yet.

═══════════════════════════════════════════════════════
PHASE 2 — PROJECTION MANIFEST (proposal only)
═══════════════════════════════════════════════════════

6. Apply Intent / Tier / Graph / Maturity filters from e2-board-projection.md.
7. Emit Projection Manifest table: elementId | type | label | target file | action (create|update|skip) | reason.
8. STOP for human gate unless the session prompt already says "approved" or lists explicit create/update IDs.
9. Ask human to confirm or adjust the manifest (one concise question if unclear).

═══════════════════════════════════════════════════════
PHASE 3 — WRITE (after human approval)
═══════════════════════════════════════════════════════

10. Apply approved manifest rows only. Route per e2-board-projection.md mapping table.
11. Write <doc-root>/process/spikes/YYYY-MM-DD-<slug>/notes.md (type: domain-discovery or domain-analysis) with timeline, manifest summary, conflicts.
12. Link every graph row to the source-ingest file and board element id.
13. If Code cross-check = yes: compare claims to always-on source map / packages (DDD-G02); record conflicts as open assumptions / hotspots — code wins.
14. Register SPK in blueprint ## Spike register (Track: domain). Update entry-point.md links if new domain files. Verify relative links.

Output [[ANCHOR:SPIKE]] (alias WORK_ITEM), [[ANCHOR:DDD_GRAPH_UPDATED]], [[ANCHOR:PROJECTION_MANIFEST]], [[ANCHOR:TRACEABILITY_COVERAGE]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```

## Relationship to other workflows

| Situation | Use |
|-----------|-----|
| No board; discover in chat | `domain-work-event-storm` |
| Board already captured in E2 | **`domain-board-ingest`** (this workflow) |
| Generic paste (wiki, specs) | `content-ingest` |
| Board incomplete after ingest | Continue gaps with `domain-work-event-storm` or `domain-work-design` |
