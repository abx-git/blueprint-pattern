import { useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { DocViewer } from './DocViewer'
import { HelpTip } from './HelpTip'
import { listInboxPaths, readProposalStatus, type InboxProposalStatus } from '../lib/inbox'

type InboxTab = 'raw' | 'proposals' | 'done'

const TAB_LABEL: Record<InboxTab, { short: string; step: string }> = {
  raw: { short: '1 · Receive', step: 'Add information' },
  proposals: { short: '2 · Review', step: 'Check the plan' },
  done: { short: '3 · Done', step: 'Already applied' },
}

const STATUS_LABEL: Record<InboxProposalStatus, string> = {
  draft: 'Needs your review',
  ready: 'Approved',
  blocked: 'On hold',
  merged: 'Applied',
}

/** Inbox: guided intake — plain language, one primary next action. */
export function InboxPhase() {
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const canWrite = useStudioStore((s) => s.canWrite)
  const index = useStudioStore((s) => s.index)
  const activePath = useStudioStore((s) => s.activePath)
  const setActivePath = useStudioStore((s) => s.setActivePath)
  const setPhase = useStudioStore((s) => s.setPhase)
  const openSession = useStudioStore((s) => s.openSession)
  const pasteInboxRaw = useStudioStore((s) => s.pasteInboxRaw)
  const setInboxProposalStatus = useStudioStore((s) => s.setInboxProposalStatus)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)
  const refreshIndex = useStudioStore((s) => s.refreshIndex)
  const opening = useStudioStore((s) => s.opening)

  const [tab, setTab] = useState<InboxTab>('raw')
  const [pasteLabel, setPasteLabel] = useState('')
  const [pasteBody, setPasteBody] = useState('')
  const [pasting, setPasting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const paths = useMemo(() => {
    if (!index) return [] as string[]
    return listInboxPaths(index.docs, tab)
  }, [index, tab])

  const proposalCounts = useMemo(() => {
    if (!index) return { draft: 0, ready: 0, blocked: 0 }
    let draft = 0
    let ready = 0
    let blocked = 0
    for (const p of listInboxPaths(index.docs, 'proposals')) {
      const st = readProposalStatus(index.docs.get(p)?.meta as { status?: unknown } | null)
      if (st === 'ready') ready++
      else if (st === 'blocked') blocked++
      else draft++
    }
    return { draft, ready, blocked }
  }, [index])

  const rawCount = index ? listInboxPaths(index.docs, 'raw').length : 0

  const activeDoc = index && activePath ? index.docs.get(activePath) : null
  const proposalStatus =
    activeDoc && activePath?.includes('/proposals/')
      ? readProposalStatus(activeDoc.meta as { status?: unknown } | null)
      : null

  /** One contextual primary CTA — never a row of jargon buttons. */
  const primary =
    tab === 'raw'
      ? {
          label: rawCount > 0 ? 'Ask AI to structure this' : 'Save information first',
          disabled: rawCount === 0,
          onClick: () => openSession('inbox-analyze'),
          hint:
            rawCount > 0
              ? 'Copies a prompt: the AI turns received text into a clear plan you can check — it will not change your docs yet.'
              : 'Add text below (or files on disk), then this button unlocks.',
        }
      : tab === 'proposals'
        ? proposalCounts.ready > 0
          ? {
              label: 'Ask AI to apply approved plans',
              disabled: false,
              onClick: () => openSession('inbox-merge'),
              hint: 'Copies a prompt: the AI writes the approved facts into Architecture, Knowledge, Concepts, etc.',
            }
          : {
              label: 'Ask AI to improve this plan',
              disabled: proposalCounts.draft + proposalCounts.blocked === 0,
              onClick: () => openSession('inbox-refine'),
              hint: 'Copies a prompt for a dialog to clarify the plan. Mark a plan “Approved” when you are happy with it.',
            }
        : {
            label: 'Back to receive new information',
            disabled: false,
            onClick: () => setTab('raw'),
            hint: 'Applied items stay here for reference.',
          }

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Inbox</h2>
        <p>Choose your documentation folder in Setup first.</p>
        <button type="button" className="btn primary" onClick={() => setPhase('connect')}>
          Go to Setup
        </button>
      </div>
    )
  }

  return (
    <div className="inbox-phase">
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-head">
          <h2>
            Inbox{' '}
            <HelpTip label="Inbox">
              <p>
                Place for <strong>new information</strong> (notes, specs, Confluence, …) that may
                belong in Architecture, Knowledge, Concepts, or elsewhere.
              </p>
              <p>
                Studio does not call the AI itself: you copy a prompt, paste it into a new chat on
                this repo, then reload the folder.
              </p>
            </HelpTip>
          </h2>
        </div>

        <p className="spike-lead">
          Bring new information in, check the AI’s plan, then apply it to your docs — three simple
          steps.
        </p>

        <div className="inbox-steps" role="tablist" aria-label="Inbox steps">
          {(['raw', 'proposals', 'done'] as InboxTab[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`inbox-step${tab === id ? ' active' : ''}`}
              onClick={() => {
                setTab(id)
                setActivePath(null)
              }}
            >
              <span className="inbox-step-num">{TAB_LABEL[id].short}</span>
              <span className="inbox-step-title">{TAB_LABEL[id].step}</span>
            </button>
          ))}
        </div>

        <ul className="spike-list">
          {paths.length === 0 && (
            <li className="muted">
              {tab === 'raw'
                ? 'Nothing received yet.'
                : tab === 'proposals'
                  ? 'No plans to review yet — structure received information first.'
                  : 'Nothing applied yet.'}
            </li>
          )}
          {paths.map((p) => {
            const doc = index?.docs.get(p)
            const st =
              tab === 'proposals' && doc
                ? readProposalStatus(doc.meta as { status?: unknown } | null)
                : null
            const name = p.split('/').pop() || p
            return (
              <li key={p}>
                <button
                  type="button"
                  className={activePath === p ? 'active' : ''}
                  onClick={() => setActivePath(p)}
                >
                  <span className="spike-title">{name}</span>
                  {st ? <span className="tree-type">{STATUS_LABEL[st]}</span> : null}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="inbox-primary">
          <p className="hint">{primary.hint}</p>
          <button
            type="button"
            className="btn primary"
            disabled={primary.disabled}
            onClick={primary.onClick}
          >
            {primary.label}
          </button>
          <button
            type="button"
            className="btn"
            disabled={opening}
            onClick={() => void refreshIndex()}
          >
            Reload folder
          </button>
        </div>
      </aside>

      <section className="inbox-main">
        {tab === 'raw' && (
          <div className="inbox-paste run-card">
            <h3>Add information</h3>
            <p className="lead">
              Paste meeting notes, a Confluence page, a spec, or any text that should eventually live
              in your architecture or domain docs.
            </p>
            <label className="field">
              <span>Short name (so you recognize it later)</span>
              <input
                value={pasteLabel}
                onChange={(e) => setPasteLabel(e.target.value)}
                placeholder="e.g. Billing workshop notes"
                disabled={!canWrite}
              />
            </label>
            <label className="field">
              <span>Text</span>
              <textarea
                rows={10}
                value={pasteBody}
                onChange={(e) => setPasteBody(e.target.value)}
                placeholder="Paste here…"
                disabled={!canWrite}
              />
            </label>
            <button
              type="button"
              className="btn primary"
              disabled={!canWrite || pasting || !pasteBody.trim()}
              onClick={async () => {
                setPasting(true)
                const path = await pasteInboxRaw({
                  label: pasteLabel || 'pasted notes',
                  body: pasteBody,
                })
                setPasting(false)
                if (path) {
                  setPasteBody('')
                  setPasteLabel('')
                  setTab('raw')
                }
              }}
            >
              {pasting ? 'Saving…' : 'Save in Inbox'}
            </button>
            {!canWrite && (
              <p className="hint">You need write access to the folder (reconnect in the header).</p>
            )}

            <details
              className="inbox-advanced"
              open={showAdvanced}
              onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
            >
              <summary>Prefer files on disk?</summary>
              <p className="hint">
                Put files into the <code>inbox/raw</code> folder inside your documentation directory,
                then click <strong>Reload folder</strong>. Same result as pasting here.
              </p>
            </details>
          </div>
        )}

        {tab === 'proposals' && !activeDoc && (
          <div className="phase-panel">
            <h2>Check the plan</h2>
            <p className="lead">
              After the AI structures your material, plans appear in the list. Read them, mark each
              one <strong>Approved</strong> when it looks right (or <strong>On hold</strong> if not).
              Only approved plans are applied to the real documentation.
            </p>
            {proposalCounts.ready > 0 ? (
              <p className="hint">{proposalCounts.ready} approved — use the button on the left to apply.</p>
            ) : proposalCounts.draft > 0 ? (
              <p className="hint">Select a plan in the list to approve it.</p>
            ) : (
              <p className="hint">No plans yet — go to step 1 and ask the AI to structure received text.</p>
            )}
          </div>
        )}

        {tab === 'done' && !activeDoc && (
          <div className="phase-panel">
            <h2>Already applied</h2>
            <p className="lead">
              Plans the AI has written into your documentation. Kept here so you can see what was
              done.
            </p>
          </div>
        )}

        {activeDoc ? (
          <div className="inbox-viewer">
            <div className="cmd-row inbox-viewer-bar">
              {proposalStatus && (
                <>
                  <span className="hint">Your decision:</span>
                  {(
                    [
                      ['draft', 'Needs review'],
                      ['ready', 'Approved'],
                      ['blocked', 'On hold'],
                    ] as const
                  ).map(([st, label]) => (
                    <button
                      key={st}
                      type="button"
                      className={`btn${proposalStatus === st ? ' primary' : ''}`}
                      disabled={!canWrite}
                      onClick={() => void setInboxProposalStatus(activeDoc.path, st)}
                    >
                      {label}
                    </button>
                  ))}
                </>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => toggleContextPin(activeDoc.path)}
                title="Include this file in the next AI prompt’s reading list"
              >
                Remember for AI prompt
              </button>
            </div>
            <DocViewer
              doc={activeDoc}
              allDocs={index!.docs}
              onNavigate={(p) => setActivePath(p)}
              onOpenStorm={() => undefined}
              onPinPath={(p) => toggleContextPin(p)}
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}
