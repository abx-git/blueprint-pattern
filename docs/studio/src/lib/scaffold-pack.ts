import type { ProjectParams } from '../types'
import { resolvedTemplate } from './project-params'

function okf(type: string, title: string, body: string): string {
  const ts = new Date().toISOString().slice(0, 10)
  return [
    '---',
    `type: ${type}`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    'description: ""',
    'resource: "repo://"',
    'tags: [architecture]',
    `timestamp: "${ts}"`,
    '---',
    '',
    body.trim(),
    '',
  ].join('\n')
}

/** Day-1 scaffold written into the chosen architecture folder from AGM Studio (browser only). */
export function buildStarterScaffold(params: ProjectParams): Record<string, string> {
  const name = params.appName || 'My Application'
  const template = resolvedTemplate(params)
  const stack = params.stack || '<stack>'
  const purpose = params.purpose || '<one sentence domain>'
  const today = new Date().toISOString().slice(0, 10)

  const alwaysOn = okf(
    'architecture-context',
    'Always-on (legacy)',
    `# Always-on (legacy)

Facts and session orientation now live in **[entry-point.md](../entry-point.md)**.

Keep this file only for older repos. If anything unique remains here, merge it into entry-point and stop maintaining a third source of truth.
`,
  )

  const blueprint = okf(
    'architecture-blueprint',
    'Blueprint — what\'s next',
    `# Blueprint — ${name}

**What's next** for the docs. Tick items as you go: \`[ ]\` open · \`[~]\` in progress · \`[x]\` done.

## Checklist

| Status | Chapter | File |
|--------|---------|------|
| [ ] | Fill entry-point facts | entry-point.md |
| [ ] | Introduction | ${template}/introduction.md |
| [ ] | Context view | ${template}/context.md |

## Spikes

| ID | Track | Title | Type | Path | Status | Date |
|----|-------|-------|------|------|--------|------|
| — | — | — | — | — | — | — |

## Reviews

| ID | Target | Reviewed | Verdict | Report | Findings |
|----|--------|----------|---------|--------|----------|
| — | — | — | — | — | — |

## Session notes

| Date | Summary |
|------|---------|
| ${today} | Starter scaffold written from AGM Studio |
`,
  )

  const entry = okf(
    'architecture-entry',
    'Entry point — start here',
    `# Entry point — ${name}

**Start here.** Put this file in the AI context. Short facts + links to everything else.

## About this system

**Application:** ${name}  
**Domain:** ${purpose}  
**Stack:** ${stack}  
**Template:** ${template}

## Source code map

| Module | Path |
|--------|------|
| — | ${params.sourceRoot || '—'} |

## Links

| What | Where |
|------|-------|
| What's next (checklist) | [blueprint.md](blueprint.md) |
| Template chapters | [${template}/](${template}/) |
| Spikes | [process/spikes/](process/spikes/) |
| Reviews | [process/reviews/](process/reviews/) |
| Index | [index.md](index.md) |
| Log | [log.md](log.md) |

## Session habit

1. Read this file → [blueprint.md](blueprint.md) → \`prompts/role-&lt;role&gt;.md\`.
2. Follow links; update this map when chapters appear.
3. Tick blueprint items when work moves forward.
`,
  )

  const index = okf(
    'architecture-index',
    'Architecture index',
    `# Architecture — ${name}

- [Entry point (start here)](entry-point.md)
- [Blueprint (what's next)](blueprint.md)
- [Process](process/) — spikes & reviews
- Template: [${template}](${template}/)
`,
  )

  const log = okf(
    'architecture-log',
    'Change log',
    `# Log

| Date | Change |
|------|--------|
| ${today} | Starter scaffold installed from AGM Studio |
`,
  )

  const roleBootstrap = okf(
    'architecture-role',
    'Role — bootstrap',
    `# Role: bootstrap

You are the bootstrap scribe for AGM. Follow the active workflow session prompt from AGM Studio.
Keep entry-point.md (start here) and blueprint.md (what's next) current every session.
Human-in-the-loop: propose; do not silently invent architecture.
Write new explorations under process/spikes/YYYY-MM-DD-&lt;slug&gt;/ (SPK register), not flat work/ files.
`,
  )

  const roleMaintenance = okf(
    'architecture-role',
    'Role — maintenance',
    `# Role: maintenance

Keep the architecture docs aligned with the codebase. Prefer evidence from diffs and source.
Update entry-point links and blueprint checklist each session. Output [[ANCHOR:LINK_CHECK]].
`,
  )

  const roleReview = okf(
    'architecture-role',
    'Role — review',
    `# Role: review

Review architecture docs for consistency, broken links, and untraceable claims.
Write Verify output under process/reviews/YYYY-MM-DD-&lt;slug&gt;/ (index.md, report.md, findings.md; REV-NNN).
`,
  )

  const intro = okf(
    'architecture-section',
    `${template} introduction`,
    `# Introduction

<!-- Fill during Adopt / Continue sessions -->

## Goals

-

## Stakeholders

-
`,
  )

  const contextDoc = okf(
    'architecture-section',
    `${template} context`,
    `# Context

<!-- System context — fill with evidence from code and interviews -->
`,
  )

  const spikeIndexTpl = okf(
    'architecture-spike',
    'SPK-NNN: [Title]',
    `# SPK-NNN: <Title>

| Field | Value |
|-------|-------|
| **ID** | SPK-NNN |
| **Track** | architecture \\| domain |
| **Type** | question \\| analysis \\| design |
| **Status** | draft |
| **Date** | YYYY-MM-DD |

## Goal

<What should be answered or designed?>

## Artifacts

| Kind | Path |
|------|------|
| Notes | [notes.md](./notes.md) |
| Boards | [boards/](./boards/) |
`,
  )

  const spikeNotesTpl = okf(
    'architecture-spike-notes',
    'Spike notes',
    `# Notes

## Working notes

-

## Diagrams

\`\`\`mermaid
flowchart LR
  A[Start] --> B[Explore]
\`\`\`
`,
  )

  return {
    'context/always-on.md': alwaysOn,
    'blueprint.md': blueprint,
    'entry-point.md': entry,
    'index.md': index,
    'log.md': log,
    'prompts/role-bootstrap.md': roleBootstrap,
    'prompts/role-maintenance.md': roleMaintenance,
    'prompts/role-review.md': roleReview,
    [`${template}/introduction.md`]: intro,
    [`${template}/context.md`]: contextDoc,
    [`${template}/README.md`]: okf(
      'architecture-index',
      `${template} template`,
      `# ${template}\n\nTemplate sections for ${name}. Expand via Continue sessions.\n`,
    ),
    'process/README.md': okf(
      'architecture-index',
      'Process',
      `# Process\n\nLifecycle artifacts: [spikes/](./spikes/) (SPK) and [reviews/](./reviews/) (REV). Not durable chapters.\n`,
    ),
    'process/spikes/README.md': okf(
      'architecture-index',
      'Spikes',
      `# Spikes\n\nTimeboxed explorations (SPK register). Create via AGM Studio → Spike, or copy \`_template/\`.\n`,
    ),
    'process/spikes/_template/index.md': spikeIndexTpl,
    'process/spikes/_template/notes.md': spikeNotesTpl,
    'process/spikes/_template/boards/README.md': okf(
      'architecture-index',
      'Spike boards',
      `# Boards\n\nPlace \`.storm.json\` Event Storming boards here. Edit in AGM Studio or export to E2.\n`,
    ),
    'process/reviews/README.md': okf(
      'architecture-index',
      'Reviews',
      `# Reviews\n\nVerify sessions (REV). Each folder has index.md, report.md, findings.md.\n`,
    ),
    'process/reviews/_template/index.md': okf(
      'architecture-review',
      'REV-NNN: [Title]',
      `# REV-NNN: <Title>\n\n| Field | Value |\n|-------|-------|\n| **ID** | REV-NNN |\n| **Verdict** | |\n\n## Artifacts\n\n| Kind | Path |\n|------|------|\n| Report | [report.md](./report.md) |\n| Findings | [findings.md](./findings.md) |\n`,
    ),
    'process/reviews/_template/report.md': okf(
      'architecture-review-report',
      'Review report',
      `# Report\n\n## Verdict\n\n\`PASS\` | \`PASS WITH NOTES\` | \`FAIL\`\n`,
    ),
    'process/reviews/_template/findings.md': okf(
      'architecture-review-findings',
      'Review findings',
      `# Findings\n\n| ID | Severity | Finding | Evidence | Recommendation |\n|----|----------|---------|----------|----------------|\n| | | | | |\n`,
    ),
  }
}
