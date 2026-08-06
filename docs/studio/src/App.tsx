import { useEffect } from 'react'
import { useStudioStore } from './store/studio-store'
import { ProjectBar, JourneyRail } from './components/ProjectBar'
import { WhatIsAgmPhase } from './components/WhatIsAgmPhase'
import { StarterPhase } from './components/StarterPhase'
import { ConnectPhase } from './components/ConnectPhase'
import { InstallPhase } from './components/InstallPhase'
import { RunPhase } from './components/RunPhase'
import { SpikePhase } from './components/SpikePhase'
import { ReviewPhase } from './components/ReviewPhase'
import './App.css'

function formatReleaseTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d)
}

function SiteFooter() {
  const released = formatReleaseTime(__AGM_BUILD_TIME__)
  return (
    <footer className="studio-site-footer">
      <span>Released {released}</span>
      <span aria-hidden="true"> · </span>
      <span>© Andreas Bergmann, Hamburg, Germany</span>
    </footer>
  )
}

export default function App() {
  const phase = useStudioStore((s) => s.phase)
  const error = useStudioStore((s) => s.error)
  const toast = useStudioStore((s) => s.toast)
  const restoring = useStudioStore((s) => s.restoring)
  const tryRestoreFolder = useStudioStore((s) => s.tryRestoreFolder)

  useEffect(() => {
    void tryRestoreFolder()
  }, [tryRestoreFolder])

  const introPhase = phase === 'about' || phase === 'start'
  const showRail = !introPhase

  return (
    <div className={`studio${introPhase ? ' studio--starter' : ''}`}>
      <ProjectBar />
      {showRail && <JourneyRail />}
      {error && (
        <div className="studio-error" role="alert">
          {error}
        </div>
      )}
      {toast && (
        <div className="studio-toast" role="status">
          {toast}
        </div>
      )}
      {restoring && introPhase === false && phase === 'connect' && !error ? (
        <div className="studio-toast" role="status">
          Restoring folder…
        </div>
      ) : null}
      <div
        className={`studio-body${phase === 'review' || phase === 'spike' ? ' studio-body--wide' : ''}${introPhase ? ' studio-body--starter' : ''}`}
      >
        {phase === 'about' && <WhatIsAgmPhase />}
        {phase === 'start' && <StarterPhase />}
        {phase === 'connect' && <ConnectPhase />}
        {phase === 'install' && <InstallPhase />}
        {phase === 'run' && <RunPhase />}
        {phase === 'spike' && <SpikePhase />}
        {phase === 'review' && <ReviewPhase />}
      </div>
      <SiteFooter />
    </div>
  )
}
