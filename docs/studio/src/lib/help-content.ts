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
      'You browse and prepare work here. Then you copy a prompt into Cursor / Claude / Copilot on the same repo. The AI edits the Markdown. You come back and Reload folder.',
    ],
  },
  {
    id: 'loop',
    title: 'The loop (remember this)',
    body: [
      '1. Setup once — bind the folder and write the starter files.',
      '2. Adopt — first fill of entry-point + blueprint facts, and create the first chapter file when that work runs.',
      '3. Extend docs — repeatedly: next open item in blueprint.md (creates that file if it does not exist yet).',
      '4. Reload folder — reload from disk after the AI wrote files.',
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
      'Architecture — lasting documentation.',
      'Knowledge — domain language and model.',
      'Inbox — new information in three steps: receive → approve plan → apply.',
      'Concepts — optional ideas that need not become official docs.',
      'Analyses — optional looks at how the code works.',
      'Ask AI — copy a prompt for Cursor / Claude / Copilot (Studio does not call an AI).',
      'Folder, Reload, and Help live only in the top bar.',
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary',
    body: [
      'Adopt — first documentation fill after Setup.',
      'Extend / continue — next open checklist item.',
      'Inbox — bring external notes into the docs with a human check in between.',
      'Reading list — small set of files the AI should open first.',
      'Concept draft — exploration under process/spikes/.',
      'Doc check — AI quality report; does not fix docs in the same chat.',
      'Remember for AI — include a file in the next prompt’s reading list.',
    ],
  },
]

export const WORKSPACE_HELP: Record<
  WorkspaceId | 'setup' | 'connect' | 'install',
  { title: string; summary: string; tips: string[] }
> = {
  architecture: {
    title: 'Architecture',
    summary: 'Your lasting documentation. Browse it here; ask the AI when you want to grow it.',
    tips: [
      'blueprint.md is the checklist of what is still open.',
      'Ask AI prepares a prompt you paste into a new chat on this project.',
      'Check docs: the AI reviews quality in a fresh chat (report only).',
      'After the AI writes files, Reload folder in the header.',
    ],
  },
  knowledge: {
    title: 'Knowledge',
    summary: 'Domain language and model — the fachliche side next to architecture chapters.',
    tips: [
      'Ask AI can help with domain workflows.',
      'Workshop boards can be turned into domain docs when you are ready.',
    ],
  },
  inbox: {
    title: 'Inbox',
    summary:
      'Add new information (notes, specs, exports), let the AI turn it into a plan, approve it, then apply it to your docs.',
    tips: [
      'Step 1: paste or drop files — nothing is written into Architecture yet.',
      'Step 2: read the plan and mark it Approved when it looks right.',
      'Step 3: ask the AI to apply approved plans into the real documentation.',
    ],
  },
  concepts: {
    title: 'Concepts',
    summary: 'Optional ideas and designs that do not have to become official docs.',
    tips: [
      'Create a draft, take notes, optionally add a workshop board.',
      'Only promote lasting facts into Architecture when you decide they should stay.',
      'Doc quality checks are under Architecture → Check docs — not here.',
    ],
  },
  analyses: {
    title: 'Analyses',
    summary: 'Optional investigations of how the software works.',
    tips: [
      'Create an analysis when you need a structured look at code or flows.',
      'Link findings back to Architecture when ready.',
    ],
  },
  session: {
    title: 'Ask AI',
    summary:
      'Build a short reading list and copy a prompt. You paste it into Cursor / Claude / Copilot — Studio does not call an AI itself.',
    tips: [
      'Usually: continue the next checklist item in blueprint.md.',
      'First time only: Adopt fills the starter facts.',
      'After the AI writes files, use Reload folder in the header.',
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
