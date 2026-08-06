import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { E2Canvas } from './E2Canvas'
import type { SpikeTrack, SpikeType } from '../lib/spikes'

export function SpikePhase() {
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const canWrite = useStudioStore((s) => s.canWrite)
  const spikes = useStudioStore((s) => s.spikes)
  const reviews = useStudioStore((s) => s.reviews)
  const index = useStudioStore((s) => s.index)
  const activeSpikePath = useStudioStore((s) => s.activeSpikePath)
  const setActiveSpikePath = useStudioStore((s) => s.setActiveSpikePath)
  const activePath = useStudioStore((s) => s.activePath)
  const setActivePath = useStudioStore((s) => s.setActivePath)
  const createSpike = useStudioStore((s) => s.createSpike)
  const createReview = useStudioStore((s) => s.createReview)
  const saveSpikeFile = useStudioStore((s) => s.saveSpikeFile)
  const createStormBoard = useStudioStore((s) => s.createStormBoard)
  const setPhase = useStudioStore((s) => s.setPhase)

  const [listKind, setListKind] = useState<'spikes' | 'reviews'>('spikes')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [track, setTrack] = useState<SpikeTrack>('architecture')
  const [type, setType] = useState<SpikeType>('analysis')
  const [editMode, setEditMode] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [boardName, setBoardName] = useState('event-storming')
  const [modelingMode, setModelingMode] = useState('eventStorming')

  const isReviewFolder = Boolean(activeSpikePath?.includes('/reviews/'))

  const spikeFiles = useMemo(() => {
    if (!index || !activeSpikePath) return []
    return [...index.docs.values()]
      .filter((d) => d.path === activeSpikePath || d.path.startsWith(activeSpikePath + '/'))
      .sort((a, b) => a.path.localeCompare(b.path))
  }, [index, activeSpikePath])

  const activeDoc = index && activePath ? index.docs.get(activePath) : null

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Spikes</h2>
        <p>Finish Setup first — choose your documentation folder.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Go to Setup
        </button>
      </div>
    )
  }

  return (
    <div className="spike-phase">
      <aside className="spike-sidebar">
        <div className="spike-sidebar-head">
          <h2>Spikes</h2>
          <button
            type="button"
            className="btn primary"
            disabled={!canWrite}
            onClick={() => setShowCreate(true)}
          >
            {listKind === 'spikes' ? 'New spike' : 'New review'}
          </button>
        </div>
        <p className="spike-lead">
          Work through open questions here — not in the durable architecture chapters.
        </p>
        <div className="panel-tabs" role="tablist">
          <button
            type="button"
            className={listKind === 'spikes' ? 'active' : ''}
            onClick={() => setListKind('spikes')}
          >
            Spikes
          </button>
          <button
            type="button"
            className={listKind === 'reviews' ? 'active' : ''}
            onClick={() => setListKind('reviews')}
          >
            Reviews
          </button>
        </div>
        {!canWrite && <p className="hint">Write access needed to create items.</p>}
        <ul className="spike-list">
          {listKind === 'spikes' && spikes.length === 0 && <li className="muted">No spikes yet.</li>}
          {listKind === 'reviews' && reviews.length === 0 && (
            <li className="muted">No reviews yet.</li>
          )}
          {listKind === 'spikes' &&
            spikes.map((s) => (
              <li key={s.path}>
                <button
                  type="button"
                  className={activeSpikePath === s.path ? 'active' : ''}
                  onClick={() => {
                    setActiveSpikePath(s.path)
                    setActivePath(`${s.path}/notes.md`)
                    setEditMode(false)
                  }}
                >
                  <span className="spike-id">{s.id}</span>
                  <span className="spike-title">{s.title}</span>
                </button>
              </li>
            ))}
          {listKind === 'reviews' &&
            reviews.map((r) => (
              <li key={r.path}>
                <button
                  type="button"
                  className={activeSpikePath === r.path ? 'active' : ''}
                  onClick={() => {
                    setActiveSpikePath(r.path)
                    setActivePath(`${r.path}/report.md`)
                    setEditMode(false)
                  }}
                >
                  <span className="spike-id">{r.id}</span>
                  <span className="spike-title">{r.title}</span>
                </button>
              </li>
            ))}
        </ul>
      </aside>

      <section className="spike-main">
        {showCreate && listKind === 'spikes' && (
          <div className="spike-create-dialog">
            <h3>Create spike</h3>
            <p className="hint">Writes under process/spikes/</p>
            <label className="field">
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Payment resilience" />
            </label>
            <label className="field">
              <span>Slug (optional)</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="payment-resilience" />
            </label>
            <label className="field">
              <span>Track</span>
              <select value={track} onChange={(e) => setTrack(e.target.value as SpikeTrack)}>
                <option value="architecture">architecture</option>
                <option value="domain">domain</option>
              </select>
            </label>
            <label className="field">
              <span>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as SpikeType)}>
                <option value="question">question</option>
                <option value="analysis">analysis</option>
                <option value="design">design</option>
                <option value="domain-question">domain-question</option>
                <option value="domain-discovery">domain-discovery</option>
                <option value="domain-analysis">domain-analysis</option>
                <option value="domain-design">domain-design</option>
              </select>
            </label>
            <div className="cmd-row">
              <button
                type="button"
                className="btn primary"
                disabled={!title.trim()}
                onClick={async () => {
                  const folder = await createSpike({ title: title.trim(), slug, track, type })
                  if (folder) {
                    setShowCreate(false)
                    setTitle('')
                    setSlug('')
                    setActivePath(`${folder}/notes.md`)
                  }
                }}
              >
                Create
              </button>
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {showCreate && listKind === 'reviews' && (
          <div className="spike-create-dialog">
            <h3>Create review</h3>
            <p className="hint">Writes under process/reviews/ (report + findings)</p>
            <label className="field">
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Phase context check" />
            </label>
            <label className="field">
              <span>Slug (optional)</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="phase-context" />
            </label>
            <div className="cmd-row">
              <button
                type="button"
                className="btn primary"
                disabled={!title.trim()}
                onClick={async () => {
                  const folder = await createReview({ title: title.trim(), slug })
                  if (folder) {
                    setShowCreate(false)
                    setTitle('')
                    setSlug('')
                    setListKind('reviews')
                    setActivePath(`${folder}/report.md`)
                  }
                }}
              >
                Create
              </button>
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!activeSpikePath && !showCreate && (
          <div className="phase-panel">
            <h2>Process workspace</h2>
            <p className="lead">
              Lifecycle artifacts live under <code>process/</code>: spikes (SPK) for explorations,
              reviews (REV) for Verify reports — separate from durable architecture chapters.
            </p>
            <button
              type="button"
              className="btn primary"
              disabled={!canWrite}
              onClick={() => setShowCreate(true)}
            >
              {listKind === 'spikes' ? 'Create your first spike' : 'Create your first review'}
            </button>
          </div>
        )}

        {activeSpikePath && (
          <div className="spike-workspace">
            <div className="spike-files">
              <h3>{activeSpikePath.split('/').pop()}</h3>
              <ul>
                {spikeFiles.map((f) => (
                  <li key={f.path}>
                    <button
                      type="button"
                      className={activePath === f.path ? 'active' : ''}
                      onClick={() => {
                        setActivePath(f.path)
                        setEditMode(false)
                      }}
                    >
                      {f.path.slice(activeSpikePath.length + 1) || f.name}
                    </button>
                  </li>
                ))}
              </ul>
              {canWrite && !isReviewFolder && (
                <div className="board-create">
                  <h4>New board</h4>
                  <input value={boardName} onChange={(e) => setBoardName(e.target.value)} />
                  <select value={modelingMode} onChange={(e) => setModelingMode(e.target.value)}>
                    <option value="eventStorming">Event storming</option>
                    <option value="domainDrivenDesign">DDD / context map</option>
                    <option value="processFlow">Process</option>
                    <option value="bdd">BDD</option>
                    <option value="dataModel">Data</option>
                  </select>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => void createStormBoard(activeSpikePath, boardName, modelingMode)}
                  >
                    Add board
                  </button>
                </div>
              )}
            </div>

            <div className="spike-content">
              {activeDoc?.kind === 'markdown' && (
                <>
                  <div className="cmd-row">
                    {canWrite && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          if (!editMode) {
                            setDraftText(activeDoc.content)
                            setEditMode(true)
                          } else {
                            setEditMode(false)
                          }
                        }}
                      >
                        {editMode ? 'Cancel edit' : 'Edit markdown'}
                      </button>
                    )}
                    {editMode && (
                      <button
                        type="button"
                        className="btn primary"
                        onClick={async () => {
                          const ok = await saveSpikeFile(activeDoc.path, draftText)
                          if (ok) setEditMode(false)
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                  {editMode ? (
                    <textarea
                      className="md-editor"
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      rows={24}
                    />
                  ) : (
                    <DocViewer
                      doc={activeDoc}
                      allDocs={index!.docs}
                      onNavigate={(path) => setActivePath(path)}
                      onOpenStorm={(path) => setActivePath(path)}
                    />
                  )}
                </>
              )}
              {activeDoc?.kind === 'storm' && (
                <E2Canvas
                  jsonText={activeDoc.content}
                  title={activeDoc.name}
                  editable={canWrite}
                  onSave={
                    canWrite
                      ? async (json) => {
                          await saveSpikeFile(activeDoc.path, json)
                        }
                      : undefined
                  }
                />
              )}
              {!activeDoc && <p className="muted">Select a file.</p>}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
