'use client'
import type { CanvasBlock, PuckBlockManifest } from '../lib/types'
import { getCategoryStyle } from '../lib/category-styles'

const TEXT_KEYS_PRIMARY = ['heading', 'title', 'label', 'eyebrow']
const TEXT_KEYS_BODY = ['subheading', 'body', 'description']

export function SchematicBlock({
  block,
  manifest,
  selected,
  onClick,
  onMove,
  onDelete,
  onDuplicate,
  onInlineEdit,
}: {
  block: CanvasBlock
  manifest: PuckBlockManifest
  selected: boolean
  onClick: () => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  onDuplicate: () => void
  onInlineEdit: (key: string, value: string) => void
}) {
  const style = getCategoryStyle(manifest.category)
  const primaryKey = TEXT_KEYS_PRIMARY.find((k) => k in (manifest.fields ?? {}))
  const bodyKey = TEXT_KEYS_BODY.find((k) => k in (manifest.fields ?? {}))
  return (
    <div
      className={`schematic-block ${selected ? 'selected' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-block-id', block.instanceId)
        e.dataTransfer.effectAllowed = 'move'
      }}
      style={{ borderColor: selected ? style.swatch : undefined }}
    >
      <div className="schematic-hdr">
        <span aria-hidden className="schematic-grip" title="Drag to reorder">⋮⋮</span>
        <span
          className="schematic-cat"
          style={{ background: style.swatch }}
          title={manifest.category}
        >
          {style.hint}
        </span>
        <div className="schematic-meta">
          <p className="schematic-name">{manifest.displayName}</p>
          <p className="schematic-cat-label">{manifest.category}</p>
        </div>
        <div className="canvas-block-actions">
          <button type="button" className="icon-btn" title="Duplicate (⌘D)" onClick={(e) => { e.stopPropagation(); onDuplicate() }}>⎘</button>
          <button type="button" className="icon-btn" title="Move up (⌘↑)" onClick={(e) => { e.stopPropagation(); onMove(-1) }}>↑</button>
          <button type="button" className="icon-btn" title="Move down (⌘↓)" onClick={(e) => { e.stopPropagation(); onMove(1) }}>↓</button>
          <button type="button" className="icon-btn" title="Delete (⌫)" onClick={(e) => { e.stopPropagation(); onDelete() }}>×</button>
        </div>
      </div>
      <Template
        template={style.template}
        block={block}
        swatch={style.swatch}
        primaryKey={primaryKey}
        bodyKey={bodyKey}
        onInlineEdit={onInlineEdit}
      />
    </div>
  )
}

function Template({
  template,
  block,
  swatch,
  primaryKey,
  bodyKey,
  onInlineEdit,
}: {
  template: 'hero' | 'grid' | 'list' | 'band' | 'card' | 'inline' | 'media'
  block: CanvasBlock
  swatch: string
  primaryKey: string | undefined
  bodyKey: string | undefined
  onInlineEdit: (key: string, value: string) => void
}) {
  const text =
    primaryKey && typeof block.props[primaryKey] === 'string'
      ? (block.props[primaryKey] as string)
      : '— text —'
  const body =
    bodyKey && typeof block.props[bodyKey] === 'string'
      ? (block.props[bodyKey] as string)
      : ''
  const Heading = ({ cls, isSmall = false }: { cls: string; isSmall?: boolean }) => (
    <p
      className={cls}
      contentEditable={!!primaryKey}
      suppressContentEditableWarning
      onClick={(e) => e.stopPropagation()}
      onBlur={(e) => {
        if (primaryKey) onInlineEdit(primaryKey, e.currentTarget.textContent ?? '')
      }}
      title={primaryKey ? 'Click to edit' : undefined}
      style={isSmall ? undefined : undefined}
    >
      {text}
    </p>
  )
  const Body = () =>
    body && bodyKey ? (
      <p
        className="schematic-body"
        contentEditable
        suppressContentEditableWarning
        onClick={(e) => e.stopPropagation()}
        onBlur={(e) => onInlineEdit(bodyKey, e.currentTarget.textContent ?? '')}
        title="Click to edit"
      >
        {body}
      </p>
    ) : null
  switch (template) {
    case 'hero':
      return (
        <div className="schematic-tpl schematic-hero">
          <div className="schematic-bar" style={{ background: swatch }} />
          <Heading cls="schematic-heading" />
          <Body />
          <span className="schematic-btn" style={{ background: swatch }} />
        </div>
      )
    case 'grid':
      return (
        <div className="schematic-tpl schematic-grid">
          <Heading cls="schematic-heading-sm" isSmall />
          <Body />
          <div className="schematic-grid-cells">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} style={{ background: swatch, opacity: 0.15 + i * 0.1 }} />
            ))}
          </div>
        </div>
      )
    case 'list':
      return (
        <div className="schematic-tpl">
          <Heading cls="schematic-heading-sm" isSmall />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="schematic-list-row" style={{ width: `${100 - i * 10}%`, background: swatch, opacity: 0.15 }} />
          ))}
        </div>
      )
    case 'band':
      return (
        <div className="schematic-tpl schematic-band" style={{ background: `${swatch}22` }}>
          <Heading cls="schematic-heading-sm" isSmall />
          <span className="schematic-btn" style={{ background: swatch }} />
        </div>
      )
    case 'inline':
      return (
        <div className="schematic-tpl schematic-inline">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} style={{ background: swatch, opacity: 0.5 }} />
          ))}
        </div>
      )
    case 'media':
      return (
        <div className="schematic-tpl">
          <div className="schematic-media" style={{ background: `${swatch}33` }}>
            <Heading cls="" />
          </div>
        </div>
      )
    case 'card':
    default:
      return (
        <div className="schematic-tpl schematic-card" style={{ borderColor: `${swatch}55` }}>
          <Heading cls="schematic-heading-sm" isSmall />
          <Body />
        </div>
      )
  }
}
