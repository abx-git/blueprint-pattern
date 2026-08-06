import { useEffect, useMemo, useRef } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import type { DocNode } from '../types'
import { parseFrontmatter, resolveRelativePath } from '../lib/okf-parse'
import { isLikelyStormJson } from '../lib/e2/storm'

interface Props {
  doc: DocNode
  allDocs: Map<string, DocNode>
  onNavigate: (path: string) => void
  onOpenStorm: (path: string) => void
  onPinPath?: (path: string) => void
}

let mermaidReady = false

function ensureMermaid() {
  if (mermaidReady) return
  mermaid.initialize({
    startOnLoad: false,
    // antiscript: allow quoted labels / mild HTML in diagrams; still block scripts
    securityLevel: 'antiscript',
    theme: 'neutral',
    flowchart: { htmlLabels: true },
    themeVariables: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
      fontSize: '14px',
    },
  })
  mermaidReady = true
}

/**
 * Mermaid already sanitizes SVG (antiscript). A second DOMPurify pass with the
 * SVG profile strips foreignObject HTML labels → diagrams with no text.
 * Keep foreignObject as an HTML integration point if we ever re-sanitize.
 */
function insertMermaidSvg(host: HTMLElement, svg: string) {
  host.innerHTML = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['foreignobject'],
    ADD_ATTR: ['dominant-baseline'],
    // DOMPurify key is lowercase (see cure53/DOMPurify#1002 / Mermaid mermaidAPI)
    HTML_INTEGRATION_POINTS: { foreignobject: true },
  })
}

/** Prefer textContent; fall back if a sanitizer left entities in the fence. */
function readMermaidSource(code: Element): string {
  const raw = (code.textContent || '').trim()
  if (!raw.includes('&lt;') && !raw.includes('&gt;') && !raw.includes('&amp;')) return raw
  const ta = document.createElement('textarea')
  ta.innerHTML = raw
  return ta.value.trim()
}

function rewriteInternalLinks(html: string, fromPath: string, allDocs: Map<string, DocNode>): string {
  const container = document.createElement('div')
  container.innerHTML = html
  for (const a of container.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')
    if (!href) continue
    const resolved = resolveRelativePath(fromPath, href)
    if (!resolved) continue
    let hitPath: string | null = allDocs.has(resolved) ? resolved : null
    if (!hitPath) {
      const base = resolved.includes('/') ? resolved.slice(resolved.lastIndexOf('/') + 1) : resolved
      hitPath = [...allDocs.keys()].find((k) => k === resolved || k.endsWith('/' + base)) ?? null
    }
    if (hitPath) {
      a.setAttribute('href', '#')
      a.setAttribute('data-agm-path', hitPath)
      a.classList.add('agm-internal-link')
    }
  }
  return container.innerHTML
}

export function DocViewer({ doc, allDocs, onNavigate, onOpenStorm, onPinPath }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { meta, body } = useMemo(() => parseFrontmatter(doc.content), [doc.content])

  const stormLinks = useMemo(() => {
    return doc.links.filter((l) => l.endsWith('.storm.json') && allDocs.has(l))
  }, [doc.links, allDocs])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      ensureMermaid()
      const rawHtml = await marked.parse(body, { async: true })
      let html = DOMPurify.sanitize(rawHtml)
      html = rewriteInternalLinks(html, doc.path, allDocs)

      if (!ref.current || cancelled) return
      ref.current.innerHTML = html

      const blocks = ref.current.querySelectorAll('code.language-mermaid, pre > code.language-mermaid')
      let i = 0
      for (const code of blocks) {
        const pre = code.parentElement
        const source = readMermaidSource(code)
        const host = document.createElement('div')
        host.className = 'mermaid-host'
        // Mermaid requires a unique DOM id; avoid path-only ids colliding across remounts
        const id = `mmd-${i++}-${Math.random().toString(36).slice(2, 10)}`
        try {
          if (!source) throw new Error('Empty mermaid fence')
          await mermaid.parse(source)
          const { svg } = await mermaid.render(id, source)
          if (cancelled) return
          insertMermaidSvg(host, svg)
          pre?.replaceWith(host)
        } catch (err) {
          host.className = 'mermaid-host mermaid-error'
          const msg = err instanceof Error ? err.message : String(err)
          const title = document.createElement('p')
          title.textContent = `Mermaid error: ${msg}`
          host.appendChild(title)
          const details = document.createElement('pre')
          details.className = 'mermaid-error-source'
          details.textContent = source.slice(0, 2000)
          host.appendChild(details)
          pre?.replaceWith(host)
        }
      }

      // Detect fenced json that is an E2 board
      for (const code of ref.current.querySelectorAll('code.language-json')) {
        const text = code.textContent || ''
        if (!isLikelyStormJson(text)) continue
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'btn storm-inline-btn'
        btn.textContent = 'Open as E2 board'
        btn.onclick = () => {
          // Store inline board under a virtual path? For MVP, copy to session — use first .storm.json sibling or alert
          const existing = [...allDocs.values()].find((d) => d.kind === 'storm')
          if (existing) onOpenStorm(existing.path)
        }
        code.parentElement?.insertAdjacentElement('afterend', btn)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [body, doc.path, allDocs, onOpenStorm])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      const a = t?.closest?.('a.agm-internal-link') as HTMLAnchorElement | null
      if (!a) return
      e.preventDefault()
      const path = a.getAttribute('data-agm-path')
      if (path) {
        if (path.endsWith('.storm.json')) onOpenStorm(path)
        else onNavigate(path)
      }
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [onNavigate, onOpenStorm, doc.path])

  // Highlight likely source-code path hints in backticks (e.g. src/foo.ts)
  useEffect(() => {
    const el = ref.current
    if (!el || !onPinPath) return
    const codes = el.querySelectorAll('code')
    for (const code of codes) {
      const text = (code.textContent || '').trim()
      if (!/^(src|lib|app|packages|services)\/[\w./-]+\.\w{1,8}$/.test(text) && !/^[\w.-]+\/[\w./-]+\.(ts|tsx|js|jsx|py|go|java|kt|rs)$/.test(text)) {
        continue
      }
      if (code.classList.contains('agm-code-path')) continue
      code.classList.add('agm-code-path')
      code.title = 'Click to pin code path for Session'
      code.style.cursor = 'pointer'
      const handler = (ev: Event) => {
        ev.preventDefault()
        onPinPath(text)
      }
      code.addEventListener('click', handler)
    }
  }, [onPinPath, doc.path, body])

  return (
    <article className="doc-viewer">
      <header className="doc-header">
        <h1>{(meta?.title as string) || doc.name}</h1>
        <p className="doc-meta">
          <code>{doc.path}</code>
          {meta?.type && <span className="badge">{meta.type}</span>}
          {doc.workspace && <span className="badge badge-ws">{doc.workspace}</span>}
        </p>
      </header>
      {stormLinks.length > 0 && (
        <div className="storm-links">
          <span>Linked E2 boards:</span>
          {stormLinks.map((p) => (
            <button key={p} type="button" className="btn" onClick={() => onOpenStorm(p)}>
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="doc-body markdown-body" ref={ref} />
    </article>
  )
}
