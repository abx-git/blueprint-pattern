import { WorkspaceShell } from './WorkspaceShell'

/** @deprecated Browse is now the Architecture / Knowledge workspace shell. */
export function ReviewPhase() {
  return (
    <WorkspaceShell
      workspace="architecture"
      lead="durable chapters, state files, extensions"
    />
  )
}
