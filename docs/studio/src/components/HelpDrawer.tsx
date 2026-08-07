import { useEffect, useRef } from 'react'
import { useStudioStore } from '../store/studio-store'
import { HELP_OVERVIEW, WORKSPACE_HELP, helpKeyForPhase } from '../lib/help-content'
import { FlowMap } from './FlowMap'

/** Slide-over help: flow map + process — About only from here / Start. */
export function HelpDrawer() {
  const helpOpen = useStudioStore((s) => s.helpOpen)
  const helpFocusId = useStudioStore((s) => s.helpFocusId)
  const setHelpOpen = useStudioStore((s) => s.setHelpOpen)
  const setPhase = useStudioStore((s) => s.setPhase)
  const phase = useStudioStore((s) => s.phase)
  const here = WORKSPACE_HELP[helpKeyForPhase(phase)]
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!helpOpen || !helpFocusId) return
    const t = window.setTimeout(() => {
      const el = document.getElementById(helpFocusId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => window.clearTimeout(t)
  }, [helpOpen, helpFocusId])

  if (!helpOpen) return null

  return (
    <div className="help-drawer-root" role="dialog" aria-modal="true" aria-labelledby="help-drawer-title">
      <button
        type="button"
        className="help-drawer-backdrop"
        aria-label="Close help"
        onClick={() => setHelpOpen(false)}
      />
      <aside className="help-drawer help-drawer--wide">
        <header className="help-drawer-header">
          <h2 id="help-drawer-title">Help — map &amp; guide</h2>
          <button type="button" className="btn" onClick={() => setHelpOpen(false)}>
            Close
          </button>
        </header>

        <div className="help-drawer-body" ref={bodyRef}>
          <section className="help-block help-block--map">
            <h3>The map</h3>
            <p className="hint">
              When concepts, terms, and files appear — open this anytime from the header (
              <strong>Map</strong>).
            </p>
            <FlowMap />
          </section>

          <section className="help-block help-block--here">
            <h3>You are here: {here.title}</h3>
            <p>{here.summary}</p>
            <ul>
              {here.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          {HELP_OVERVIEW.map((sec) => (
            <section key={sec.id} className="help-block">
              <h3>{sec.title}</h3>
              {sec.body.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </section>
          ))}

          <section className="help-block">
            <h3>More</h3>
            <p>
              The brand logo returns to <strong>Architecture</strong> (home). Method background:
            </p>
            <div className="cmd-row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setHelpOpen(false)
                  setPhase('about')
                }}
              >
                What is AGM?
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setHelpOpen(false)
                  setPhase('start')
                }}
              >
                How Studio works
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
