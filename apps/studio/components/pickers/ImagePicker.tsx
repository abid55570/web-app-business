'use client'
import { useState } from 'react'

// Built-in gallery — Unsplash-source URLs that don't require API keys.
// Studio S5a will replace this with real upload + Unsplash search.
const STARTER_GALLERY = [
  { id: 'mountain', url: 'https://source.unsplash.com/featured/640x360/?mountain', label: 'Mountain' },
  { id: 'office',   url: 'https://source.unsplash.com/featured/640x360/?office',   label: 'Office' },
  { id: 'people',   url: 'https://source.unsplash.com/featured/640x360/?people',   label: 'People' },
  { id: 'tech',     url: 'https://source.unsplash.com/featured/640x360/?tech',     label: 'Tech' },
  { id: 'product',  url: 'https://source.unsplash.com/featured/640x360/?product',  label: 'Product' },
  { id: 'abstract', url: 'https://source.unsplash.com/featured/640x360/?abstract', label: 'Abstract' },
]

export function ImagePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [showGallery, setShowGallery] = useState(false)
  return (
    <div>
      <div className="picker-image-current">
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value} alt="" className="picker-image-thumb" />
        ) : (
          <div className="picker-image-empty">No image</div>
        )}
        <div className="picker-image-actions">
          <input
            type="text"
            value={value ?? ''}
            placeholder="Paste image URL…"
            onChange={(e) => onChange(e.target.value)}
            className="props-field-input"
          />
          <button
            type="button"
            className="btn"
            onClick={() => setShowGallery((s) => !s)}
          >
            {showGallery ? 'Hide' : 'Gallery'}
          </button>
        </div>
      </div>
      {showGallery ? (
        <div className="picker-image-gallery">
          {STARTER_GALLERY.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                onChange(g.url)
                setShowGallery(false)
              }}
              title={g.label}
              className="picker-image-tile"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt={g.label} loading="lazy" />
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
