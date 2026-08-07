import { useStudioStore } from '../store/studio-store'
import { supportsDirectoryPicker } from '../lib/fs-access'

export function StarterPhase() {
  const setPhase = useStudioStore((s) => s.setPhase)
  const goSetup = useStudioStore((s) => s.goSetup)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const installStatus = useStudioStore((s) => s.installStatus)
  const ready = Boolean(folderLabel) && installStatus === 'ready'

  return (
    <div className="starter-page">
      <div className="starter-hero">
        <p className="starter-brand">AGM Studio</p>
        <h1>Your architecture cockpit</h1>
        <p className="starter-lead">
          One-time setup binds your docs folder. After that: work in Architecture, Knowledge,
          Inbox, Concepts, and Analyses — Ask AI builds a short reading list and a copy-paste prompt.
        </p>
        <div className="starter-cta">
          <button
            type="button"
            className="btn primary"
            onClick={() => (ready ? setPhase('architecture') : goSetup())}
          >
            {ready ? 'Open cockpit' : folderLabel ? 'Continue Setup' : 'Start Setup'}
          </button>
          <button type="button" className="btn" onClick={() => setPhase('about')}>
            What is AGM?
          </button>
        </div>
      </div>

      <section className="starter-section" aria-labelledby="starter-before">
        <h2 id="starter-before">What you need</h2>
        <ul className="starter-list">
          <li>
            <strong>This page</strong> in Chrome, Edge, or Brave (folder write access).
          </li>
          <li>
            <strong>A local folder</strong> — usually <code>docs/architecture</code> (empty is fine).
          </li>
          <li>
            <strong>An AI chat on the same repo</strong> — Cursor, Claude, or Copilot — to paste
            prompts Studio prepares.
          </li>
        </ul>
        {!supportsDirectoryPicker() && (
          <p className="starter-note">
            This browser cannot grant folder write access. Use Chrome, Edge, or Brave for the full
            experience.
          </p>
        )}
      </section>

      <section className="starter-section" aria-labelledby="starter-flow">
        <h2 id="starter-flow">How it works</h2>
        <ol className="starter-flow">
          <li>
            <span className="starter-flow-step">Setup</span>
            <span className="starter-flow-body">
              Once: choose the folder, confirm the doc path, write entry-point + blueprint only.
              Studio remembers the folder. Empty chapters appear later when Adopt / Extend creates
              them.
            </span>
          </li>
          <li>
            <span className="starter-flow-step">Cockpit</span>
            <span className="starter-flow-body">
              Browse Architecture, Knowledge (<code>domain/</code>), Concepts, and Analyses in
              parallel workspaces with a shared navigator.
            </span>
          </li>
          <li>
            <span className="starter-flow-step">Ask AI</span>
            <span className="starter-flow-body">
              Remember a few files, choose what you want help with, copy the prompt → paste into a
              new AI chat.
            </span>
          </li>
          <li>
            <span className="starter-flow-step">Iterate</span>
            <span className="starter-flow-body">
              The AI edits Markdown on disk; click Reload folder in Studio. Concepts need not ship.
            </span>
          </li>
        </ol>
      </section>

      <section className="starter-section starter-diagram" aria-labelledby="starter-loop">
        <h2 id="starter-loop">The loop</h2>
        <div
          className="starter-loop"
          role="img"
          aria-label="Studio cockpit; AI chat writes docs; Studio refreshes graph"
        >
          <div className="starter-loop-node">
            <strong>Studio</strong>
            <span>Cockpit + pack</span>
          </div>
          <div className="starter-loop-arrow" aria-hidden="true">
            →
          </div>
          <div className="starter-loop-node">
            <strong>AI chat</strong>
            <span>Writes Markdown</span>
          </div>
          <div className="starter-loop-arrow" aria-hidden="true">
            →
          </div>
          <div className="starter-loop-node">
            <strong>Studio</strong>
            <span>Reload folder</span>
          </div>
        </div>
        <p className="starter-section-lead">
          Setup is rare. Daily work is the cockpit workspaces plus Ask AI.
        </p>
      </section>

      <div className="starter-cta starter-cta--footer">
        <button type="button" className="btn" onClick={() => setPhase('about')}>
          What is AGM?
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => (ready ? setPhase('architecture') : goSetup())}
        >
          {ready ? 'Open cockpit' : 'Start Setup'}
        </button>
      </div>
    </div>
  )
}
