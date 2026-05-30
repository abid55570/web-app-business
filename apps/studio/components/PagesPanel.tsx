'use client'
import { useState } from 'react'
import type { StudioPage } from '../lib/types'

export function PagesPanel({
  pages,
  activePageId,
  onSwitch,
  onAdd,
  onRename,
  onDelete,
}: {
  pages: StudioPage[]
  activePageId: string
  onSwitch: (id: string) => void
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  return (
    <div className="pages-panel">
      {pages.map((p) =>
        renaming === p.id ? (
          <input
            key={p.id}
            autoFocus
            defaultValue={p.name}
            className="pages-rename-input"
            onBlur={(e) => {
              if (e.target.value.trim()) onRename(p.id, e.target.value.trim())
              setRenaming(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') setRenaming(null)
            }}
          />
        ) : (
          <button
            key={p.id}
            type="button"
            className={`pages-tab ${activePageId === p.id ? 'active' : ''}`}
            onClick={() => onSwitch(p.id)}
            onDoubleClick={() => setRenaming(p.id)}
            title={`${p.route} · ${p.blocks.length} block${p.blocks.length === 1 ? '' : 's'} · double-click to rename`}
          >
            {p.name}
            <span className="pages-tab-count">{p.blocks.length}</span>
            {pages.length > 1 ? (
              <span
                role="button"
                className="pages-tab-del"
                title="Delete page"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete page "${p.name}"?`)) onDelete(p.id)
                }}
              >
                ×
              </span>
            ) : null}
          </button>
        ),
      )}
      {adding ? (
        <input
          autoFocus
          placeholder="New page name…"
          className="pages-rename-input"
          onBlur={(e) => {
            if (e.target.value.trim()) onAdd(e.target.value.trim())
            setAdding(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') setAdding(false)
          }}
        />
      ) : (
        <button
          type="button"
          className="pages-tab pages-add"
          onClick={() => setAdding(true)}
        >
          + page
        </button>
      )}
    </div>
  )
}
