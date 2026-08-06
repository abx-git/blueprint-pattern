import { useStudioStore } from '../store/studio-store'

export function InstallPhase() {
  const setPhase = useStudioStore((s) => s.setPhase)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const project = useStudioStore((s) => s.project)
  const canWrite = useStudioStore((s) => s.canWrite)
  const installStatus = useStudioStore((s) => s.installStatus)
  const writeStarterScaffold = useStudioStore((s) => s.writeStarterScaffold)
  const installing = useStudioStore((s) => s.installing)

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Setup — Starter</h2>
        <p>Choose a folder in Setup first.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Choose folder
        </button>
      </div>
    )
  }

  return (
    <div className="phase-panel install-phase">
      <h2>Setup — Starter schreiben</h2>
      <p className="lead">
        {installStatus === 'ready'
          ? 'Starter ist vorhanden. Du kannst zu Schreiben weitergehen oder die Dateien neu schreiben.'
          : 'Ein Klick schreibt entry-point, blueprint und Vorlagen in den Ordner. Kein CLI.'}
      </p>

      <div className="install-card">
        <p>
          Writes entry-point, blueprint, template stubs, roles, and process
          templates into <code>{folderLabel}</code>. Run prompts will refer to{' '}
          <code>{project.docRoot || './'}</code>.
        </p>
        {!canWrite && (
          <p className="warn">
            Write permission is required. Go back to Connect and choose the folder again in Chrome,
            Edge, or Brave — allow edit access when the browser asks.
          </p>
        )}
        <button
          type="button"
          className="btn primary"
          disabled={!canWrite || installing}
          onClick={() => writeStarterScaffold()}
        >
          {installing
            ? 'Writing…'
            : installStatus === 'ready'
              ? 'Rewrite starter files'
              : 'Write starter into folder'}
        </button>
      </div>

      <div className="phase-actions">
        <button type="button" className="btn" onClick={() => setPhase('connect')}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => setPhase('run')}
          disabled={installStatus === 'missing'}
        >
          Continue to Schreiben
        </button>
        {installStatus === 'missing' && (
          <span className="hint">Write the starter first (needs write access).</span>
        )}
      </div>
    </div>
  )
}
