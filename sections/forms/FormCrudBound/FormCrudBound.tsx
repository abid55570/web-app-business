'use client'
import { useState } from 'react'

export type FormCrudBoundField = {
  name: string
  /** HTML input type. 'text' / 'email' / 'password' / 'number' / 'tel' /
   *  'url' / 'date' / 'textarea' / 'checkbox' / 'select' */
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea' | 'checkbox' | 'select'
  label: string
  required?: boolean
  placeholder?: string
  options?: string[]  // for select
}

export type FormCrudBoundProps = {
  modelName: string
  endpoint?: string
  fields: FormCrudBoundField[]
  submitLabel?: string
  successMessage?: string
  accentColor?: string
}

/**
 * Form auto-wired to a backend CRUD endpoint. Submits JSON via fetch
 * to `endpoint` (defaults to `/api/<modelName>` lowercase). All fields
 * rendered from the `fields` prop — labels, types, required marks all
 * derive from there. Studio's Schema tab + form-binder helper can write
 * sensible defaults.
 */
export function FormCrudBound({
  modelName,
  endpoint,
  fields,
  submitLabel = 'Save',
  successMessage = '✓ Saved',
  accentColor = '#6366f1',
}: FormCrudBoundProps) {
  const apiUrl = endpoint ?? `/api/${modelName.toLowerCase()}`
  const [values, setValues] = useState<Record<string, string | boolean | number>>(() => {
    const init: Record<string, string | boolean | number> = {}
    for (const f of fields) {
      if (f.type === 'checkbox') init[f.name] = false
      else if (f.type === 'number') init[f.name] = 0
      else init[f.name] = ''
    }
    return init
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setOk(false)
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = typeof body.detail === 'string' ? body.detail
          : typeof body.message === 'string' ? body.message
          : `HTTP ${res.status}`
        throw new Error(msg)
      }
      setOk(true)
      // Reset to empty after success
      const cleared: Record<string, string | boolean | number> = {}
      for (const f of fields) cleared[f.name] = f.type === 'checkbox' ? false : f.type === 'number' ? 0 : ''
      setValues(cleared)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-12">
      <h2 className="mb-2 text-2xl font-bold tracking-tight">{modelName}</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Submits to <code className="font-mono text-xs bg-secondary/30 rounded px-1.5 py-0.5">{apiUrl}</code>
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {f.label}{f.required ? ' *' : ''}
            </span>
            {f.type === 'textarea' ? (
              <textarea
                required={f.required}
                value={String(values[f.name] ?? '')}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            ) : f.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
            ) : f.type === 'select' ? (
              <select
                required={f.required}
                value={String(values[f.name] ?? '')}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Select…</option>
                {(f.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={f.type}
                required={f.required}
                value={String(values[f.name] ?? '')}
                onChange={(e) => setValues({ ...values, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
          </label>
        ))}

        {error ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        ) : null}
        {ok ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: accentColor }}
        >
          {busy ? 'Submitting…' : submitLabel}
        </button>
      </form>
    </section>
  )
}
