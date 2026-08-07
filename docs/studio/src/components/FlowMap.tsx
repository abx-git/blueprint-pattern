/**
 * Visual map of Studio IA: when concepts, terms, and files appear.
 * Shown in Help (and via header Map).
 */
export function FlowMap() {
  return (
    <div className="flow-map" id="help-flow-map">
      <p className="flow-map-lead">
        Studio does not call an AI. You browse here, copy a prompt, the AI writes Markdown on disk,
        then you <strong>Reload folder</strong>.
      </p>

      <ol className="flow-map-stages">
        <li className="flow-stage flow-stage--once">
          <div className="flow-stage-when">
            <span className="flow-stage-badge">Once</span>
            <strong className="flow-stage-title">1 · Setup</strong>
          </div>
          <div className="flow-stage-cols">
            <div>
              <h4>Creates</h4>
              <ul>
                <li>
                  <code>entry-point.md</code> — short facts + links (start here)
                </li>
                <li>
                  <code>blueprint.md</code> — checklist of what’s next
                </li>
              </ul>
            </div>
            <div>
              <h4>Understand</h4>
              <ul>
                <li>
                  <em>Documentation folder</em> — where the Markdown lives
                </li>
                <li>
                  <em>Doc root</em> — path used inside AI prompts
                </li>
                <li>No empty chapter stubs yet</li>
              </ul>
            </div>
          </div>
        </li>

        <li className="flow-stage flow-stage--home">
          <div className="flow-stage-when">
            <span className="flow-stage-badge">Home</span>
            <strong className="flow-stage-title">2 · Architecture</strong>
          </div>
          <div className="flow-stage-cols">
            <div>
              <h4>Creates / holds</h4>
              <ul>
                <li>Lasting chapters (appear when Ask AI fills them)</li>
                <li>
                  Brand logo returns here — <em>home</em>
                </li>
              </ul>
            </div>
            <div>
              <h4>Understand</h4>
              <ul>
                <li>
                  <em>Durable docs</em> — what you keep in Git long-term
                </li>
                <li>
                  <em>Check docs</em> — quality report only (no fixes in that chat)
                </li>
              </ul>
            </div>
          </div>
        </li>

        <li className="flow-stage flow-stage--loop">
          <div className="flow-stage-when">
            <span className="flow-stage-badge">Daily</span>
            <strong className="flow-stage-title">3 · Ask AI → chat → Reload</strong>
          </div>
          <div className="flow-map-loop" aria-hidden="true">
            <span className="flow-loop-node">Ask AI</span>
            <span className="flow-loop-arrow">→</span>
            <span className="flow-loop-node">New AI chat</span>
            <span className="flow-loop-arrow">→</span>
            <span className="flow-loop-node">Writes files</span>
            <span className="flow-loop-arrow">→</span>
            <span className="flow-loop-node">Reload folder</span>
            <span className="flow-loop-arrow">→</span>
            <span className="flow-loop-node">Architecture</span>
          </div>
          <div className="flow-stage-cols">
            <div>
              <h4>Creates (over time)</h4>
              <ul>
                <li>
                  <strong>First fill</strong> — facts + first chapter
                </li>
                <li>
                  <strong>Next checklist</strong> — next open row in blueprint
                </li>
                <li>Further chapters as the checklist advances</li>
              </ul>
            </div>
            <div>
              <h4>Understand</h4>
              <ul>
                <li>
                  <em>Reading list</em> — files the prompt tells the AI to open
                </li>
                <li>
                  <em>Remember for AI</em> — pin a file into that list
                </li>
                <li>
                  First fill ≈ Adopt · Next checklist ≈ Extend (in prompt text)
                </li>
              </ul>
            </div>
          </div>
        </li>

        <li className="flow-stage flow-stage--side">
          <div className="flow-stage-when">
            <span className="flow-stage-badge">As needed</span>
            <strong className="flow-stage-title">4 · Side paths</strong>
          </div>
          <div className="flow-side-grid">
            <article className="flow-side-card">
              <h4>Inbox</h4>
              <p className="flow-side-flow">Receive → plan → approve → apply</p>
              <p>
                <strong>Creates:</strong> intake notes, then proposals, then real docs when applied.
              </p>
              <p>
                <strong>Understand:</strong> nothing lands in Architecture until you approve.
              </p>
            </article>
            <article className="flow-side-card">
              <h4>Knowledge</h4>
              <p className="flow-side-flow">Domain language &amp; model</p>
              <p>
                <strong>Creates:</strong> files under <code>domain/</code> when you grow them.
              </p>
              <p>
                <strong>Understand:</strong> Ask AI · domain &amp; more (not the architecture checklist).
              </p>
            </article>
            <article className="flow-side-card">
              <h4>Concepts / Analyses</h4>
              <p className="flow-side-flow">Optional drafts</p>
              <p>
                <strong>Creates:</strong> spikes under <code>process/</code> — need not become official
                docs.
              </p>
              <p>
                <strong>Understand:</strong> promote lasting facts into Architecture when ready.
              </p>
            </article>
            <article className="flow-side-card">
              <h4>Check docs</h4>
              <p className="flow-side-flow">Architecture subview</p>
              <p>
                <strong>Creates:</strong> report + findings under <code>process/reviews/</code>.
              </p>
              <p>
                <strong>Understand:</strong> report-only; fix later with Ask AI · next checklist.
              </p>
            </article>
          </div>
        </li>
      </ol>

      <div className="flow-map-legend">
        <h4>Quick glossary</h4>
        <dl className="flow-glossary">
          <div>
            <dt>Architecture</dt>
            <dd>Home — lasting documentation</dd>
          </div>
          <div>
            <dt>Ask AI</dt>
            <dd>Copy a prompt; Studio never calls the model</dd>
          </div>
          <div>
            <dt>Reload folder</dt>
            <dd>Re-read disk after the AI wrote files</dd>
          </div>
          <div>
            <dt>Blueprint</dt>
            <dd>Checklist of open work</dd>
          </div>
          <div>
            <dt>Entry-point</dt>
            <dd>Short “start here” for humans and AI</dd>
          </div>
          <div>
            <dt>Inbox plan</dt>
            <dd>Structured proposal you approve before apply</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
