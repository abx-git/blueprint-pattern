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
  { id: 'review-maintenance', label: 'Check docs after code sync' },
  { id: 'review-phase', label: 'Check a documentation phase' },
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
        <h2>Ask AI</h2>
        <p>Finish Setup first — choose your documentation folder.</p>
        <button type="button" className="btn primary" onClick={() => goSetup()}>
          Go to Setup
        </button>
      </div>
    )
  }

  const primaryStep: RunStep = installStatus === 'ready' ? 'continue' : 'adopt'
  const stepOptions: { id: RunStep; label: string }[] = [
    { id: 'continue', label: 'Continue docs — next checklist item' },
    {
      id: 'adopt',
      label: installStatus === 'ready' ? 'First fill again (Adopt)' : 'First fill (Adopt)',
    },
    { id: 'inbox-analyze', label: 'Inbox — structure new information' },
    { id: 'inbox-refine', label: 'Inbox — improve a plan' },
    { id: 'inbox-merge', label: 'Inbox — apply approved plans' },
    { id: 'evolve', label: 'Sync with code / import paste (legacy)' },
    { id: 'verify', label: 'Check documentation quality' },
    { id: 'advanced', label: 'More (design, domain, analysis)' },
  ]

  const inboxCopyLabel =
    step === 'inbox-analyze'
      ? 'structure Inbox'
      : step === 'inbox-refine'
        ? 'improve plan'
        : step === 'inbox-merge'
          ? 'apply approved plans'
          : step

  return (
    <div className="phase-panel run-phase">
      <h2>
        Ask AI{' '}
        <HelpTip label="Ask AI">
          <p>
            Studio does not write docs or call an AI itself. You copy a prompt into {tool} on this
            project; the AI edits Markdown; then use <strong>Reload folder</strong> in the header.
          </p>
        </HelpTip>
      </h2>
      <p className="lead">
        1) Adjust the reading list if needed · 2) Choose what you want help with · 3) Copy → paste
        into a <strong>new chat</strong> · 4) Reload folder.
      </p>

      <div className="run-card context-pack-card">
        <h3>Reading list for the AI</h3>
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
                      ? 'Optional extra file is not in the folder yet — create it via Ask AI (first fill / continue), then Reload folder'
                      : slot.id === 'refs'
                        ? 'Remember files while browsing docs'
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
                      <span className="muted"> — remember docs while browsing</span>
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
          <strong>Extra tables</strong> (optional) live in <code>context/on-demand.md</code> — include
          them only when that file exists and you want the AI to read them. Use{' '}
          <strong>Remember for AI prompt</strong> while browsing to add specific files here.
        </p>

        <details className="focus-details">
          <summary>Optional focus topics</summary>
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
              placeholder="custom topic (e.g. billing-notes)"
            />
            <button type="button" className="btn" onClick={addExtension}>
              Add topic
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
        <span>What do you want help with?</span>
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
                Ask the AI to turn received Inbox text into a clear <strong>plan</strong> you can
                approve. Nothing is written into Architecture yet.
              </>
            )}
            {step === 'inbox-refine' && (
              <>
                Ask the AI to improve a plan after your feedback. Do not apply it until you mark the
                plan <strong>Approved</strong> in Inbox.
              </>
            )}
            {step === 'inbox-merge' && (
              <>
                Ask the AI to write <strong>Approved</strong> plans into your real documentation, then
                move them to Done.
              </>
            )}{' '}
            {personalizeWorkflowWhen(inboxWf, project)}
          </p>
          {(step === 'inbox-refine' || step === 'inbox-merge') && (
            <div className="workflow-inputs">
              <label className="field">
                <span>Plan file (optional — leave empty to use Approved plans)</span>
                <input
                  value={inputs.proposalPath || inputs.proposalPaths || ''}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      proposalPath: e.target.value,
                      proposalPaths: e.target.value,
                    })
                  }
                  placeholder="Usually leave empty"
                />
              </label>
              {step === 'inbox-refine' && (
                <label className="field">
                  <span>Your notes for the AI</span>
                  <input
                    value={inputs.notes || ''}
                    onChange={(e) => setInputs({ ...inputs, notes: e.target.value })}
                    placeholder="What should change?"
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
            {copyBtn(inboxCopyLabel)}
          </button>
          <button type="button" className="btn" onClick={() => setPhase('inbox')}>
            Back to Inbox
          </button>
        </div>
      )}

      {(step === 'evolve' || step === 'verify' || step === 'advanced') && (
        <div className="run-card">
          {step === 'verify' && (
            <p>
              <strong>Check docs</strong> = quality check of architecture documentation in a{' '}
              <em>fresh</em> AI chat. Report only (PASS / notes / FAIL). The AI does not fix chapters
              in that chat. Browse results under Architecture → Check docs.
            </p>
          )}
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
          After the AI writes files: header → <strong>Reload folder</strong>, then check the
          checklist in Architecture.
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
