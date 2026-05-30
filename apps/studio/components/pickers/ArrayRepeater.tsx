'use client'

export function ArrayRepeater({
  value,
  onChange,
  itemSchemaHint,
}: {
  value: unknown
  onChange: (v: unknown) => void
  itemSchemaHint?: string
}) {
  const list = Array.isArray(value) ? value : []
  const isPrimitiveList =
    list.length === 0 ||
    list.every((it) => typeof it === 'string' || typeof it === 'number')

  function addRow() {
    if (isPrimitiveList) onChange([...list, ''])
    else onChange([...list, {}])
  }

  function removeRow(idx: number) {
    onChange(list.filter((_, i) => i !== idx))
  }

  function moveRow(idx: number, dir: -1 | 1) {
    const next = list.slice()
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onChange(next)
  }

  function updatePrimitive(idx: number, v: string) {
    const next = list.slice()
    next[idx] = v
    onChange(next)
  }

  function updateObject(idx: number, key: string, v: string) {
    const next = list.slice()
    const row = { ...(next[idx] as Record<string, unknown>) }
    row[key] = v
    next[idx] = row
    onChange(next)
  }

  function addKey(idx: number, key: string) {
    if (!key) return
    const next = list.slice()
    const row = { ...(next[idx] as Record<string, unknown>) }
    if (!(key in row)) row[key] = ''
    next[idx] = row
    onChange(next)
  }

  return (
    <div className="picker-array">
      {itemSchemaHint ? (
        <p className="picker-array-hint">Each row: {itemSchemaHint}</p>
      ) : null}
      <ul className="picker-array-rows">
        {list.map((row, i) => (
          <li key={i} className="picker-array-row">
            <div className="picker-array-row-hdr">
              <span className="picker-array-row-idx">#{i + 1}</span>
              <div className="picker-array-row-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Move up"
                  onClick={() => moveRow(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Move down"
                  onClick={() => moveRow(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Delete row"
                  onClick={() => removeRow(i)}
                >
                  ×
                </button>
              </div>
            </div>
            {isPrimitiveList ? (
              <input
                type="text"
                className="props-field-input"
                value={typeof row === 'string' ? row : String(row ?? '')}
                onChange={(e) => updatePrimitive(i, e.target.value)}
              />
            ) : (
              <div className="picker-array-obj">
                {Object.entries(row as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="picker-array-kv">
                    <label className="picker-array-key">{k}</label>
                    <input
                      type="text"
                      className="props-field-input"
                      value={
                        typeof v === 'string' ? v : JSON.stringify(v ?? '')
                      }
                      onChange={(e) => updateObject(i, k, e.target.value)}
                    />
                  </div>
                ))}
                <AddKeyInput onAdd={(k) => addKey(i, k)} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="btn picker-array-add" onClick={addRow}>
        + Add row
      </button>
    </div>
  )
}

function AddKeyInput({ onAdd }: { onAdd: (k: string) => void }) {
  return (
    <div className="picker-array-addkey">
      <input
        type="text"
        placeholder="+ add key…"
        className="props-field-input"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd((e.target as HTMLInputElement).value)
            ;(e.target as HTMLInputElement).value = ''
          }
        }}
      />
    </div>
  )
}
