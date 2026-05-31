'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Section = { id: string; selected: boolean }
type Module = { id: string; displayName: string; description: string; dependsOn: string[]; category: string }
type ModuleCategory = { key: string; label: string; modules: Module[] }

type AppRecipe = {
  id: string
  branding: { name?: string; tagline?: string; primary?: string }
  sections?: string[]
  modules?: Array<{ id: string }>
}

export default function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [outDir, setOutDir] = useState('')
  const [recipe, setRecipe] = useState<AppRecipe | null>(null)
  const [allModules, setAllModules] = useState<ModuleCategory[]>([])
  const [allSections, setAllSections] = useState<string[]>([])
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [primary, setPrimary] = useState('#6366f1')
  const [pickedModules, setPickedModules] = useState<Set<string>>(new Set())
  const [pickedSections, setPickedSections] = useState<Set<string>>(new Set())
  const [saveLog, setSaveLog] = useState<string[]>([])

  // Load the app + module catalogue in parallel.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/wizard/apps/${id}`).then((r) => r.json()),
      fetch('/api/wizard/modules').then((r) => r.json()),
    ])
      .then(([app, cat]) => {
        if (cancelled) return
        const r = app.recipe as AppRecipe
        setRecipe(r)
        setOutDir(app.outDir ?? '')
        setName(r.branding?.name ?? '')
        setTagline(r.branding?.tagline ?? '')
        setPrimary(r.branding?.primary ?? '#6366f1')
        setPickedModules(new Set((r.modules ?? []).map((m) => m.id)))
        setPickedSections(new Set(r.sections ?? []))
        setAllModules(cat.categories ?? [])
        // Flatten all sections across categories — pull from the recipe
        // initially, then expand as user toggles. (We don't have a
        // sections catalogue endpoint yet; defer to recipe-known list.)
        setAllSections(r.sections ?? [])
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  function toggleModule(mid: string) {
    setPickedModules((s) => {
      const n = new Set(s)
      if (n.has(mid)) n.delete(mid)
      else n.add(mid)
      return n
    })
  }
  function toggleSection(sid: string) {
    setPickedSections((s) => {
      const n = new Set(s)
      if (n.has(sid)) n.delete(sid)
      else n.add(sid)
      return n
    })
  }

  async function save() {
    setSaving(true)
    setSaveLog(['Saving recipe…', 'Re-running wirer…'])
    try {
      const res = await fetch(`/api/wizard/apps/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          branding: { name, tagline, primary },
          modules: Array.from(pickedModules),
          sections: Array.from(pickedSections),
        }),
      })
      const data = await res.json()
      setSaveLog((l) => [...l, ...(data.log ?? []).slice(-12)])
      if (data.ok) setSaveLog((l) => [...l, '✓ Saved. Restart your dev server to see changes.'])
      else setSaveLog((l) => [...l, '✗ FAILED — see log above.'])
    } catch (err) {
      setSaveLog((l) => [...l, 'ERROR: ' + (err as Error).message])
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="welcome-shell">
        <section className="welcome-card welcome-finishing">
          <p className="welcome-emoji">⏳</p>
          <h2>Loading {id}…</h2>
        </section>
      </div>
    )
  }
  if (!recipe) {
    return (
      <div className="welcome-shell">
        <section className="welcome-card">
          <h2>App not found</h2>
          <p>No recipe.json at output/{id}/.</p>
          <button type="button" className="btn-primary btn-lg" onClick={() => router.push('/welcome')}>
            ← Back to wizard
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="welcome-shell">
      <section className="welcome-card welcome-templates">
        <header>
          <h2>Edit {recipe.branding?.name ?? id}</h2>
          <p>
            Change branding, swap sections, toggle modules. Click <strong>Save & regenerate</strong> when done —
            the wirer re-runs in place. Anything you put under <code>overrides/</code> is preserved.
          </p>
        </header>

        <h3 className="wiz-done-h3">Branding</h3>
        <label className="brand-field">
          <span>App name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        </label>
        <label className="brand-field">
          <span>Tagline</span>
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={80} />
        </label>
        <label className="brand-field">
          <span>Brand colour</span>
          <div className="brand-color-row">
            {['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#18181b'].map((c) => (
              <button key={c} type="button" className={`brand-swatch ${primary === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setPrimary(c)} />
            ))}
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="brand-color-native" />
          </div>
        </label>

        <h3 className="wiz-done-h3">Sections in this app</h3>
        <div className="wiz-mod-list">
          {allSections.length === 0 ? (
            <p style={{color:'#64748b', fontSize:13}}>No sections recorded in recipe. Edit page.tsx directly under <code>frontend/src/app/</code> or override it.</p>
          ) : (
            allSections.map((sid) => {
              const active = pickedSections.has(sid)
              return (
                <button key={sid} type="button" className={`wiz-mod-card ${active ? 'on' : ''}`} onClick={() => toggleSection(sid)}>
                  <span className="wiz-mod-check">{active ? '✓' : ''}</span>
                  <div className="wiz-mod-body">
                    <strong>{sid}</strong>
                    <span className="wiz-mod-id">section</span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <h3 className="wiz-done-h3">Modules</h3>
        <div className="wiz-modules">
          {allModules.map((cat) => (
            <div key={cat.key} className="wiz-mod-cat">
              <h4 className="wiz-mod-cat-label">{cat.label}</h4>
              <div className="wiz-mod-list">
                {cat.modules.map((m) => {
                  const active = pickedModules.has(m.id)
                  return (
                    <button key={m.id} type="button" className={`wiz-mod-card ${active ? 'on' : ''}`} onClick={() => toggleModule(m.id)}>
                      <span className="wiz-mod-check">{active ? '✓' : ''}</span>
                      <div className="wiz-mod-body">
                        <strong>{m.displayName}</strong>
                        <span className="wiz-mod-id">{m.id}</span>
                        {m.description ? <p>{m.description}</p> : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {saveLog.length > 0 ? (
          <pre className="wiz-build-log">
            {saveLog.map((l, i) => <div key={i}>{l}</div>)}
          </pre>
        ) : null}

        <div className="welcome-actions">
          <button type="button" className="btn-text" onClick={() => router.push('/welcome')}>← Back</button>
          <div style={{display:'flex', gap:8}}>
            <button type="button" className="btn-text" onClick={() => router.push(`/?app=${id}`)}>Open in Studio →</button>
            <button type="button" className="btn-primary btn-lg" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : '⚡ Save & regenerate'}
            </button>
          </div>
        </div>
        <p className="welcome-footnote" style={{marginTop:16}}>
          Output: <code>{outDir}</code>
        </p>
      </section>
    </div>
  )
}
