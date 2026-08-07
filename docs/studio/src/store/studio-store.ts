import { create } from 'zustand'
import type {
  ArchitectureIndex,
  InstallStatus,
  JourneyPhase,
  ProjectParams,
  SessionIntent,
  WorkspaceId,
} from '../types'
import { DEFAULT_PROJECT, isWorkspacePhase } from '../types'
import { buildArchitectureIndex } from '../lib/build-index'
import { detectInstallStatus } from '../lib/detect-install'
import {
  buildDocPromptPath,
  confirmFolderBinding,
  loadDirectoryHandle,
  looksLikeGitRepo,
  openArchitectureFolderViaInput,
  pickDirectory,
  rehydrateFolder,
  supportsDirectoryPicker,
  walkDirectoryHandle,
  writeFileMap,
  writeTextFile,
  type FileMap,
} from '../lib/fs-access'
import { loadProjectParams, saveProjectParams } from '../lib/project-params'
import {
  isCockpitPhase,
  loadBootDone,
  loadContextPins,
  loadDocFocus,
  loadFolderHint,
  loadLastDailyPhase,
  saveBootDone,
  saveContextPins,
  saveDocFocus,
  saveFolderHint,
  saveLastDailyPhase,
} from '../lib/session-persist'
import { buildStarterScaffold } from '../lib/scaffold-pack'
import { createDocSearch, type SearchHit } from '../lib/search'
import {
  buildInboxScaffoldFiles,
  buildRawPasteFile,
  setProposalStatus,
} from '../lib/inbox'
import { NOTES_GITIGNORE, buildNoteFile } from '../lib/notes'
import { isAnalysisSpikeType } from '../lib/workspace'
import { togglePin } from '../lib/context-pack'
import { parseBoardJson } from '../lib/e2/storm'
import {
  appendReviewRegisterRow,
  appendSpikeRegisterRow,
  buildReviewFiles,
  buildSpikeFiles,
  emptyStormBoard,
  listReviews,
  listSpikes,
  nextReviewId,
  nextSpikeId,
  slugify,
  type CreateSpikeInput,
  type ReviewInfo,
  type SpikeInfo,
  type SpikeTrack,
  type SpikeType,
} from '../lib/spikes'

function applyIndex(files: FileMap, label: string) {
  const index = buildArchitectureIndex(label, files)
  const searchFn = createDocSearch(index.docs)
  const preferred =
    [...index.docs.keys()].find((p) => p.endsWith('entry-point.md') || p.endsWith('blueprint.md')) ??
    [...index.docs.keys()].find((p) => p.endsWith('.md')) ??
    null
  const installStatus = detectInstallStatus(files)
  const spikes = listSpikes(files)
  const reviews = listReviews(files)
  return { index, searchFn, preferred, installStatus, spikes, reviews }
}

let searchFn: ((q: string) => SearchHit[]) | null = null

interface StudioState {
  phase: JourneyPhase
  project: ProjectParams
  folderHandle: FileSystemDirectoryHandle | null
  folderLabel: string | null
  folderHint: string | null
  restoring: boolean
  pendingBaseHandle: FileSystemDirectoryHandle | null
  pendingBaseName: string | null
  pendingCanWrite: boolean
  pendingSubpath: string
  canWrite: boolean
  installStatus: InstallStatus
  index: ArchitectureIndex | null
  spikes: SpikeInfo[]
  reviews: ReviewInfo[]
  activeSpikePath: string | null
  activePath: string | null
  typeFilter: string
  searchQuery: string
  searchHits: SearchHit[]
  browsePanel: 'doc' | 'graph' | 'board'
  contextPins: string[]
  docFocus: string[]
  includeOnDemand: boolean
  /** Opt-in: allow notes/ paths in the Ask AI reading list. */
  includeLocalNotes: boolean
  /** Opt-in: allow Concepts/Analyses spikes as evidence in Ask AI. */
  includeSpikeEvidence: boolean
  /** Preferred Ask AI tab when opening from a CTA (consumed once). */
  sessionIntent: SessionIntent | null
  /** Workspace to return to from Ask AI (Back). */
  sessionReturnPhase: Exclude<WorkspaceId, 'session'> | null
  helpOpen: boolean
  /** When opening Help, scroll to this element id (e.g. help-flow-map). */
  helpFocusId: string | null
  error: string | null
  opening: boolean
  installing: boolean
  toast: string | null

