import { useEffect, useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import type { SessionIntent, WorkflowEntry } from '../types'
import {
  buildAdoptPrompt,
  copyText,
  personalizeWorkflowPrompt,
  personalizeWorkflowWhen,
} from '../lib/personalize'
import { buildContextPack, formatContextPackBlock } from '../lib/context-pack'
import { HelpTip } from './HelpTip'
import workflowCatalog from '../catalog/workflows.json'
import adoptPromptBase from '../catalog/adopt-prompt.txt?raw'

const DOC_FOCUS_OPTIONS: { id: string; label: string }[] = [
  { id: 'implementation', label: 'Implementation' },
  { id: 'interfaces', label: 'Interfaces' },
  { id: 'persistence', label: 'Persistence' },
  { id: 'security', label: 'Security' },
  { id: 'deployment', label: 'Deployment' },
  { id: 'observability', label: 'Observability' },
  { id: 'operations', label: 'Operations' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'domain-glossary', label: 'Domain glossary' },
  { id: 'domain-model', label: 'Domain model' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'external-sources', label: 'External sources' },
  { id: 'use-cases', label: 'Use cases' },
]

const GOLDEN_EVOLVE = [
  { id: 'maintenance-diff-range', label: 'Sync from git range' },
  { id: 'content-ingest', label: 'Import pasted content' },
  { id: 'refinement', label: 'Refine a section' },
]

const GOLDEN_REVIEW = [
  { id: 'review-maintenance', label: 'Review after sync' },
  { id: 'review-phase', label: 'Review a phase' },
]

const ADVANCED_WORK = [
  { id: 'architecture-work-continue', label: 'Continue architecture work' },
  { id: 'architecture-work-query', label: 'Query' },
  { id: 'architecture-work-analysis', label: 'Analysis' },
  { id: 'architecture-work-design', label: 'Design' },
  { id: 'domain-work-continue', label: 'Domain continue' },
  { id: 'domain-board-ingest', label: 'Domain board ingest' },
]

type RunStep = SessionIntent

function aiLabel(tool: string): string {
  if (tool === 'cursor') return 'Cursor'
  if (tool === 'claude') return 'Claude'
  if (tool === 'copilot') return 'Copilot'
  return 'your AI chat'
}

/** Session workspace: context pack + copy-paste prompt (successor to Run / Write). */
export function SessionPhase() {
  const project = useStudioStore((s) => s.project)
  const setPhase = useStudioStore((s) => s.setPhase)
  const goSetup = useStudioStore((s) => s.goSetup)
  const installStatus = useStudioStore((s) => s.installStatus)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const showToast = useStudioStore((s) => s.showToast)
  const index = useStudioStore((s) => s.index)
  const activePath = useStudioStore((s) => s.activePath)
  const contextPins = useStudioStore((s) => s.contextPins)
  const toggleContextPin = useStudioStore((s) => s.toggleContextPin)
  const docFocus = useStudioStore((s) => s.docFocus)
  const setDocFocus = useStudioStore((s) => s.setDocFocus)
  const includeOnDemand = useStudioStore((s) => s.includeOnDemand)
  const setIncludeOnDemand = useStudioStore((s) => s.setIncludeOnDemand)
  const sessionIntent = useStudioStore((s) => s.sessionIntent)
  const clearSessionIntent = useStudioStore((s) => s.clearSessionIntent)
  const tool = aiLabel(project.aiTool)

  // Bundled at build time (synced by scripts/sync-assistant-data.py) — no runtime fetch.
  const workflows = workflowCatalog as WorkflowEntry[]
  const adoptBase = adoptPromptBase
  const [step, setStep] = useState<RunStep>(
    () => sessionIntent ?? (installStatus === 'ready' ? 'continue' : 'adopt'),
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [extensionSlug, setExtensionSlug] = useState('')

  useEffect(() => {
    if (!sessionIntent) return
    setStep(sessionIntent)
    clearSessionIntent()
  }, [sessionIntent, clearSessionIntent])

  const pack = useMemo(
    () =>
      buildContextPack({
        index,
        activePath,
        pins: contextPins,
        docFocus,
        includeOnDemand,
      }),
    [index, activePath, contextPins, docFocus, includeOnDemand],
  )

  const packBlock = useMemo(() => formatContextPackBlock(pack, project), [pack, project])

  const byId = (id: string) => workflows.find((w) => w.id === id)

  const adoptText = useMemo(() => {
    if (!adoptBase) return ''
    return buildAdoptPrompt(adoptBase, project, packBlock)
  }, [adoptBase, project, packBlock])

  const continueWf = byId('bootstrap-continue')
  const continueText = useMemo(() => {
    if (!continueWf) return ''
    return personalizeWorkflowPrompt(continueWf, project, inputs, packBlock)
  }, [continueWf, project, inputs, packBlock])

  const selected = selectedId ? byId(selectedId) : null
  const selectedText = useMemo(() => {
    if (!selected) return ''
    return personalizeWorkflowPrompt(selected, project, inputs, packBlock)
  }, [selected, project, inputs, packBlock])

  const inboxWf =
    step === 'inbox-analyze' || step === 'inbox-refine' || step === 'inbox-merge'
      ? byId(step)
      : null
  const inboxText = useMemo(() => {
    if (!inboxWf) return ''
    return personalizeWorkflowPrompt(inboxWf, project, inputs, packBlock)
  }, [inboxWf, project, inputs, packBlock])

  const copyOut = async (text: string) => {
    const ok = await copyText(text)
    showToast(ok ? `Copied — open ${tool}, start a new chat, paste` : 'Copy failed')
  }

  const copyBtn = (label: string) => `Copy for ${tool} — ${label}`

  const toggleFocus = (id: string) => {
    if (docFocus.includes(id)) setDocFocus(docFocus.filter((x) => x !== id))
    else setDocFocus([...docFocus, id])
  }

  const addExtension = () => {
    const slug = extensionSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    if (!slug) return
    const id = `extension:${slug}`
    if (!docFocus.includes(id)) setDocFocus([...docFocus, id])
    setExtensionSlug('')
  }

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Session</h2>
        <p>Finish Setup first — choose your documentation folder.</p>
        <button type="button" className="btn primary" onClick={() => goSetup()}>
          Go to Setup
        </button>
      </div>
    )
  }

  const primaryStep: RunStep = installStatus === 'ready' ? 'continue' : 'adopt'
  const stepOptions: { id: RunStep; label: string }[] = [
    { id: 'continue', label: 'Extend — next blueprint item' },
    { id: 'adopt', label: installStatus === 'ready' ? 'Re-adopt — first fill again' : 'Adopt — first fill' },
    { id: 'inbox-analyze', label: 'Inbox — analyze raw → proposal' },
    { id: 'inbox-refine', label: 'Inbox — refine proposal' },
    { id: 'inbox-merge', label: 'Inbox — merge ready proposals' },
    { id: 'evolve', label: 'Sync / Import from code or paste' },
    { id: 'verify', label: 'Verify / review' },
    { id: 'advanced', label: 'More (design, domain, analysis)' },
  ]

  return (
    <div className="phase-panel run-phase">
      <h2>
        Prompt{' '}
        <HelpTip label="Prompt">
          <p>
            Studio does not write docs or call an LLM. You copy a prompt into {tool} on this repo; the
            AI edits Markdown; then use Refresh in the header.
          </p>
        </HelpTip>
      </h2>
      <p className="lead">
        1) Adjust the context pack if needed · 2) Choose what to prepare · 3) Copy → paste into a{' '}
        <strong>new chat</strong> · 4) Refresh the folder.
      </p>

      <div className="run-card context-pack-card">
        <h3>Context pack</h3>
        <ul className="context-pack-list">
          {pack.slots.map((slot) => {
            const onDemandMissing =
              slot.id === 'ondemand' &&
              !(index && [...index.docs.keys()].some((p) => p.endsWith('context/on-demand.md')))
            const locked =
              Boolean(slot.required) ||
              slot.id === 'focus' ||
              slot.id === 'refs' ||
              onDemandMissing
            return (
              <li key={slot.id}>
                <label
                  className={`context-pack-item${locked ? ' is-locked' : ''}`}
                  title={
                    onDemandMissing
                      ? 'File context/on-demand.md is not in the folder yet — Create it via Adopt / Extend, then Refresh'
                      : slot.id === 'refs'
                        ? 'Add pins while browsing docs'
                        : slot.id === 'focus'
                          ? 'Follows the doc you last opened'
                          : undefined
                  }
                >
                  <input
                    type="checkbox"
                    checked={slot.id === 'ondemand' ? includeOnDemand && !onDemandMissing : slot.included}
                    disabled={locked}
                    onChange={() => {
                      if (slot.id === 'ondemand' && !onDemandMissing) {
                        setIncludeOnDemand(!includeOnDemand)
                      }
                    }}
                  />
                  <span>
                    <strong>{slot.label}</strong>
                    {slot.id !== 'refs' && slot.path ? (
                      <>
                        {' '}
                        <code>{slot.path}</code>
                      </>
                    ) : null}
                    {onDemandMissing ? (
                      <span className="muted"> — not in folder yet</span>
                    ) : null}
                    {slot.id === 'refs' && contextPins.length === 0 ? (
                      <span className="muted"> — pin docs while browsing</span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        {contextPins.length > 0 && (
          <div className="pin-chips">
            {contextPins.map((p) => (
              <button
                key={p}
                type="button"
                className="btn pin-chip"
                title="Unpin"
                onClick={() => toggleContextPin(p)}
              >
                {p} ×
              </button>
            ))}
          </div>
        )}
        <p className="hint">
          <strong>On-demand</strong> = optional extra tables (domain terms, pitfalls, environments) in{' '}
          <code>context/on-demand.md</code>. Include it only when that file exists and you want the AI to
          read it. Pins: mark paths while browsing Architecture / Knowledge / Inbox / Concepts / Analyses.
        </p>

        <details className="focus-details">
          <summary>DOC_FOCUS / extensions (optional)</summary>
          <div className="focus-grid">
            {DOC_FOCUS_OPTIONS.map((opt) => (
              <label key={opt.id} className="focus-chip">
                <input
                  type="checkbox"
                  checked={docFocus.includes(opt.id)}
                  onChange={() => toggleFocus(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="cmd-row">
            <input
              value={extensionSlug}
              onChange={(e) => setExtensionSlug(e.target.value)}
              placeholder="extension slug (e.g. billing-notes)"
            />
            <button type="button" className="btn" onClick={addExtension}>
              Add extension:&lt;slug&gt;
            </button>
          </div>
          {docFocus.filter((d) => d.startsWith('extension:')).length > 0 && (
            <p className="hint">
              Custom: {docFocus.filter((d) => d.startsWith('extension:')).join(', ')}
            </p>
          )}
        </details>
      </div>

      <label className="field prompt-kind-field">
        <span>What to prepare</span>
        <select
          value={step}
          onChange={(e) => {
            setStep(e.target.value as RunStep)
            setSelectedId(null)
            setInputs({})
          }}
        >
          {stepOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.id === primaryStep ? `★ ${opt.label}` : opt.label}
            </option>
          ))}
        </select>
      </label>

      {step === 'adopt' && (
        <div className="run-card">
          <p>
            First docs session: fills entry-point (start here), blueprint (what&apos;s next), and the
            first chapter.
          </p>
          <details open>
            <summary>Preview</summary>
            <pre className="preview-box">
              {adoptText.slice(0, 4000)}
              {adoptText.length > 4000 ? '\n…' : ''}
            </pre>
          </details>
          <button type="button" className="btn primary" onClick={() => copyOut(adoptText)}>
            {copyBtn('Adopt')}
          </button>
        </div>
      )}

      {step === 'continue' && continueWf && (
        <div className="run-card">
          <p>
            Resume the next open item in <code>blueprint.md</code>.{' '}
            {personalizeWorkflowWhen(continueWf, project)}
          </p>
          <details open>
            <summary>Preview</summary>
            <pre className="preview-box">{continueText.slice(0, 4000)}</pre>
          </details>
          <button type="button" className="btn primary" onClick={() => copyOut(continueText)}>
            {copyBtn('Extend docs')}
          </button>
        </div>
      )}

      {inboxWf && (
        <div className="run-card">
          <p>
            {step === 'inbox-analyze' && (
              <>
                Structure <code>inbox/raw/</code> into a reviewable proposal under{' '}
                <code>inbox/proposals/</code> — no merge yet.
              </>
            )}
            {step === 'inbox-refine' && (
              <>
                Dialog to improve a proposal. Set path below if needed; do not merge until status is{' '}
                <code>ready</code>.
              </>
            )}
            {step === 'inbox-merge' && (
              <>
                Apply proposals with <code>status: ready</code> into the graph + <code>sources/</code>,
                then archive under <code>inbox/done/</code>.
              </>
            )}{' '}
            {personalizeWorkflowWhen(inboxWf, project)}
          </p>
          {(step === 'inbox-refine' || step === 'inbox-merge') && (
            <div className="workflow-inputs">
              <label className="field">
                <span>Proposal path(s)</span>
                <input
                  value={inputs.proposalPath || inputs.proposalPaths || ''}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      proposalPath: e.target.value,
                      proposalPaths: e.target.value,
                    })
                  }
                  placeholder="inbox/proposals/YYYY-MM-DD-slug.md"
                />
              </label>
              {step === 'inbox-refine' && (
                <label className="field">
                  <span>Human notes</span>
                  <input
                    value={inputs.notes || ''}
                    onChange={(e) => setInputs({ ...inputs, notes: e.target.value })}
                  />
                </label>
              )}
            </div>
          )}
          <details open>
            <summary>Preview</summary>
            <pre className="preview-box">{inboxText.slice(0, 4000)}</pre>
          </details>
          <button type="button" className="btn primary" onClick={() => copyOut(inboxText)}>
            {copyBtn(step)}
          </button>
          <button type="button" className="btn" onClick={() => setPhase('inbox')}>
            Back to Inbox
          </button>
        </div>
      )}

      {(step === 'evolve' || step === 'verify' || step === 'advanced') && (
        <div className="run-card">
          <div className="mode-grid">
            {(step === 'evolve'
              ? GOLDEN_EVOLVE
              : step === 'verify'
                ? GOLDEN_REVIEW
                : ADVANCED_WORK
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                className={selectedId === m.id ? 'mode-btn active' : 'mode-btn'}
                disabled={!byId(m.id)}
                onClick={() => {
                  setSelectedId(m.id)
                  setInputs({})
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          {selected && (
            <>
              <p className="mode-when">{personalizeWorkflowWhen(selected, project)}</p>
              {(selected.id === 'refinement' ||
                selected.id === 'content-ingest' ||
                selected.id === 'maintenance-diff-range' ||
                selected.id === 'review-phase' ||
                selected.id.startsWith('architecture-work') ||
                selected.id.startsWith('domain-work') ||
                selected.id === 'domain-board-ingest') && (
                <div className="workflow-inputs">
                  {selected.id === 'refinement' && (
                    <label className="field">
                      <span>What should improve?</span>
                      <input
                        value={inputs.goal || ''}
                        onChange={(e) => setInputs({ ...inputs, goal: e.target.value })}
                      />
                    </label>
                  )}
                  {selected.id === 'content-ingest' && (
                    <>
                      <label className="field">
                        <span>Source label</span>
                        <input
                          value={inputs.sourceLabel || ''}
                          onChange={(e) => setInputs({ ...inputs, sourceLabel: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>Pasted content</span>
                        <textarea
                          rows={6}
                          value={inputs.pastedContent || ''}
                          onChange={(e) => setInputs({ ...inputs, pastedContent: e.target.value })}
                        />
                      </label>
                    </>
                  )}
                  {selected.id === 'maintenance-diff-range' && (
                    <>
                      <label className="field">
                        <span>DIFF_FROM</span>
                        <input
                          value={inputs.diffFrom || ''}
                          onChange={(e) => setInputs({ ...inputs, diffFrom: e.target.value })}
                          placeholder="main"
                        />
                      </label>
                      <label className="field">
                        <span>DIFF_TO</span>
                        <input
                          value={inputs.diffTo || 'HEAD'}
                          onChange={(e) => setInputs({ ...inputs, diffTo: e.target.value })}
                        />
                      </label>
                    </>
                  )}
                  {(selected.id === 'review-phase' ||
                    selected.id.startsWith('architecture-work') ||
                    selected.id.startsWith('domain-work')) && (
                    <label className="field">
                      <span>Slug</span>
                      <input
                        value={inputs.slug || ''}
                        onChange={(e) => setInputs({ ...inputs, slug: e.target.value })}
                        placeholder="short-name"
                      />
                    </label>
                  )}
                </div>
              )}
              <details>
                <summary>Preview</summary>
                <pre className="preview-box">{selectedText.slice(0, 4000)}</pre>
              </details>
              <button type="button" className="btn primary" onClick={() => copyOut(selectedText)}>
                {copyBtn('prompt')}
              </button>
            </>
          )}
        </div>
      )}

      <div className="run-cta">
        <p className="hint">
          After the AI writes files: header → <strong>Refresh</strong>, then check{' '}
          <code>blueprint.md</code>.
        </p>
        <button type="button" className="btn" onClick={() => setPhase('architecture')}>
          Back to Architecture
        </button>
      </div>
    </div>
  )
}

/** @deprecated use SessionPhase */
export { SessionPhase as RunPhase }
