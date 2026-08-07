import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { HelpTip } from './HelpTip'

/**
 * Verify reports (REV): AI checks architecture docs in a fresh chat — report only.
 * Lives under Architecture, not Concepts.
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
            Verify reports{' '}
            <HelpTip label="Verify reports">
              <p>
                A <strong>review</strong> is a quality check of the architecture documentation (or a
                phase / post-sync slice) — not a review of Concepts.
              </p>
              <p>
                <strong>Who:</strong> an AI chat on this repo (Prompt → Verify), in a{' '}
                <em>fresh</em> chat with no write context.
              </p>
              <p>
                <strong>Result:</strong> report + findings under <code>process/reviews/</code>,
                registered in <code>blueprint.md</code>. Report-only — the agent does not fix docs
                in that session.
              </p>
            </HelpTip>
          </h2>
          <button
            type="button"
            className="btn primary"
            disabled={!canWrite}
            onClick={() => setShowCreate(true)}
          >
            New review folder
          </button>
        </div>

        <ol className="reviews-howto">
          <li>
            <strong>What</strong> — Check that durable docs match reality / blueprint quality.
          </li>
          <li>
            <strong>Who</strong> — You copy a Verify prompt; the AI writes the report (fresh chat).
          </li>
          <li>
            <strong>Then</strong> — Read the verdict here; fix issues later via Extend / separate
            work — not in the same Verify chat.
          </li>
        </ol>

        <ul className="spike-list">
          {reviews.length === 0 && <li className="muted">No verify reports yet.</li>}
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
            title="Opens Prompt on Verify workflows"
          >
            Prepare Verify prompt
          </button>
        </div>
      </aside>

      <section className="spike-main">
        {showCreate && (
          <div className="spike-create-dialog">
            <h3>New verify report folder</h3>
            <p className="hint">
              Creates empty <code>report.md</code> + <code>findings.md</code> under{' '}
              <code>process/reviews/</code> and a REV row in <code>blueprint.md</code>. The AI fills
              them when you run Verify (fresh chat).
            </p>
            <label className="field">
              <span>Title (what is being checked?)</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Phase context after Extend"
              />
            </label>
            <label className="field">
              <span>Slug (optional)</span>
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
                Create folder
              </button>
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showCreate && !isReviewFolder && (
          <div className="phase-panel">
            <h2>Verify reports</h2>
            <p className="lead">
              These reports check <strong>architecture documentation quality</strong> (links,
              evidence, phase readiness) — they do <strong>not</strong> review Concept spikes.
            </p>
            <ol className="reviews-howto reviews-howto--main">
              <li>Optional: create a review folder (stub report + findings).</li>
              <li>
                Click <strong>Prepare Verify prompt</strong> → copy into a <em>new</em> AI chat.
              </li>
              <li>AI writes the report only (PASS / PASS WITH NOTES / FAIL + findings).</li>
              <li>Refresh here, read the verdict, then fix gaps with Extend or other work.</li>
            </ol>
            <div className="cmd-row">
              <button type="button" className="btn primary" onClick={() => openSession('verify')}>
                Prepare Verify prompt
              </button>
              <button
                type="button"
                className="btn"
                disabled={!canWrite}
                onClick={() => setShowCreate(true)}
              >
                New review folder
              </button>
            </div>
          </div>
        )}

        {isReviewFolder && activeSpikePath && (
          <div className="spike-workspace">
            <div className="spike-files">
              <h3>{activeSpikePath.split('/').pop()}</h3>
              <p className="hint">
                Report-only artifacts. Fill via Verify prompt; do not expect the same chat to edit
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
                Prepare Verify prompt
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
                <p className="muted">Select report.md or findings.md.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
