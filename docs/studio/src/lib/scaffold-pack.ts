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

/**
 * Minimal Day-1 bootstrap from AGM Studio.
 * Only state files needed to start — no empty chapters, domain stubs, or process templates.
 * Those appear when Adopt / Extend docs / Concepts / Analyses create them.
 */
export function buildStarterScaffold(params: ProjectParams): Record<string, string> {
  const name = params.appName || 'My Application'
  const template = resolvedTemplate(params)
  const stack = params.stack || '<stack>'
  const purpose = params.purpose || '<one sentence domain>'
  const today = new Date().toISOString().slice(0, 10)
  const source = params.sourceRoot || '—'

  const blueprint = okf(
    'architecture-blueprint',
    "Blueprint — what's next",
    `# Blueprint — ${name}

**What's next** for the docs. Tick items as you go: \`[ ]\` open · \`[~]\` in progress · \`[x]\` done.

Files listed below are **planned** — create them only when Adopt / Extend docs / a Studio action produces them. Do not pre-create empty stubs.

## Checklist

| Status | Chapter | File (create when working this row) |
|--------|---------|-------------------------------------|
| [ ] | Fill entry-point facts | entry-point.md |
| [ ] | Introduction | ${template}/introduction.md |
| [ ] | Context view | ${template}/context.md |
| [ ] | Domain knowledge (optional) | domain/ |
| [ ] | Index + log (OKF) | index.md, log.md |

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
| ${today} | Minimal starter from AGM Studio (entry-point + blueprint only) |
`,
  )

  const entry = okf(
    'architecture-entry',
    'Entry point — start here',
    `# Entry point — ${name}

**Start here.** Put this file in the AI context. Short facts + links to what exists.

## About this system

**Application:** ${name}  
**Domain:** ${purpose}  
**Stack:** ${stack}  
**Template:** ${template}

## Source code map

| Module | Path |
|--------|------|
| — | ${source} |

## Links

| What | Where |
|------|-------|
| What's next (checklist) | [blueprint.md](blueprint.md) |

Further chapters, \`domain/\`, spikes, and reviews appear when you run **Adopt** / **Extend docs** or create them in Studio. Do not invent empty files ahead of time.

## Session habit

1. Read this file → [blueprint.md](blueprint.md). Session prompts come from **AGM Studio**.
2. Create or fill the next checklist file only when that work starts.
3. Update this link map when new durable files appear. Tick blueprint when work moves forward.
`,
  )

  return {
    'entry-point.md': entry,
    'blueprint.md': blueprint,
  }
}
