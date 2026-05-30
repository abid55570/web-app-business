'use client'
import type { CanvasBlock, PuckBlockManifest, PuckField } from '../lib/types'
import { ColorPicker } from './pickers/ColorPicker'
import { ImagePicker } from './pickers/ImagePicker'
import { ArrayRepeater } from './pickers/ArrayRepeater'

export function PropertiesPane({
  block,
  manifest,
  onChange,
}: {
  block: CanvasBlock | null
  manifest: PuckBlockManifest | null
  onChange: (propName: string, value: unknown) => void
}) {
  if (!block || !manifest) {
    return (
      <aside className="studio-right">
        <h2 className="panel-title">Properties</h2>
        <p className="props-empty">Click a block to edit its props.</p>
      </aside>
    )
  }
  return (
    <aside className="studio-right">
      <h2 className="panel-title">{manifest.displayName}</h2>
      {Object.entries(manifest.fields).length === 0 ? (
        <p className="props-empty">This block has no editable props.</p>
      ) : (
        Object.entries(manifest.fields).map(([name, field]) => (
          <FieldEditor
            key={name}
            name={name}
            field={field}
            value={block.props[name]}
            onChange={(v) => onChange(name, v)}
          />
        ))
      )}
    </aside>
  )
}

function FieldEditor({
  name,
  field,
  value,
  onChange,
}: {
  name: string
  field: PuckField
  value: unknown
  onChange: (v: unknown) => void
}) {
  // Heuristic: prop name → richer picker than the raw type implies.
  const isColor =
    /color|tint|bg|background|fill|stroke/i.test(name) &&
    field.type === 'text'
  const isImage =
    /image|photo|picture|avatar|logo|poster|cover|thumbnail/i.test(name) &&
    field.type === 'text'
  return (
    <div className="props-field">
      <label className="props-field-label">
        {field.label ?? name}
        <span className="props-field-type">
          ({isColor ? 'color' : isImage ? 'image' : field.type})
        </span>
        {field.required ? ' *' : ''}
      </label>
      {renderInput(field, value, onChange, isColor, isImage)}
      {field.description ? (
        <small className="props-field-hint">{field.description}</small>
      ) : null}
    </div>
  )
}

function renderInput(
  field: PuckField,
  value: unknown,
  onChange: (v: unknown) => void,
  isColor: boolean,
  isImage: boolean,
) {
  // Forced pickers from heuristics first.
  if (isColor) {
    return (
      <ColorPicker value={typeof value === 'string' ? value : ''} onChange={onChange} />
    )
  }
  if (isImage) {
    return (
      <ImagePicker value={typeof value === 'string' ? value : ''} onChange={onChange} />
    )
  }

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          className="props-field-input"
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          className="props-field-input"
          value={typeof value === 'number' ? value : ''}
          min={field.min}
          max={field.max}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value))
          }
        />
      )
    case 'select':
    case 'radio':
      return (
        <select
          className="props-field-input"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— choose —</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    case 'array':
      return (
        <ArrayRepeater
          value={value}
          onChange={onChange}
          itemSchemaHint={field.description}
        />
      )
    case 'object':
      return (
        <textarea
          className="props-field-input"
          rows={4}
          placeholder="JSON object"
          value={value ? JSON.stringify(value, null, 2) : ''}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value || '{}'))
            } catch {
              /* ignore */
            }
          }}
        />
      )
    case 'text':
    default:
      return (
        <input
          type="text"
          className="props-field-input"
          value={typeof value === 'string' ? value : ''}
          maxLength={field.max}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}
