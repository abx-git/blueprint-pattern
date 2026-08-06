import type { FileMap } from './fs-access'
import type { InstallStatus } from '../types'

function hasPath(files: FileMap, suffix: string): boolean {
  for (const p of files.keys()) {
    if (p === suffix || p.endsWith('/' + suffix) || p.endsWith(suffix)) return true
  }
  return false
}

/** Detect AGM graph markers in an opened folder (doc-root contents). */
export function detectInstallStatus(files: FileMap): InstallStatus {
  const blueprint = hasPath(files, 'blueprint.md')
  const entry = hasPath(files, 'entry-point.md')
  if (blueprint && entry) return 'ready'
  if (blueprint || entry) return 'partial'
  if (files.size === 0) return 'missing'
  const anyMd = [...files.keys()].some((p) => p.endsWith('.md'))
  return anyMd ? 'partial' : 'missing'
}
