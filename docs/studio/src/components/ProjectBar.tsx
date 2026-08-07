import { useStudioStore } from '../store/studio-store'
import { supportsDirectoryPicker } from '../lib/fs-access'
import type { JourneyPhase, WorkspaceId } from '../types'
import { workspaceLabel } from '../lib/session-persist'

const COCKPIT: { id: WorkspaceId; hint: string }[] = [
  { id: 'architecture', hint: 'Your docs' },
  { id: 'knowledge', hint: 'Domain language' },
  { id: 'inbox', hint: 'New information' },
  { id: 'concepts', hint: 'Ideas & drafts' },
  { id: 'analyses', hint: 'How code works' },
  { id: 'session', hint: 'Copy a prompt' },
]

export function JourneyRail() {
  const phase = useStudioStore((s) => s.phase)
  const setPhase = useStudioStore((s) => s.setPhase)
  const openSession = useStudioStore((s) => s.openSession)
  const goSetup = useStudioStore((s) => s.goSetup)
  const installStatus = useStudioStore((s) => s.installStatus)
  const index = useStudioStore((s) => s.index)
  const folderLabel = useStudioStore((s) => s.folderLabel)

  const ready = Boolean(folderLabel) && installStatus === 'ready'
  const setupActive = phase === 'connect' || phase === 'install'
  const setupHint = !folderLabel
    ? 'Choose folder'
    : installStatus !== 'ready'
      ? 'Write starter'
      : 'Project & folder'

  return (
    <nav className="journey-rail" aria-label="AGM Studio">
      {ready ? (
        <>
          {COCKPIT.map((p) => {
            const locked =
              (p.id === 'architecture' || p.id === 'knowledge') && !index && p.id !== phase
            return (
              <button
                key={p.id}
                type="button"
                className={`journey-chip${phase === p.id ? ' active' : ''}`}
                disabled={locked}
                onClick={() => {
                  if (p.id === 'session') {
                    openSession(installStatus === 'ready' ? 'continue' : 'adopt')
                  } else setPhase(p.id)
                }}
              >
                <span className="journey-chip-label">{workspaceLabel(p.id)}</span>
                <span className="journey-chip-hint">{p.hint}</span>
              </button>
            )
          })}
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
          {COCKPIT.map((p) => (
            <button
              key={p.id}
              type="button"
              className="journey-chip"
              disabled
              title="Finish Setup first"
            >
              <span className="journey-chip-label">{workspaceLabel(p.id)}</span>
              <span className="journey-chip-hint">after Setup</span>
            </button>
          ))}
        </>
      )}
    </nav>
  )
}

export function ProjectBar() {
  const phase = useStudioStore((s) => s.phase)
  const goHome = useStudioStore((s) => s.goHome)
  const goSetup = useStudioStore((s) => s.goSetup)
  const setHelpOpen = useStudioStore((s) => s.setHelpOpen)
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

  const tagForPhase = (p: JourneyPhase): string => {
    if (p === 'about') return 'what is AGM'
    if (p === 'start') return 'how it works'
    if (!ready) return 'Setup'
    if (
      p === 'architecture' ||
      p === 'knowledge' ||
      p === 'concepts' ||
      p === 'analyses' ||
      p === 'inbox'
    ) {
      return workspaceLabel(p)
    }
    if (p === 'session') return 'Ask AI'
    return 'Setup'
  }

  return (
    <header className="project-bar">
      <button
        type="button"
        className="studio-brand studio-brand-btn"
        onClick={() => goHome()}
        title={ready ? 'Home — Architecture' : 'Home'}
      >
        <strong>AGM Studio</strong>
        <span className="studio-tag">{tagForPhase(phase)}</span>
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
        <button
          type="button"
          className="btn help-open-btn"
          onClick={() => setHelpOpen(true)}
          title="Explain the process and workspaces"
        >
          Help
        </button>
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
          <button
            type="button"
            className="btn"
            disabled={opening}
            onClick={() => refreshIndex()}
            title="Reload files from disk after the AI wrote something"
          >
            Reload folder
          </button>
        )}
      </div>
    </header>
  )
}
