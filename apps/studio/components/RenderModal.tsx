'use client'
import { useEffect, useState } from 'react'
import type { StudioMultiPageState } from '../lib/types'

type DiffEntry = {
  pageId: string
  status: string
  added: number
  removed: number
  edited: number
}

export function RenderModal({
  open,
  state,
  onClose,
}: {
  open: boolean
  state: StudioMultiPageState
  onClose: () => void
}) {
  const [diff, setDiff] = useState<DiffEntry[] | null>(null)
  const [rendering, setRendering] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; outDir: string; log: string[] } | null>(null)

  useEffect(() => {
    if (!open) return
    setResult(null)
    setDiff(null)
    void fetch('/api/diff', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state),
    })
      .then((r) => r.json())
      .then((d: { diff: DiffEntry[] }) => setDiff(d.diff))
  }, [open, state])

  async function doRender() {
    setRendering(true)
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ starter: 'observability-saas' }),
    })
    setResult(await res.json())
    setRendering(false)
  }

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>Render to app</h2>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>
        <section>
          <h3>Diff vs last save</h3>
          {diff === null ? <p>Computing…</p> : diff.length === 0 ? <p>No changes.</p> : (
            <ul className="diff-list">
              {diff.map((d) => (
                <li key={d.pageId}>
                  <strong>{d.pageId}</strong>{' '}
                  <span className={`diff-status diff-${d.status}`}>{d.status}</span>
                  {' · '}+{d.added} added{' · '}−{d.removed} removed{' · '}~{d.edited} edited
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h3>Generate</h3>
          <p className="modal-hint">
            Note: S4 wires the studio to a sample starter (<code>observability-saas</code>).
            Mapping studio page-state to a generated recipe lands in S5a.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={rendering}
            onClick={() => void doRender()}
          >
            {rendering ? 'Rendering…' : 'Render now'}
          </button>
          {result ? (
            <div className={`render-result ${result.ok ? 'ok' : 'err'}`}>
              <p>{result.ok ? '✓ Render succeeded' : '✗ Render failed'}</p>
              <p className="render-out">→ {result.outDir}</p>
              <pre className="render-log">{result.log.slice(-12).join('\n')}</pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
