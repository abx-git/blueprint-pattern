import { useStudioStore } from '../store/studio-store'

export function WhatIsAgmPhase() {
  const setPhase = useStudioStore((s) => s.setPhase)
  const goSetup = useStudioStore((s) => s.goSetup)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const installStatus = useStudioStore((s) => s.installStatus)
  const ready = Boolean(folderLabel) && installStatus === 'ready'

  return (
    <div className="starter-page about-page">
      <div className="starter-hero">
        <p className="starter-brand">Architecture Graph Method</p>
        <h1>What is AGM?</h1>
        <p className="starter-lead">
          Short version: your architecture docs live as Markdown files in Git, linked to each other
          like a small wiki. You and an AI agent keep them up to date together. Studio is the
          iterative cockpit — not a hosted wiki.
        </p>
      </div>

      <section className="starter-section">
        <h2>The problem it tries to fix</h2>
        <p className="about-prose">
          Architecture notes often end up in slides, Confluence pages, or one huge document that
          nobody trusts after six months. Code moves on. The docs stay behind. When someone asks
          “how does this work?”, you dig through chat history and tribal knowledge.
        </p>
        <p className="about-prose">
          AGM puts the docs next to the code, in plain Markdown, with relative links. Same review
          flow as code. Same history in Git.
        </p>
      </section>

      <section className="starter-section">
        <h2>What you actually get</h2>
        <ul className="starter-list">
          <li>
            A folder like <code>docs/architecture/</code> with state files (entry point + blueprint),
            durable chapters, a parallel domain knowledge base, and process spikes for ideas that
            may never ship.
          </li>
          <li>
            Studio workspaces: <strong>Architecture</strong>, <strong>Knowledge</strong>,{' '}
            <strong>Inbox</strong>, <strong>Concepts</strong>, <strong>Analyses</strong> — plus{' '}
            <strong>Ask AI</strong> to build a short reading list and copy a prompt.
          </li>
          <li>
            Habit for the agent: open the entry point first, follow links, don&apos;t invent claims
            without a source, tick the blueprint when work moves forward.
          </li>
        </ul>
      </section>

      <section className="starter-section">
        <h2>How work usually goes</h2>
        <p className="about-prose">
          One-time Setup binds your docs folder. Then you work in the cockpit: browse and remember
          pages, open Ask AI, copy a prompt into Cursor or another AI chat on the same repo. The
          agent edits Markdown. You stay in the loop — scribe, not autonomous architect.
        </p>
        <p className="about-prose">
          Concepts and analyses live as dated spikes so drafts need not land in durable chapters.
          Domain knowledge grows in <code>domain/</code> beside architecture docs.
        </p>
      </section>

      <section className="starter-section">
        <h2>What AGM is not</h2>
        <ul className="starter-list">
          <li>Not a hosted wiki. Files stay on your machine / in your Git remote.</li>
          <li>
            Not a full modelling suite. Boards in Studio are lean; heavy workshops can still go to
            a proper tool and come back as a file.
          </li>
          <li>
            Not “set and forget”. Docs only stay useful if you keep running short sessions when the
            system changes.
          </li>
        </ul>
      </section>

      <section className="starter-section">
        <h2>Why “graph”?</h2>
        <p className="about-prose">
          Because pages point at each other. From the entry point you walk to a context chapter,
          to a domain note, to a spike, to an interface. Agents follow those links the same way a
          person would click around — so the structure matters more than one giant dump of text.
        </p>
      </section>

      <section className="starter-section">
        <h2>License</h2>
        <p className="about-prose">
          AGM (method, Studio, and the materials in this project) is released under the{' '}
          <strong>MIT License</strong>. You may use, change, and share it — including in commercial
          work — as long as you keep the copyright notice.
        </p>
        <p className="about-prose">
          Please credit: <strong>Andreas Bergmann, Hamburg, Germany</strong>.
        </p>
        <p className="about-prose about-prose--muted">
          Full text: MIT license in the project repository (<code>LICENSE</code>).
        </p>
      </section>

      <div className="starter-cta starter-cta--footer">
        <button type="button" className="btn" onClick={() => setPhase('start')}>
          How Studio works
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => (ready ? setPhase('architecture') : goSetup())}
        >
          {ready ? 'Open Architecture' : 'Start Setup'}
        </button>
      </div>
    </div>
  )
}
