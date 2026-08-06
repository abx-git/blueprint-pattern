import { useEffect, useState } from 'react'
import { useStudioStore } from '../store/studio-store'
import { supportsDirectoryPicker } from '../lib/fs-access'

export function ConnectPhase() {
  const project = useStudioStore((s) => s.project)
  const setProject = useStudioStore((s) => s.setProject)
  const setPhase = useStudioStore((s) => s.setPhase)
  const folderLabel = useStudioStore((s) => s.folderLabel)
  const pendingBaseName = useStudioStore((s) => s.pendingBaseName)
  const pendingSubpath = useStudioStore((s) => s.pendingSubpath)
  const pickBaseFolder = useStudioStore((s) => s.pickBaseFolder)
  const confirmConnect = useStudioStore((s) => s.confirmConnect)
  const clearPendingBase = useStudioStore((s) => s.clearPendingBase)
  const suggestDocRootForPending = useStudioStore((s) => s.suggestDocRootForPending)
  const connectFolderFallback = useStudioStore((s) => s.connectFolderFallback)
  const opening = useStudioStore((s) => s.opening)
  const installStatus = useStudioStore((s) => s.installStatus)

  const [subpath, setSubpath] = useState('')

  useEffect(() => {
    if (pendingBaseName) setSubpath(pendingSubpath)
  }, [pendingBaseName, pendingSubpath])

  const onSubpathChange = async (value: string) => {
    setSubpath(value)
    const suggested = await suggestDocRootForPending(value)
    if (suggested) setProject({ docRoot: suggested })
  }

  const continueNext = () => {
    if (!folderLabel) return
    setPhase(installStatus === 'ready' ? 'run' : 'install')
  }

  const pending = Boolean(pendingBaseName)
  const confirmed = Boolean(folderLabel) && !pending

  return (
    <div className="phase-panel connect-phase">
      <h2>Setup — Ordner &amp; Projekt</h2>
      <p className="lead">
        Einmal: Ordner wählen, optional Unterpfad, Pfad bestätigen. Studio merkt sich den Ordner für
        den nächsten Besuch. Danach: Schreiben · Spikes · Lesen.
      </p>

      <div className="form-grid">
        <label className="field">
          <span>Project name</span>
          <input
            type="text"
            value={project.appName}
            onChange={(e) => setProject({ appName: e.target.value })}
            placeholder="e.g. Order Service"
            required
          />
        </label>

        <label className="field">
          <span>Documentation template</span>
          <select
            value={project.template}
            onChange={(e) => setProject({ template: e.target.value })}
          >
            <option value="arc42">arc42 (default)</option>
            <option value="lean-service">lean-service</option>
            <option value="c4-light">c4-light</option>
            <option value="adr-first">adr-first</option>
            <option value="custom">custom</option>
          </select>
        </label>

        {project.template === 'custom' && (
          <label className="field">
            <span>Custom template name</span>
            <input
              type="text"
              value={project.customTemplate}
              onChange={(e) => setProject({ customTemplate: e.target.value })}
              placeholder="e.g. internal-standard"
            />
          </label>
        )}

        <label className="field">
          <span>AI chat (for Run prompts)</span>
          <select value={project.aiTool} onChange={(e) => setProject({ aiTool: e.target.value })}>
            <option value="cursor">Cursor</option>
            <option value="claude">Claude</option>
            <option value="copilot">Copilot / VS Code</option>
            <option value="generic">Other</option>
          </select>
        </label>

        <label className="field">
          <span>Purpose / domain (optional)</span>
          <input
            type="text"
            value={project.purpose}
            onChange={(e) => setProject({ purpose: e.target.value })}
            placeholder="One sentence"
          />
        </label>

        <label className="field">
          <span>Stack (optional)</span>
          <input
            type="text"
            value={project.stack}
            onChange={(e) => setProject({ stack: e.target.value })}
            placeholder="e.g. TypeScript / Node.js"
          />
        </label>
      </div>

      <div className="connect-folder-block">
        <h3>Documentation folder</h3>
        <ol className="connect-steps">
          <li className={!pending && !confirmed ? 'current' : confirmed || pending ? 'done' : ''}>
            Choose a directory (repo root, or the docs folder itself).
          </li>
          <li className={pending ? 'current' : confirmed ? 'done' : ''}>
            Optional: add a subfolder under it.
          </li>
          <li className={pending ? 'current' : confirmed ? 'done' : ''}>
            Confirm the resulting path used in prompts.
          </li>
        </ol>

        {!pending && (
          <div className="connect-step-actions">
            <button
              type="button"
              className="btn primary"
              disabled={opening || !supportsDirectoryPicker()}
              onClick={() => pickBaseFolder()}
            >
              {opening ? 'Opening…' : confirmed ? 'Change folder' : '1. Choose folder'}
            </button>
            {!supportsDirectoryPicker() && (
              <button
                type="button"
                className="btn"
                disabled={opening}
                onClick={() => connectFolderFallback()}
              >
                Open read-only (limited)
              </button>
            )}
          </div>
        )}

        {pending && pendingBaseName && (
          <div className="connect-pending">
            <p className="status-line">
              Selected folder: <strong>{pendingBaseName}</strong>
            </p>

            <label className="field connect-doc-root">
              <span>2. Subfolder (optional)</span>
              <input
                type="text"
                value={subpath}
                onChange={(e) => void onSubpathChange(e.target.value)}
                placeholder="e.g. docs/architecture"
              />
              <span className="hint">
                Relative to <code>{pendingBaseName}</code>. Leave empty if that folder already{' '}
                <em>is</em> the documentation root.
              </span>
            </label>

            <label className="field connect-doc-root">
              <span>3. Resulting path (used in prompts)</span>
              <input
                type="text"
                value={project.docRoot}
                onChange={(e) => setProject({ docRoot: e.target.value })}
                placeholder="docs/architecture/"
              />
              <span className="hint">
                Edit if needed. Setup and Schreiben use this path.
              </span>
            </label>

            <div className="connect-step-actions">
              <button
                type="button"
                className="btn primary"
                disabled={opening || !project.docRoot.trim()}
                onClick={() => void confirmConnect(subpath, project.docRoot)}
              >
                {opening ? 'Binding…' : 'Confirm path'}
              </button>
              <button
                type="button"
                className="btn"
                disabled={opening}
                onClick={() => clearPendingBase()}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {confirmed && (
          <p className="status-line">
            Bound: <strong>{folderLabel}</strong>
            {' · '}
            Prompts use: <strong>{project.docRoot || './'}</strong>
            {' · '}
            Install: <strong>{installStatus}</strong>
          </p>
        )}
      </div>

      <div className="phase-actions">
        <button type="button" className="btn primary" disabled={!confirmed} onClick={continueNext}>
          {installStatus === 'ready' ? 'Weiter — Schreiben' : 'Weiter — Starter'}
        </button>
      </div>
    </div>
  )
}
