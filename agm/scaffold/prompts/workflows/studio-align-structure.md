# Workflow: studio-align-structure

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Align |
| **Mode** | Direct |
| **When** | Existing architecture Markdown does not match AGM Studio’s expected folder layout / naming (workspaces empty or wrong, missing entry-point/blueprint, legacy always-on-only layout, reviews under Concepts, etc.) |
| **Role** | `bootstrap` |
| **Fresh session** | Recommended |
| **Prerequisite** | Documentation root bound in AGM Studio; human available to approve destructive moves |

## Session prompt

```
AGM — Evolve · Align structure for AGM Studio
Role: bootstrap

Goal: Inventory this documentation root, explain gaps vs AGM Studio’s current IA, then reformat / relocate so Studio workspaces work correctly — without inventing architecture facts.

Human notes: <notes>
Template preference (if known): <template>
Dry-run only (yes/no; default no — apply after proposing): <dry-run>

## Why this session exists

AGM Studio’s UI maps **paths and conventions** to workspaces (Architecture, Knowledge, Inbox, Concepts, Analyses, Ask AI). If the folder uses an older or ad-hoc layout, Studio looks empty, puts reviews in the wrong place, or cannot drive Inbox / Check docs. Your job is to make the **on-disk structure** match Studio’s current understanding.

## Target structure (Studio contract — authoritative)

Documentation root = <doc-root> (every path below is relative to it).

### A. State files (required — Studio “meta”)
- entry-point.md — short always-on facts + link map; OKF YAML frontmatter with non-empty `type`. Put this in AI context first.
- blueprint.md — checklist of what’s next ([ ] / [~] / [x]), SPK/REV registers, short session notes; OKF `type`.
- Optional: context/on-demand.md — extra tables only when needed.
- Legacy: context/always-on.md — if present with unique facts, **merge into entry-point** and stop treating it as a second source of truth. Do not invent a third always-on file.

### B. Architecture (Studio → Architecture · Docs)
- Template chapters under the chosen template folder, e.g. arc42/, c4-light/, lean-service/, adr-first/, or custom/ — **create a chapter file only when it has real content** (no empty stub mass-create).
- Supporting trees as used: interfaces/, ops/, use-cases/, sources/, extensions/<slug>/ (each extension needs index.md with OKF `type`, linked from entry-point, blueprint row).
- Prefer **relative Markdown links only**.

### C. Knowledge (Studio → Knowledge)
- domain/ — domain language & model (appears when domain work creates it; do not invent empty domain stubs).

### D. Inbox (Studio → Inbox)
- inbox/raw/ — received material (not yet applied)
- inbox/proposals/ — reviewable plans (`type: inbox-proposal`, `status: draft|ready|blocked|merged`)
- inbox/done/ — applied plans
- inbox/index.md + inbox/log.md
Create the inbox tree only if missing **and** you are aligning for Studio use (or human asked). Do not invent raw content.

### E. Concepts & Analyses (Studio → Concepts / Analyses)
- process/spikes/YYYY-MM-DD-<slug>/ — drafts
- Concepts filter spike types such as: question, design, domain-question, domain-design, …
- Analyses filter type: analysis
- Do **not** require a separate process/analyses/ tree for Day-1.

### F. Check docs / Verify reports (Studio → Architecture · Check docs)
- process/reviews/<folder>/ with report.md + findings.md (report-only)
- REV rows in blueprint.md
- Must **not** live under Concepts; relocate if found under spikes or elsewhere.

### G. Progressive disclosure
- At each major structure level that is a concept folder: index.md + log.md when that subtree exists.
- Every durable Markdown artifact: OKF frontmatter bounded by --- with mandatory non-empty `type`.

### H. Local notes (Studio → Notes)
- notes/ — **local user scratch** (gitignored content via notes/.gitignore)
- Not durable architecture truth; agents must not read/promote unless the human explicitly asks
- Align may ensure notes/.gitignore exists; do **not** invent note files or move lasting chapters into notes/

### I. What Studio does *not* expect on Day-1
- Mass empty chapter stubs
- prompts/role-*.md under the doc root (Studio embeds roles in the copied prompt)
- Reviews as “Concepts”
- Inbox material applied straight into chapters without a proposal + human ready status
- Treating notes/ or spikes as lasting Architecture truth without explicit human promotion

## Instructions

1. Read <doc-root>entry-point.md and <doc-root>blueprint.md if they exist. If missing, create them as thin but valid OKF state files (facts you can evidence from the tree; checklist reflecting real planned chapters — do not invent product claims).
2. Inventory the documentation root: list top-level dirs/files and classify each against the Target structure (A–H). Note mismatches (wrong names, reviews under spikes, domain content outside domain/, Confluence dumps in chapter folders, always-on-only layout, absolute/external wiki links that break the graph, missing frontmatter `type`, etc.).
3. Write a short **alignment plan** in the chat (and optionally as a session note in blueprint.md): keep / move / rename / merge / leave-as-legacy. Prefer moves + link updates over rewriting chapter prose.
4. If <dry-run> is yes: stop after the plan + [[ANCHOR:OPEN_QUESTIONS]]. Do not move files.
5. Otherwise apply the plan with human-in-the-loop judgment:
   - Move/rename files to the Target structure; fix relative links and entry-point link map.
   - Add OKF `type` where missing (infer from path/role; ask if unclear).
   - Relocate Verify reports into process/reviews/ and register REV rows.
   - Ensure Inbox folders exist if Studio Inbox will be used; do not fabricate raw notes.
   - Ensure notes/.gitignore exists if Notes workspace will be used; do not invent note content; do not commit note files.
   - Merge leftover context/always-on.md facts into entry-point when thin/duplicative.
   - Update blueprint checklist to match files that actually exist or are genuinely next; tick only what is done.
   - Maintain index.md / log.md at structure levels you touch.
6. Do **not** invent architecture decisions, diagrams, or domain terms. Do **not** delete content without moving it to a sensible path (or asking). Do **not** run Adopt/Extend chapter fills in this session unless a state file is empty and must be bootstrapped minimally.
7. Do **not** promote notes/ or spike drafts into lasting chapters during Align unless the human explicitly asked to.
8. Append a blueprint.md session note: “Align structure for Studio” + what changed.
9. Stop. Tell the human to **Reload folder** in AGM Studio and verify Architecture / Knowledge / Inbox / Notes / Concepts / Analyses / Check docs.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:INGEST_SUMMARY]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
