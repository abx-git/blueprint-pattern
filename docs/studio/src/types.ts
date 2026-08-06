export type SetupPhase = 'about' | 'start' | 'connect' | 'install'

/** Durable cockpit workspaces after Setup. */
export type WorkspaceId = 'architecture' | 'knowledge' | 'concepts' | 'analyses' | 'session'

/** Which Session tab to open when navigating from a workspace CTA. */
export type SessionIntent = 'adopt' | 'continue' | 'evolve' | 'verify' | 'advanced'

export type JourneyPhase = SetupPhase | WorkspaceId

/** DocNode classification from path conventions. */
export type DocWorkspace = 'architecture' | 'knowledge' | 'concepts' | 'analyses' | 'meta'

export type InstallStatus = 'unknown' | 'missing' | 'ready' | 'partial'

export interface ProjectParams {
  appName: string
  template: string
  customTemplate: string
  docRoot: string
  aiTool: string
  purpose: string
  stack: string
  sourceRoot: string
}

export interface OkfMeta {
  type: string
  title?: string
  description?: string
  tags?: string[]
  timestamp?: string
  [key: string]: unknown
}

export interface DocNode {
  path: string
  name: string
  kind: 'markdown' | 'storm'
  content: string
  meta: OkfMeta | null
  links: string[]
  workspace: DocWorkspace
}

export interface GraphEdge {
  from: string
  to: string
  broken: boolean
}

export interface ArchitectureIndex {
  rootLabel: string
  docs: Map<string, DocNode>
  edges: GraphEdge[]
  openedAt: string
}

export interface WorkflowEntry {
  id: string
  track: string
  activity: string
  mode: string
  role: string
  group: string
  when: string
  prerequisite?: string
  freshChat?: boolean
  freshNote?: string
  anchors?: string[]
  steps?: string[]
  placeholders?: string[]
  prompt: string
}

/** @deprecated use JourneyPhase */
export type StudioMode = 'workflows' | 'browse'

export const DEFAULT_PROJECT: ProjectParams = {
  appName: '',
  template: 'arc42',
  customTemplate: '',
  docRoot: '',
  aiTool: 'cursor',
  purpose: '',
  stack: '',
  sourceRoot: '',
}

export const STORAGE_KEY = 'agm-studio-project'

export const WORKSPACE_PHASES: WorkspaceId[] = [
  'architecture',
  'knowledge',
  'concepts',
  'analyses',
  'session',
]

export function isWorkspacePhase(phase: JourneyPhase): phase is WorkspaceId {
  return (WORKSPACE_PHASES as string[]).includes(phase)
}

export function isSetupPhase(phase: JourneyPhase): phase is SetupPhase {
  return phase === 'about' || phase === 'start' || phase === 'connect' || phase === 'install'
}
