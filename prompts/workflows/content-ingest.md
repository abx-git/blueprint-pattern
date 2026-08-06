# Workflow: content-ingest

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Import |
| **Mode** | Direct |
| **When** | Incorporate pasted external material (Confluence, Markdown, specs, use cases, internal notes) into the architecture graph |
| **Role** | `bootstrap` |
| **Fresh session** | Optional |

## Session prompt

```
AGM — Evolve · Import content
Role: bootstrap

Source label: <source-label>
Source type: <source-type>
Goal: <goal>

Scope: <scope> (from documentation focus checkboxes or optional text — architecture content only; never entry-point.md, blueprint.md, or always-on.md body except always-on external-systems table when relevant)

Pasted content:
<pasted-content>

Instructions:
1. Start with <doc-root>entry-point.md → <doc-root>blueprint.md → <doc-root>prompts/role-bootstrap.md → prompts/reference/content-ingest.md.
2. Redact secrets, credentials, and PII from pasted content before writing files; ask the human if confidentiality is unclear.
3. Create <doc-root>sources/ if missing (index.md, log.md). Persist the import in <doc-root>sources/YYYY-MM-DD-<slug>.md (type: source-ingest) with provenance frontmatter; update sources/index.md and sources/log.md.
4. Extract structured facts into scoped architecture sections — e.g. use-cases/, <template>/introduction.md, context.md, glossary, interfaces/imports.md, constraints, context/on-demand.md, domain/ when installed. Link every extracted claim back to the source-ingest file.
5. When paste describes scenarios, create or update <doc-root>use-cases/<slug>.md (type: use-case) with source link.
6. Cross-check code via always-on.md source map when claims imply implementation; record conflicts as open assumptions.
7. Update entry-point.md links and blueprint.md session log; adjust relevant blueprint phase rows when new areas are populated.
8. If **Architecture documentation areas (evolve)** is present, prioritize those areas when placing extracted content.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:INGEST_SUMMARY]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
