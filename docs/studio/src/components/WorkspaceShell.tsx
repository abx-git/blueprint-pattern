import { useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import type { WorkspaceId } from '../types'
import { workspaceLabel } from '../lib/session-persist'
import { WORKSPACE_HELP } from '../lib/help-content'
import { BrowseMode } from './BrowseMode'
import { HelpTip } from './HelpTip'
import { ReviewsPanel } from './ReviewsPanel'

interface Props {
  workspace: Exclude<WorkspaceId, 'session' | 'inbox' | 'concepts' | 'analyses'>
  title?: string
  lead?: string
}

/** Shared navigator/viewer — browse + remember files; AI prompts live under Ask AI. */
export function WorkspaceShell({ workspace, title, lead }: Props) {
  const index = useStudioStore((s) => s.index)
  const goSetup = useStudioStore((s) => s.goSetup)
  const openSession = useStudioStore((s) => s.openSession)
  const label = title || workspaceLabel(workspace)
  const help = WORKSPACE_HELP[workspace]
  const [archTab, setArchTab] = useState<'docs' | 'verify'>('docs')

  if (!index) {
    return (
      <div className="phase-panel">
        <h2>{label}</h2>
        <p>
          No files loaded yet. Finish Setup, or click <strong>Reload folder</strong> in the header
          after the AI has written files.
        </p>
        <div className="cmd-row">
          <button type="button" className="btn primary" onClick={() => goSetup()}>
            Go to Setup
          </button>
        </div>
      </div>
    )
  }

  const hasChapter = [...index.docs.keys()].some(
    (p) =>
      p.endsWith('.md') &&
      !p.endsWith('entry-point.md') &&
      !p.endsWith('blueprint.md') &&
      !p.includes('/process/') &&
      !p.includes('/context/'),
  )

  const showVerify = workspace === 'architecture'
  const onCheckDocs = showVerify && archTab === 'verify'

  /** Knowledge must not reuse Architecture’s “Ask AI” — name the intent. */
  const askLabel =
    workspace === 'knowledge'
      ? 'Ask AI · domain & more'
      : hasChapter
        ? 'Ask AI · next checklist'
        : 'Ask AI · first fill'
  const askIntent =
    workspace === 'knowledge' ? ('advanced' as const) : hasChapter ? ('continue' as const) : ('adopt' as const)

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
          {showVerify && (
            <div className="panel-tabs arch-tabs" role="tablist">
              <button
                type="button"
                className={archTab === 'docs' ? 'active' : ''}
                onClick={() => setArchTab('docs')}
              >
                Docs
              </button>
              <button
                type="button"
                className={archTab === 'verify' ? 'active' : ''}
                onClick={() => setArchTab('verify')}
                title="Ask the AI to check documentation quality (report only)"
              >
                Check docs
              </button>
            </div>
          )}
        </div>
        <div className="cmd-row review-toolbar-actions">
          {onCheckDocs ? (
            <button
              type="button"
              className="btn primary"
              onClick={() => openSession('verify')}
              title="Opens Ask AI — documentation quality check"
            >
              Ask AI to check docs
            </button>
          ) : (
            <button
              type="button"
              className="btn primary"
              onClick={() => openSession(askIntent)}
              title="Opens Ask AI — copy a prompt for your chat"
            >
              {askLabel}
            </button>
          )}
        </div>
      </div>
      {onCheckDocs ? (
        <ReviewsPanel />
      ) : (
        <BrowseMode embedded workspaceFilter={workspace} />
      )}
    </div>
  )
}
