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
        <h2>Setup — starter</h2>
        <p>Choose a folder in Setup first.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Choose folder
        </button>
      </div>
    )
  }

  return (
    <div className="phase-panel install-phase">
      <h2>Setup — write starter</h2>
      <p className="lead">
        {installStatus === 'ready'
          ? 'Starter state files are present. Open Architecture, or rewrite entry-point + blueprint.'
          : 'Writes only two state files: entry-point.md and blueprint.md. No empty chapters or stubs.'}
      </p>

      <div className="install-card">
        <p>
          Into <code>{folderLabel}</code>: <strong>entry-point.md</strong> (facts + links) and{' '}
          <strong>blueprint.md</strong> (what&apos;s next). Template chapters, domain/, spikes, and
          reviews are created later by <strong>Ask AI · first fill</strong>,{' '}
          <strong>Ask AI · next checklist</strong>, or Studio actions — not now. Prompts stay in AGM
          Studio. Doc paths in prompts use <code>{project.docRoot || './'}</code>.
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
              ? 'Rewrite entry-point + blueprint'
              : 'Write entry-point + blueprint'}
        </button>
      </div>

      <div className="phase-actions">
        <button type="button" className="btn" onClick={() => setPhase('connect')}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => setPhase('architecture')}
          disabled={installStatus === 'missing'}
        >
          Open Architecture
        </button>
        {installStatus === 'missing' && (
          <span className="hint">Write the starter first (needs write access).</span>
        )}
      </div>
    </div>
  )
}
