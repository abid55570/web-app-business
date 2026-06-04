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

/** What the iframe bridge reports when the user clicks an element. */
type SelectedEl = {
  elementId: string
  tag: string
  text: string
  className: string
  rect?: { top: number; left: number; width: number; height: number }
}

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
  /** Element clicked inside the iframe via the studio-bridge. */
  const [selectedEl, setSelectedEl] = useState<SelectedEl | null>(null)
  /** Whether the bridge has handshaken — confirms the generated app
   *  has the bridge script (Sprint 2a+ regen required). */
  const [bridgeAck, setBridgeAck] = useState(false)
  /** Live-edit buffer for the selected element's text. */
  const [editText, setEditText] = useState('')
  /** Live-edit buffer for the selected element's classes. */
  const [editClass, setEditClass] = useState('')
  /** Live-edit buffer for static attributes (src, href, alt). */
  const [editAttrs, setEditAttrs] = useState<Record<string, string>>({})
  /** "saving" / "dirty" indicator for the inspector. */
  const [editState, setEditState] = useState<'idle' | 'dirty' | 'saving' | 'saved'>('idle')

  // Palette state
  const [paletteSearch, setPaletteSearch] = useState('')
  const [paletteCategory, setPaletteCategory] = useState<string>('all')
  const [catMenuOpen, setCatMenuOpen] = useState(false)

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

  // ─── Studio iframe bridge (Sprint 2a) ──────────────────────────
  // Listen for messages from _studio-bridge.js inside the iframe.
  // Clear selection + bridgeAck when iframe remounts (page tab switch
  // or save→reload).
  useEffect(() => {
    setSelectedEl(null)
    setBridgeAck(false)
  }, [activePageId, iframeKey])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as { source?: string; type?: string; payload?: unknown } | undefined
      if (!data || data.source !== 'bd-bridge') return
      if (data.type === 'bd:ready') {
        // Bridge loaded — greet it. It'll ack with bd:hello-ack.
        iframeRef.current?.contentWindow?.postMessage(
          { source: 'bd-studio', type: 'bd:hello' },
          '*',
        )
      } else if (data.type === 'bd:hello-ack') {
        setBridgeAck(true)
      } else if (data.type === 'bd:select') {
        const sel = data.payload as SelectedEl
        setSelectedEl(sel)
        setEditText(sel.text ?? '')
        setEditClass(sel.className ?? '')
        setEditAttrs({})
        setEditState('idle')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function clearSelection() {
    setSelectedEl(null)
    setEditText('')
    setEditState('idle')
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'bd-studio', type: 'bd:clear' },
      '*',
    )
  }

  /** Send a live-preview patch to the iframe bridge (no persist). */
  function sendBridgePatch(patch: { text?: string; className?: string; attributes?: Record<string, string> }) {
    if (!selectedEl) return
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'bd-studio', type: 'bd:apply', payload: { elementId: selectedEl.elementId, patch } },
      '*',
    )
  }

  function previewText(text: string) {
    setEditText(text)
    setEditState('dirty')
    sendBridgePatch({ text })
  }

  function previewClass(className: string) {
    setEditClass(className)
    setEditState('dirty')
    sendBridgePatch({ className })
  }

  function previewAttr(name: string, value: string) {
    setEditAttrs((prev) => ({ ...prev, [name]: value }))
    setEditState('dirty')
    sendBridgePatch({ attributes: { [name]: value } })
  }

  /** Smart color swap: replaces existing Tailwind color classes
   *  (text-*, bg-*, border-*, fill-*) with the picked shade. Falls
   *  back to APPENDING when no existing color class is found. */
  function pickColor(targetClass: string) {
    if (!selectedEl) return
    const parts = editClass.split(/\s+/).filter(Boolean)
    // Detect the prefix from targetClass (text-, bg-, border-, fill-).
    const prefixMatch = /^(text|bg|border|fill|from|to|via)-/.exec(targetClass)
    if (!prefixMatch) return
    const prefix = prefixMatch[1]!
    const filtered = parts.filter((c) => !c.startsWith(prefix + '-'))
    filtered.push(targetClass)
    previewClass(filtered.join(' '))
  }

  /** Persist whatever's currently in the edit buffers to overrides + regen. */
  async function saveElementEdit() {
    if (!selectedEl) return
    setEditState('saving')
    const patch: { text?: string; className?: string; attributes?: Record<string, string> } = {}
    if (editText !== (selectedEl.text ?? '')) patch.text = editText
    if (editClass !== (selectedEl.className ?? '')) patch.className = editClass
    if (Object.keys(editAttrs).length > 0) patch.attributes = editAttrs
    if (Object.keys(patch).length === 0) { setEditState('idle'); return }
    setSaveLog((l) => ['→ overrides ' + selectedEl.elementId + ' (' + Object.keys(patch).join(', ') + ')', ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/overrides`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ elementId: selectedEl.elementId, patch }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveLog((l) => ['✓ override saved + regen', ...l])
        setEditState('saved')
        setIframeKey((k) => k + 1)
      } else {
        setSaveLog((l) => ['✗ override failed', ...((data.log ?? []) as string[]).slice(-3), ...l])
        setEditState('dirty')
      }
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
      setEditState('dirty')
    }
  }

  /** Wipe the override for the selected element + regen. */
  async function resetElementEdit() {
    if (!selectedEl) return
    setEditState('saving')
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/overrides`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ elementId: selectedEl.elementId, clear: true }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveLog((l) => ['↩ reset ' + selectedEl.elementId, ...l])
        setEditState('idle')
        setIframeKey((k) => k + 1)
        // Re-fetch the current text from bridge after iframe reload
        setEditText('')
      }
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
    }
  }
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
          {appReachable ? (
            <>
              <span className={`se-dot ${bridgeAck ? 'se-dot-on' : 'se-dot-idle'}`} style={{marginLeft: 12}} />
              <span className="se-app-label">
                Bridge: {bridgeAck ? 'ready — click any element' : 'waiting / regen needed'}
              </span>
            </>
          ) : null}
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
          {/* Custom dark dropdown — native <select> renders with OS theme
              which on Windows is white-on-light. */}
          <div className="se-cat-dd">
            <button
              type="button"
              className="se-cat-dd-trigger"
              onClick={() => setCatMenuOpen((v) => !v)}
              aria-expanded={catMenuOpen}
            >
              <span>{paletteCategory === 'all' ? 'All categories' : catalog.find((c) => c.key === paletteCategory)?.label ?? paletteCategory}</span>
              <span className="se-cat-dd-caret">{catMenuOpen ? '▴' : '▾'}</span>
            </button>
            {catMenuOpen ? (
              <div className="se-cat-dd-menu">
                <button
                  type="button"
                  className={`se-cat-dd-item ${paletteCategory === 'all' ? 'on' : ''}`}
                  onClick={() => { setPaletteCategory('all'); setCatMenuOpen(false) }}
                >
                  All categories <span className="se-cat-dd-count">{catalog.reduce((n, c) => n + c.sections.length, 0)}</span>
                </button>
                {catalog.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`se-cat-dd-item ${paletteCategory === c.key ? 'on' : ''}`}
                    onClick={() => { setPaletteCategory(c.key); setCatMenuOpen(false) }}
                  >
                    {c.label} <span className="se-cat-dd-count">{c.sections.length}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
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
                Sprint 2b adds inline prop editing for the selected section.
                For now, edit <code>src/app/page.tsx</code> in the generated app
                to change props — or drop a replacement under <code>overrides/</code>.
              </p>
              <p className="se-help">
                Selected: <code>{homeSections[selectedSectionIdx]}</code>
              </p>
            </>
          ) : null}

          {/* ─── Sprint 2a/b: clicked element inspector + live edit ── */}
          {selectedEl ? (
            <>
              <div className="se-divider" />
              <div className="se-pane-head">
                <strong>🎯 Element</strong>
                <button type="button" className="se-inspector-close" onClick={clearSelection} title="Clear selection">✕</button>
              </div>
              <div className="se-inspector">
                <div className="se-inspector-row">
                  <span>tag</span>
                  <code>&lt;{selectedEl.tag}&gt;</code>
                </div>
                <div className="se-inspector-row">
                  <span>id</span>
                  <code className="se-inspector-id">{selectedEl.elementId}</code>
                </div>

                {/* Sprint 2b: inline text editor */}
                <div className="se-edit-block">
                  <label className="se-edit-label">
                    <span>Text content</span>
                    {selectedEl.text || selectedEl.text === '' ? (
                      <textarea
                        value={editText}
                        onChange={(e) => previewText(e.target.value)}
                        rows={Math.max(2, Math.min(8, Math.ceil(editText.length / 38)))}
                        placeholder="(no text content)"
                        className="se-edit-textarea"
                      />
                    ) : (
                      <p className="se-help" style={{padding: '4px 0'}}>
                        This element has no editable text (likely contains nested elements or JSX expressions).
                      </p>
                    )}
                  </label>
                  <div className="se-edit-actions">
                    <span className={`se-edit-state se-edit-state-${editState}`}>
                      {editState === 'idle' ? '⚪ no changes' :
                       editState === 'dirty' ? '🟡 unsaved' :
                       editState === 'saving' ? '⏳ saving…' :
                       '🟢 saved'}
                    </span>
                    <button type="button" onClick={resetElementEdit} className="se-btn se-btn-ghost" title="Wipe override + restore default">↩ Reset</button>
                    <button type="button" onClick={saveElementEdit} disabled={editState !== 'dirty'} className="se-btn se-btn-primary">
                      💾 Save edit
                    </button>
                  </div>
                </div>

                {/* Sprint 2c: color picker — smart-swaps text-* / bg-* / border-* classes */}
                <div className="se-edit-block">
                  <label className="se-edit-label">
                    <span>Color (smart-swap text/bg)</span>
                  </label>
                  <div className="se-color-grid">
                    {[
                      { label: 'Indigo', text: 'text-indigo-500', bg: 'bg-indigo-500', hex: '#6366f1' },
                      { label: 'Purple', text: 'text-purple-500', bg: 'bg-purple-500', hex: '#a855f7' },
                      { label: 'Pink',   text: 'text-pink-500',   bg: 'bg-pink-500',   hex: '#ec4899' },
                      { label: 'Red',    text: 'text-red-500',    bg: 'bg-red-500',    hex: '#ef4444' },
                      { label: 'Orange', text: 'text-orange-500', bg: 'bg-orange-500', hex: '#f97316' },
                      { label: 'Amber',  text: 'text-amber-500',  bg: 'bg-amber-500',  hex: '#f59e0b' },
                      { label: 'Green',  text: 'text-green-500',  bg: 'bg-green-500',  hex: '#22c55e' },
                      { label: 'Teal',   text: 'text-teal-500',   bg: 'bg-teal-500',   hex: '#14b8a6' },
                      { label: 'Cyan',   text: 'text-cyan-500',   bg: 'bg-cyan-500',   hex: '#06b6d4' },
                      { label: 'Blue',   text: 'text-blue-500',   bg: 'bg-blue-500',   hex: '#3b82f6' },
                      { label: 'Slate',  text: 'text-slate-500',  bg: 'bg-slate-500',  hex: '#64748b' },
                      { label: 'White',  text: 'text-white',      bg: 'bg-white',      hex: '#ffffff' },
                    ].map((c) => (
                      <div key={c.label} className="se-color-cell">
                        <span className="se-color-dot" style={{ background: c.hex }} title={c.label} />
                        <div className="se-color-btns">
                          <button type="button" className="se-color-btn" onClick={() => pickColor(c.text)} title={'Apply ' + c.text}>T</button>
                          <button type="button" className="se-color-btn" onClick={() => pickColor(c.bg)} title={'Apply ' + c.bg}>B</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="se-help" style={{padding:'4px 0', margin:0, fontSize: 10}}>
                    <strong>T</strong> = text colour · <strong>B</strong> = background. Smart-swaps the existing class.
                  </p>
                </div>

                {/* Sprint 2c: image src attribute (when element is <img>) */}
                {selectedEl.tag === 'img' ? (
                  <div className="se-edit-block">
                    <label className="se-edit-label">
                      <span>Image URL (src)</span>
                      <input
                        type="text"
                        placeholder="https://… or /path"
                        value={editAttrs.src ?? ''}
                        onChange={(e) => previewAttr('src', e.target.value)}
                        className="se-edit-textarea"
                      />
                    </label>
                    <label className="se-edit-label">
                      <span>Alt text</span>
                      <input
                        type="text"
                        placeholder="Describe the image"
                        value={editAttrs.alt ?? ''}
                        onChange={(e) => previewAttr('alt', e.target.value)}
                        className="se-edit-textarea"
                      />
                    </label>
                  </div>
                ) : null}

                {/* Sprint 2c: href editor for links/buttons */}
                {(selectedEl.tag === 'a' || selectedEl.tag === 'button') ? (
                  <div className="se-edit-block">
                    <label className="se-edit-label">
                      <span>{selectedEl.tag === 'a' ? 'Link URL (href)' : 'On-click route'}</span>
                      <input
                        type="text"
                        placeholder="/signup or https://…"
                        value={editAttrs.href ?? ''}
                        onChange={(e) => previewAttr('href', e.target.value)}
                        className="se-edit-textarea"
                      />
                    </label>
                  </div>
                ) : null}

                {/* Sprint 2c: full className editor (power-user) */}
                <div className="se-edit-block">
                  <label className="se-edit-label">
                    <span>Tailwind classes</span>
                    <textarea
                      value={editClass}
                      onChange={(e) => previewClass(e.target.value)}
                      rows={Math.max(2, Math.min(6, Math.ceil(editClass.length / 38)))}
                      placeholder="(no className)"
                      className="se-edit-textarea"
                    />
                  </label>
                  <p className="se-help" style={{padding:'4px 0', margin:0, fontSize: 10}}>
                    Edit raw className. Try removing <code>bg-black</code> or adding <code>p-12 rounded-3xl</code>.
                  </p>
                </div>
              </div>
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
