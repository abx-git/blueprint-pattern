# AGM — standalone adoption prompt

1. **Install** — Prefer [AGM Studio](https://abx-git.github.io/agm.github.io/): Connect your architecture folder → Install → **Write starter into folder**.  
   Alternative (CLI): `agm scaffold` / `agm-install.sh` with `--doc-root` matching your documentation path.
2. **Adopt** — copy the adoption prompt below into a **new** agent chat at your **application repository root** (so paths like `<doc-root>…` resolve correctly).

Starts **Build**: agent fills `entry-point.md` (start here) and `blueprint.md` (what's next), plus the first evidence-based section (scaffold already present).

---

## Session prompt

```
AGM — Adopt (standalone session).
Role: bootstrap

Adopt the Architecture Graph Method (AGM) into this application repository.
The human installed the scaffold via AGM Studio (browser write) or `agm scaffold` / `agm-install.sh`.
Execute Phase B–C in the bundled adopt-procedure (or prompts/reference/adopt-procedure.md).

Prerequisites: application repository open in the IDE; scaffold present under the documentation root below; human available for a short interview.

Use the **Documentation root** from Project parameters for every architecture path — never hardcode another docs folder.

Core files (keep simple):
- <doc-root>/entry-point.md — start here (short facts + links). Put this in AI context.
- <doc-root>/blueprint.md — what's next (checklist + short session notes).
- <doc-root>/context/always-on.md — legacy only; merge leftover facts into entry-point.

Instructions:
1. If <doc-root>/blueprint.md already exists, stop and tell the human to paste the **Continue** session prompt (Build · Continue) from AGM Studio Run in a new chat instead.
2. Verify Phase A: <doc-root>/prompts/role-bootstrap.md and prompts/core/system-prompt.md must exist. If missing, stop — ask the human to finish Install in AGM Studio (or run `agm scaffold` / install script) with the same documentation root.
3. If an **Adoption parameters** / **Project parameters** block is present, fill entry-point.md and blueprint.md under <doc-root>; interview only for missing facts.
4. Bootstrap: follow <doc-root>/prompts/role-bootstrap.md — facts + links in entry-point.md, checklist in blueprint.md, first evidence-based template section under <doc-root>.
5. Ensure <doc-root>/process/spikes/ exists (README + _template/ if missing). Prefer spikes for explorations, not flat work/ files.
6. Verify relative links. Append a short session note to <doc-root>/blueprint.md.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:TEMPLATE_SELECTED]], [[ANCHOR:PHASE_STATUS]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```

---

## Scaffold procedure (include when pasting — or agent reads adopt-procedure.md from repo)

See [docs/reference/adopt-procedure.md](../docs/reference/adopt-procedure.md). AGM Studio / Assistant sync should bundle prompt + procedure in one block.
