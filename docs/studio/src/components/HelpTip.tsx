import { useId, useState, type ReactNode } from 'react'

interface Props {
  /** Short label for accessibility */
  label: string
  children: ReactNode
  className?: string
}

/** Inline “?” that expands a short explanation without leaving the page. */
export function HelpTip({ label, children, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className={`help-tip ${className}`.trim()}>
      <button
        type="button"
        className="help-tip-btn"
        aria-expanded={open}
        aria-controls={id}
        title={`Help: ${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <div id={id} className="help-tip-panel" role="note">
          <div className="help-tip-panel-head">
            <strong>{label}</strong>
            <button type="button" className="help-tip-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="help-tip-panel-body">{children}</div>
        </div>
      )}
    </span>
  )
}
