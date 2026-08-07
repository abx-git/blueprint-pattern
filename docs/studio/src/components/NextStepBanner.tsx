import { useStudioStore } from '../store/studio-store'

/**
 * One-line orientation under the rail — plain language + matching primary CTA.
 */
export function NextStepBanner() {
  const phase = useStudioStore((s) => s.phase)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const installStatus = useStudioStore((s) => s.installStatus)
  const goSetup = useStudioStore((s) => s.goSetup)
  const setPhase = useStudioStore((s) => s.setPhase)
  const openSession = useStudioStore((s) => s.openSession)
  const openHelp = useStudioStore((s) => s.openHelp)
  const refreshIndex = useStudioStore((s) => s.refreshIndex)
  const index = useStudioStore((s) => s.index)
  const opening = useStudioStore((s) => s.opening)

  const setupDone = Boolean(folderLabel) && installStatus === 'ready'

  let text: string
  let actionLabel: string | null = null
  let onAction: (() => void) | null = null

  if (!setupDone) {
    text = 'Connect your documentation folder and create the two starter files.'
    actionLabel = 'Continue Setup'
    onAction = () => goSetup()
  } else if (phase === 'session') {
    text = 'Copy the prompt → paste into a new AI chat on this project → then reload the folder.'
    actionLabel = 'Reload folder'
    onAction = () => void refreshIndex()
  } else if (phase === 'connect' || phase === 'install') {
    text = 'Setup is ready. Open Architecture to browse your docs.'
    actionLabel = 'Open Architecture'
    onAction = () => setPhase('architecture')
  } else if (phase === 'concepts') {
    text = 'Optional scratch space for ideas. Promote lasting facts into Architecture when ready.'
    actionLabel = 'Ask AI'
    onAction = () => openSession('advanced')
  } else if (phase === 'inbox') {
    text = 'Add information → ask AI to structure it → approve the plan → apply it to your docs.'
    actionLabel = null
    onAction = null
  } else if (phase === 'notes') {
    text =
      'Local scratch only. Ask AI will not use these notes unless you enable Include local notes.'
    actionLabel = null
    onAction = null
  } else if (phase === 'analyses') {
    text = 'Optional deep-dives into how the code works. Create an analysis when you need one.'
    actionLabel = 'Ask AI'
    onAction = () => openSession('advanced')
  } else if (phase === 'knowledge') {
    text = 'Browse domain language and model. Ask AI for domain or design help when you need it.'
    actionLabel = 'Ask AI · domain & more'
    onAction = () => openSession('advanced')
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
    if (hasChapter) {
      text = 'Browse your docs. Ask AI when you want the next checklist item filled.'
      actionLabel = 'Ask AI · next checklist'
      onAction = () => openSession('continue')
    } else {
      text = 'Starter is ready. Ask AI for the first documentation fill.'
      actionLabel = 'Ask AI · first fill'
      onAction = () => openSession('adopt')
    }
  }

  return (
    <div className="next-step-banner" role="status">
      <p className="next-step-text">
        <span className="next-step-label">Next</span>
        {text}{' '}
        <button type="button" className="linkish" onClick={() => openHelp()}>
          Map
        </button>
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="btn primary"
          disabled={opening && actionLabel === 'Reload folder'}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
