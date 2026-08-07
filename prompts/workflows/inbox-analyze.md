# Workflow: inbox-analyze

| Field | Value |
|-------|-------|
| **Track** | Evolve |
| **Activity** | Inbox |
| **Mode** | Direct |
| **When** | New files or pastes landed in `inbox/raw/` and need structuring into a reviewable proposal (no merge yet) |
| **Role** | `bootstrap` |
| **Fresh session** | Optional |
| **Prerequisite** | Documentation root bound; raw material under `<doc-root>inbox/raw/` (Studio paste or dropped files) |

## Session prompt

```
AGM — Evolve · Inbox · Analyze
Role: bootstrap

Goal: <optional focus, e.g. route domain terms only>
Raw paths (optional; default = unprocessed files in inbox/raw/): <raw-paths>
Slug hint: <slug>

Instructions:
1. Read <doc-root>entry-point.md and <doc-root>blueprint.md first (keep context small). Then read prompts/reference/inbox-pipeline.md (or the bundled Inbox procedure) and the routing tables in prompts/reference/content-ingest.md / docs/reference/content-ingest.md.
2. Ensure <doc-root>inbox/ exists with raw/, proposals/, done/, index.md, log.md — create missing pieces only as needed. Do not create empty architecture chapter stubs.
3. List files under <doc-root>inbox/raw/. Prefer paths listed in Raw paths; otherwise take new/unprocessed raw files (not yet referenced by a proposal under proposals/ or done/).
4. Redact secrets, credentials, and PII before writing. Ask the human if classification is unclear.
5. For each logical intake, write <doc-root>inbox/proposals/YYYY-MM-DD-<slug>.md with type: inbox-proposal, status: draft, raw: [relative links to raw files], targets: [planned paths]. Body MUST include: Summary; Structured content; Integration & linking instructions; Open questions.
6. Route targets across Architecture, Knowledge (domain/), Concepts/Analyses (process/spikes/), extensions/, ops/, use-cases/ as appropriate — do NOT apply those writes in this session.
7. Update inbox/index.md and append inbox/log.md. Add a short blueprint.md session note that Analyze produced proposal(s). Link inbox/ from entry-point.md if missing.
8. Stop. Do not merge into template chapters, domain/, or sources/ in this session.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:INGEST_SUMMARY]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```
