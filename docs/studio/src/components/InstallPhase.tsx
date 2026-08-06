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
        <h2>Install</h2>
        <p>Connect a folder first.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Go to Connect
        </button>
      </div>
    )
  }

  return (
    <div className="phase-panel install-phase">
      <h2>Install into your folder</h2>
      <p className="lead">
        Status: <strong>{installStatus}</strong>
        {installStatus === 'ready'
          ? ' — architecture graph found. Continue to Run.'
          : ' — Studio writes the starter pack into this folder. No CLI or download.'}
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
          Continue to Run
        </button>
        {installStatus === 'missing' && (
          <span className="hint">Write the starter first (needs write access).</span>
        )}
      </div>
    </div>
  )
}