  setPhase: (phase: JourneyPhase) => void
  /** Open Ask AI on a specific intent; remembers current workspace for Back. */
  openSession: (intent?: SessionIntent) => void
  clearSessionIntent: () => void
  /** Leave Ask AI → remembered workspace (or Architecture). */
  leaveSession: () => void
  setHelpOpen: (open: boolean) => void
  /** Open Help, optionally focusing the flow map. */
  openHelp: (focusId?: string) => void
  /** Brand / Home: Architecture when ready, else Setup or Start. */
  goHome: () => void
  goSetup: () => void
  setProject: (patch: Partial<ProjectParams>) => void
  setActivePath: (path: string | null) => void
  setActiveSpikePath: (path: string | null) => void
  setTypeFilter: (type: string) => void
  setSearchQuery: (q: string) => void
  setBrowsePanel: (panel: 'doc' | 'graph' | 'board') => void
  toggleContextPin: (path: string) => void
  setDocFocus: (ids: string[]) => void
  setIncludeOnDemand: (v: boolean) => void
  setIncludeLocalNotes: (v: boolean) => void
  setIncludeSpikeEvidence: (v: boolean) => void
  showToast: (msg: string) => void
  clearToast: () => void

  connectFolder: () => Promise<void>
  pickBaseFolder: () => Promise<void>
  confirmConnect: (subpath: string, docRoot: string) => Promise<void>
  clearPendingBase: () => void
  suggestDocRootForPending: (subpath: string) => Promise<string>
  connectFolderFallback: () => Promise<void>
  tryRestoreFolder: () => Promise<void>
  refreshIndex: (opts?: { keepPhase?: boolean }) => Promise<void>
  writeStarterScaffold: () => Promise<void>
  clearFolder: () => void

  createSpike: (input: {
    title: string
    slug?: string
    track: SpikeTrack
    type: SpikeType
  }) => Promise<string | null>
  createReview: (input: { title: string; slug?: string; scope?: string }) => Promise<string | null>
  saveSpikeFile: (relativePath: string, content: string) => Promise<boolean>
  createStormBoard: (spikePath: string, name: string, modelingMode?: string) => Promise<string | null>
  /** Import an E2 Board Snapshot v2 (.storm.json) into spikePath/boards/. */
  importStormBoard: (
    spikePath: string,
    jsonText: string,
    preferredName?: string,
  ) => Promise<string | null>
  /** Paste text into inbox/raw/ (creates inbox scaffold if missing). */
  pasteInboxRaw: (opts: { label: string; body: string; slug?: string }) => Promise<string | null>
  /** Write a local note under notes/ (ensures notes/.gitignore). */
  pasteLocalNote: (opts: { title: string; body: string; slug?: string }) => Promise<string | null>
  /** Update status: on an inbox proposal file. */
  setInboxProposalStatus: (
    relativePath: string,
    status: 'draft' | 'ready' | 'blocked',
  ) => Promise<boolean>
}

