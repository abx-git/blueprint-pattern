import { useStudioStore } from '../store/studio-store'
import { BrowseMode } from './BrowseMode'

/** Review = Browse stack bound to the connected folder. */
export function ReviewPhase() {
  const index = useStudioStore((s) => s.index)
  const setPhase = useStudioStore((s) => s.setPhase)
  const refreshIndex = useStudioStore((s) => s.refreshIndex)
  const opening = useStudioStore((s) => s.opening)

  if (!index) {
    return (
      <div className="phase-panel">
        <h2>Lesen</h2>
        <p>
          Noch kein Index. Setup abschließen oder Ordner aktualisieren, nachdem der Agent Dateien
          geschrieben hat.
        </p>
        <div className="cmd-row">
          <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
            Go to Setup
          </button>
          <button type="button" className="btn" onClick={() => setPhase('run')}>
            Back to Schreiben
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="review-phase">
      <div className="review-toolbar">
        <p>
          Lesen: <strong>{index.rootLabel}</strong> · {index.docs.size} files — Graph, Mermaid,
          Boards.
        </p>
        <div className="cmd-row">
          <button type="button" className="btn" disabled={opening} onClick={() => refreshIndex()}>
            Refresh from folder
          </button>
          <button type="button" className="btn" onClick={() => setPhase('run')}>
            Back to Schreiben
          </button>
        </div>
      </div>
      <BrowseMode embedded />
    </div>
  )
}
