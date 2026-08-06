import { useMemo } from 'react'
import { useStudioStore } from '../store/studio-store'
import { filterDocsByWorkspace, uniqueTypes } from '../lib/build-index'
import { supportsDirectoryPicker } from '../lib/fs-access'
import type { WorkspaceId } from '../types'
import { DocTree } from './DocTree'
import { DocViewer } from './DocViewer'
import { LinkGraph } from './LinkGraph'
import { E2Canvas } from './E2Canvas'

interface Props {
  /** When true, skip the empty-state “open folder” panel (parent handles CTA). */
  embedded?: boolean
  /** Filter tree to a cockpit workspace (Architecture / Knowledge). */
  workspaceFilter?: Exclude<WorkspaceId, 'session'>
}

export function BrowseMode({ embedded = false, workspaceFilter }: Props) {
  const index = useStudioStore((s) => s.index)
  const activePath = useStudioStore((s) => s.activePath)
  const setActivePath = useStudioStore((s) => s.setActivePath)
  const typeFilter = useStudioStore((s) => s.typeFilter)
  const setTypeFilter = useStudioStore((s) => s.setTypeFilter)
  const searchQuery = useStudioStore((s) => s.searchQuery)
  const setSearchQuery = useStudioStore((s) => s.setSearchQuery)
  const searchHits = useStudioStore((s) => s.searchHits)
  const browsePanel = useStudioStore((s) => s.browsePanel)
  const setBrowsePanel = useStudioStore((s) => s.setBrowsePanel)
  const connectFolder = useStudioStore((s) => s.connectFolder)
  const connectFolderFallback = useStudioStore((s) => s.connectFolderFallback)
  const setPhase = useStudioStore((s) => s.setPhase)
  const opening = useStudioStore((s) => s.opening)
  const contextPins = useStudioStore((s) => s.contextPins)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)
  const showToast = useStudioStore((s) => s.showToast)

  const filteredDocs = useMemo(() => {
    if (!index) return new Map()
    if (!workspaceFilter) return index.docs
    return filterDocsByWorkspace(index.docs, workspaceFilter)
  }, [index, workspaceFilter])

  const types = useMemo(() => uniqueTypes(filteredDocs), [filteredDocs])
  const activeDoc = index && activePath ? index.docs.get(activePath) : null
  const brokenCount = useMemo(
    () => (index ? index.edges.filter((e) => e.broken).length : 0),
    [index],
  )

  if (!index) {
    if (embedded) return null
    return (
      <div className="browse-empty">
        <h2>Browse architecture</h2>
        <p>Connect a folder in Setup first.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Go to Setup
        </button>
        <button
          type="button"
          className="btn"
          disabled={opening}
          onClick={() => (supportsDirectoryPicker() ? connectFolder() : connectFolderFallback())}
        >
          Choose folder now
        </button>
      </div>
    )
  }

  return (
    <div className="browse-layout">
      <aside className="browse-sidebar">
        {brokenCount > 0 && (
          <p className="hint warn-inline" title="Broken relative links in the graph">
            {brokenCount} broken link{brokenCount === 1 ? '' : 's'}
          </p>
        )}
        <label className="search-label">
          Search
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Title, path, body…"
          />
        </label>
        {searchHits.length > 0 && (
          <ul className="search-hits">
            {searchHits
              .filter((h) => !workspaceFilter || filteredDocs.has(h.path))
              .map((h) => (
                <li key={h.path}>
                  <button type="button" onClick={() => setActivePath(h.path)}>
                    <span className="hit-title">{h.title}</span>
                    <span className="hit-path">{h.path}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
        <label className="filter-label">
          Type
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <DocTree
          docs={filteredDocs}
          activePath={activePath}
          typeFilter={typeFilter}
          onSelect={setActivePath}
        />
      </aside>

      <section className="browse-main">
        <div className="panel-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={browsePanel === 'doc' ? 'active' : ''}
            aria-selected={browsePanel === 'doc'}
            onClick={() => setBrowsePanel('doc')}
          >
            Document
          </button>
          <button
            type="button"
            role="tab"
            className={browsePanel === 'graph' ? 'active' : ''}
            aria-selected={browsePanel === 'graph'}
            onClick={() => setBrowsePanel('graph')}
          >
            Link graph
          </button>
          <button
            type="button"
            role="tab"
            className={browsePanel === 'board' ? 'active' : ''}
            aria-selected={browsePanel === 'board'}
            onClick={() => setBrowsePanel('board')}
            disabled={activeDoc?.kind !== 'storm'}
          >
            E2 board
          </button>
        </div>

        {activePath && browsePanel === 'doc' && (
          <div className="cmd-row browse-pin-row">
            <button
              type="button"
              className="btn"
              onClick={() => {
                toggleContextPin(activePath)
                showToast(
                  contextPins.includes(activePath)
                    ? 'Unpinned from context pack'
                    : 'Pinned for Session context pack',
                )
              }}
            >
              {contextPins.includes(activePath) ? 'Unpin from Session' : 'Pin for Session'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                try {
                  await navigator.clipboard?.writeText(activePath)
                  showToast('Path copied')
                } catch {
                  showToast('Copy failed')
                }
              }}
            >
              Copy path
            </button>
          </div>
        )}

        <div className="panel-body">
          {browsePanel === 'graph' && (
            <LinkGraph
              index={{
                ...index,
                docs: filteredDocs,
                edges: index.edges.filter(
                  (e) => filteredDocs.has(e.from) || filteredDocs.has(e.to),
                ),
              }}
              activePath={activePath}
              onSelect={(path) => {
                setActivePath(path)
                setBrowsePanel('doc')
              }}
            />
          )}
          {browsePanel === 'board' && activeDoc?.kind === 'storm' && (
            <E2Canvas jsonText={activeDoc.content} title={activeDoc.meta?.title as string} />
          )}
          {browsePanel === 'doc' && activeDoc?.kind === 'markdown' && (
            <DocViewer
              doc={activeDoc}
              allDocs={index.docs}
              onNavigate={(path) => setActivePath(path)}
              onOpenStorm={(path) => {
                setActivePath(path)
                setBrowsePanel('board')
              }}
              onPinPath={(path) => {
                toggleContextPin(path)
                showToast('Pinned for Session')
              }}
            />
          )}
          {browsePanel === 'doc' && activeDoc?.kind === 'storm' && (
            <div className="doc-storm-prompt">
              <p>
                <strong>{activeDoc.path}</strong> is an E2 board snapshot.
              </p>
              <button type="button" className="btn primary" onClick={() => setBrowsePanel('board')}>
                Open E2 board canvas
              </button>
            </div>
          )}
          {browsePanel === 'doc' && !activeDoc && (
            <p className="muted">Select a document from the tree.</p>
          )}
        </div>
      </section>
    </div>
  )
}
