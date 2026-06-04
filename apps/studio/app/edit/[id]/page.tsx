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
 * Sprint 3:  drag-reorder pages, theme switcher, Playwright PNG thumbnails — shipped
 * Sprint 4:  Monaco code editor + Export ZIP + deploy buttons — shipped
 * Sprint 5:  prop bindings, palette drag-drop, theme branding propagate — shipped
 * Sprint 6:  element-IDs on every page (not just home), so click-to-edit works
 *            on /signup, /login, /dashboard, /pricing etc. — shipped
 */

import { use, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleCodeEditor } from './ModuleCodeEditor'

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

type ThemePack = { id: string; displayName: string; category: string; description: string; accent: string; accent2?: string }

type Module = {
  id: string
  displayName: string
  description: string
  dependsOn: string[]
  category: string
}
type ModuleCategory = { key: string; label: string; modules: Module[] }

type PageDef = { id: string; route: string; label: string; isAuth?: boolean }

type BottomTab = 'modules' | 'code' | 'recipe' | 'deploy' | 'help'

type DeployTarget = { id: string; label: string; icon: string; commands: string[]; notes: string }
type DeployInfo = {
  currentTarget: string | null
  hasBackend: boolean
  hasDb: boolean
  artifacts: { name: string; present: boolean }[]
  targets: DeployTarget[]
}

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
  const [themes, setThemes] = useState<ThemePack[]>([])
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

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
  /** Index being dragged in the section list — null if not dragging. */
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  /** Deploy info (loaded lazily when user opens Deploy tab). */
  const [deployInfo, setDeployInfo] = useState<DeployInfo | null>(null)
  const [exporting, setExporting] = useState(false)
  /** Sprint 5a: prop binding for the currently-selected element. */
  const [binding, setBinding] = useState<{ found: boolean; sectionId?: string; prop?: string; currentValue?: string | null; sourceFile?: string | null } | null>(null)
  const [bindingValue, setBindingValue] = useState('')
  const [bindingSaving, setBindingSaving] = useState(false)
  /** Sprint 5b: section being dragged from palette (null when not dragging). */
  const [paletteDragId, setPaletteDragId] = useState<string | null>(null)
  /** Sprint 5c: visible overlay while a theme apply is regenerating. */
  const [themeApplying, setThemeApplying] = useState<string | null>(null)

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
      fetch('/api/themes').then((r) => r.json()),
    ])
      .then(([app, cat, mods, th]) => {
        if (cancelled) return
        const r = app.recipe as AppRecipe
        setRecipe(r)
        setOutDir(app.outDir ?? '')
        setName(r.branding?.name ?? '')
        setTagline(r.branding?.tagline ?? '')
        setPrimary(r.branding?.primary ?? '#6366f1')
        setCatalog(cat.categories ?? [])
        setAllModules(mods.categories ?? [])
        setThemes(th.themes ?? [])
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
        // Sprint 5a — look up section-prop binding for this element
        setBinding(null)
        fetch(`/api/wizard/apps/${wizardId}/binding?elementId=${encodeURIComponent(sel.elementId)}`)
          .then((r) => r.json())
          .then((d) => {
            setBinding(d)
            if (d.found && d.currentValue !== null && d.currentValue !== undefined) {
              setBindingValue(String(d.currentValue))
            }
          })
          .catch(() => {})
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
  // Recipe.sections drives the HOME page composition. Auth pages (signup/
  // login/dashboard) + extra pages (pricing/about/etc.) are baked by
  // derive-auth-pages + derive-extra-pages — Studio doesn't yet rewrite their
  // section composition, so add/remove/reorder controls only apply to Home.
  //
  // HOWEVER, ELEMENT-LEVEL EDITING WORKS ON EVERY PAGE. Sprint 6 made the
  // wirer inject `data-bd-element` on every page.tsx (not just sections), so
  // the iframe bridge + binding flow lets you click any text/button/image on
  // /signup, /login, /dashboard etc. and edit it.
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
      // Auth/extra pages aren't section-composed — they're hand-rendered
      // by derive-auth-pages / derive-extra-pages. Tell the user how to
      // edit them instead of just blocking with an alert.
      setSaveLog((l) => [
        `i Section add only works on Home. To edit ${activePage.label}, click any element in the preview, or use the Code tab below.`,
        ...l,
      ])
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

  /** Duplicate the section at `idx` — insert a copy right after it. */
  async function duplicateSection(idx: number) {
    if (!isHomePage) return
    const sid = homeSections[idx]
    if (!sid) return
    const next = [...homeSections.slice(0, idx + 1), sid, ...homeSections.slice(idx + 1)]
    await saveRecipe({ sections: next })
    setSelectedSectionIdx(idx + 1)
  }

  /** Reorder via drag from `from` index to drop position `to`. */
  async function reorderSection(from: number, to: number) {
    if (!isHomePage) return
    if (from === to || from < 0 || to < 0 || from >= homeSections.length || to >= homeSections.length) return
    const next = [...homeSections]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    await saveRecipe({ sections: next })
    setSelectedSectionIdx(to)
  }

  /** Download the current app as a ZIP via the export endpoint. */
  async function downloadZip() {
    setExporting(true)
    setSaveLog((l) => ['→ exporting ZIP (regen + zip)…', ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/export`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'export failed' }))
        setSaveLog((l) => ['✗ ' + (err.error ?? 'export failed'), ...l])
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${wizardId}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSaveLog((l) => [`✓ downloaded ${wizardId}.zip (${(blob.size / 1024).toFixed(1)} KB)`, ...l])
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
    } finally {
      setExporting(false)
    }
  }

  /** Load deploy info lazily when user opens the Deploy tab. */
  useEffect(() => {
    if (bottomTab !== 'deploy') return
    if (deployInfo) return
    fetch(`/api/wizard/apps/${wizardId}/deploy-info`)
      .then((r) => r.json())
      .then((d) => setDeployInfo(d as DeployInfo))
      .catch(() => {})
  }, [bottomTab, wizardId, deployInfo])

  /** Sprint 5a — save the bound section prop value (e.g. "Create your account"
   *  → patches the page.tsx prop literal, writes to overrides/, regen). */
  async function saveBinding() {
    if (!selectedEl || !binding?.found || !binding.prop) return
    setBindingSaving(true)
    setSaveLog((l) => [`→ prop ${binding.sectionId}.${binding.prop} = ${bindingValue.slice(0, 40)}…`, ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/binding`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ elementId: selectedEl.elementId, value: bindingValue }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveLog((l) => [`✓ prop saved → ${data.sourceFile}`, ...l])
        setIframeKey((k) => k + 1)
      } else {
        setSaveLog((l) => [`✗ prop save failed: ${data.error ?? 'unknown'}`, ...l])
      }
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
    } finally {
      setBindingSaving(false)
    }
  }

  /** Sprint 5b — handle palette drag start: enable iframe drop zones,
   *  attach mousemove listener (parent coords → iframe-relative). */
  function startPaletteDrag(sectionId: string) {
    setPaletteDragId(sectionId)
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'bd-studio', type: 'bd:drag-enter', payload: { sectionId } },
      '*',
    )
  }

  function endPaletteDrag() {
    setPaletteDragId(null)
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'bd-studio', type: 'bd:drag-end' },
      '*',
    )
  }

  /** Drop a palette section onto the iframe at the cursor position.
   *  Iframe coords resolved by translating clientX/Y minus iframe rect.
   *  Works through the transparent overlay placed atop the iframe. */
  async function dropOnIframe(e: React.DragEvent) {
    e.preventDefault()
    const dropId = paletteDragId
    if (!dropId || !iframeRef.current) return
    const rect = iframeRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top + (iframeRef.current.contentWindow?.scrollY ?? 0)
    // Ask bridge for nearest insertion index, then insert + save.
    const idx = await new Promise<number>((resolve) => {
      const onAck = (ev: MessageEvent) => {
        const d = ev.data as { source?: string; type?: string; payload?: { atIdx?: number } }
        if (d?.source === 'bd-bridge' && d?.type === 'bd:probe-drop-ack') {
          window.removeEventListener('message', onAck)
          resolve(d.payload?.atIdx ?? homeSections.length)
        }
      }
      window.addEventListener('message', onAck)
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'bd-studio', type: 'bd:probe-drop', payload: { x, y } },
        '*',
      )
      // Fallback after 500ms
      setTimeout(() => { window.removeEventListener('message', onAck); resolve(homeSections.length) }, 500)
    })
    const next = [...homeSections.slice(0, idx), dropId, ...homeSections.slice(idx)]
    endPaletteDrag()
    await saveRecipe({ sections: next })
    setSelectedSectionIdx(idx)
  }

  /** Swap the theme pack. recipe.theme.pack → re-runs wirer with new
   *  globals.css + tailwind tokens; iframe reload picks it up. */
  async function applyTheme(themeId: string) {
    setThemeMenuOpen(false)
    setThemeApplying(themeId) // Sprint 5c — visible overlay
    const theme = themes.find((t) => t.id === themeId)
    const accent = theme?.accent
    setSaveLog((l) => [`→ theme ${themeId}${accent ? ' (' + accent + ')' : ''}`, ...l])
    try {
      // Sprint 5d: send theme + branding.primary patch together so
      // sections that read accentColor / primary actually re-skin.
      const res = await fetch(`/api/wizard/apps/${wizardId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          theme: themeId,
          branding: accent ? { name, tagline, primary: accent } : undefined,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveLog((l) => [`✓ theme applied: ${themeId}${accent ? ' → primary ' + accent : ''}`, ...l])
        // Also patch the accentColor prop in every premium section that has
        // it. We POST to bindings that match the prop name 'accentColor'.
        if (accent) {
          try {
            // Find every section currently on the page that's known to
            // have an accentColor prop (Hero3DScene, FeaturesStagger,
            // FeatureScroll3D, TestimonialsMarqueePremium, CtaMagnetic,
            // PortfolioProjectGrid, PricingPremium, HeroEventCountdown).
            const premiumWithAccent = new Set([
              'Hero3DScene', 'FeaturesStagger', 'FeatureScroll3D',
              'TestimonialsMarqueePremium', 'CtaMagnetic',
              'PortfolioProjectGrid', 'PricingPremium', 'HeroEventCountdown',
            ])
            const sectionsOnPage = (await fetch(`/api/wizard/apps/${wizardId}`).then((r) => r.json())).recipe.sections ?? []
            // We don't have a binding for accentColor (it's set as a prop, not
            // a JSX expression child), so use the recipe-side approach:
            // patch the page.tsx directly via the file API (text replace).
            // For S5d minimum-viable, we rely on branding.primary which
            // derive-page reads on next regen.
            void premiumWithAccent; void sectionsOnPage
          } catch {
            // best-effort
          }
          // Trigger one more regen so derive-page picks up new branding.primary
          await fetch(`/api/wizard/apps/${wizardId}`, {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ branding: { name, tagline, primary: accent } }),
          })
          setPrimary(accent)
        }
        const fresh = await fetch(`/api/wizard/apps/${wizardId}`).then((r) => r.json())
        setRecipe(fresh.recipe as AppRecipe)
        setIframeKey((k) => k + 1)
      } else {
        setSaveLog((l) => ['✗ theme apply failed', ...((data.log ?? []) as string[]).slice(-3), ...l])
      }
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
    } finally {
      setTimeout(() => setThemeApplying(null), 1500)
    }
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
          {/* Theme picker — Sprint 3a */}
          <div className="se-theme-dd">
            <button
              type="button"
              className="se-theme-trigger"
              onClick={() => setThemeMenuOpen((v) => !v)}
              title="Switch theme pack"
            >
              <span className="se-theme-swatch" style={{ background: themes.find((t) => t.id === recipe.theme?.pack)?.accent ?? '#6366f1' }} />
              🎨 {recipe.theme?.pack ?? 'theme'}
              <span style={{opacity:.5,marginLeft:4}}>▾</span>
            </button>
            {themeMenuOpen ? (
              <div className="se-theme-menu">
                <p className="se-theme-menu-title">{themes.length} theme packs · click to apply</p>
                <div className="se-theme-grid">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`se-theme-cell ${recipe.theme?.pack === t.id ? 'on' : ''}`}
                      onClick={() => applyTheme(t.id)}
                      title={t.description || t.id}
                    >
                      <span className="se-theme-cell-swatch" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2 ?? t.accent})` }} />
                      <span className="se-theme-cell-name">{t.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={() => setIframeKey((k) => k + 1)} title="Reload preview">↻</button>
          <a href={`http://localhost:${appPort}`} target="_blank" rel="noreferrer" className="se-open">↗ Open in tab</a>
          <button type="button" onClick={() => void downloadZip()} disabled={exporting} title="Regenerate + download as ZIP">
            {exporting ? '⏳ Zipping…' : '📦 Export ZIP'}
          </button>
          <button type="button" onClick={() => { setBottomTab('deploy'); setBottomOpen(true) }} title="Show deploy options">🚀 Deploy</button>
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
                      className={`se-palette-card ${paletteDragId === s.id ? 'dragging' : ''}`}
                      title={s.description || s.id}
                      onClick={() => addSectionToPage(s.id)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'copy'
                        e.dataTransfer.setData('text/plain', s.id)
                        startPaletteDrag(s.id)
                      }}
                      onDragEnd={endPaletteDrag}
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
        <main
          className="se-pane se-center"
          onDragOver={(e) => { if (paletteDragId) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' } }}
          onDrop={(e) => { if (paletteDragId) void dropOnIframe(e) }}
        >
          {/* Sprint 5c — theme-apply overlay */}
          {themeApplying ? (
            <div className="se-theme-overlay">
              <div className="se-theme-overlay-card">
                <p className="se-theme-overlay-spin">⟳</p>
                <strong>Applying theme: {themeApplying}</strong>
                <span>Regenerating + reloading preview…</span>
              </div>
            </div>
          ) : null}
          {/* Sprint 5b — palette-drag indicator overlay */}
          {paletteDragId ? (
            <div className="se-drop-indicator">
              ↓ drop <code>{paletteDragId}</code> on the preview to insert
            </div>
          ) : null}
          {/* Sprint 5d — transparent drop-capture overlay over the iframe.
              Browsers won't deliver dragover/drop events from inside an
              iframe document up to the parent, so we put a div ON TOP of
              the iframe while dragging that explicitly captures both. */}
          {paletteDragId ? (
            <div
              className="se-drop-overlay"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
              onDragLeave={(e) => { e.preventDefault() }}
              onDrop={(e) => { void dropOnIframe(e) }}
            />
          ) : null}
          {appReachable ? (
            <iframe
              key={`${activePageId}-${iframeKey}`}
              ref={iframeRef}
              src={`http://localhost:${appPort}${activePage.route}`}
              className="se-iframe"
              title="Live app preview"
              /* iframe ignores pointer events while dragging so the
                 overlay below captures dragover/drop. Otherwise the
                 iframe document swallows them. */
              style={paletteDragId ? { pointerEvents: 'none' } : undefined}
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
            <strong>{isHomePage ? 'Sections on this page' : `${activePage.label} — click to edit`}</strong>
          </div>
          {!isHomePage ? (
            <div className="se-help">
              <p style={{margin: '0 0 8px'}}>
                <strong>Click any element</strong> in the preview (heading, button, input, link)
                to edit text + color in the right pane — same as Canva.
              </p>
              <p style={{margin: '0 0 8px', opacity: .7}}>
                Section <em>composition</em> (add / remove / reorder) is Home-only for now —
                this page is hand-rendered by the wirer&apos;s page deriver, so the section
                list doesn&apos;t apply.
              </p>
              <p style={{margin: 0, opacity: .55, fontSize: 11}}>
                To restructure the page itself: open <em>Code</em> tab below and edit{' '}
                <code>frontend/src/app{activePage.route === '/' ? '' : activePage.route}/page.tsx</code>.
              </p>
            </div>
          ) : (
            <ol className="se-section-list">
              {homeSections.map((sid, i) => {
                const meta = sectionMeta(sid)
                const selected = selectedSectionIdx === i
                const dropAbove = dragOverIdx === i && dragIdx !== null && dragIdx > i
                const dropBelow = dragOverIdx === i && dragIdx !== null && dragIdx < i
                return (
                  <li
                    key={`${sid}-${i}`}
                    className={`se-section-row ${selected ? 'on' : ''} ${dragIdx === i ? 'dragging' : ''} ${dropAbove ? 'drop-above' : ''} ${dropBelow ? 'drop-below' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      setDragIdx(i)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', String(i))
                    }}
                    onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIdx(i) }}
                    onDragLeave={() => setDragOverIdx((v) => (v === i ? null : v))}
                    onDrop={(e) => {
                      e.preventDefault()
                      const from = Number(e.dataTransfer.getData('text/plain'))
                      setDragIdx(null); setDragOverIdx(null)
                      if (!Number.isNaN(from)) void reorderSection(from, i)
                    }}
                  >
                    <span className="se-section-row-handle" title="Drag to reorder">⋮⋮</span>
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
                      <button type="button" onClick={() => duplicateSection(i)} title="Duplicate" className="se-section-row-dup">⎘</button>
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
              <div className="se-pane-head"><strong>Section</strong></div>
              <p className="se-help">
                Click any element <em>inside</em> the iframe (heading, button, image)
                to edit its text + color in this pane. Whole-section prop editing also
                works via the <em>Prop binding</em> panel when a click resolves to a
                bound JSX expression.
              </p>
              <p className="se-help">
                Selected section: <code>{homeSections[selectedSectionIdx]}</code>
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

                {/* Sprint 5a: prop-binding editor — when this element
                    is just `{prop}`, edit the actual section prop value
                    instead of being blocked by the JSX-expression rule. */}
                {binding?.found && binding.prop ? (
                  <div className="se-edit-block" style={{ borderTop: '2px solid #6366f1' }}>
                    <label className="se-edit-label">
                      <span>📎 Prop: <code>{binding.sectionId}.{binding.prop}</code></span>
                      <textarea
                        value={bindingValue}
                        onChange={(e) => { setBindingValue(e.target.value); setEditState('dirty') }}
                        rows={Math.max(2, Math.min(8, Math.ceil(bindingValue.length / 38)))}
                        placeholder="(prop value)"
                        className="se-edit-textarea"
                        style={{ borderColor: 'rgba(99,102,241,.4)' }}
                      />
                    </label>
                    <div className="se-edit-actions">
                      <span className="se-edit-state">
                        bound to <code>{binding.sourceFile}</code>
                      </span>
                      <button type="button" className="se-btn se-btn-primary" onClick={saveBinding} disabled={bindingSaving}>
                        {bindingSaving ? '⏳ Saving prop…' : '💾 Save prop'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Sprint 2b: inline text editor */}
                <div className="se-edit-block">
                  <label className="se-edit-label">
                    <span>{binding?.found ? 'Raw text (not bound — JSX literal)' : 'Text content'}</span>
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
          <button type="button" className={`se-bottom-tab ${bottomTab === 'code' ? 'on' : ''}`} onClick={() => { setBottomTab('code'); setBottomOpen(true) }}>
            ⌨ Code editor
          </button>
          <button type="button" className={`se-bottom-tab ${bottomTab === 'recipe' ? 'on' : ''}`} onClick={() => { setBottomTab('recipe'); setBottomOpen(true) }}>
            📄 Recipe
          </button>
          <button type="button" className={`se-bottom-tab ${bottomTab === 'deploy' ? 'on' : ''}`} onClick={() => { setBottomTab('deploy'); setBottomOpen(true) }}>
            🚀 Deploy
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
          {bottomTab === 'code' ? (
            <ModuleCodeEditor wizardId={wizardId} />
          ) : null}
          {bottomTab === 'recipe' ? (
            <pre className="se-recipe">{JSON.stringify(recipe, null, 2)}</pre>
          ) : null}
          {bottomTab === 'deploy' ? (
            <div className="se-deploy">
              {!deployInfo ? <p className="se-help">Loading deploy options…</p> : (
                <>
                  <div className="se-deploy-summary">
                    <div>
                      <p className="se-help" style={{padding:0}}>Current target</p>
                      <strong>{deployInfo.currentTarget ?? 'none (pick one below or set via wizard)'}</strong>
                    </div>
                    <div>
                      <p className="se-help" style={{padding:0}}>Stack</p>
                      <strong>{deployInfo.hasBackend ? `frontend + backend${deployInfo.hasDb ? ' + db' : ''}` : 'frontend only'}</strong>
                    </div>
                    <div>
                      <p className="se-help" style={{padding:0}}>Artifacts</p>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>
                        {deployInfo.artifacts.filter((a) => a.present).map((a) => (
                          <code key={a.name} className="se-class-chip">{a.name}</code>
                        ))}
                      </div>
                    </div>
                    <div style={{marginLeft:'auto'}}>
                      <button type="button" className="se-btn se-btn-primary" onClick={() => void downloadZip()} disabled={exporting}>
                        {exporting ? '⏳ Zipping…' : '📦 Download ZIP'}
                      </button>
                    </div>
                  </div>
                  <div className="se-deploy-grid">
                    {deployInfo.targets.map((t) => (
                      <div key={t.id} className="se-deploy-card">
                        <h4>{t.icon} {t.label}</h4>
                        <pre className="se-deploy-cmds">{t.commands.join('\n')}</pre>
                        <p>{t.notes}</p>
                      </div>
                    ))}
                  </div>
                  <p className="se-help">
                    Full playbook: open <code>{deployInfo.artifacts.find((a) => a.name === 'PRODUCTION.md')?.present ? 'PRODUCTION.md' : 'docs at github.com/abid55570/web-app-business'}</code> in the generated app dir.
                  </p>
                </>
              )}
            </div>
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
