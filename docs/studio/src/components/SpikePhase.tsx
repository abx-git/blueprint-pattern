import { useMemo, useRef, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { E2Canvas } from './E2Canvas'
import type { SpikeTrack, SpikeType } from '../lib/spikes'
import { isAnalysisSpikeType, isConceptSpikeType } from '../lib/workspace'
import { HelpTip } from './HelpTip'
import { WORKSPACE_HELP } from '../lib/help-content'

interface Props {
  mode: 'concepts' | 'analyses'
}

export function SpikePhase({ mode }: Props) {
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
  const importStormBoard = useStudioStore((s) => s.importStormBoard)
  const setPhase = useStudioStore((s) => s.setPhase)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)
  const showToast = useStudioStore((s) => s.showToast)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const isAnalyses = mode === 'analyses'
  const title = isAnalyses ? 'Analyses' : 'Concepts'
  const help = WORKSPACE_HELP[isAnalyses ? 'analyses' : 'concepts']
  const defaultType: SpikeType = isAnalyses ? 'analysis' : 'design'
  const defaultTrack: SpikeTrack = 'architecture'

  const [listKind, setListKind] = useState<'spikes' | 'reviews'>('spikes')
  const [showCreate, setShowCreate] = useState(false)
  const [spikeTitle, setSpikeTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [track, setTrack] = useState<SpikeTrack>(defaultTrack)
  const [type, setType] = useState<SpikeType>(defaultType)
  const [editMode, setEditMode] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [boardName, setBoardName] = useState('event-storming')
  const [modelingMode, setModelingMode] = useState('eventStorming')

  const filteredSpikes = useMemo(() => {
    return spikes.filter((s) =>
      isAnalyses ? isAnalysisSpikeType(s.type) : isConceptSpikeType(s.type),
    )
  }, [spikes, isAnalyses])

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
        <h2>{title}</h2>
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
          <h2>
            {title}{' '}
            <HelpTip label={help.title}>
              <p>{help.summary}</p>
              <ul>
                {help.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </HelpTip>
          </h2>
          <button
            type="button"
            className="btn primary"
            disabled={!canWrite}
            onClick={() => {
              setType(defaultType)
              setShowCreate(true)
            }}
          >
            {listKind === 'spikes' ? (isAnalyses ? 'New analysis' : 'New concept') : 'New review'}
          </button>
        </div>
        <p className="spike-lead">{help.summary}</p>
        {!isAnalyses && (
          <div className="panel-tabs" role="tablist">
            <button
              type="button"
              className={listKind === 'spikes' ? 'active' : ''}
              onClick={() => setListKind('spikes')}
            >
              Concepts
            </button>
            <button
              type="button"
              className={listKind === 'reviews' ? 'active' : ''}
              onClick={() => setListKind('reviews')}
            >
              Reviews
            </button>
          </div>
        )}
        {!canWrite && <p className="hint">Write access needed to create items.</p>}
        <ul className="spike-list">
          {listKind === 'spikes' && filteredSpikes.length === 0 && (
            <li className="muted">No {isAnalyses ? 'analyses' : 'concepts'} yet.</li>
          )}
          {listKind === 'reviews' && reviews.length === 0 && (
            <li className="muted">No reviews yet.</li>
          )}
          {listKind === 'spikes' &&
            filteredSpikes.map((s) => (
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
                  <span className="tree-type">{s.type}</span>
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
            <h3>{isAnalyses ? 'Create analysis' : 'Create concept spike'}</h3>
            <p className="hint">Writes under process/spikes/</p>
            <label className="field">
              <span>Title</span>
              <input
                value={spikeTitle}
                onChange={(e) => setSpikeTitle(e.target.value)}
                placeholder={isAnalyses ? 'Payment flow analysis' : 'Payment resilience design'}
              />
            </label>
            <label className="field">
              <span>Slug (optional)</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="short-name" />
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
                {isAnalyses ? (
                  <>
                    <option value="analysis">analysis</option>
                    <option value="domain-analysis">domain-analysis</option>
                  </>
                ) : (
                  <>
                    <option value="question">question</option>
                    <option value="design">design</option>
                    <option value="domain-question">domain-question</option>
                    <option value="domain-discovery">domain-discovery</option>
                    <option value="domain-design">domain-design</option>
                  </>
                )}
              </select>
            </label>
            <div className="cmd-row">
              <button
                type="button"
                className="btn primary"
                disabled={!spikeTitle.trim()}
                onClick={async () => {
                  const folder = await createSpike({
                    title: spikeTitle.trim(),
                    slug,
                    track,
                    type,
                  })
                  if (folder) {
                    setShowCreate(false)
                    setSpikeTitle('')
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
              <input
                value={spikeTitle}
                onChange={(e) => setSpikeTitle(e.target.value)}
                placeholder="Phase context check"
              />
            </label>
            <label className="field">
              <span>Slug (optional)</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="phase-context" />
            </label>
            <div className="cmd-row">
              <button
                type="button"
                className="btn primary"
                disabled={!spikeTitle.trim()}
                onClick={async () => {
                  const folder = await createReview({ title: spikeTitle.trim(), slug })
                  if (folder) {
                    setShowCreate(false)
                    setSpikeTitle('')
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
            <h2>{title}</h2>
            <p className="lead">
              {isAnalyses
                ? 'Structured investigations of implementation and flows. Outputs stay under process/spikes/ until you promote facts into durable chapters.'
                : 'Lifecycle drafts under process/ — concepts need not land in durable architecture chapters.'}
            </p>
            <p className="hint">
              {canWrite
                ? `Use “New ${isAnalyses ? 'analysis' : listKind === 'reviews' ? 'review' : 'concept'}” in the sidebar to start.`
                : 'Write access is needed to create items (reconnect the folder with write permission).'}
            </p>
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
                  <div className="cmd-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => void createStormBoard(activeSpikePath, boardName, modelingMode)}
                    >
                      Add board
                    </button>
                    <button
                      type="button"
                      className="btn primary"
                      disabled={importing}
                      onClick={() => importInputRef.current?.click()}
                    >
                      {importing ? 'Importing…' : 'Import E2…'}
                    </button>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".storm.json,application/json,.json"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (!file || !activeSpikePath) return
                        setImporting(true)
                        try {
                          const text = await file.text()
                          const path = await importStormBoard(activeSpikePath, text, file.name)
                          if (path) showToast(`Board at ${path}`)
                        } finally {
                          setImporting(false)
                        }
                      }}
                    />
                  </div>
                  <p className="hint">
                    Import an E2 Board Snapshot v2 (<code>.storm.json</code>) into this spike&apos;s{' '}
                    <code>boards/</code>.
                  </p>
                </div>
              )}
            </div>

            <div className="spike-content">
              {activeDoc?.kind === 'markdown' && (
                <>
                  <div className="cmd-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        toggleContextPin(activeDoc.path)
                        showToast('Pinned for Session')
                      }}
                    >
                      Pin for Session
                    </button>
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
                      onPinPath={(path) => {
                        toggleContextPin(path)
                        showToast('Pinned for Session')
                      }}
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
