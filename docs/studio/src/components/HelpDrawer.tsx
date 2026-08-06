import { useStudioStore } from '../store/studio-store'
import { HELP_OVERVIEW, WORKSPACE_HELP, helpKeyForPhase } from '../lib/help-content'

/** Slide-over help: process, workspaces, glossary — no navigation CTAs. */
export function HelpDrawer() {
  const helpOpen = useStudioStore((s) => s.helpOpen)
  const setHelpOpen = useStudioStore((s) => s.setHelpOpen)
  const phase = useStudioStore((s) => s.phase)
  const here = WORKSPACE_HELP[helpKeyForPhase(phase)]

  if (!helpOpen) return null

  return (
    <div className="help-drawer-root" role="dialog" aria-modal="true" aria-labelledby="help-drawer-title">
      <button
        type="button"
        className="help-drawer-backdrop"
        aria-label="Close help"
        onClick={() => setHelpOpen(false)}
      />
      <aside className="help-drawer">
        <header className="help-drawer-header">
          <h2 id="help-drawer-title">Help — how AGM Studio works</h2>
          <button type="button" className="btn" onClick={() => setHelpOpen(false)}>
            Close
          </button>
        </header>

        <div className="help-drawer-body">
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
        </div>
      </aside>
    </div>
  )
}
