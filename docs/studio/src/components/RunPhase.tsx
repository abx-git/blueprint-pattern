import { useEffect, useMemo, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import type { WorkflowEntry } from '../types'
import {
  buildAdoptPrompt,
  copyText,
  personalizeWorkflowPrompt,
  personalizeWorkflowWhen,
} from '../lib/personalize'

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
]

type RunStep = 'adopt' | 'continue' | 'evolve' | 'verify' | 'advanced'

function aiLabel(tool: string): string {
  if (tool === 'cursor') return 'Cursor'
  if (tool === 'claude') return 'Claude'
  if (tool === 'copilot') return 'Copilot'
  return 'your AI chat'
}

export function RunPhase() {
  const project = useStudioStore((s) => s.project)
  const setPhase = useStudioStore((s) => s.setPhase)
  const goSetup = useStudioStore((s) => s.goSetup)
  const installStatus = useStudioStore((s) => s.installStatus)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const showToast = useStudioStore((s) => s.showToast)
  const tool = aiLabel(project.aiTool)

  const [workflows, setWorkflows] = useState<WorkflowEntry[]>([])
  const [adoptBase, setAdoptBase] = useState('')
  const [step, setStep] = useState<RunStep>(() =>
    installStatus === 'ready' ? 'continue' : 'adopt',
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setStep(installStatus === 'ready' ? 'continue' : 'adopt')
  }, [installStatus])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [wfRes, adoptRes] = await Promise.all([
          fetch('./workflows.json', { cache: 'no-store' }),
          fetch('./adopt-prompt.txt', { cache: 'no-store' }),
        ])
        if (!wfRes.ok || !adoptRes.ok) throw new Error('Failed to load workflow catalog')
        const wf = (await wfRes.json()) as WorkflowEntry[]
        const adopt = await adoptRes.text()
        if (!cancelled) {
          setWorkflows(wf)
          setAdoptBase(adopt)
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Load failed')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const byId = (id: string) => workflows.find((w) => w.id === id)

  const adoptText = useMemo(() => {
    if (!adoptBase) return ''
    return buildAdoptPrompt(adoptBase, project)
  }, [adoptBase, project])

  const continueWf = byId('bootstrap-continue')
  const continueText = useMemo(() => {
    if (!continueWf) return ''
    return personalizeWorkflowPrompt(continueWf, project, inputs)
  }, [continueWf, project, inputs])

  const selected = selectedId ? byId(selectedId) : null
  const selectedText = useMemo(() => {
    if (!selected) return ''
    return personalizeWorkflowPrompt(selected, project, inputs)
  }, [selected, project, inputs])

  const copyOut = async (text: string) => {
    const ok = await copyText(text)
    showToast(
      ok
        ? `Copied — open ${tool}, start a new chat, paste`
        : 'Copy failed',
    )
  }

  const copyBtn = (label: string) => `Copy for ${tool} — ${label}`

  if (!folderLabel) {
    return (
      <div className="phase-panel">
        <h2>Write</h2>
        <p>Finish Setup first — choose your documentation folder.</p>
        <button type="button" className="btn primary" onClick={() => goSetup()}>
          Go to Setup
        </button>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="phase-panel">
        <h2>Write</h2>
        <p className="warn">{loadError}</p>
      </div>
    )
  }

  const tabs: { id: RunStep; label: string }[] =
    installStatus === 'ready'
      ? [
          { id: 'continue', label: 'Extend' },
          { id: 'evolve', label: 'Sync / Import' },
          { id: 'verify', label: 'Verify' },
          { id: 'adopt', label: 'Re-adopt' },
          { id: 'advanced', label: 'More' },
        ]
      : [
          { id: 'adopt', label: 'Adopt' },
          { id: 'continue', label: 'Extend' },
          { id: 'evolve', label: 'Sync / Import' },
          { id: 'verify', label: 'Verify' },
          { id: 'advanced', label: 'More' },
        ]

  return (
    <div className="phase-panel run-phase">
      <h2>Write — extend documentation</h2>
      <p className="lead">
        Studio prepares the prompt for <strong>{project.docRoot || '(set in Setup)'}</strong>. Open{' '}
        <strong>{tool}</strong> on the same repo, start a <strong>new chat</strong>, paste — the
        agent writes the files. Then return here for Spikes or Browse.
        {installStatus !== 'ready' && (
          <>
            {' '}
            Starter still missing (<strong>{installStatus}</strong>) — use Setup or Adopt.
          </>
        )}
      </p>

      <div className="run-steps" role="tablist">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={step === id ? 'active' : ''}
            onClick={() => {
              setStep(id)
              setSelectedId(null)
              setInputs({})
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {step === 'adopt' && (
        <div className="run-card">
          <p>
            First docs session: fills entry-point (start here), blueprint (what&apos;s next), and the
            first chapter.
          </p>
          <details open>
            <summary>Preview</summary>
            <pre className="preview-box">{adoptText.slice(0, 4000)}{adoptText.length > 4000 ? '\n…' : ''}</pre>
          </details>
          <button type="button" className="btn primary" onClick={() => copyOut(adoptText)}>
            {copyBtn('Adopt')}
          </button>
        </div>
      )}

      {step === 'continue' && continueWf && (
        <div className="run-card">
          <p>{personalizeWorkflowWhen(continueWf, project)}</p>
          <details>
            <summary>Preview</summary>
            <pre className="preview-box">{continueText.slice(0, 4000)}</pre>
          </details>
          <button type="button" className="btn primary" onClick={() => copyOut(continueText)}>
            {copyBtn('Extend')}
          </button>
        </div>
      )}

      {(step === 'evolve' || step === 'verify' || step === 'advanced') && (
        <div className="run-card">
          <div className="mode-grid">
            {(step === 'evolve' ? GOLDEN_EVOLVE : step === 'verify' ? GOLDEN_REVIEW : ADVANCED_WORK).map(
              (m) => (
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
              ),
            )}
          </div>
          {selected && (
            <>
              <p className="mode-when">{personalizeWorkflowWhen(selected, project)}</p>
              {(selected.id === 'refinement' ||
                selected.id === 'content-ingest' ||
                selected.id === 'maintenance' ||
                selected.id === 'maintenance-diff-range' ||
                selected.id === 'review-phase' ||
                selected.id.startsWith('architecture-work')) && (
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
                  {(selected.id === 'review-phase' || selected.id.startsWith('architecture-work')) && (
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
        <p>
          After the session: <strong>Spikes</strong> for ideas, or <strong>Browse</strong> for the
          graph.
        </p>
        <button type="button" className="btn" onClick={() => setPhase('spike')}>
          Spikes
        </button>
        <button type="button" className="btn primary" onClick={() => setPhase('review')}>
          Browse
        </button>
      </div>
    </div>
  )
}
