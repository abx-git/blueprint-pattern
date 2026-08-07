import type { DocWorkspace, WorkspaceId } from '../types'

/** Spike type strings that belong in Analyses workspace. */
const ANALYSIS_TYPES = new Set([
  'analysis',
  'domain-analysis',
  'architecture-analysis',
])

/** Classify a doc path into a Studio workspace bucket. */
export function classifyDocPath(path: string, spikeType?: string): DocWorkspace {
  const p = path.replace(/\\/g, '/').toLowerCase()

  if (/(^|\/)inbox\//.test(p)) return 'inbox'

  if (
    /(^|\/)entry-point\.md$/.test(p) ||
    /(^|\/)blueprint\.md$/.test(p) ||
    (/(^|\/)index\.md$/.test(p) && !/(^|\/)inbox\//.test(p)) ||
    (/(^|\/)log\.md$/.test(p) && !/(^|\/)inbox\//.test(p)) ||
    /(^|\/)context\//.test(p)
  ) {
    return 'meta'
  }

  if (/(^|\/)domain\//.test(p)) return 'knowledge'

  if (/(^|\/)(process\/)?spikes\//.test(p) || /(^|\/)work\//.test(p)) {
    if (spikeType && ANALYSIS_TYPES.has(spikeType.toLowerCase())) return 'analyses'
    if (/analysis/.test(p)) return 'analyses'
    return 'concepts'
  }

  if (/(^|\/)(process\/)?reviews\//.test(p)) return 'architecture'

  // Template chapters, interfaces, ops, extensions, sources, use-cases, prompts
  return 'architecture'
}

export function isAnalysisSpikeType(type: string): boolean {
  const t = type.toLowerCase().trim()
  return ANALYSIS_TYPES.has(t) || t.includes('analysis')
}

export function isConceptSpikeType(type: string): boolean {
  return !isAnalysisSpikeType(type)
}

/** Docs visible in a browse workspace (meta always available in Architecture). */
export function docMatchesWorkspace(workspace: DocWorkspace, active: WorkspaceId): boolean {
  if (active === 'session') return true
  if (active === 'architecture') {
    return workspace === 'architecture' || workspace === 'meta'
  }
  if (active === 'knowledge') {
    return workspace === 'knowledge' || workspace === 'meta'
  }
  if (active === 'inbox') return workspace === 'inbox'
  if (active === 'concepts') return workspace === 'concepts'
  if (active === 'analyses') return workspace === 'analyses'
  return true
}

/** Preferred primary workflows per workspace (Session picker hints). */
export function workflowsForWorkspace(ws: WorkspaceId): string[] {
  switch (ws) {
    case 'architecture':
      return [
        'bootstrap-continue',
        'maintenance-diff-range',
        'content-ingest',
        'refinement',
      ]
    case 'knowledge':
      return [
        'domain-work-continue',
        'domain-work-discovery',
        'domain-board-ingest',
        'domain-work-design',
      ]
    case 'inbox':
      return ['inbox-analyze', 'inbox-refine', 'inbox-merge']
    case 'concepts':
      return ['architecture-work-design', 'architecture-work-continue']
    case 'analyses':
      return [
        'architecture-work-analysis',
        'architecture-work-query',
        'architecture-work-continue',
      ]
    case 'session':
      return []
    default:
      return []
  }
}
