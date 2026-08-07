/**
 * Path helpers for local notes and non-durable scratch (spikes).
 * Notes are gitignored; spikes are in-repo but not lasting architecture truth.
 */

export function isNotesPath(path: string): boolean {
  return /(^|\/)notes\//i.test(path.replace(/\\/g, '/'))
}

/** Concepts / Analyses spikes (and legacy work/). */
export function isSpikePath(path: string): boolean {
  const p = path.replace(/\\/g, '/').toLowerCase()
  return /(^|\/)(process\/)?spikes\//.test(p) || /(^|\/)work\//.test(p)
}

/** Paths that must not feed chapter claims unless the human explicitly opts in. */
export function isNonDurableEvidencePath(path: string): boolean {
  return isNotesPath(path) || isSpikePath(path)
}

export function filterEvidencePins(
  pins: string[],
  opts: { includeLocalNotes?: boolean; includeSpikeEvidence?: boolean },
): string[] {
  return pins.filter((p) => {
    if (isNotesPath(p)) return Boolean(opts.includeLocalNotes)
    if (isSpikePath(p)) return Boolean(opts.includeSpikeEvidence)
    return true
  })
}

export const NOTES_GITIGNORE = `# AGM local notes — do not commit note files
*
!.gitignore
`

export function buildNoteFile(opts: { title: string; body: string }): string {
  const ts = new Date().toISOString().slice(0, 10)
  const title = opts.title.replace(/"/g, '\\"')
  return [
    '---',
    'type: local-note',
    `title: "${title}"`,
    'description: "Local AGM Studio note — not durable architecture; not for Git"',
    'tags: [notes, local]',
    `timestamp: "${ts}"`,
    '---',
    '',
    `# ${opts.title}`,
    '',
    opts.body.trim(),
    '',
  ].join('\n')
}
