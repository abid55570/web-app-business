'use client'
import { useEffect, useState } from 'react'

type Snap = { id: string; label: string; at: number; pages: number; blocks: number }

export function HistoryDrawer({
  open,
  onClose,
  state,
  onRestore,
}: {
  open: boolean
  onClose: () => void
  state: unknown
  onRestore: (snap: unknown) => void
}) {
  const [snaps, setSnaps] = useState<Snap[]>([])
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (open) void load()
  }, [open])

  async function load() {
    const r = await fetch('/api/snapshots')
    const j = (await r.json()) as { snapshots: Snap[] }
    setSnaps(j.snapshots.sort((a, b) => b.at - a.at))
  }

  async function record() {
    if (!label.trim()) return
    await fetch('/api/snapshots', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ label, state }),
    })
    setLabel('')
    void load()
  }

  async function restore(id: string) {
    if (!confirm('Restore this snapshot? Current unsaved state will be lost.')) return
    const r = await fetch(`/api/snapshots?id=${encodeURIComponent(id)}`)
    const snap = await r.json()
    onRestore(snap.state)
    onClose()
  }

  async function del(id: string) {
    if (!confirm('Delete snapshot?')) return
    await fetch(`/api/snapshots?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    void load()
  }

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>Version history</h2>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>
        <section>
          <h3>Save snapshot of current state</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="text"
              className="props-field-input"
              placeholder="e.g. Pre-launch"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary" onClick={() => void record()}>
              Save
            </button>
          </div>
        </section>
        <section>
          <h3>Snapshots</h3>
          {snaps.length === 0 ? <p className="props-empty">No snapshots yet.</p> : (
            <ul className="snaps-list">
              {snaps.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.label}</strong>
                    <span className="snap-meta"> · {s.pages} page{s.pages === 1 ? '' : 's'}, {s.blocks} block{s.blocks === 1 ? '' : 's'} · {new Date(s.at).toLocaleString()}</span>
                  </div>
                  <div>
                    <button type="button" className="btn" onClick={() => void restore(s.id)}>Restore</button>
                    <button type="button" className="icon-btn" onClick={() => void del(s.id)}>×</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
