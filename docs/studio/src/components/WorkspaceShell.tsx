import { useStudioStore } from '../store/studio-store'
import type { WorkspaceId } from '../types'
import { workspaceLabel } from '../lib/session-persist'
import { WORKSPACE_HELP } from '../lib/help-content'
import { BrowseMode } from './BrowseMode'
import { HelpTip } from './HelpTip'

interface Props {
  workspace: Exclude<WorkspaceId, 'session'>
  title?: string
  lead?: string
}

/** Shared navigator/viewer — browse + pin only; AI prompts live under Prompt. */
export function WorkspaceShell({ workspace, title, lead }: Props) {
  const index = useStudioStore((s) => s.index)
  const setPhase = useStudioStore((s) => s.setPhase)
  const openSession = useStudioStore((s) => s.openSession)
  const label = title || workspaceLabel(workspace)
  const help = WORKSPACE_HELP[workspace]

  if (!index) {
    return (
      <div className="phase-panel">
        <h2>{label}</h2>
        <p>
          No index yet. Finish Setup, or refresh the folder after the agent has written files (header
          → Refresh).
        </p>
        <div className="cmd-row">
          <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
            Go to Setup
          </button>
        </div>
      </div>
    )
  }

  const promptIntent =
    workspace === 'knowledge'
      ? ('advanced' as const)
      : [...index.docs.keys()].some(
            (p) =>
              p.endsWith('.md') &&
              !p.endsWith('entry-point.md') &&
              !p.endsWith('blueprint.md') &&
              !p.includes('/process/') &&
              !p.includes('/context/'),
          )
        ? ('continue' as const)
        : ('adopt' as const)

  return (
    <div className="review-phase">
      <div className="review-toolbar">
        <div className="review-toolbar-text">
          <p className="review-toolbar-title">
            <strong>{label}</strong>
            <HelpTip label={help.title}>
              <p>{help.summary}</p>
              <ul>
                {help.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </HelpTip>
            <span className="review-toolbar-meta">
              · {index.rootLabel} · {index.docs.size} files
              {lead ? ` — ${lead}` : ''}
            </span>
          </p>
          <p className="hint review-build-hint">{help.summary}</p>
        </div>
        <div className="cmd-row review-toolbar-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => openSession(promptIntent)}
            title="Opens Prompt — copy for your AI chat"
          >
            Prepare AI prompt
          </button>
        </div>
      </div>
      <BrowseMode embedded workspaceFilter={workspace} />
    </div>
  )
}
