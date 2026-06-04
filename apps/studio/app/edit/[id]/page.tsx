'use client'

/**
 * Studio v2 — App Editor
 *
 * Opens an existing wizard app. Shows:
 *   - Pages tabs (Home, /pricing, /about, /docs, /blog, /login, /signup, /dashboard)
 *   - Live iframe of the actual running app (user must boot `run.bat` to see it)
 *   - Left rail: visual section palette (547 sections grouped by category, thumbnails)
 *   - Right rail: "Sections in this page" + properties panel for selected section
 *   - Bottom tabs: Modules / Recipe (raw)
 *
 * Sprint 1 scope:
 *   - View pages + iframe
 *   - Add section from palette → patches recipe → regen
 *   - Remove section from page
 *   - Reorder sections (move up/down)
 *   - Edit branding (name, tagline, color)
 *   - Save → POST /api/wizard/apps/[id] → wirer regens in place
 *
 * Sprint 2 (next):
 *   - Click element inside iframe → highlights → edit props inline
 *   - Element-level text/color/image edits via studio-overrides.json
 *
 * Sprint 3:
 *   - Drag-reorder pages, theme switcher live preview, real Playwright PNG thumbnails
 *
 * Sprint 4:
 *   - Monaco code editor for module files + deploy buttons
 */

