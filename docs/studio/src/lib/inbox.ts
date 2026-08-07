import { slugify } from './spikes'

export type InboxProposalStatus = 'draft' | 'ready' | 'blocked' | 'merged'

export function todayStamp(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Minimal inbox tree written on first paste / analyze. */
export function buildInboxScaffoldFiles(): Record<string, string> {
  const ts = todayStamp()
  return {
    'inbox/index.md': `---
type: inbox-index
title: "Inbox"
description: "Incoming material — raw → proposals → merge"
tags: [inbox]
timestamp: "${ts}"
---

# Inbox

Multi-step ingest: drop or paste into [raw/](./raw/), review [proposals/](./proposals/), archive in [done/](./done/).

Procedure: keep prompts in AGM Studio; see inbox-pipeline in AGM reference.
`,
    'inbox/log.md': `---
type: inbox-log
title: "Inbox log"
description: "Change tracking for inbox/"
tags: [inbox]
timestamp: "${ts}"
---

# Inbox log

| Date | Event | Path |
|------|-------|------|
`,
    'inbox/raw/.gitkeep': '',
    'inbox/proposals/.gitkeep': '',
    'inbox/done/.gitkeep': '',
  }
}

export function buildRawPasteFile(opts: {
  label: string
  body: string
  slug?: string
}): { path: string; content: string } {
  const ts = todayStamp()
  const slug = slugify(opts.slug || opts.label || 'paste') || 'paste'
  const path = `inbox/raw/${ts}-${slug}.md`
  const title = opts.label.trim() || slug
  const content = `---
type: inbox-raw
title: "${title.replace(/"/g, '\\"')}"
description: "Pasted into Studio Inbox"
tags: [inbox, raw]
timestamp: "${ts}"
provenance:
  sourceLabel: "${title.replace(/"/g, '\\"')}"
  sourceType: plain-text
  ingestedAt: "${ts}"
---

# ${title}

## Raw import

\`\`\`
${opts.body.replace(/\n```/g, '\n``\u200b`')}
\`\`\`
`
  return { path, content: content.endsWith('\n') ? content : `${content}\n` }
}

/** Set or replace status: in YAML frontmatter (best-effort). */
export function setProposalStatus(raw: string, status: InboxProposalStatus): string {
  if (!raw.startsWith('---')) {
    return `---
type: inbox-proposal
status: ${status}
---

${raw}`
  }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return raw
  let yamlText = raw.slice(3, end)
  if (/^status:\s*/m.test(yamlText)) {
    yamlText = yamlText.replace(/^status:\s*.*$/m, `status: ${status}`)
  } else {
    yamlText = yamlText.trimEnd() + `\nstatus: ${status}\n`
  }
  const body = raw.slice(end + 4).replace(/^\r?\n/, '')
  return `---\n${yamlText.trim()}\n---\n\n${body}`
}

export function readProposalStatus(meta: { status?: unknown } | null | undefined): InboxProposalStatus {
  const s = typeof meta?.status === 'string' ? meta.status.toLowerCase() : 'draft'
  if (s === 'ready' || s === 'blocked' || s === 'merged') return s
  return 'draft'
}

export function listInboxPaths(
  docs: Map<string, { path: string }>,
  kind: 'raw' | 'proposals' | 'done',
): string[] {
  const prefix = `inbox/${kind}/`
  return [...docs.keys()]
    .filter((p) => {
      const n = p.replace(/\\/g, '/')
      return n.includes(prefix) && !n.endsWith('/.gitkeep') && !n.endsWith('/index.md')
    })
    .sort()
}