function afterOpen(
  set: (partial: Partial<StudioState>) => void,
  get: () => StudioState,
  label: string,
  files: FileMap,
  handle: FileSystemDirectoryHandle | null,
  canWrite: boolean,
  opts?: { keepPhase?: boolean; preferDaily?: boolean },
) {
  const { index, searchFn: sf, preferred, installStatus, spikes, reviews } = applyIndex(files, label)
  searchFn = sf
  const prevPhase = get().phase
  let phase: JourneyPhase
  if (opts?.keepPhase) {
    phase = prevPhase
  } else if (installStatus === 'ready') {
    phase = opts?.preferDaily ? loadLastDailyPhase() : 'architecture'
  } else if (get().folderLabel || label) {
    phase = 'install'
  } else {
    phase = 'connect'
  }
  saveFolderHint(label)
  saveBootDone(true)
  set({
    folderHandle: handle,
    folderLabel: label,
    folderHint: label,
    canWrite,
    index,
    spikes,
    reviews,
    activePath: preferred,
    installStatus,
    searchQuery: '',
    searchHits: [],
    browsePanel: 'doc',
    opening: false,
    restoring: false,
    phase,
    error: null,
  })
  if (isCockpitPhase(phase)) saveLastDailyPhase(phase)
}

export const useStudioStore = create<StudioState>((set, get) => ({
  phase: 'connect',
  project: loadProjectParams(),
  folderHandle: null,
  folderLabel: null,
  folderHint: loadFolderHint(),
  restoring: true,
  pendingBaseHandle: null,
  pendingBaseName: null,
  pendingCanWrite: false,
  pendingSubpath: '',
  canWrite: false,
  installStatus: 'unknown',
  index: null,
  spikes: [],
  reviews: [],
  activeSpikePath: null,
  activePath: null,
  typeFilter: '',
  searchQuery: '',
  searchHits: [],
  browsePanel: 'doc',
  contextPins: loadContextPins(),
  docFocus: loadDocFocus(),
  includeOnDemand: false,
  includeLocalNotes: false,
  includeSpikeEvidence: false,
  sessionIntent: null,
  sessionReturnPhase: null,
  helpOpen: false,
  helpFocusId: null,
  error: null,
  opening: false,
  installing: false,
  toast: null,

  setPhase: (phase) => {
    if (isCockpitPhase(phase)) saveLastDailyPhase(phase)
    set({ phase })
  },

  openSession: (intent = 'continue') => {
    const { phase, sessionReturnPhase } = get()
    const returning =
      isCockpitPhase(phase) && phase !== 'session'
        ? (phase as Exclude<WorkspaceId, 'session'>)
        : sessionReturnPhase
    saveLastDailyPhase('session')
    set({ phase: 'session', sessionIntent: intent, sessionReturnPhase: returning })
  },

  clearSessionIntent: () => set({ sessionIntent: null }),

  leaveSession: () => {
    const back = get().sessionReturnPhase ?? 'architecture'
    if (isCockpitPhase(back)) saveLastDailyPhase(back)
    set({ phase: back, sessionReturnPhase: null })
  },

  setHelpOpen: (helpOpen) => set({ helpOpen, helpFocusId: null }),

  openHelp: (focusId = 'help-flow-map') => set({ helpOpen: true, helpFocusId: focusId }),

  goHome: () => {
    const { folderLabel, installStatus, phase } = get()
    if (folderLabel && installStatus === 'ready') {
      saveLastDailyPhase('architecture')
      set({ phase: 'architecture' })
      return
    }
    if (phase === 'about' || phase === 'start') {
      set({ phase: 'start' })
      return
    }
    if (!folderLabel) set({ phase: 'connect' })
    else if (installStatus !== 'ready') set({ phase: 'install' })
    else set({ phase: 'architecture' })
  },

  goSetup: () => {
    const { folderLabel, installStatus } = get()
    if (!folderLabel) set({ phase: 'connect' })
    else if (installStatus !== 'ready') set({ phase: 'install' })
    else set({ phase: 'connect' })
  },

  setProject: (patch) => {
    const project = { ...get().project, ...patch }
    saveProjectParams(project)
    set({ project })
  },

  setActivePath: (path) => {
    const doc = path && get().index ? get().index!.docs.get(path) : null
    const browsePanel =
      doc?.kind === 'storm' ? 'board' : get().browsePanel === 'board' ? 'doc' : get().browsePanel
    set({ activePath: path, browsePanel: path ? browsePanel : get().browsePanel })
  },

  setActiveSpikePath: (activeSpikePath) => set({ activeSpikePath }),

  setTypeFilter: (typeFilter) => set({ typeFilter }),

  setSearchQuery: (searchQuery) => {
    const searchHits = searchFn && searchQuery.trim() ? searchFn(searchQuery) : []
    set({ searchQuery, searchHits })
  },

  setBrowsePanel: (browsePanel) => set({ browsePanel }),

  toggleContextPin: (path) => {
    const contextPins = togglePin(get().contextPins, path)
    saveContextPins(contextPins)
    set({ contextPins })
  },

  setDocFocus: (docFocus) => {
    saveDocFocus(docFocus)
    set({ docFocus })
  },

  setIncludeOnDemand: (includeOnDemand) => set({ includeOnDemand }),
  setIncludeLocalNotes: (includeLocalNotes) => set({ includeLocalNotes }),
  setIncludeSpikeEvidence: (includeSpikeEvidence) => set({ includeSpikeEvidence }),

  showToast: (toast) => {
    set({ toast })
    window.setTimeout(() => {
      if (get().toast === toast) set({ toast: null })
    }, 2800)
  },

  clearToast: () => set({ toast: null }),

  connectFolder: async () => {
    await get().pickBaseFolder()
  },

  pickBaseFolder: async () => {
    set({ opening: true, error: null })
    try {
      if (!supportsDirectoryPicker()) {
        await get().connectFolderFallback()
        return
      }
      const picked = await pickDirectory({ mode: 'readwrite' })
      if (!picked) {
        set({ opening: false })
        return
      }
      const isRepo = await looksLikeGitRepo(picked.handle)
      const defaultSub = isRepo ? 'docs/architecture' : ''
      const suggested = await buildDocPromptPath(picked.handle, defaultSub)
      set({
        pendingBaseHandle: picked.handle,
        pendingBaseName: picked.handle.name,
        pendingCanWrite: picked.canWrite,
        pendingSubpath: defaultSub,
        opening: false,
        error: null,
        phase: 'connect',
      })
      get().setProject({ docRoot: suggested })
      get().showToast(`Selected “${picked.handle.name}” — set subfolder if needed, then confirm`)
    } catch (err) {
      set({
        opening: false,
        error: err instanceof Error ? err.message : 'Failed to open folder',
      })
    }
  },

  suggestDocRootForPending: async (subpath) => {
    const base = get().pendingBaseHandle
    if (!base) return ''
    return buildDocPromptPath(base, subpath)
  },

  confirmConnect: async (subpath, docRoot) => {
    const base = get().pendingBaseHandle
    if (!base) {
      set({ error: 'Choose a folder first.' })
      return
    }
    set({ opening: true, error: null })
    try {
      const result = await confirmFolderBinding({
        base,
        canWrite: get().pendingCanWrite,
        subpath,
        docRoot,
      })
      get().setProject({ docRoot: result.docRoot })
      set({
        pendingBaseHandle: null,
        pendingBaseName: null,
        pendingCanWrite: false,
        pendingSubpath: '',
      })
      afterOpen(set, get, result.label, result.files, result.handle, result.canWrite, {
        preferDaily: false,
      })
      get().showToast(`Confirmed · prompts use ${result.docRoot}`)
    } catch (err) {
      set({
        opening: false,
        error: err instanceof Error ? err.message : 'Failed to bind folder',
      })
    }
  },

  clearPendingBase: () => {
    set({
      pendingBaseHandle: null,
      pendingBaseName: null,
      pendingCanWrite: false,
      pendingSubpath: '',
    })
  },

  connectFolderFallback: async () => {
    set({ opening: true, error: null })
    try {
      const result = await openArchitectureFolderViaInput()
      if (!result) {
        set({ opening: false })
        return
      }
      const docRoot = `${result.label}/`
      get().setProject({ docRoot })
      afterOpen(set, get, result.label, result.files, null, false)
      get().showToast(`Opened read-only · prompts use ${docRoot}`)
    } catch (err) {
      set({
        opening: false,
        error: err instanceof Error ? err.message : 'Failed to open folder',
      })
    }
  },

  tryRestoreFolder: async () => {
    set({ restoring: true, error: null })
    const handle = await loadDirectoryHandle()
    const hint = loadFolderHint()
    if (!handle) {
      const bootDone = loadBootDone()
      set({
        restoring: false,
        folderHint: hint,
        phase: bootDone ? 'connect' : 'start',
      })
      return
    }
    const hydrated = await rehydrateFolder(handle)
    if (!hydrated) {
      set({
        restoring: false,
        folderHint: hint || handle.name,
        phase: 'connect',
        error:
          'Previously chosen folder needs permission again. Click “Choose folder” (or Allow) to continue.',
      })
      return
    }
    afterOpen(set, get, hint || handle.name, hydrated.files, handle, hydrated.canWrite, {
      preferDaily: true,
    })
    get().showToast(`Restored · ${hint || handle.name}`)
  },

  refreshIndex: async (opts) => {
    const handle = get().folderHandle
    if (!handle) {
      set({ error: 'No folder bound — finish Setup first.' })
      return
    }
    set({ opening: true, error: null })
    try {
      const files: FileMap = new Map()
      await walkDirectoryHandle(handle, '', files)
      afterOpen(set, get, handle.name, files, handle, get().canWrite, {
        keepPhase: opts?.keepPhase ?? true,
      })
      get().showToast('Folder refreshed')
    } catch (err) {
      set({
        opening: false,
        error: err instanceof Error ? err.message : 'Reload failed',
      })
    }
  },

  writeStarterScaffold: async () => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({
        error:
          'Write access required — open Setup and choose the folder again in Chrome/Edge/Brave.',
      })
      return
    }
    set({ installing: true, error: null })
    try {
      const files = buildStarterScaffold(get().project)
      await writeFileMap(handle, files)
      await get().refreshIndex({ keepPhase: true })
      set({ installing: false, phase: 'architecture', installStatus: 'ready' })
      saveLastDailyPhase('architecture')
      get().showToast(`Wrote ${Object.keys(files).length} starter files`)
    } catch (err) {
      set({
        installing: false,
        error: err instanceof Error ? err.message : 'Scaffold write failed',
      })
    }
  },

  clearFolder: () => {
    searchFn = null
    saveFolderHint(null)
    saveBootDone(false)
    set({
      folderHandle: null,
      folderLabel: null,
      folderHint: null,
      pendingBaseHandle: null,
      pendingBaseName: null,
      pendingCanWrite: false,
      pendingSubpath: '',
      canWrite: false,
      installStatus: 'unknown',
      index: null,
      spikes: [],
      reviews: [],
      activeSpikePath: null,
      activePath: null,
      searchQuery: '',
      searchHits: [],
      typeFilter: '',
      browsePanel: 'doc',
      phase: 'start',
      error: null,
      restoring: false,
    })
  },

  createSpike: async ({ title, slug, track, type }) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required to create a spike.' })
      return null
    }
    try {
      const filesNow: FileMap = new Map()
      await walkDirectoryHandle(handle, '', filesNow)
      const existing = listSpikes(filesNow)
      const bp =
        [...filesNow.entries()].find(([p]) => p.endsWith('blueprint.md'))?.[1] ??
        filesNow.get('blueprint.md')
      const id = nextSpikeId(bp, existing)
      const input: CreateSpikeInput = {
        title,
        slug: slugify(slug || title),
        track,
        type,
        nextId: id,
      }
      const spikeFiles = buildSpikeFiles(input)
      await writeFileMap(handle, spikeFiles)
      if (bp) {
        const bpPath =
          [...filesNow.keys()].find((p) => p.endsWith('blueprint.md')) || 'blueprint.md'
        const folder = Object.keys(spikeFiles)[0]!.replace(/\/index\.md$/, '')
        const updated = appendSpikeRegisterRow(bp, {
          id,
          track,
          title,
          type,
          path: folder,
          status: 'draft',
          date: new Date().toISOString().slice(0, 10),
        })
        await writeTextFile(handle, bpPath, updated)
      }
      const folder = Object.keys(spikeFiles)[0]!.replace(/\/index\.md$/, '')
      await get().refreshIndex({ keepPhase: true })
      const targetPhase = isAnalysisSpikeType(type) ? 'analyses' : 'concepts'
      set({ activeSpikePath: folder, phase: targetPhase })
      get().showToast(`Created ${id}`)
      return folder
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Create spike failed' })
      return null
    }
  },

  createReview: async ({ title, slug, scope }) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required to create a review.' })
      return null
    }
    try {
      const filesNow: FileMap = new Map()
      await walkDirectoryHandle(handle, '', filesNow)
      const existing = listReviews(filesNow)
      const bp =
        [...filesNow.entries()].find(([p]) => p.endsWith('blueprint.md'))?.[1] ??
        filesNow.get('blueprint.md')
      const id = nextReviewId(bp, existing)
      const reviewFiles = buildReviewFiles({
        title,
        slug: slugify(slug || title),
        nextId: id,
        scope: scope || 'phase',
      })
      await writeFileMap(handle, reviewFiles)
      const folder = Object.keys(reviewFiles)[0]!.replace(/\/index\.md$/, '')
      if (bp) {
        const bpPath =
          [...filesNow.keys()].find((p) => p.endsWith('blueprint.md')) || 'blueprint.md'
        const updated = appendReviewRegisterRow(bp, {
          id,
          target: title,
          reviewed: new Date().toISOString().slice(0, 10),
          verdict: '',
          reportPath: `${folder}/report.md`,
          findingsPath: `${folder}/findings.md`,
        })
        await writeTextFile(handle, bpPath, updated)
      }
      await get().refreshIndex({ keepPhase: true })
      set({ activeSpikePath: folder, activePath: `${folder}/report.md`, phase: 'architecture' })
      get().showToast(`Created ${id} — open Architecture → Check docs`)
      return folder
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Create review failed' })
      return null
    }
  },

  saveSpikeFile: async (relativePath, content) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required.' })
      return false
    }
    try {
      await writeTextFile(handle, relativePath, content)
      await get().refreshIndex({ keepPhase: true })
      get().showToast('Saved')
      return true
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Save failed' })
      return false
    }
  },

  createStormBoard: async (spikePath, name, modelingMode = 'eventStorming') => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required.' })
      return null
    }
    try {
      const safe = slugify(name) || 'board'
      const path = `${spikePath}/boards/${safe}.storm.json`
      const json = emptyStormBoard(name, modelingMode)
      await writeTextFile(handle, path, json)
      await get().refreshIndex({ keepPhase: true })
      set({ activePath: path, browsePanel: 'board' })
      get().showToast('Board created')
      return path
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Board create failed' })
      return null
    }
  },

  importStormBoard: async (spikePath, jsonText, preferredName) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required to import a board.' })
      return null
    }
    const parsed = parseBoardJson(jsonText)
    if (!parsed) {
      set({
        error:
          'Not a valid E2 board snapshot (need format event-storming-tool, version 1 or 2).',
      })
      return null
    }
    try {
      const fromName = preferredName?.replace(/\.storm\.json$/i, '').replace(/\.json$/i, '')
      let safe = slugify(fromName || parsed.title || 'imported-board') || 'imported-board'
      let path = `${spikePath}/boards/${safe}.storm.json`
      // Avoid overwrite: append short suffix if path already indexed
      const existing = get().index?.docs.has(path)
      if (existing) {
        safe = `${safe}-${Date.now().toString(36).slice(-4)}`
        path = `${spikePath}/boards/${safe}.storm.json`
      }
      // Keep original JSON text (preserves provenance fields); normalize whitespace lightly
      let out = jsonText.trim()
      try {
        out = JSON.stringify(JSON.parse(jsonText), null, 2)
      } catch {
        /* keep raw */
      }
      await writeTextFile(handle, path, out.endsWith('\n') ? out : `${out}\n`)
      await get().refreshIndex({ keepPhase: true })
      set({ activePath: path, browsePanel: 'board' })
      get().showToast(`Imported “${parsed.title}”`)
      return path
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Board import failed' })
      return null
    }
  },

  pasteInboxRaw: async ({ label, body, slug }) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required to paste into Inbox.' })
      return null
    }
    if (!body.trim()) {
      set({ error: 'Paste some content first.' })
      return null
    }
    try {
      const filesNow: FileMap = new Map()
      await walkDirectoryHandle(handle, '', filesNow)
      const hasInbox = [...filesNow.keys()].some((p) => p.replace(/\\/g, '/').startsWith('inbox/'))
      if (!hasInbox) {
        await writeFileMap(handle, buildInboxScaffoldFiles())
      }
      const { path, content } = buildRawPasteFile({ label, body, slug })
      await writeTextFile(handle, path, content)

      const after: FileMap = new Map()
      await walkDirectoryHandle(handle, '', after)
      const logPath =
        [...after.keys()].find((p) => p.replace(/\\/g, '/').endsWith('inbox/log.md')) ||
        'inbox/log.md'
      const log = after.get(logPath) || buildInboxScaffoldFiles()['inbox/log.md'] || ''
      const stamp = new Date().toISOString().slice(0, 10)
      const line = `| ${stamp} | paste | ${path} |`
      if (!log.includes(`| ${path} |`)) {
        await writeTextFile(handle, logPath, `${log.trimEnd()}\n${line}\n`)
      }

      await get().refreshIndex({ keepPhase: true })
      set({ phase: 'inbox', activePath: path })
      get().showToast(`Saved ${path}`)
      return path
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Inbox paste failed' })
      return null
    }
  },

  pasteLocalNote: async ({ title, body, slug }) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required to save a local note.' })
      return null
    }
    if (!body.trim()) {
      set({ error: 'Write some note text first.' })
      return null
    }
    try {
      const filesNow: FileMap = new Map()
      await walkDirectoryHandle(handle, '', filesNow)
      const hasIgnore = [...filesNow.keys()].some(
        (p) => p.replace(/\\/g, '/') === 'notes/.gitignore',
      )
      if (!hasIgnore) {
        await writeTextFile(handle, 'notes/.gitignore', NOTES_GITIGNORE)
      }
      const base =
        (slug || title || 'note')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 48) || 'note'
      const stamp = new Date().toISOString().slice(0, 10)
      let path = `notes/${stamp}-${base}.md`
      let n = 0
      while (filesNow.has(path) || [...filesNow.keys()].some((p) => p.replace(/\\/g, '/') === path)) {
        n += 1
        path = `notes/${stamp}-${base}-${n}.md`
      }
      const content = buildNoteFile({ title: title || base, body })
      await writeTextFile(handle, path, content)
      await get().refreshIndex({ keepPhase: true })
      set({ phase: 'notes', activePath: path })
      get().showToast(`Saved local note ${path}`)
      return path
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Note save failed' })
      return null
    }
  },

  setInboxProposalStatus: async (relativePath, status) => {
    const handle = get().folderHandle
    if (!handle || !get().canWrite) {
      set({ error: 'Write access required to update proposal status.' })
      return false
    }
    const doc = get().index?.docs.get(relativePath)
    if (!doc) {
      set({ error: `Proposal not found: ${relativePath}` })
      return false
    }
    try {
      const next = setProposalStatus(doc.content, status)
      await writeTextFile(handle, relativePath, next)
      await get().refreshIndex({ keepPhase: true })
      set({ activePath: relativePath })
      get().showToast(`Status → ${status}`)
      return true
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Status update failed' })
      return false
    }
  },
}))

export { DEFAULT_PROJECT, isWorkspacePhase }
