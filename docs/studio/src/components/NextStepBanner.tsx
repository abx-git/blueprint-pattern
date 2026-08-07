import { useStudioStore } from '../store/studio-store'

/**
 * One-line orientation under the rail — plain language, no jargon.
 */
export function NextStepBanner() {
  const phase = useStudioStore((s) => s.phase)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const installStatus = useStudioStore((s) => s.installStatus)
  const goSetup = useStudioStore((s) => s.goSetup)
  const index = useStudioStore((s) => s.index)

  const setupDone = Boolean(folderLabel) && installStatus === 'ready'

  let text: string
  let actionLabel: string | null = null
  let onAction: (() => void) | null = null

  if (!setupDone) {
    text = 'Connect your documentation folder and create the two starter files.'
    actionLabel = 'Continue Setup'
    onAction = () => goSetup()
  } else if (phase === 'session') {
    text =
      'Copy the prompt → paste into a new AI chat on this project → then Reload folder in the header.'
  } else if (phase === 'connect' || phase === 'install') {
    text = 'When Setup is done, open Architecture to browse your docs or Inbox to add new information.'
  } else if (phase === 'concepts') {
    text = 'Optional scratch space for ideas. Promote lasting facts into Architecture when ready.'
  } else if (phase === 'inbox') {
    text = 'Add information → ask AI to structure it → approve the plan → apply it to your docs.'
  } else if (phase === 'analyses') {
    text = 'Optional deep-dives into how the code works. Create an analysis when you need one.'
  } else if (phase === 'knowledge') {
    text = 'Browse domain language and model. When you want the AI to help, use Ask AI.'
  } else {
    const hasChapter = Boolean(
      index &&
        [...index.docs.keys()].some(
          (p) =>
            p.endsWith('.md') &&
            !p.endsWith('entry-point.md') &&
            !p.endsWith('blueprint.md') &&
            !p.includes('/process/') &&
            !p.includes('/context/') &&
            !p.includes('/inbox/'),
        ),
    )
    text = hasChapter
      ? 'Browse your docs. Ask AI when you want the next chapter filled from the checklist.'
      : 'Starter is ready. Ask AI for the first documentation fill (Adopt).'
  }

  return (
    <div className="next-step-banner" role="status">
      <p className="next-step-text">
        <span className="next-step-label">Next</span>
        {text}
      </p>
      {actionLabel && onAction ? (
        <button type="button" className="btn primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
