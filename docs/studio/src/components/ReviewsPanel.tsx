import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { HelpTip } from './HelpTip'

/**
 * Doc checks under Architecture → Check docs.
 * Primary CTA lives in the Architecture toolbar — not duplicated here.
 */
export function ReviewsPanel() {
  const canWrite = useStudioStore((s) => s.canWrite)
  const reviews = useStudioStore((s) => s.reviews)
  const index = useStudioStore((s) => s.index)
  const activeSpikePath = useStudioStore((s) => s.activeSpikePath)
  const setActiveSpikePath = useStudioStore((s) => s.setActiveSpikePath)
  const activePath = useStudioStore((s) => s.activePath)
  const setActivePath = useStudioStore((s) => s.setActivePath)
  const createReview = useStudioStore((s) => s.createReview)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')

  const isReviewFolder = Boolean(activeSpikePath?.includes('/reviews/'))
  const reviewFiles = useMemo(() => {
    if (!index || !activeSpikePath || !isReviewFolder) return []
    return [...index.docs.values()]
      .filter((d) => d.path === activeSpikePath || d.path.startsWith(activeSpikePath + '/'))
      .sort((a, b) => a.path.localeCompare(b.path))
  }, [index, activeSpikePath, isReviewFolder])

  const activeDoc = index && activePath ? index.docs.get(activePath) : null

  return (
    <div className="reviews-panel spike-phase">
      <aside className="spike-sidebar">
        <div className="spike-sidebar-head">
          <h2>
            Check docs{' '}
            <HelpTip label="Check docs">
              <p>
                A <strong>doc check</strong> asks the AI whether your lasting documentation is sound
                — not whether a Concept draft is good.
              </p>
              <p>
                Use the toolbar button <strong>Ask AI to check docs</strong>, paste into a{' '}
                <em>new</em> chat, then Reload folder. The AI does not fix docs in that chat.
              </p>
            </HelpTip>
          </h2>
          <button
            type="button"
            className="btn"
            disabled={!canWrite}
            onClick={() => setShowCreate(true)}
          >
            Start a check
          </button>
        </div>

        <ol className="reviews-howto">
          <li>
            <strong>Optional</strong> — Start a check (empty report folder).
          </li>
          <li>
            <strong>Then</strong> — Toolbar → Ask AI to check docs → new chat → Reload folder.
          </li>
          <li>
            <strong>Fix later</strong> — Use Ask AI · next checklist, not the same check chat.
          </li>
        </ol>

        <ul className="spike-list">
          {reviews.length === 0 && <li className="muted">No doc checks yet.</li>}
          {reviews.map((r) => (
            <li key={r.path}>
              <button
                type="button"
                className={activeSpikePath === r.path ? 'active' : ''}
                onClick={() => {
                  setActiveSpikePath(r.path)
                  setActivePath(`${r.path}/report.md`)
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
        {showCreate && (
          <div className="spike-create-dialog">
            <h3>Start a documentation check</h3>
            <p className="hint">
              Creates an empty report the AI will fill when you run the check in a fresh chat.
            </p>
            <label className="field">
              <span>What is being checked?</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Context chapter after first fill"
              />
            </label>
            <label className="field">
              <span>Short id (optional)</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="phase-context"
              />
            </label>
            <div className="cmd-row">
              <button
                type="button"
                className="btn primary"
                disabled={!title.trim() || !canWrite}
                onClick={async () => {
                  const folder = await createReview({ title: title.trim(), slug })
                  if (folder) {
                    setShowCreate(false)
                    setTitle('')
                    setSlug('')
                    setActiveSpikePath(folder)
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

        {!showCreate && !isReviewFolder && (
          <div className="phase-panel">
            <h2>Check documentation quality</h2>
            <p className="lead">
              These reports check <strong>architecture documentation quality</strong> — they do{' '}
              <strong>not</strong> review Concept drafts.
            </p>
            <ol className="reviews-howto reviews-howto--main">
              <li>Optional: click <strong>Start a check</strong> for an empty report folder.</li>
              <li>
                Use the toolbar <strong>Ask AI to check docs</strong> → copy into a <em>new</em> AI
                chat.
              </li>
              <li>Reload folder, read the verdict, then fix gaps with Ask AI · next checklist.</li>
            </ol>
            <div className="cmd-row">
              <button
                type="button"
                className="btn"
                disabled={!canWrite}
                onClick={() => setShowCreate(true)}
              >
                Start a check
              </button>
            </div>
          </div>
        )}

        {isReviewFolder && activeSpikePath && (
          <div className="spike-workspace">
            <div className="spike-files">
              <h3>{activeSpikePath.split('/').pop()}</h3>
              <p className="hint">
                Report only. Fill via the toolbar <strong>Ask AI to check docs</strong>.
              </p>
              <ul>
                {reviewFiles.map((f) => (
                  <li key={f.path}>
                    <button
                      type="button"
                      className={activePath === f.path ? 'active' : ''}
                      onClick={() => setActivePath(f.path)}
                    >
                      {f.path.slice(activeSpikePath.length + 1) || f.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="spike-doc">
              {activeDoc ? (
                <DocViewer
                  doc={activeDoc}
                  allDocs={index!.docs}
                  onNavigate={(p) => setActivePath(p)}
                  onOpenStorm={() => undefined}
                  onPinPath={(p) => toggleContextPin(p)}
                />
              ) : (
                <p className="muted">Select the report or findings file.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
