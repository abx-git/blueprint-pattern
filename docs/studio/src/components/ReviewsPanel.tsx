import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { HelpTip } from './HelpTip'

/**
 * Doc checks: AI reviews architecture docs in a fresh chat — report only.
 * Lives under Architecture → Check docs, not Concepts.
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
  const openSession = useStudioStore((s) => s.openSession)
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
                (for a phase or after a sync) — not whether a Concept draft is good.
              </p>
              <p>
                <strong>Who:</strong> you copy a prompt into a <em>new</em> AI chat on this project.
              </p>
              <p>
                <strong>Result:</strong> a written report with PASS / notes / FAIL. The AI does not
                fix the docs in that same chat — you fix later with Ask AI.
              </p>
            </HelpTip>
          </h2>
          <button
            type="button"
            className="btn primary"
            disabled={!canWrite}
            onClick={() => setShowCreate(true)}
          >
            Start a check
          </button>
        </div>

        <ol className="reviews-howto">
          <li>
            <strong>What</strong> — Check that durable docs match reality and the checklist quality.
          </li>
          <li>
            <strong>Who</strong> — You copy a prompt; the AI writes the report in a fresh chat.
          </li>
          <li>
            <strong>Then</strong> — Read the verdict here; fix issues later via Ask AI — not in the
            same check chat.
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

        <div className="cmd-row inbox-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => openSession('verify')}
            title="Opens Ask AI with a documentation quality check"
          >
            Ask AI to check docs
          </button>
        </div>
      </aside>

      <section className="spike-main">
        {showCreate && (
          <div className="spike-create-dialog">
            <h3>Start a documentation check</h3>
            <p className="hint">
              Creates an empty report the AI will fill when you run the check in a fresh chat. You
              choose a short name so you can find it later.
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
              These reports check <strong>architecture documentation quality</strong> (links,
              evidence, readiness) — they do <strong>not</strong> review Concept drafts.
            </p>
            <ol className="reviews-howto reviews-howto--main">
              <li>Optional: start a check (empty report ready for the AI).</li>
              <li>
                Click <strong>Ask AI to check docs</strong> → copy into a <em>new</em> AI chat.
              </li>
              <li>The AI writes the report only (PASS / notes / FAIL + findings).</li>
              <li>
                Click <strong>Reload folder</strong>, read the verdict, then fix gaps with Ask AI.
              </li>
            </ol>
            <div className="cmd-row">
              <button type="button" className="btn primary" onClick={() => openSession('verify')}>
                Ask AI to check docs
              </button>
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
                Report only. Fill via Ask AI → check docs. Do not expect the same chat to edit
                chapters.
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
              <button
                type="button"
                className="btn primary"
                onClick={() => openSession('verify')}
              >
                Ask AI to check docs
              </button>
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
