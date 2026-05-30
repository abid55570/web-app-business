'use client'
import { useEffect, useState } from 'react'

type Asset = {
  id: string
  filename: string
  url: string
  sizeBytes: number
  uploadedAt?: number
}

export function AssetLibrary({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  onPick: (url: string) => void
}) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    void load()
  }, [open])

  async function load() {
    const res = await fetch('/api/assets')
    const j = (await res.json()) as { assets: Asset[] }
    setAssets(j.assets.sort((a, b) => (b.uploadedAt ?? 0) - (a.uploadedAt ?? 0)))
  }

  async function upload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    await fetch('/api/assets', { method: 'POST', body: fd })
    setUploading(false)
    await load()
  }

  async function del(id: string) {
    if (!confirm('Delete asset?')) return
    await fetch(`/api/assets?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    await load()
  }

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>Asset library</h2>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="asset-upload">
          <label className="btn btn-primary">
            {uploading ? 'Uploading…' : '+ Upload image'}
            <input
              type="file"
              accept="image/*,video/mp4"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void upload(f)
              }}
            />
          </label>
          <p className="modal-hint">
            Stored under <code>output/studio-assets/</code> · S5b swaps to S3/R2.
          </p>
        </div>
        {assets.length === 0 ? (
          <p className="props-empty">No assets yet — upload one above.</p>
        ) : (
          <ul className="asset-grid">
            {assets.map((a) => (
              <li key={a.id}>
                <button type="button" className="asset-tile" onClick={() => onPick(a.url)} title={`${a.filename} · ${(a.sizeBytes / 1024).toFixed(1)} KB`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.filename} />
                  <span className="asset-filename">{a.filename}</span>
                </button>
                <button type="button" className="asset-del" onClick={() => void del(a.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
