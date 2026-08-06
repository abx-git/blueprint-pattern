import { useStudioStore } from '../store/studio-store'

/**
 * One-line orientation under the rail. Avoids duplicating CTAs that already
 * exist in the page (Prepare / Refresh / New concept).
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
    text = 'Bind the docs folder and write the starter (entry-point + blueprint).'
    actionLabel = 'Continue Setup'
    onAction = () => goSetup()
  } else if (phase === 'session') {
    text =
      'Copy the prompt below → paste into a new AI chat on this repo → then use Refresh in the header.'
  } else if (phase === 'connect' || phase === 'install') {
    text = 'Finish Setup, then browse Architecture or open Prompt from the rail.'
  } else if (phase === 'concepts') {
    text = 'Optional drafts under process/ — create a concept here; lasting facts go to Architecture later.'
  } else if (phase === 'analyses') {
    text = 'Optional code investigations — create an analysis here when you need one.'
  } else if (phase === 'knowledge') {
    text = 'Browse domain docs, pin what matters, then Prepare AI prompt in the toolbar.'
  } else {
    const hasChapter = Boolean(
      index &&
        [...index.docs.keys()].some(
          (p) =>
            p.endsWith('.md') &&
            !p.endsWith('entry-point.md') &&
            !p.endsWith('blueprint.md') &&
            !p.includes('/process/') &&
            !p.includes('/context/'),
        ),
    )
    text = hasChapter
      ? 'Browse and pin docs, then Prepare AI prompt in the toolbar (next blueprint item).'
      : 'Starter is ready — Prepare AI prompt in the toolbar for Adopt (first fill).'
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
