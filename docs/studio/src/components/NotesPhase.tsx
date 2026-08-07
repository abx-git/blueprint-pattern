import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { HelpTip } from './HelpTip'
import { isNotesPath } from '../lib/notes'

/** Local user notes — not Git, not architecture truth unless explicitly opted in. */
export function NotesPhase() {
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const canWrite = useStudioStore((s) => s.canWrite)
  const index = useStudioStore((s) => s.index)
  const activePath = useStudioStore((s) => s.activePath)
  const setActivePath = useStudioStore((s) => s.setActivePath)
  const goSetup = useStudioStore((s) => s.goSetup)
  const pasteLocalNote = useStudioStore((s) => s.pasteLocalNote)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)
  const contextPins = useStudioStore((s) => s.contextPins)
  const refreshIndex = useStudioStore((s) => s.refreshIndex)
  const opening = useStudioStore((s) => s.opening)
  const showToast = useStudioStore((s) => s.showToast)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const paths = useMemo(() => {
    if (!index) return [] as string[]
    return [...index.docs.keys()]
      .filter((p) => isNotesPath(p) && p.endsWith('.md') && !p.endsWith('.gitignore'))
      .sort()
  }, [index])

  const activeDoc = index && activePath ? index.docs.get(activePath) : null

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Notes</h2>
        <p>Choose your documentation folder in Setup first.</p>
        <button type="button" className="btn primary" onClick={() => goSetup()}>
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
            Notes{' '}
            <HelpTip label="Notes">
              <p>
                Your <strong>local</strong> scratch notes under <code>notes/</code>. Content is{' '}
                <strong>not meant for Git</strong> and is <strong>not</strong> architecture truth.
              </p>
              <p>
                Ask AI ignores notes unless you enable <em>Include local notes</em> on Ask AI (or
                explicitly ask in the prompt).
              </p>
            </HelpTip>
          </h2>
        </div>
        <p className="spike-lead">
          Parallel to AGM flows — personal reminders only. Prefer Inbox for material that should
          become lasting docs.
        </p>
        <ul className="spike-list">
          {paths.length === 0 && <li className="muted">No local notes yet.</li>}
          {paths.map((p) => (
            <li key={p}>
              <button
                type="button"
                className={activePath === p ? 'active' : ''}
                onClick={() => setActivePath(p)}
              >
                <span className="spike-title">{p.split('/').pop()}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="inbox-primary">
          <button
            type="button"
            className="btn"
            disabled={opening}
            onClick={() => void refreshIndex()}
          >
            Reload folder
          </button>
        </div>
      </aside>

      <section className="inbox-main">
        {!activeDoc && (
          <div className="inbox-paste run-card">
            <h3>New local note</h3>
            <p className="lead">
              Saved under <code>notes/</code> with a local-only <code>.gitignore</code>. Not checked
              into Git. Not used by Ask AI unless you explicitly include notes.
            </p>
            <label className="field">
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Interview leftovers"
                disabled={!canWrite}
              />
            </label>
            <label className="field">
              <span>Text</span>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Private notes…"
                disabled={!canWrite}
              />
            </label>
            <button
              type="button"
              className="btn primary"
              disabled={!canWrite || saving || !body.trim()}
              onClick={async () => {
                setSaving(true)
                const path = await pasteLocalNote({
                  title: title || 'untitled note',
                  body,
                })
                setSaving(false)
                if (path) {
                  setTitle('')
                  setBody('')
                }
              }}
            >
              {saving ? 'Saving…' : 'Save local note'}
            </button>
            {!canWrite && (
              <p className="hint">You need write access to the folder (reconnect in the header).</p>
            )}
          </div>
        )}

        {activeDoc ? (
          <div className="inbox-viewer">
            <div className="cmd-row inbox-viewer-bar">
              <span className="hint">Local only — not architecture truth</span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  toggleContextPin(activeDoc.path)
                  const on = !contextPins.includes(activeDoc.path)
                  showToast(
                    on
                      ? 'Remembered — still excluded from Ask AI until you enable Include local notes'
                      : 'Removed from reading list',
                  )
                }}
              >
                {contextPins.includes(activeDoc.path)
                  ? 'Forget for AI prompt'
                  : 'Remember for AI prompt'}
              </button>
              <button type="button" className="btn" onClick={() => setActivePath(null)}>
                New note
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
        ) : null}
      </section>
    </div>
  )
}
