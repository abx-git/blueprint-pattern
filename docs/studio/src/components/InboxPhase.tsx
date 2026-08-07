import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { HelpTip } from './HelpTip'
import { WORKSPACE_HELP } from '../lib/help-content'
import { listInboxPaths, readProposalStatus } from '../lib/inbox'

type InboxTab = 'raw' | 'proposals' | 'done'

/** Inbox workspace: paste/drop intake → proposals → merge prompts. */
export function InboxPhase() {
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const canWrite = useStudioStore((s) => s.canWrite)
  const index = useStudioStore((s) => s.index)
  const activePath = useStudioStore((s) => s.activePath)
  const setActivePath = useStudioStore((s) => s.setActivePath)
  const setPhase = useStudioStore((s) => s.setPhase)
  const openSession = useStudioStore((s) => s.openSession)
  const pasteInboxRaw = useStudioStore((s) => s.pasteInboxRaw)
  const setInboxProposalStatus = useStudioStore((s) => s.setInboxProposalStatus)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)
  const refreshIndex = useStudioStore((s) => s.refreshIndex)
  const opening = useStudioStore((s) => s.opening)

  const help = WORKSPACE_HELP.inbox
  const [tab, setTab] = useState<InboxTab>('raw')
  const [pasteLabel, setPasteLabel] = useState('')
  const [pasteBody, setPasteBody] = useState('')
  const [pasting, setPasting] = useState(false)

  const paths = useMemo(() => {
    if (!index) return [] as string[]
    return listInboxPaths(index.docs, tab)
  }, [index, tab])

  const activeDoc = index && activePath ? index.docs.get(activePath) : null
  const proposalStatus =
    activeDoc && activePath?.includes('/proposals/')
      ? readProposalStatus(activeDoc.meta as { status?: unknown } | null)
      : null

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Inbox</h2>
        <p>Finish Setup first — choose your documentation folder.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Go to Setup
        </button>
      </div>
    )
  }

  return (
    <div className="inbox-phase">
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-head">
          <h2>
            Inbox{' '}
            <HelpTip label={help.title}>
              <p>{help.summary}</p>
              <ul>
                {help.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </HelpTip>
          </h2>
        </div>
        <p className="spike-lead">{help.summary}</p>

        <div className="panel-tabs" role="tablist">
          {(['raw', 'proposals', 'done'] as InboxTab[]).map((id) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => {
                setTab(id)
                setActivePath(null)
              }}
            >
              {id === 'raw' ? 'Raw' : id === 'proposals' ? 'Proposals' : 'Done'}
            </button>
          ))}
        </div>

        <ul className="spike-list">
          {paths.length === 0 && (
            <li className="muted">
              {tab === 'raw'
                ? 'No raw files yet — paste below or drop files into inbox/raw/ then Refresh.'
                : tab === 'proposals'
                  ? 'No proposals yet — run Analyze after raw arrives.'
                  : 'Nothing merged yet.'}
            </li>
          )}
          {paths.map((p) => {
            const doc = index?.docs.get(p)
            const st =
              tab === 'proposals' && doc
                ? readProposalStatus(doc.meta as { status?: unknown } | null)
                : null
            return (
              <li key={p}>
                <button
                  type="button"
                  className={activePath === p ? 'active' : ''}
                  onClick={() => setActivePath(p)}
                >
                  <span className="spike-title">{p.split('/').pop()}</span>
                  {st ? <span className="tree-type">{st}</span> : null}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="inbox-actions cmd-row">
          <button
            type="button"
            className="btn primary"
            onClick={() => openSession('inbox-analyze')}
          >
            Analyze → proposal
          </button>
          <button type="button" className="btn" onClick={() => openSession('inbox-refine')}>
            Refine
          </button>
          <button type="button" className="btn" onClick={() => openSession('inbox-merge')}>
            Merge ready
          </button>
          <button type="button" className="btn" disabled={opening} onClick={() => void refreshIndex()}>
            Refresh
          </button>
        </div>
      </aside>

      <section className="inbox-main">
        {tab === 'raw' && (
          <div className="inbox-paste run-card">
            <h3>Paste into raw/</h3>
            <p className="hint">
              Or drop files directly into <code>inbox/raw/</code> in the docs folder, then Refresh.
            </p>
            <label className="field">
              <span>Label</span>
              <input
                value={pasteLabel}
                onChange={(e) => setPasteLabel(e.target.value)}
                placeholder="Confluence export, meeting notes, …"
                disabled={!canWrite}
              />
            </label>
            <label className="field">
              <span>Content</span>
              <textarea
                rows={8}
                value={pasteBody}
                onChange={(e) => setPasteBody(e.target.value)}
                placeholder="Paste Markdown, notes, or specs…"
                disabled={!canWrite}
              />
            </label>
            <button
              type="button"
              className="btn primary"
              disabled={!canWrite || pasting || !pasteBody.trim()}
              onClick={async () => {
                setPasting(true)
                const path = await pasteInboxRaw({
                  label: pasteLabel || 'paste',
                  body: pasteBody,
                })
                setPasting(false)
                if (path) {
                  setPasteBody('')
                  setTab('raw')
                }
              }}
            >
              {pasting ? 'Saving…' : 'Save to inbox/raw'}
            </button>
            {!canWrite && <p className="hint">Write access needed to paste.</p>}
          </div>
        )}

        {activeDoc ? (
          <div className="inbox-viewer">
            <div className="cmd-row inbox-viewer-bar">
              {proposalStatus && (
                <>
                  <span className="hint">Status: {proposalStatus}</span>
                  {(['draft', 'ready', 'blocked'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`btn${proposalStatus === st ? ' primary' : ''}`}
                      disabled={!canWrite}
                      onClick={() => void setInboxProposalStatus(activeDoc.path, st)}
                    >
                      {st}
                    </button>
                  ))}
                </>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  toggleContextPin(activeDoc.path)
                }}
              >
                Pin for Session
              </button>
            </div>
            <DocViewer
              doc={activeDoc}
              allDocs={index!.docs}
              onNavigate={(p) => setActivePath(p)}
              onOpenStorm={() => undefined}
              onPinPath={(p) => toggleContextPin(p)}
            />
          </div>
        ) : tab !== 'raw' || paths.length > 0 ? (
          <div className="phase-panel">
            <h2>{tab === 'raw' ? 'Raw' : tab === 'proposals' ? 'Proposals' : 'Done'}</h2>
            <p className="lead">
              {tab === 'raw'
                ? 'Select a raw file or paste new material. Then Analyze → proposal.'
                : tab === 'proposals'
                  ? 'Review a proposal, set status to ready, then Merge ready.'
                  : 'Archived proposals after merge.'}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
