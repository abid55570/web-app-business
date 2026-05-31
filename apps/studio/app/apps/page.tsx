'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type AppRow = {
  id: string
  outDir: string
  mtimeMs: number
  recipe: {
    id: string
    branding: { name?: string; tagline?: string; primary?: string }
    modules: string[]
    sections: string[]
    stack: { backend?: string; frontend?: string }
  }
}

export default function AppsListPage() {
  const router = useRouter()
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wizard/apps')
      .then((r) => r.json())
      .then((d) => setApps(d.apps ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="welcome-shell">
      <section className="welcome-card welcome-templates">
        <header>
          <h2>Your generated apps</h2>
          <p>
            {apps.length} app{apps.length === 1 ? '' : 's'} found.
            Click <strong>Edit</strong> to change branding, swap sections,
            toggle modules — the wirer regenerates in place.
          </p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#71717a' }}>Loading…</p>
        ) : apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <p className="welcome-emoji">📭</p>
            <h3 style={{ margin: '8px 0' }}>No apps yet</h3>
            <p style={{ color: '#64748b', marginBottom: 20 }}>Build one through the wizard.</p>
            <button type="button" className="btn-primary btn-lg" onClick={() => router.push('/welcome')}>
              Start the wizard →
            </button>
          </div>
        ) : (
          <div className="template-grid">
            {apps.map((a) => {
              const accent = a.recipe.branding.primary ?? '#6366f1'
              return (
                <button
                  key={a.id}
                  type="button"
                  className="template-card"
                  onClick={() => router.push(`/edit/${a.id}`)}
                  style={{ borderColor: accent + '44' }}
                >
                  <span className="template-icon" style={{ color: accent }}>📦</span>
                  <strong>{a.recipe.branding.name ?? a.id}</strong>
                  <span className="template-desc">
                    {a.recipe.branding.tagline || a.recipe.id}
                  </span>
                  <span className="template-bestfor">
                    {a.recipe.sections.length} section{a.recipe.sections.length === 1 ? '' : 's'} ·{' '}
                    {a.recipe.modules.length} module{a.recipe.modules.length === 1 ? '' : 's'}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="welcome-actions">
          <button type="button" className="btn-text" onClick={() => router.push('/')}>← Studio home</button>
          <button type="button" className="btn-primary btn-lg" onClick={() => router.push('/welcome')}>
            + Build new app
          </button>
        </div>
      </section>
    </div>
  )
}
