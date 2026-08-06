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
        <h1>Your architecture companion</h1>
        <p className="starter-lead">
          One-time setup binds your docs folder. After that: write with AI sessions, explore spikes,
          or browse the graph — Studio remembers the folder next time.
        </p>
        <div className="starter-cta">
          <button
            type="button"
            className="btn primary"
            onClick={() => (ready ? setPhase('run') : goSetup())}
          >
            {ready ? 'Continue — Write' : folderLabel ? 'Continue Setup' : 'Start Setup'}
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
              Once: choose the folder, confirm the doc path, write the starter if needed. Studio
              remembers it.
            </span>
          </li>
          <li>
            <span className="starter-flow-step">Write</span>
            <span className="starter-flow-body">
              Copy a session prompt → paste into a new AI chat. Extend docs, sync after code changes,
              or run Adopt for the first fill.
            </span>
          </li>
          <li>
            <span className="starter-flow-step">Spikes</span>
            <span className="starter-flow-body">
              Capture messy questions in dated spike folders; lean-edit boards here.
            </span>
          </li>
          <li>
            <span className="starter-flow-step">Browse</span>
            <span className="starter-flow-body">
              Browse the Markdown graph, Mermaid diagrams, and boards.
            </span>
          </li>
        </ol>
      </section>

      <section className="starter-section starter-diagram" aria-labelledby="starter-loop">
        <h2 id="starter-loop">The loop</h2>
        <div
          className="starter-loop"
          role="img"
          aria-label="Studio holds folder; AI chat writes docs; Studio for spikes and browse"
        >
          <div className="starter-loop-node">
            <strong>Studio</strong>
            <span>Folder + prompts</span>
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
            <span>Spikes &amp; browse</span>
          </div>
        </div>
        <p className="starter-section-lead">
          Setup is rare. Daily work is Write, Spikes, and Browse.
        </p>
      </section>

      <div className="starter-cta starter-cta--footer">
        <button type="button" className="btn" onClick={() => setPhase('about')}>
          What is AGM?
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => (ready ? setPhase('run') : goSetup())}
        >
          {ready ? 'Continue — Write' : 'Start Setup'}
        </button>
      </div>
    </div>
  )
}
