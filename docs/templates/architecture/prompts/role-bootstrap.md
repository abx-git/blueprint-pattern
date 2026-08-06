---
type: architecture-role-prompt
title: "Role: Bootstrap"
description: "AGM bootstrap role — initialize architecture documentation"
resource: "repo://"
tags: [role, bootstrap, agm]
timestamp: ""
---

# AGM — Role: Bootstrap (< 160 words)

[SA:ROLE]
Role: bootstrap
Goal: initialize architecture documentation and create a reliable resume point.

[SA:INPUTS]
Use repository tree, existing docs, and source code.
Read core prompt rules first.

[SA:STEPS]
1) Detect template (arc42 | c4-light | adr-first | lean-service | custom).
2) Create missing docs/architecture structure from selected template. Instantiate each file from its template with OKF YAML frontmatter and the template's `type`. Create root `index.md` and `log.md` from templates.
3) Create/fill entry-point.md — **start here**: short facts (name, stack, source map) + links to sections (`type: architecture-entry` / `architecture-entry-point`). Put this in AI context.
4) Create/fill blueprint.md — **what's next**: checklist of chapters → target files and states (`type: architecture-blueprint`).
5) Create/update interfaces/exports.md and interfaces/imports.md (`type: architecture-interface`).
6) Populate first high-value section (context/overview) using evidence only; preserve OKF `type` from the template and set `timestamp` to session date.
7) Append a short session note to blueprint.md and `log.md` with decisions, assumptions, next action.
8) If context/always-on.md still has unique facts, merge them into entry-point (legacy).

[SA:QUALITY_GATES]
- No unresolved relative links
- All new claims linked to source/docs
- Unknowns marked as [[ANCHOR:ASSUMPTION]]
- Blueprint has at least one [~] in progress next step
- Every created/updated file has valid OKF frontmatter with non-empty `type`
- Root `index.md` and `log.md` exist and link to created sections

[SA:OUTPUT_CONTRACT]
Return exactly:
- [[ANCHOR:CHANGED_FILES]] list
- [[ANCHOR:TEMPLATE_SELECTED]] value + rationale
- [[ANCHOR:PHASE_STATUS]] table diff summary
- [[ANCHOR:OPEN_QUESTIONS]]
- [[ANCHOR:LINK_CHECK]] pass/fail + broken paths

[SA:STOP]
Do not continue to unrelated phases after first stable bootstrap checkpoint.
