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
          like a small wiki. You and an AI agent keep them up to date together. Studio is just the
          front door.
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
            A folder like <code>docs/architecture/</code> with an entry point (start here —
            facts + links), a blueprint (what&apos;s next), and short pages you open one by one.
          </li>
          <li>
            Habit for the agent: open the entry point in context, follow links, don&apos;t invent
            claims without a source, tick the blueprint when a chapter moves forward.
          </li>
          <li>
            Spikes for messy questions — a dated folder with notes and optional boards, instead of
            dumping everything into one scratch file.
          </li>
        </ul>
      </section>

      <section className="starter-section">
        <h2>How work usually goes</h2>
        <p className="about-prose">
          You pick a goal (“fill the context chapter”, “sync after this PR”, “review this area”).
          Studio gives you a prompt. You paste it into Cursor or another AI chat that can see the
          repo. The agent edits Markdown. You check the result, then open Spike or Review in Studio
          if you want to dig further.
        </p>
        <p className="about-prose">
          The agent is a scribe, not the architect. You stay in the loop. If something is unclear,
          it should mark that — not paper over it.
        </p>
      </section>

      <section className="starter-section">
        <h2>What AGM is not</h2>
        <ul className="starter-list">
          <li>Not a hosted wiki. Files stay on your machine / in your Git remote.</li>
          <li>Not a full modelling suite. Boards in Studio are lean; heavy workshops can still go to
            a proper tool and come back as a file.</li>
          <li>Not “set and forget”. Docs only stay useful if you keep running short sessions when
            the system changes.</li>
        </ul>
      </section>

      <section className="starter-section">
        <h2>Why “graph”?</h2>
        <p className="about-prose">
          Because pages point at each other. From the entry point you walk to a context chapter,
          to a component view, to an interface note. Agents follow those links the same way a
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
          onClick={() => (ready ? setPhase('run') : goSetup())}
        >
          {ready ? 'Continue — Write' : 'Start Setup'}
        </button>
      </div>
    </div>
  )
}
