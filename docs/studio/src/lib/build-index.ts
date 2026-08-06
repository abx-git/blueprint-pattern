import type { ArchitectureIndex, DocNode, GraphEdge, WorkspaceId } from '../types'
import type { FileMap } from './fs-access'
import { extractMarkdownLinks, fileName, parseFrontmatter } from './okf-parse'
import { classifyDocPath, docMatchesWorkspace } from './workspace'

function isStormPath(path: string): boolean {
  return path.toLowerCase().endsWith('.storm.json')
}

function spikeTypeFromIndex(files: FileMap, path: string): string | undefined {
  // If under a spike folder, read that folder's index.md type
  const m = path.match(/^(.*(?:process\/)?spikes\/[^/]+)(?:\/|$)/i)
  if (!m?.[1]) return undefined
  const indexContent = files.get(`${m[1]}/index.md`)
  if (!indexContent) return undefined
  const { meta, body } = parseFrontmatter(indexContent)
  const ty = body.match(/\*\*Type\*\*\s*\|\s*([^|\n]+)/i)
  if (ty) return ty[1]!.trim()
  if (meta?.type) return String(meta.type)
  return undefined
}

export function buildArchitectureIndex(rootLabel: string, files: FileMap): ArchitectureIndex {
  const docs = new Map<string, DocNode>()

  for (const [path, content] of files) {
    if (isStormPath(path)) {
      const spikeType = spikeTypeFromIndex(files, path)
      docs.set(path, {
        path,
        name: fileName(path),
        kind: 'storm',
        content,
        meta: { type: 'e2-board-snapshot', title: fileName(path) },
        links: [],
        workspace: classifyDocPath(path, spikeType),
      })
      continue
    }
    if (!path.toLowerCase().endsWith('.md')) continue

    const { meta, body } = parseFrontmatter(content)
    const links = extractMarkdownLinks(path, body)
    const spikeType =
      spikeTypeFromIndex(files, path) ||
      (meta?.type && String(meta.type)) ||
      undefined
    docs.set(path, {
      path,
      name: fileName(path),
      kind: 'markdown',
      content,
      meta,
      links,
      workspace: classifyDocPath(path, spikeType),
    })
  }

  const edges: GraphEdge[] = []
  for (const doc of docs.values()) {
    if (doc.kind !== 'markdown') continue
    for (const to of doc.links) {
      let resolved = to
      if (!docs.has(to)) {
        const hit = [...docs.keys()].find((k) => k === to || k.endsWith('/' + to) || k.endsWith(to))
        if (hit) resolved = hit
      }
      edges.push({ from: doc.path, to: resolved, broken: !docs.has(resolved) })
    }
  }

  // Re-link broken edges that resolve via basename match within the same folder tree
  for (const edge of edges) {
    if (!edge.broken) continue
    const base = edge.to.includes('/') ? edge.to.slice(edge.to.lastIndexOf('/') + 1) : edge.to
    const hit = [...docs.keys()].find((k) => k === edge.to || k.endsWith('/' + base))
    if (hit) {
      edge.to = hit
      edge.broken = false
    }
  }

  return {
    rootLabel,
    docs,
    edges,
    openedAt: new Date().toISOString(),
  }
}

export function treePaths(docs: Map<string, DocNode>): string[] {
  return [...docs.keys()].sort((a, b) => a.localeCompare(b))
}

export function uniqueTypes(docs: Map<string, DocNode>): string[] {
  const set = new Set<string>()
  for (const d of docs.values()) {
    if (d.meta?.type) set.add(String(d.meta.type))
  }
  return [...set].sort()
}

export function filterDocsByWorkspace(
  docs: Map<string, DocNode>,
  workspace: WorkspaceId,
): Map<string, DocNode> {
  const out = new Map<string, DocNode>()
  for (const [path, doc] of docs) {
    if (docMatchesWorkspace(doc.workspace, workspace)) out.set(path, doc)
  }
  return out
}
