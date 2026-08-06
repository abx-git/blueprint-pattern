import type { JourneyPhase } from '../types'

const DAILY_PHASE_KEY = 'agm-studio-last-daily-phase'
const FOLDER_HINT_KEY = 'agm-studio-folder-hint'
const BOOT_DONE_KEY = 'agm-studio-boot-done'

export type DailyPhase = 'run' | 'spike' | 'review'

export function isDailyPhase(phase: JourneyPhase): phase is DailyPhase {
  return phase === 'run' || phase === 'spike' || phase === 'review'
}

export function loadLastDailyPhase(): DailyPhase {
  try {
    const raw = localStorage.getItem(DAILY_PHASE_KEY)
    if (raw === 'run' || raw === 'spike' || raw === 'review') return raw
  } catch {
    /* ignore */
  }
  return 'run'
}

export function saveLastDailyPhase(phase: JourneyPhase): void {
  if (!isDailyPhase(phase)) return
  try {
    localStorage.setItem(DAILY_PHASE_KEY, phase)
  } catch {
    /* ignore */
  }
}

export function loadFolderHint(): string | null {
  try {
    return localStorage.getItem(FOLDER_HINT_KEY)
  } catch {
    return null
  }
}

export function saveFolderHint(label: string | null): void {
  try {
    if (!label) localStorage.removeItem(FOLDER_HINT_KEY)
    else localStorage.setItem(FOLDER_HINT_KEY, label)
  } catch {
    /* ignore */
  }
}

/** True after user completed first-time setup at least once (folder bound). */
export function loadBootDone(): boolean {
  try {
    return localStorage.getItem(BOOT_DONE_KEY) === '1'
  } catch {
    return false
  }
}

export function saveBootDone(done: boolean): void {
  try {
    if (done) localStorage.setItem(BOOT_DONE_KEY, '1')
    else localStorage.removeItem(BOOT_DONE_KEY)
  } catch {
    /* ignore */
  }
}
