# Local notes (AGM Studio)

User scratch notes that live **parallel** to AGM flows and are **not** durable architecture truth.

## Contract

| Rule | Detail |
|------|--------|
| **Path** | `<doc-root>/notes/` |
| **Git** | Note files are **local only**. The folder may contain a tracked `.gitignore` that ignores all note content. |
| **Studio** | Workspace **Notes** — browse / write notes here. |
| **AI default** | Agents must **not** read, pin, or promote `notes/` unless the human **explicitly** asks in this session. |
| **Not truth** | Notes are never evidence for Architecture / Knowledge claims by themselves. Same caution applies to Concepts / Analyses (`process/spikes/`) unless the human explicitly treats them as evidence. |

## Layout

```
<doc-root>/
├── notes/
│   ├── .gitignore    # may be committed: ignores * except itself
│   └── *.md          # local — not committed
├── entry-point.md
├── blueprint.md
└── …
```

Suggested `notes/.gitignore`:

```gitignore
# AGM local notes — do not commit note files
*
!.gitignore
```

## When to use

- Personal reminders, interview scribbles, “ask later”, private context
- Material that must **not** enter Git or the shared graph yet

Prefer **Inbox** when external material should become reviewable proposals and then lasting docs. Prefer **Concepts** when exploration should be shared in-repo as a spike (still not durable chapter truth until promoted).

## Promotion

Only when the human explicitly asks:

1. Distill facts into Architecture / Knowledge / Inbox proposal with provenance, **or**
2. Pin the note in Ask AI **and** enable “Include local notes” for that session.

Do not copy notes wholesale into template chapters.
