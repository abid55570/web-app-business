'use client'
import { useState } from 'react'
import type { CanvasBlock, PuckBlockManifest } from '../lib/types'
import { SchematicBlock } from './SchematicBlock'

const VP_WIDTHS: Record<string, number | null> = {
  sm: 390,
  md: 768,
  lg: 1100,
  full: null,
}

export function Canvas({
  page,
  manifestsById,
  selectedId,
  viewport,
  onSelect,
  onMove,
  onDelete,
  onDuplicate,
  onReorder,
  onInsertAt,
  onInlineEdit,
}: {
  page: CanvasBlock[]
  manifestsById: Record<string, PuckBlockManifest>
  selectedId: string | null
  viewport: 'sm' | 'md' | 'lg' | 'full'
  onSelect: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onReorder: (fromId: string, toIndex: number) => void
  onInsertAt: (blockId: string, atIndex: number) => void
  onInlineEdit: (id: string, propName: string, value: unknown) => void
}) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const w = VP_WIDTHS[viewport]

  function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(null)
    const fromId = e.dataTransfer.getData('application/x-block-id')
    const blockId = e.dataTransfer.getData('application/x-palette-block')
    if (fromId) onReorder(fromId, idx)
    else if (blockId) onInsertAt(blockId, idx)
  }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  if (page.length === 0) {
    return (
      <main className="studio-center">
        <div
          className="canvas-empty"
          onDragOver={(e) => onDragOver(e, 0)}
          onDrop={(e) => onDrop(e, 0)}
        >
          <p>
            Empty canvas. Click or drag a section from the left palette.
          </p>
          <p className="canvas-empty-hint">
            Tip: <kbd>/</kbd> focus search · <kbd>⌘Z</kbd> undo · <kbd>⌘D</kbd> duplicate
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="studio-center">
      <div
        className="canvas-frame"
        style={w ? { maxWidth: w, transition: 'max-width 200ms' } : undefined}
      >
        <DropZone
          idx={0}
          active={dragOverIdx === 0}
          onDragOver={(e) => onDragOver(e, 0)}
          onDragLeave={() => setDragOverIdx(null)}
          onDrop={(e) => onDrop(e, 0)}
        />
        {page.map((b, i) => {
          const m = manifestsById[b.blockId]
          if (!m) return null
          return (
            <div key={b.instanceId}>
              <SchematicBlock
                block={b}
                manifest={m}
                selected={selectedId === b.instanceId}
                onClick={() => onSelect(b.instanceId)}
                onMove={(dir) => onMove(b.instanceId, dir)}
                onDelete={() => onDelete(b.instanceId)}
                onDuplicate={() => onDuplicate(b.instanceId)}
                onInlineEdit={(key, val) => onInlineEdit(b.instanceId, key, val)}
              />
              <DropZone
                idx={i + 1}
                active={dragOverIdx === i + 1}
                onDragOver={(e) => onDragOver(e, i + 1)}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={(e) => onDrop(e, i + 1)}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
}

function DropZone({
  idx,
  active,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  idx: number
  active: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}) {
  return (
    <div
      className={`canvas-dropzone ${active ? 'active' : ''}`}
      data-idx={idx}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {active ? <span>Drop here</span> : null}
    </div>
  )
}
