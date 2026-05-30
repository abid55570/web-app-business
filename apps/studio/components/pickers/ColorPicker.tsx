'use client'
import { useState } from 'react'

const THEME_SWATCHES = [
  '#6366f1', // primary indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#facc15', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#71717a', // neutral
  '#18181b', // ink
]

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [showHex, setShowHex] = useState(false)
  return (
    <div>
      <div className="picker-color-row">
        {THEME_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            className={`picker-swatch ${value === c ? 'selected' : ''}`}
            style={{ background: c }}
          />
        ))}
        <button
          type="button"
          title="Custom color"
          onClick={() => setShowHex((s) => !s)}
          className="picker-swatch picker-swatch-custom"
        >
          +
        </button>
      </div>
      {showHex ? (
        <div className="picker-color-hex">
          <input
            type="color"
            value={isValidHex(value) ? value : '#6366f1'}
            onChange={(e) => onChange(e.target.value)}
            className="picker-color-native"
          />
          <input
            type="text"
            value={value ?? ''}
            placeholder="#rrggbb or var(--color-...)"
            onChange={(e) => onChange(e.target.value)}
            className="props-field-input"
            style={{ flex: 1 }}
          />
        </div>
      ) : null}
    </div>
  )
}

function isValidHex(v: string | undefined): boolean {
  return !!v && /^#[0-9a-fA-F]{3,8}$/.test(v)
}
