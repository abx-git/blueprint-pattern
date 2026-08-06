# AGM — standalone adoption prompt

1. **Install** — Prefer [AGM Studio](https://abx-git.github.io/agm.github.io/): Connect your architecture folder → Install → write **entry-point.md** + **blueprint.md** only.  
   Alternative (CLI): `agm scaffold` / `agm-install.sh` with `--doc-root` matching your documentation path.
2. **Adopt** — copy the adoption prompt below into a **new** agent chat at your **application repository root** (so paths like `<doc-root>…` resolve correctly).

Starts **Build**: agent **fills** the Studio/CLI state files and creates the **first evidence-based chapter** (no empty stubs ahead of time).

---

## Session prompt

```
AGM — Adopt (standalone session).
Role: bootstrap

Adopt the Architecture Graph Method (AGM) into this application repository.
The human installed a minimal starter via AGM Studio (entry-point.md + blueprint.md) or a fuller CLI scaffold.
Execute Phase B–C in the bundled adopt-procedure (or prompts/reference/adopt-procedure.md).

Prerequisites: application repository open in the IDE; documentation root present; human available for a short interview.

Use the **Documentation root** from Project parameters for every architecture path — never hardcode another docs folder.

Core files (keep simple):
- <doc-root>/entry-point.md — start here (short facts + links). Put this in AI context.
- <doc-root>/blueprint.md — what's next (checklist + short session notes).
- <doc-root>/context/always-on.md — legacy only; merge leftover facts into entry-point if present.

Studio note: Session/role instructions are in this prompt. Do not require prompts/role-*.md or prompts/core/system-prompt.md under the repo (Studio does not install them).

Instructions:
1. Treat existing entry-point.md / blueprint.md from Studio Install as expected stubs — fill and enrich them. Stop and tell the human to use **Extend docs** (Build · Continue) only if adoption is already done: e.g. a template chapter file already has real evidence-based content and blueprint shows meaningful [x]/[~] progress beyond the Install stub.
2. Phase A (Studio path): if this prompt includes Project parameters / Studio prompt notes, skip on-disk role/system-prompt checks. (CLI installs may still have prompts/role-bootstrap.md — use it when present, otherwise follow this prompt.)
3. If an **Adoption parameters** / **Project parameters** block is present, fill entry-point.md and blueprint.md under <doc-root>; interview only for missing facts.
4. Bootstrap (inline role): human-in-the-loop scribe — facts + links in entry-point.md, checklist in blueprint.md, then create and fill the first high-value template section under <doc-root> from evidence only. Do not pre-create empty chapter, domain, or process stub files.
5. Create process/spikes/ or process/reviews/ only when the human starts a spike/review later — not during Adopt unless needed for this session.
6. Verify relative links among files that exist. Append a short session note to <doc-root>/blueprint.md. Mark the first chapter [~] or [x] as appropriate.

Output [[ANCHOR:CHANGED_FILES]], [[ANCHOR:TEMPLATE_SELECTED]], [[ANCHOR:PHASE_STATUS]], [[ANCHOR:OPEN_QUESTIONS]], [[ANCHOR:LINK_CHECK]] before stop.
```

---

## Scaffold procedure (include when pasting — or agent reads adopt-procedure.md from repo)

See [docs/reference/adopt-procedure.md](../docs/reference/adopt-procedure.md). AGM Studio / Assistant sync should bundle prompt + procedure in one block.