import { use, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type AppRecipe = {
  id: string
  branding: { name?: string; tagline?: string; primary?: string }
  sections?: string[]
  modules?: Array<{ id: string }>
  extraPages?: string[]
  stack?: { backend?: string; frontend?: string }
}

type CatalogSection = {
  id: string
  displayName: string
  description: string
  category: string
  tags: string[]
  thumbnail: string
  propCount: number
}
type CatalogCategory = { key: string; label: string; sections: CatalogSection[] }

type Module = {
  id: string
  displayName: string
  description: string
  dependsOn: string[]
  category: string
}
type ModuleCategory = { key: string; label: string; modules: Module[] }

type PageDef = { id: string; route: string; label: string; isAuth?: boolean }

type BottomTab = 'modules' | 'recipe' | 'help'

export default function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: wizardId } = use(params)

  // Data
  const [loading, setLoading] = useState(true)
  const [recipe, setRecipe] = useState<AppRecipe | null>(null)
  const [outDir, setOutDir] = useState('')
  const [catalog, setCatalog] = useState<CatalogCategory[]>([])
  const [allModules, setAllModules] = useState<ModuleCategory[]>([])

  // Editor state
  const [activePageId, setActivePageId] = useState('home')
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number | null>(null)
  const [appPort, setAppPort] = useState(3000)
  const [iframeKey, setIframeKey] = useState(0) // bump to force iframe reload
  const [appReachable, setAppReachable] = useState<boolean | null>(null)
  const [bottomTab, setBottomTab] = useState<BottomTab>('modules')
  /** Collapsed by default — gives the iframe full vertical space. */
  const [bottomOpen, setBottomOpen] = useState(false)

  // Palette state
  const [paletteSearch, setPaletteSearch] = useState('')
  const [paletteCategory, setPaletteCategory] = useState<string>('all')

  // Branding inputs (local copy, save patches them all)
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [primary, setPrimary] = useState('#6366f1')

  // Saving
  const [saving, setSaving] = useState(false)
  const [saveLog, setSaveLog] = useState<string[]>([])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Initial data load
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/wizard/apps/${wizardId}`).then((r) => r.json()),
      fetch('/api/sections/catalog').then((r) => r.json()),
      fetch('/api/wizard/modules').then((r) => r.json()),
    ])
      .then(([app, cat, mods]) => {
        if (cancelled) return
        const r = app.recipe as AppRecipe
        setRecipe(r)
        setOutDir(app.outDir ?? '')
        setName(r.branding?.name ?? '')
        setTagline(r.branding?.tagline ?? '')
        setPrimary(r.branding?.primary ?? '#6366f1')
        setCatalog(cat.categories ?? [])
        setAllModules(mods.categories ?? [])
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [wizardId])

  // Probe the generated app's dev server.
  useEffect(() => {
    let cancelled = false
    function probe() {
      // Use no-cors HEAD via Image() — works without CORS exposure.
      const img = new Image()
      const timeout = setTimeout(() => { if (!cancelled) setAppReachable(false) }, 2500)
      img.onload = img.onerror = () => {
        clearTimeout(timeout)
        if (cancelled) return
        // Both events fire when port is open; only timeout means closed.
        setAppReachable(true)
      }
      img.src = `http://localhost:${appPort}/favicon.ico?_p=${Date.now()}`
    }
    probe()
    const t = setInterval(probe, 6000)
    return () => { cancelled = true; clearInterval(t) }
  }, [appPort])

  // Derive pages list from recipe.extraPages + always-present routes.
  const pages: PageDef[] = useMemo(() => {
    const list: PageDef[] = [{ id: 'home', route: '/', label: 'Home' }]
    for (const p of recipe?.extraPages ?? []) {
      list.push({ id: p, route: `/${p}`, label: `/${p}` })
    }
    const hasAuth = (recipe?.modules ?? []).some((m) => m.id === 'auth-jwt')
    if (hasAuth) {
      list.push({ id: 'signup', route: '/signup', label: '/signup', isAuth: true })
      list.push({ id: 'login', route: '/login', label: '/login', isAuth: true })
      list.push({ id: 'dashboard', route: '/dashboard', label: '/dashboard', isAuth: true })
    }
    return list
  }, [recipe])

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0]!
  // NOTE: iframe is keyed by `${activePageId}-${iframeKey}` so every tab
  // switch forces a fresh mount — works around generated app's
  // next/navigation router.replace() leaving the previous iframe stuck
  // on the redirected URL (e.g. /dashboard → /login when not signed in).
  // Sprint 1: only the homepage exposes editable section list via recipe.sections.
  // Extra pages have their sections baked by derive-extra-pages — Sprint 2/3 will
  // surface those as editable too.
  const isHomePage = activePage.id === 'home'
  const homeSections = recipe?.sections ?? []

  // Palette filtering
  const filteredCatalog = useMemo(() => {
    const q = paletteSearch.trim().toLowerCase()
    return catalog
      .filter((c) => paletteCategory === 'all' || c.key === paletteCategory)
      .map((c) => ({
        ...c,
        sections: c.sections.filter(
          (s) => !q || s.id.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.sections.length > 0)
  }, [catalog, paletteSearch, paletteCategory])

  // ── Actions ──────────────────────────────────────────────────────

  async function addSectionToPage(sectionId: string) {
    if (!isHomePage) {
      alert('Sprint 1 only lets you edit the Home page sections. Extra-page editing arrives in Sprint 2.')
      return
    }
    const next = [...homeSections, sectionId]
    await saveRecipe({ sections: next })
    setSelectedSectionIdx(next.length - 1)
  }

  async function removeSectionAt(idx: number) {
    if (!isHomePage) return
    const next = homeSections.filter((_, i) => i !== idx)
    await saveRecipe({ sections: next })
    setSelectedSectionIdx(null)
  }

  async function moveSection(idx: number, dir: -1 | 1) {
    if (!isHomePage) return
    const target = idx + dir
    if (target < 0 || target >= homeSections.length) return
    const next = [...homeSections]
    ;[next[idx], next[target]] = [next[target]!, next[idx]!]
    await saveRecipe({ sections: next })
    setSelectedSectionIdx(target)
  }

  async function saveRecipe(patch: { branding?: AppRecipe['branding']; sections?: string[]; modules?: string[] }) {
    setSaving(true)
    setSaveLog((l) => ['→ ' + (Object.keys(patch).join(', ')), ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!data.ok) {
        setSaveLog((l) => ['✗ regen failed', ...((data.log ?? []) as string[]).slice(-3), ...l])
      } else {
        setSaveLog((l) => ['✓ saved + regen', ...l])
        // Refetch recipe
        const fresh = await fetch(`/api/wizard/apps/${wizardId}`).then((r) => r.json())
        setRecipe(fresh.recipe as AppRecipe)
        // Force iframe reload to see changes
        setIframeKey((k) => k + 1)
      }
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
    } finally {
      setSaving(false)
    }
  }

  async function saveBranding() {
    await saveRecipe({ branding: { name, tagline, primary } })
  }

  // ── Render ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="se-loading">
        <div className="se-spinner">⏳ Loading {wizardId}…</div>
      </div>
    )
  }
  if (!recipe) {
    return (
      <div className="se-loading">
        <p>App not found.</p>
        <button type="button" onClick={() => router.push('/apps')}>← Back to apps</button>
      </div>
    )
  }

  const sectionMeta = (id: string): CatalogSection | null => {
    for (const c of catalog) {
      const found = c.sections.find((s) => s.id === id)
      if (found) return found
    }
    return null
  }

  return (
    <div className="se-root">
      {/* ─── HEADER ─────────────────────────────── */}
      <header className="se-header">
        <button type="button" className="se-back" onClick={() => router.push('/apps')}>← Apps</button>
        <div className="se-brand">
          <strong>{recipe.branding?.name ?? wizardId}</strong>
          <span className="se-brand-id">{wizardId}</span>
        </div>
        <div className="se-app-status">
          {appReachable === null ? <span className="se-dot se-dot-idle" /> :
            appReachable ? <span className="se-dot se-dot-on" /> : <span className="se-dot se-dot-off" />}
          <span className="se-app-label">
            App: {appReachable === null ? 'probing…' : appReachable ? `running on :${appPort}` : `not reachable — start run.bat in ${outDir}`}
          </span>
        </div>
        <div className="se-header-actions">
          <button type="button" onClick={() => setIframeKey((k) => k + 1)} title="Reload preview">↻</button>
          <a href={`http://localhost:${appPort}`} target="_blank" rel="noreferrer" className="se-open">↗ Open in tab</a>
          <button type="button" className="se-save" onClick={() => saveBranding()} disabled={saving}>
            {saving ? 'Saving…' : '⌘S Save brand'}
          </button>
        </div>
      </header>

      {/* ─── PAGES TABS ─────────────────────────── */}
      <nav className="se-tabs">
        {pages.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`se-tab ${p.id === activePageId ? 'on' : ''} ${p.isAuth ? 'se-tab-auth' : ''}`}
            onClick={() => setActivePageId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* ─── MAIN GRID ─────────────────────────── */}
      <div className="se-grid">
        {/* LEFT — visual palette */}
        <aside className="se-pane se-left">
          <div className="se-pane-head">
            <strong>Sections library</strong>
            <span className="se-count">{filteredCatalog.reduce((n, c) => n + c.sections.length, 0)} / 547</span>
          </div>
          <input
            type="search"
            placeholder="Search 547 sections…"
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            className="se-palette-search"
          />
          <select value={paletteCategory} onChange={(e) => setPaletteCategory(e.target.value)} className="se-palette-cat">
            <option value="all">All categories</option>
            {catalog.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <div className="se-palette-grid">
            {filteredCatalog.map((c) => (
              <div key={c.key} className="se-palette-group">
                <div className="se-palette-group-label">{c.label}</div>
                <div className="se-palette-cards">
                  {c.sections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="se-palette-card"
                      title={s.description || s.id}
                      onClick={() => addSectionToPage(s.id)}
                    >
                      <img src={s.thumbnail} alt={s.displayName} className="se-palette-thumb" loading="lazy" />
                      <span className="se-palette-name">{s.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER — iframe preview */}
        <main className="se-pane se-center">
          {appReachable ? (
            <iframe
              key={`${activePageId}-${iframeKey}`}
              ref={iframeRef}
              src={`http://localhost:${appPort}${activePage.route}`}
              className="se-iframe"
              title="Live app preview"
            />
          ) : (
            <div className="se-iframe-empty">
              <p className="se-iframe-empty-icon">🪟</p>
              <h2>App preview not running</h2>
              <p>Boot the generated app to see it here.</p>
              <pre className="se-iframe-empty-code">{`cd "${outDir}"\n.\\run.bat`}</pre>
              <p className="se-iframe-empty-help">
                Then refresh this page (or it&apos;ll auto-detect within a few seconds).
              </p>
            </div>
          )}
        </main>

        {/* RIGHT — sections in this page + properties */}
        <aside className="se-pane se-right">
          <div className="se-pane-head">
            <strong>{isHomePage ? 'Sections on this page' : `${activePage.label} (read-only)`}</strong>
          </div>
          {!isHomePage ? (
            <p className="se-help">
              This is a derived page from the wizard&apos;s &quot;Pages&quot; step.
              Sprint 2 will make extra-page sections editable here too. For now, edit
              the file directly under <code>{outDir}/frontend/src/app{activePage.route}/page.tsx</code>.
            </p>
          ) : (
            <ol className="se-section-list">
              {homeSections.map((sid, i) => {
                const meta = sectionMeta(sid)
                const selected = selectedSectionIdx === i
                return (
                  <li key={`${sid}-${i}`} className={`se-section-row ${selected ? 'on' : ''}`}>
                    <button
                      type="button"
                      className="se-section-row-pick"
                      onClick={() => setSelectedSectionIdx(selected ? null : i)}
                    >
                      <img src={meta?.thumbnail ?? `/api/sections/thumbnail/${sid}`} alt="" className="se-section-row-thumb" />
                      <div className="se-section-row-meta">
                        <strong>{meta?.displayName ?? sid}</strong>
                        <span>{meta?.category ?? ''}</span>
                      </div>
                    </button>
                    <div className="se-section-row-actions">
                      <button type="button" disabled={i === 0} onClick={() => moveSection(i, -1)} title="Move up">↑</button>
                      <button type="button" disabled={i === homeSections.length - 1} onClick={() => moveSection(i, 1)} title="Move down">↓</button>
                      <button type="button" onClick={() => removeSectionAt(i)} title="Remove" className="se-section-row-rm">✕</button>
                    </div>
                  </li>
                )
              })}
              {homeSections.length === 0 ? (
                <li className="se-section-empty">No sections yet. Click one in the library on the left to add.</li>
              ) : null}
            </ol>
          )}

          <div className="se-divider" />

          {/* Properties — Sprint 1: branding only. Sprint 2: per-element props. */}
          <div className="se-pane-head"><strong>Brand</strong></div>
          <label className="se-field">
            <span>App name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="se-field">
            <span>Tagline</span>
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </label>
          <label className="se-field">
            <span>Primary colour</span>
            <div className="se-swatch-row">
              {['#6366f1','#a855f7','#ec4899','#ef4444','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#18181b'].map((c) => (
                <button key={c} type="button" className={`se-swatch ${primary === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setPrimary(c)} />
              ))}
              <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="se-swatch se-swatch-pick" />
            </div>
          </label>

          {selectedSectionIdx !== null && isHomePage ? (
            <>
              <div className="se-divider" />
              <div className="se-pane-head"><strong>Section props</strong></div>
              <p className="se-help">
                Sprint 2 adds inline prop editing for the selected section.
                For now, edit <code>src/app/page.tsx</code> in the generated app
                to change props — or drop a replacement under <code>overrides/</code>.
              </p>
              <p className="se-help">
                Selected: <code>{homeSections[selectedSectionIdx]}</code>
              </p>
            </>
          ) : null}

          {saveLog.length > 0 ? (
            <>
              <div className="se-divider" />
              <div className="se-pane-head"><strong>Activity</strong></div>
              <ul className="se-savelog">
                {saveLog.slice(0, 6).map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </>
          ) : null}
        </aside>
      </div>

      {/* ─── BOTTOM TABS (collapsible) ───────────── */}
      <footer className={`se-bottom ${bottomOpen ? 'se-bottom-open' : 'se-bottom-collapsed'}`}>
        <nav className="se-bottom-tabs">
          <button
            type="button"
            className="se-bottom-toggle"
            onClick={() => setBottomOpen((v) => !v)}
            title={bottomOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {bottomOpen ? '▼' : '▲'}
          </button>
          <button type="button" className={`se-bottom-tab ${bottomTab === 'modules' ? 'on' : ''}`} onClick={() => { setBottomTab('modules'); setBottomOpen(true) }}>
            🧩 Modules ({recipe.modules?.length ?? 0})
          </button>
          <button type="button" className={`se-bottom-tab ${bottomTab === 'recipe' ? 'on' : ''}`} onClick={() => { setBottomTab('recipe'); setBottomOpen(true) }}>
            📄 Recipe
          </button>
          <button type="button" className={`se-bottom-tab ${bottomTab === 'help' ? 'on' : ''}`} onClick={() => { setBottomTab('help'); setBottomOpen(true) }}>
            ❓ Help
          </button>
          {!bottomOpen ? (
            <span className="se-bottom-hint">click a tab or ▲ to expand</span>
          ) : null}
        </nav>
        <div className="se-bottom-body" hidden={!bottomOpen}>
          {bottomTab === 'modules' ? (
            <div className="se-modules-list">
              {(recipe.modules ?? []).map((m) => {
                const meta = allModules.flatMap((c) => c.modules).find((x) => x.id === m.id)
                return (
                  <div key={m.id} className="se-module-row">
                    <strong>{meta?.displayName ?? m.id}</strong>
                    <code>{m.id}</code>
                    {meta?.description ? <p>{meta.description}</p> : null}
                  </div>
                )
              })}
              <p className="se-help">
                Sprint 4 makes module code editable (Monaco editor + safe regen).
                For now, files live under <code>{outDir}/backend/app/&lt;module&gt;/</code>.
              </p>
            </div>
          ) : null}
          {bottomTab === 'recipe' ? (
            <pre className="se-recipe">{JSON.stringify(recipe, null, 2)}</pre>
          ) : null}
          {bottomTab === 'help' ? (
            <div className="se-help-pane">
              <h3>Studio v2 — Sprint 1 (foundation)</h3>
              <ul>
                <li><strong>To preview:</strong> open <code>{outDir}</code> and run <code>run.bat</code></li>
                <li><strong>Add section:</strong> click a thumbnail in the left library</li>
                <li><strong>Reorder / remove:</strong> use ↑↓✕ on the right rail</li>
                <li><strong>Brand:</strong> name / tagline / colour fields → ⌘S Save</li>
                <li>Every save reruns the wirer in place + auto-reloads the iframe</li>
              </ul>
              <h3>Coming in next sprints</h3>
              <ul>
                <li><strong>S2:</strong> Click any text/button/image in the iframe → edit inline (Canva mode)</li>
                <li><strong>S3:</strong> Drag-reorder pages, theme switcher, real screenshot thumbnails</li>
                <li><strong>S4:</strong> Monaco code editor for modules + deploy to Vercel/Render</li>
              </ul>
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  )
}
