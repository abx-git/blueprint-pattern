import type { ArchitectureIndex, ProjectParams } from '../types'
import { normDocRoot } from './project-params'
import {
  filterEvidencePins,
  isNotesPath,
  isSpikePath,
} from './notes'

export interface ContextPackSlot {
  id: 'always' | 'plan' | 'focus' | 'ondemand' | 'refs'
  label: string
  path: string
  included: boolean
  required?: boolean
}

export interface ContextPack {
  slots: ContextPackSlot[]
  pins: string[]
  docFocus: string[]
  includeLocalNotes: boolean
  includeSpikeEvidence: boolean
}

function findEnding(index: ArchitectureIndex | null, suffix: string): string | null {
  if (!index) return null
  return [...index.docs.keys()].find((p) => p.endsWith(suffix)) ?? null
}

function allowPath(
  path: string | null | undefined,
  opts: { includeLocalNotes: boolean; includeSpikeEvidence: boolean },
): boolean {
  if (!path) return false
  if (isNotesPath(path)) return opts.includeLocalNotes
  if (isSpikePath(path)) return opts.includeSpikeEvidence
  return true
}

/** Build default context pack from index + active path + pinned refs. */
export function buildContextPack(opts: {
  index: ArchitectureIndex | null
  activePath: string | null
  pins: string[]
  docFocus: string[]
  includeOnDemand?: boolean
  includeLocalNotes?: boolean
  includeSpikeEvidence?: boolean
}): ContextPack {
  const includeLocalNotes = Boolean(opts.includeLocalNotes)
  const includeSpikeEvidence = Boolean(opts.includeSpikeEvidence)
  const entry = findEnding(opts.index, 'entry-point.md') || 'entry-point.md'
  const blueprint = findEnding(opts.index, 'blueprint.md') || 'blueprint.md'
  const onDemand = findEnding(opts.index, 'context/on-demand.md')
  const pins = filterEvidencePins(opts.pins, { includeLocalNotes, includeSpikeEvidence })
  const focusOk = allowPath(opts.activePath, { includeLocalNotes, includeSpikeEvidence })

  const slots: ContextPackSlot[] = [
    {
      id: 'always',
      label: 'Start here (entry-point)',
      path: entry,
      included: true,
      required: true,
    },
    {
      id: 'plan',
      label: 'Checklist (blueprint)',
      path: blueprint,
      included: true,
      required: true,
    },
    {
      id: 'focus',
      label: 'Open document',
      path: focusOk ? opts.activePath || '' : '',
      included: focusOk && Boolean(opts.activePath),
    },
    {
      id: 'ondemand',
      label: 'Extra tables (optional)',
      path: onDemand || 'context/on-demand.md',
      included: Boolean(opts.includeOnDemand && onDemand),
    },
    {
      id: 'refs',
      label: 'Remembered files',
      path: pins.join(', '),
      included: pins.length > 0,
    },
  ]

  return {
    slots,
    pins,
    docFocus: opts.docFocus,
    includeLocalNotes,
    includeSpikeEvidence,
  }
}

/** Markdown block listing pack paths for the agent. */
export function formatContextPackBlock(
  pack: ContextPack,
  params: ProjectParams,
): string {
  const root = normDocRoot(params.docRoot)
  const lines: string[] = [
    '## Context pack (read these first — keep context small)',
    '',
    'Open only the paths below unless a link from them is required. Do not invent claims without a source. Prefer relative links.',
    '',
    '### Non-durable sources (hard rule)',
    '',
    '- Do **not** treat `notes/` (local user notes), Concepts, or Analyses (`process/spikes/`) as durable architecture **truth**.',
    '- Use them as evidence **only** when the human explicitly opted in for this session (see flags below) or explicitly asked in the session prompt.',
    `- Local notes included this session: **${pack.includeLocalNotes ? 'yes' : 'no'}**`,
    `- Concepts/Analyses spikes included this session: **${pack.includeSpikeEvidence ? 'yes' : 'no'}**`,
    '',
  ]

  for (const slot of pack.slots) {
    if (!slot.included) continue
    if (slot.id === 'refs') {
      if (pack.pins.length === 0) continue
      lines.push(`### Pinned refs`)
      for (const pin of pack.pins) {
        const abs = pin.includes('/') || pin.endsWith('.md') ? `${root}${pin}` : pin
        lines.push(`- ${abs}`)
      }
      lines.push('')
      continue
    }
    if (!slot.path) continue
    lines.push(`- **${slot.label}:** ${root}${slot.path}`)
  }

  if (pack.docFocus.length > 0) {
    lines.push('')
    lines.push(`**DOC_FOCUS / Scope:** ${pack.docFocus.join(',')}`)
  }

  lines.push('')
  return lines.join('\n')
}

export function togglePin(pins: string[], path: string): string[] {
  const i = pins.indexOf(path)
  if (i >= 0) return pins.filter((_, idx) => idx !== i)
  return [...pins, path].slice(0, 24)
}
