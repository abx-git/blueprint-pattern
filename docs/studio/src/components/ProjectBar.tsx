import { useStudioStore } from '../store/studio-store'
import { supportsDirectoryPicker } from '../lib/fs-access'
import type { JourneyPhase } from '../types'

const DAILY: { id: JourneyPhase; label: string; hint: string }[] = [
  { id: 'run', label: 'Schreiben', hint: 'Docs erweitern' },
  { id: 'spike', label: 'Spikes', hint: 'Ideen ausarbeiten' },
  { id: 'review', label: 'Lesen', hint: 'Graph browsen' },
]

export function JourneyRail() {
  const phase = useStudioStore((s) => s.phase)
  const setPhase = useStudioStore((s) => s.setPhase)
  const goSetup = useStudioStore((s) => s.goSetup)
  const installStatus = useStudioStore((s) => s.installStatus)
  const index = useStudioStore((s) => s.index)
  const folderLabel = useStudioStore((s) => s.folderLabel)

  const ready = Boolean(folderLabel) && installStatus === 'ready'
  const setupActive = phase === 'connect' || phase === 'install'
  const setupHint = !folderLabel
    ? 'Ordner wählen'
    : installStatus !== 'ready'
      ? 'Starter schreiben'
      : 'Projekt & Ordner'

  return (
    <nav className="journey-rail" aria-label="AGM Studio">
      {ready ? (
        <>
          {DAILY.map((p) => {
            const locked = p.id === 'review' && !index
            return (
              <button
                key={p.id}
                type="button"
                className={`journey-chip${phase === p.id ? ' active' : ''}`}
                disabled={locked && p.id !== phase}
                onClick={() => setPhase(p.id)}
              >
                <span className="journey-chip-label">{p.label}</span>
                <span className="journey-chip-hint">{p.hint}</span>
              </button>
            )
          })}
          <button
            type="button"
            className={`journey-chip journey-chip--secondary${setupActive ? ' active' : ''}`}
            onClick={() => goSetup()}
          >
            <span className="journey-chip-label">Setup</span>
            <span className="journey-chip-hint">{setupHint}</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`journey-chip${setupActive || phase === 'start' ? ' active' : ''}`}
            onClick={() => goSetup()}
          >
            <span className="journey-chip-label">Setup</span>
            <span className="journey-chip-hint">{setupHint}</span>
          </button>
          {DAILY.map((p) => (
            <button
              key={p.id}
              type="button"
              className="journey-chip"
              disabled
              title="Finish Setup first"
            >
              <span className="journey-chip-label">{p.label}</span>
              <span className="journey-chip-hint">nach Setup</span>
            </button>
          ))}
        </>
      )}
    </nav>
  )
}

export function ProjectBar() {
  const phase = useStudioStore((s) => s.phase)
  const setPhase = useStudioStore((s) => s.setPhase)
  const goSetup = useStudioStore((s) => s.goSetup)
  const project = useStudioStore((s) => s.project)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const folderHint = useStudioStore((s) => s.folderHint)
  const canWrite = useStudioStore((s) => s.canWrite)
  const installStatus = useStudioStore((s) => s.installStatus)
  const connectFolder = useStudioStore((s) => s.connectFolder)
  const connectFolderFallback = useStudioStore((s) => s.connectFolderFallback)
  const refreshIndex = useStudioStore((s) => s.refreshIndex)
  const opening = useStudioStore((s) => s.opening)
  const restoring = useStudioStore((s) => s.restoring)

  const displayFolder = folderLabel || folderHint
  const ready = Boolean(folderLabel) && installStatus === 'ready'
  const introPhase = phase === 'about' || phase === 'start'

  return (
    <header className="project-bar">
      <button type="button" className="studio-brand studio-brand-btn" onClick={() => setPhase('about')}>
        <strong>AGM Studio</strong>
        <span className="studio-tag">
          {phase === 'about'
            ? 'what is AGM'
            : phase === 'start'
              ? 'how it works'
              : ready
                ? 'Schreiben · Spikes · Lesen'
                : 'Setup'}
        </span>
      </button>
      <div className="project-meta">
        <span className="meta-pill">{project.appName || 'Unnamed project'}</span>
        {project.docRoot ? <span className="meta-pill">{project.docRoot}</span> : null}
        {displayFolder ? (
          <span className="meta-pill" title={displayFolder}>
            {displayFolder}
            {folderLabel ? (canWrite ? ' · write' : ' · read') : ' · reconnect'}
            {folderLabel && installStatus !== 'unknown' ? ` · ${installStatus}` : ''}
          </span>
        ) : (
          <span className="meta-pill muted">{restoring ? 'Restoring…' : 'No folder'}</span>
        )}
      </div>
      <div className="studio-actions">
        {!introPhase && (
          <button
            type="button"
            className="btn"
            disabled={opening || restoring}
            onClick={() => {
              goSetup()
              if (!folderLabel) {
                if (supportsDirectoryPicker()) void connectFolder()
                else void connectFolderFallback()
              }
            }}
          >
            {opening || restoring
              ? 'Opening…'
              : folderLabel
                ? 'Change folder'
                : folderHint
                  ? 'Allow folder again'
                  : 'Choose folder'}
          </button>
        )}
        {folderLabel && !introPhase && (
          <button type="button" className="btn" disabled={opening} onClick={() => refreshIndex()}>
            Refresh
          </button>
        )}
      </div>
    </header>
  )
}
