import type { JourneyPhase, WorkspaceId } from '../types'

export interface HelpSection {
  id: string
  title: string
  body: string[]
}

/** Full help drawer — the “manual” inside Studio. */
export const HELP_OVERVIEW: HelpSection[] = [
  {
    id: 'idea',
    title: 'What Studio does',
    body: [
      'Your architecture lives as Markdown files in a folder next to the code (usually docs/architecture/). Studio does not host the docs and does not call an AI itself.',
      'You browse and prepare work here. Then you copy a prompt into Cursor / Claude / Copilot on the same repo. The AI edits the Markdown. You come back and Refresh.',
    ],
  },
  {
    id: 'loop',
    title: 'The loop (remember this)',
    body: [
      '1. Setup once — bind the folder and write the starter files.',
      '2. Adopt — first fill of entry-point + blueprint facts, and create the first chapter file when that work runs.',
      '3. Extend docs — repeatedly: next open item in blueprint.md (creates that file if it does not exist yet).',
      '4. Refresh — reload the folder after the AI wrote files.',
      'Setup writes only entry-point.md and blueprint.md. Empty stubs are never pre-created. Concepts / Analyses / Knowledge files appear when you create them.',
    ],
  },
  {
    id: 'files',
    title: 'Two files that steer everything',
    body: [
      'entry-point.md — start here for humans and AI (short facts + links). Put this in the AI context.',
      'blueprint.md — what’s next (checklist). Extend docs always resumes the next [ ] or [~] row.',
    ],
  },
  {
    id: 'workspaces',
    title: 'Workspaces',
    body: [
      'Architecture — durable documentation chapters (what should stay true).',
      'Knowledge — domain / fachliche model under domain/.',
      'Concepts — designs and questions that need not ship (spikes).',
      'Analyses — how the software works (analysis spikes).',
      'Prompt — prepares the copy-paste AI prompt (prompts live in AGM Studio, not in your docs folder).',
      'Chrome actions (Help, folder, Refresh) live only in the top bar.',
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary',
    body: [
      'Adopt — first documentation session.',
      'Extend docs — continue the blueprint checklist (one chapter / item).',
      'Context pack — small list of files the AI should read first (keeps context small).',
      'Spike — dated folder under process/spikes/ for exploration.',
      'E2 board — .storm.json workshop board; import into a spike’s boards/ folder.',
      'Pin — mark a path so it is included in the next prompt’s context pack.',
    ],
  },
]

export const WORKSPACE_HELP: Record<
  WorkspaceId | 'setup' | 'connect' | 'install',
  { title: string; summary: string; tips: string[] }
> = {
  architecture: {
    title: 'Architecture',
    summary: 'Browse and pin durable docs. Prepare an AI prompt when you want to grow them.',
    tips: [
      'Open blueprint.md to see what is still unchecked.',
      'Use Prepare AI prompt (or the Prompt rail) — do not hunt for Adopt/Extend elsewhere.',
      'After the AI writes files, click Refresh in the header.',
    ],
  },
  knowledge: {
    title: 'Knowledge',
    summary: 'Domain language and model (domain/). Parallel to architecture chapters.',
    tips: [
      'Prepare AI prompt opens domain / advanced workflows.',
      'E2 boards can be projected into domain/ via domain-board-ingest.',
    ],
  },
  concepts: {
    title: 'Concepts',
    summary: 'Drafts and designs that may never become durable chapters.',
    tips: [
      'Create a spike, take notes, optionally import an E2 board.',
      'Promote facts into Architecture only when you decide they should ship.',
    ],
  },
  analyses: {
    title: 'Analyses',
    summary: 'Structured look at implementation and flows (spike type analysis).',
    tips: [
      'Use Extend docs → More → Analysis, or create an analysis spike here.',
      'Link findings back to architecture chapters when ready.',
    ],
  },
  session: {
    title: 'Prompt',
    summary: 'Build a context pack and copy a prompt for your AI chat. Studio does not call an LLM.',
    tips: [
      'Default: Extend — next open row in blueprint.md.',
      'Adopt is only for the first fill.',
      'After the AI writes files, use Refresh in the header.',
    ],
  },
  setup: {
    title: 'Setup',
    summary: 'One-time: choose folder, write starter scaffold.',
    tips: ['Use Chrome, Edge, or Brave for write access.', 'After starter is ready, open Architecture.'],
  },
  connect: {
    title: 'Setup — folder',
    summary: 'Bind the local architecture folder Studio will read and write.',
    tips: ['Prefer the repo root or docs/architecture as the bound path.'],
  },
  install: {
    title: 'Setup — starter',
    summary: 'Writes only entry-point.md and blueprint.md. No empty chapter or domain stubs.',
    tips: [
      'Chapters and domain files appear when Adopt / Extend docs / Studio create them.',
      'Safe to re-run only if you intend to overwrite those two state files.',
    ],
  },
}

export function helpKeyForPhase(phase: JourneyPhase): keyof typeof WORKSPACE_HELP {
  if (phase === 'about' || phase === 'start') return 'setup'
  if (phase === 'connect') return 'connect'
  if (phase === 'install') return 'install'
  if (phase === 'session') return 'session'
  return phase
}
