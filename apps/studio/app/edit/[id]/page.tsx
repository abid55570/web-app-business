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
  /** Sprint 7b — per-page extra-sections map. Home uses top-level
   *  `sections` instead; this is for auth/extra pages. */
  pageExtras?: Record<string, string[]>
  /** Sprint 12b — user-defined blank pages (any URL-safe slug). */
  blankPages?: string[]
  theme?: { pack?: string }
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
  /** Sprint 8: undo/redo history of text/className edits. Each entry
   *  is a reversible patch we can replay forward or backward. */
  type HistoryEntry = {
    elementId: string
    field: 'text' | 'className'
    before: string
    after: string
    label: string
  }
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyCursor, setHistoryCursor] = useState(0) // points to the NEXT undo target
  /** Sprint 8: brief "saved" status indicator that auto-dismisses. */
  const [statusToast, setStatusToast] = useState<string | null>(null)
  /** Sprint 8: hint shown when bridge sends bd:edit-start so user knows
   *  they're editing inline (also disables the right-rail text field). */
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null)
  /** Sprint 10: canvas zoom (0.5..2.0 or 'fit') + viewport width preset. */
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  /** Sprint 10: image-picker state (uploaded files for current app). */
  const [uploads, setUploads] = useState<string[]>([])
  const [uploadBusy, setUploadBusy] = useState(false)
  /** Sprint 9: gradient-picker state (per-element, kept in studio memory only). */
  const [gradFrom, setGradFrom] = useState('#6366f1')
  const [gradVia, setGradVia] = useState('#a855f7')
  const [gradUseVia, setGradUseVia] = useState(true)
  const [gradTo, setGradTo] = useState('#ec4899')
  const [gradDir, setGradDir] = useState<'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl' | 'to-t' | 'to-tr'>('to-br')

  // Palette state
  const [paletteSearch, setPaletteSearch] = useState('')
  const [paletteCategory, setPaletteCategory] = useState<string>('all')
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  /** Sprint 7a/9/12: left-pane tab — sections | themes | brand | photos. */
  const [leftTab, setLeftTab] = useState<'sections' | 'themes' | 'brand' | 'photos'>('sections')
  /** Sprint 12a: photo library state. */
  const [photoCategory, setPhotoCategory] = useState<string>('hero')
  /** Sprint 7a: theme palette search query. */
  const [themeSearch, setThemeSearch] = useState('')
  /** Sprint 7a: theme category filter ('all' or category key from themes API). */
  const [themeCategory, setThemeCategory] = useState<string>('all')

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

  // Derive pages list from recipe.extraPages + recipe.blankPages + auth routes.
  const pages: PageDef[] = useMemo(() => {
    const list: PageDef[] = [{ id: 'home', route: '/', label: 'Home' }]
    for (const p of recipe?.extraPages ?? []) {
      list.push({ id: p, route: `/${p}`, label: `/${p}` })
    }
    // Sprint 12b — custom blank pages
    for (const p of recipe?.blankPages ?? []) {
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
      } else if (data.type === 'bd:edit-start') {
        // Sprint 8 — bridge has entered contentEditable mode on an element
        const p = data.payload as { elementId?: string } | undefined
        setInlineEditingId(p?.elementId ?? null)
      } else if (data.type === 'bd:edit-cancel') {
        setInlineEditingId(null)
      } else if (data.type === 'bd:edit-commit') {
        // Sprint 8 — user finished inline edit; persist the new text
        const p = data.payload as { elementId?: string; text?: string } | undefined
        setInlineEditingId(null)
        if (p?.elementId && typeof p.text === 'string') {
          void commitInlineEditFromBridge(p.elementId, p.text)
        }
      } else if (data.type === 'bd:section-action') {
        // Sprint 11b — on-canvas toolbar button clicked
        const p = data.payload as { action?: string; idx?: number } | undefined
        if (typeof p?.idx === 'number') {
          const i = p.idx
          if (p.action === 'move-up') void moveSection(i, -1)
          else if (p.action === 'move-down') void moveSection(i, 1)
          else if (p.action === 'duplicate') void duplicateSection(i)
          else if (p.action === 'remove') void removeSectionAt(i)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sprint 8 — Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y for undo/redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey
      if (!isMod) return
      // Ignore when user typing in a real form input (right-rail textareas)
      const t = e.target as HTMLElement | null
      const tag = t?.tagName ?? ''
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); void undo() }
      else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); void redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, historyCursor])

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

  /** Sprint 9 — replace any class with given prefix-set by the target class.
   *  E.g. setExclusiveClass(['text-xs','text-sm','text-base','text-lg',
   *  'text-xl',...], 'text-2xl') wipes any other text-size class first.
   *  Pass null target to just CLEAR all matching prefixes. */
  function setExclusiveClass(group: readonly string[], target: string | null) {
    if (!selectedEl) return
    const parts = editClass.split(/\s+/).filter(Boolean)
    const filtered = parts.filter((c) => !group.includes(c))
    if (target) filtered.push(target)
    previewClass(filtered.join(' '))
  }

  /** Detect which class in a group is currently applied (for highlighting). */
  function activeClassFrom(group: readonly string[]): string | null {
    const parts = editClass.split(/\s+/).filter(Boolean)
    return group.find((g) => parts.includes(g)) ?? null
  }

  /** Sprint 9 — apply a gradient via Tailwind arbitrary values. Wipes any
   *  conflicting bg-/from-/via-/to- classes first. */
  function applyGradient(opts: { dir: string; from: string; via?: string | null; to: string }) {
    if (!selectedEl) return
    const parts = editClass.split(/\s+/).filter(Boolean)
    // Drop solid bg, any direction class, and any from/via/to.
    const filtered = parts.filter((c) =>
      !/^bg-/.test(c) && !/^from-/.test(c) && !/^via-/.test(c) && !/^to-/.test(c),
    )
    filtered.push('bg-gradient-' + opts.dir)
    filtered.push('from-[' + opts.from + ']')
    if (opts.via) filtered.push('via-[' + opts.via + ']')
    filtered.push('to-[' + opts.to + ']')
    previewClass(filtered.join(' '))
  }

  /** Sprint 9 — solid bg (also wipes gradient classes). */
  function applySolidBg(color: string) {
    if (!selectedEl) return
    const parts = editClass.split(/\s+/).filter(Boolean)
    const filtered = parts.filter((c) =>
      !/^bg-/.test(c) && !/^from-/.test(c) && !/^via-/.test(c) && !/^to-/.test(c),
    )
    // Use arbitrary-value form so any hex works.
    filtered.push('bg-[' + color + ']')
    previewClass(filtered.join(' '))
  }

  /** Sprint 8 — push a reversible patch into history (truncates redo
   *  branch if user undid + then edited). Cap at 50 entries. */
  function pushHistory(entry: HistoryEntry) {
    setHistory((h) => {
      const head = h.slice(0, historyCursor)
      const next = [...head, entry]
      // Cap at 50 to keep memory bounded
      const trimmed = next.length > 50 ? next.slice(next.length - 50) : next
      setHistoryCursor(trimmed.length)
      return trimmed
    })
  }

  /** Sprint 8 — brief toast that fades in/out. */
  function flashStatus(msg: string, ms = 1400) {
    setStatusToast(msg)
    setTimeout(() => setStatusToast((s) => (s === msg ? null : s)), ms)
  }

  /** Persist a text/className patch to overrides. Optimistic by default:
   *  we don't bump iframeKey because the bridge already applied the change
   *  visually OR the contentEditable user-input is already on-screen.
   *  Returns success. Reloads iframe only when `reload` is true. */
  async function persistElementPatch(
    elementId: string,
    patch: { text?: string; className?: string; attributes?: Record<string, string> },
    opts: { reload?: boolean; label?: string } = {},
  ): Promise<boolean> {
    if (Object.keys(patch).length === 0) return true
    setEditState('saving')
    flashStatus('Saving…', 30_000)
    setSaveLog((l) => ['→ ' + (opts.label ?? 'override ' + elementId), ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/overrides`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ elementId, patch }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveLog((l) => ['✓ saved', ...l])
        setEditState('saved')
        flashStatus('✓ Saved')
        if (opts.reload) setIframeKey((k) => k + 1)
        return true
      }
      setSaveLog((l) => ['✗ save failed', ...((data.log ?? []) as string[]).slice(-3), ...l])
      setEditState('dirty')
      flashStatus('✗ Save failed', 3000)
      return false
    } catch (e) {
      setSaveLog((l) => ['✗ ' + (e as Error).message, ...l])
      setEditState('dirty')
      flashStatus('✗ ' + (e as Error).message, 3000)
      return false
    }
  }

  /** Persist whatever's currently in the edit buffers to overrides. */
  async function saveElementEdit() {
    if (!selectedEl) return
    const patch: { text?: string; className?: string; attributes?: Record<string, string> } = {}
    if (editText !== (selectedEl.text ?? '')) patch.text = editText
    if (editClass !== (selectedEl.className ?? '')) patch.className = editClass
    if (Object.keys(editAttrs).length > 0) patch.attributes = editAttrs
    if (Object.keys(patch).length === 0) { setEditState('idle'); return }
    // Sprint 8 — record reversible history for text + className edits
    if (typeof patch.text === 'string') {
      pushHistory({ elementId: selectedEl.elementId, field: 'text', before: selectedEl.text ?? '', after: patch.text, label: 'Text edit' })
    }
    if (typeof patch.className === 'string') {
      pushHistory({ elementId: selectedEl.elementId, field: 'className', before: selectedEl.className ?? '', after: patch.className, label: 'Style edit' })
    }
    await persistElementPatch(selectedEl.elementId, patch, { label: 'overrides ' + selectedEl.elementId + ' (' + Object.keys(patch).join(', ') + ')' })
  }

  /** Sprint 8 — called when the bridge posts bd:edit-commit (user finished
   *  inline editing on the canvas). The contentEditable already shows the
   *  new text, so this is pure background persistence — no iframe reload. */
  async function commitInlineEditFromBridge(elementId: string, newText: string) {
    // Capture the previous text from selectedEl if it matches; else best-effort
    const prevText = selectedEl?.elementId === elementId ? (selectedEl.text ?? '') : ''
    pushHistory({ elementId, field: 'text', before: prevText, after: newText, label: 'Inline text' })
    if (selectedEl?.elementId === elementId) {
      // Keep right-rail in sync with the canvas edit
      setEditText(newText)
      setSelectedEl({ ...selectedEl, text: newText })
    }
    await persistElementPatch(elementId, { text: newText }, { label: 'inline edit ' + elementId })
  }

  /** Sprint 8 — undo: pop the previous history entry, send the inverse
   *  patch to bridge for immediate visual revert, then persist. */
  async function undo() {
    if (historyCursor === 0) return
    const entry = history[historyCursor - 1]
    if (!entry) return
    setHistoryCursor(historyCursor - 1)
    const patch = { [entry.field]: entry.before } as { text?: string; className?: string }
    // Optimistic preview via bridge
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'bd-studio', type: 'bd:apply', payload: { elementId: entry.elementId, patch } },
      '*',
    )
    if (selectedEl?.elementId === entry.elementId) {
      if (entry.field === 'text') { setEditText(entry.before); setSelectedEl({ ...selectedEl, text: entry.before }) }
      if (entry.field === 'className') { setEditClass(entry.before); setSelectedEl({ ...selectedEl, className: entry.before }) }
    }
    flashStatus('↶ Undo')
    await persistElementPatch(entry.elementId, patch, { label: 'undo ' + entry.label })
  }

  /** Sprint 8 — redo: push the patch we just undid back forward. */
  async function redo() {
    if (historyCursor >= history.length) return
    const entry = history[historyCursor]
    if (!entry) return
    setHistoryCursor(historyCursor + 1)
    const patch = { [entry.field]: entry.after } as { text?: string; className?: string }
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'bd-studio', type: 'bd:apply', payload: { elementId: entry.elementId, patch } },
      '*',
    )
    if (selectedEl?.elementId === entry.elementId) {
      if (entry.field === 'text') { setEditText(entry.after); setSelectedEl({ ...selectedEl, text: entry.after }) }
      if (entry.field === 'className') { setEditClass(entry.after); setSelectedEl({ ...selectedEl, className: entry.after }) }
    }
    flashStatus('↷ Redo')
    await persistElementPatch(entry.elementId, patch, { label: 'redo ' + entry.label })
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
  // Sprint 7b — section composition now works on EVERY page:
  //   Home pages   → recipe.sections        (full page composition)
  //   Other pages  → recipe.pageExtras[id]  (sections injected into baked page)
  // The right-pane list, add/remove/reorder controls, and palette-drop all
  // target the active page's section list via `pageSections` below.
  const isHomePage = activePage.id === 'home'
  const homeSections = recipe?.sections ?? []
  const pageExtrasForActive = recipe?.pageExtras?.[activePage.id] ?? []
  /** The section list for the ACTIVE page tab. */
  const pageSections = isHomePage ? homeSections : pageExtrasForActive

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

  /** Persist a new section list for the ACTIVE page. Home → top-level
   *  `sections`; everything else → `pageExtras[<pageId>]`. */
  async function savePageSections(next: string[]) {
    if (isHomePage) {
      await saveRecipe({ sections: next })
    } else {
      const merged = { ...(recipe?.pageExtras ?? {}) }
      if (next.length === 0) {
        delete merged[activePage.id]
      } else {
        merged[activePage.id] = next
      }
      await saveRecipe({ pageExtras: merged })
    }
  }

  async function addSectionToPage(sectionId: string) {
    const next = [...pageSections, sectionId]
    await savePageSections(next)
    setSelectedSectionIdx(next.length - 1)
  }

  async function removeSectionAt(idx: number) {
    const next = pageSections.filter((_, i) => i !== idx)
    await savePageSections(next)
    setSelectedSectionIdx(null)
  }

  async function moveSection(idx: number, dir: -1 | 1) {
    const target = idx + dir
    if (target < 0 || target >= pageSections.length) return
    const next = [...pageSections]
    ;[next[idx], next[target]] = [next[target]!, next[idx]!]
    await savePageSections(next)
    setSelectedSectionIdx(target)
  }

  /** Duplicate the section at `idx` — insert a copy right after it. */
  async function duplicateSection(idx: number) {
    const sid = pageSections[idx]
    if (!sid) return
    const next = [...pageSections.slice(0, idx + 1), sid, ...pageSections.slice(idx + 1)]
    await savePageSections(next)
    setSelectedSectionIdx(idx + 1)
  }

  /** Reorder via drag from `from` index to drop position `to`. */
  async function reorderSection(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= pageSections.length || to >= pageSections.length) return
    const next = [...pageSections]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    await savePageSections(next)
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
          resolve(d.payload?.atIdx ?? pageSections.length)
        }
      }
      window.addEventListener('message', onAck)
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'bd-studio', type: 'bd:probe-drop', payload: { x, y } },
        '*',
      )
      // Fallback after 500ms
      setTimeout(() => { window.removeEventListener('message', onAck); resolve(pageSections.length) }, 500)
    })
    const next = [...pageSections.slice(0, idx), dropId, ...pageSections.slice(idx)]
    endPaletteDrag()
    await savePageSections(next)
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

  /** Sprint 11a/12b — POST a recipe patch, refetch recipe, reload iframe,
   *  flash a status toast. Used by AddPageMenu + future "add anything"
   *  flows. Distinct from saveRecipe in that it bumps iframeKey + toasts
   *  on success/failure (vs saveRecipe which just updates state). */
  async function postAndRefresh(patch: Record<string, unknown>, label: string): Promise<boolean> {
    setSaving(true)
    setSaveLog((l) => [`→ ${label}`, ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (data.ok) {
        setSaveLog((l) => [`✓ ${label} — regen done`, ...l])
        const fresh = await fetch(`/api/wizard/apps/${wizardId}`).then((r) => r.json())
        const nextRecipe = fresh.recipe as AppRecipe
        setRecipe(nextRecipe)
        setIframeKey((k) => k + 1)
        // Route to the new page if patch refers to one
        const newSlug = (patch as { extraPages?: string[]; blankPages?: string[] }).extraPages?.slice(-1)[0]
          ?? (patch as { blankPages?: string[] }).blankPages?.slice(-1)[0]
        if (newSlug) setActivePageId(newSlug)
        flashStatus(`✓ ${label}`)
        return true
      }
      flashStatus(`✗ Failed: ${(data.log ?? []).slice(-1)[0] ?? 'unknown'}`, 4000)
      return false
    } catch (e) {
      flashStatus(`✗ ${(e as Error).message}`, 4000)
      return false
    } finally { setSaving(false) }
  }

  async function saveRecipe(patch: { branding?: AppRecipe['branding']; sections?: string[]; modules?: string[]; pageExtras?: Record<string, string[]> }) {
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
          {/* Sprint 10 — viewport + zoom */}
          <div className="se-vp-group" title="Preview viewport">
            <button type="button" className={`se-vp-btn ${viewport === 'mobile' ? 'on' : ''}`} onClick={() => setViewport('mobile')} title="Mobile (360px)">📱</button>
            <button type="button" className={`se-vp-btn ${viewport === 'tablet' ? 'on' : ''}`} onClick={() => setViewport('tablet')} title="Tablet (768px)">📱̲</button>
            <button type="button" className={`se-vp-btn ${viewport === 'desktop' ? 'on' : ''}`} onClick={() => setViewport('desktop')} title="Desktop (full)">🖥</button>
          </div>
          <select className="se-zoom" value={String(zoom)} onChange={(e) => setZoom(e.target.value === 'fit' ? 'fit' : Number(e.target.value))} title="Canvas zoom">
            <option value="fit">Fit</option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
          </select>
          {/* Sprint 8 — Undo/Redo buttons + Ctrl+Z/Y shortcuts */}
          <button
            type="button"
            onClick={() => void undo()}
            disabled={historyCursor === 0}
            title={historyCursor === 0 ? 'Nothing to undo' : `Undo (Ctrl+Z) — ${history[historyCursor - 1]?.label ?? ''}`}
            className="se-undo"
          >↶</button>
          <button
            type="button"
            onClick={() => void redo()}
            disabled={historyCursor >= history.length}
            title={historyCursor >= history.length ? 'Nothing to redo' : `Redo (Ctrl+Y) — ${history[historyCursor]?.label ?? ''}`}
            className="se-undo"
          >↷</button>
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

      {/* Sprint 8 — toast for save status (no full reload anymore) */}
      {statusToast ? <div className="se-toast">{statusToast}</div> : null}

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
        {/* Sprint 11a / 12b — add new page menu (templates + custom slug) */}
        <AddPageMenu
          existing={pages.map((p) => p.id)}
          onAdd={async (extraId) => {
            const current = recipe?.extraPages ?? []
            if (current.includes(extraId)) { setActivePageId(extraId); return }
            await postAndRefresh({ extraPages: [...current, extraId] }, `/${extraId}`)
          }}
          onAddCustom={async (slug) => {
            if (!/^[a-z][a-z0-9-]{0,40}$/.test(slug)) {
              flashStatus('✗ Slug must be lowercase letters / numbers / hyphens', 3500)
              return
            }
            const allTaken = new Set(pages.map((p) => p.id))
            if (allTaken.has(slug)) { setActivePageId(slug); return }
            const currentBlank = recipe?.blankPages ?? []
            await postAndRefresh({ blankPages: [...currentBlank, slug] }, `/${slug}`)
          }}
        />
      </nav>

      {/* ─── MAIN GRID ─────────────────────────── */}
      <div className="se-grid">
        {/* LEFT — visual palette (sections or themes, tabbed) */}
        <aside className="se-pane se-left">
          {/* Sprint 7a/9/12: tab switcher — Sections | Themes | Brand | Photos. */}
          <div className="se-left-tabs se-left-tabs-4">
            <button
              type="button"
              className={`se-left-tab ${leftTab === 'sections' ? 'on' : ''}`}
              onClick={() => setLeftTab('sections')}
            >
              🧩 <span className="se-left-tab-count">{catalog.reduce((n, c) => n + c.sections.length, 0)}</span>
            </button>
            <button
              type="button"
              className={`se-left-tab ${leftTab === 'themes' ? 'on' : ''}`}
              onClick={() => setLeftTab('themes')}
            >
              🎨 <span className="se-left-tab-count">{themes.length}</span>
            </button>
            <button
              type="button"
              className={`se-left-tab ${leftTab === 'brand' ? 'on' : ''}`}
              onClick={() => setLeftTab('brand')}
            >
              ⚡ Brand
            </button>
            <button
              type="button"
              className={`se-left-tab ${leftTab === 'photos' ? 'on' : ''}`}
              onClick={() => setLeftTab('photos')}
            >
              📷 <span className="se-left-tab-count">96</span>
            </button>
          </div>

          {leftTab === 'themes' ? (
            <ThemePalette
              themes={themes}
              activeTheme={recipe.theme?.pack ?? null}
              applyTheme={applyTheme}
              applying={themeApplying}
              search={themeSearch}
              setSearch={setThemeSearch}
              category={themeCategory}
              setCategory={setThemeCategory}
            />
          ) : leftTab === 'brand' ? (
            <BrandPanel
              name={name}
              setName={setName}
              tagline={tagline}
              setTagline={setTagline}
              primary={primary}
              setPrimary={setPrimary}
              activeTheme={themes.find((t) => t.id === recipe.theme?.pack) ?? null}
              saving={saving}
              save={() => saveBranding()}
            />
          ) : leftTab === 'photos' ? (
            <PhotoLibrary
              category={photoCategory}
              setCategory={setPhotoCategory}
              onPick={(url) => {
                // If an image is selected → set its src. Else copy URL to clipboard.
                if (selectedEl?.tag === 'img') {
                  previewAttr('src', url)
                  flashStatus('✓ Photo applied to image')
                } else {
                  navigator.clipboard?.writeText(url).catch(() => {})
                  flashStatus('📋 URL copied — select an <img> + paste into src')
                }
              }}
            />
          ) : (
          <>
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
          </>
          )}
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
            <div className={`se-canvas-stage se-canvas-stage-${viewport}`}>
              {/* Sprint 10 — wrapper applies width preset + zoom transform.
                  Inner iframe gets its own size; the wrapper centres + scales. */}
              <div
                className="se-canvas-frame"
                style={{
                  width: viewport === 'mobile' ? 360 : viewport === 'tablet' ? 768 : '100%',
                  transform: zoom === 'fit' ? undefined : `scale(${zoom})`,
                  transformOrigin: 'top center',
                }}
              >
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
              </div>
            </div>
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

        {/* RIGHT — sections on this page + properties */}
        <aside className="se-pane se-right">
          <div className="se-pane-head">
            <strong>
              {isHomePage
                ? 'Sections on Home'
                : `Extra sections on ${activePage.label}`}
            </strong>
            <span className="se-count">{pageSections.length}</span>
          </div>
          {!isHomePage ? (
            <p className="se-help" style={{margin: '0 12px 8px', fontSize: 11, opacity: .65}}>
              Sections added here are appended <em>below</em> the page&apos;s
              built-in content (form / dashboard layout). Drag from the
              left palette or click any section there to add it.
            </p>
          ) : null}
          <ol className="se-section-list">
            {pageSections.map((sid, i) => {
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
                    <button type="button" disabled={i === pageSections.length - 1} onClick={() => moveSection(i, 1)} title="Move down">↓</button>
                    <button type="button" onClick={() => duplicateSection(i)} title="Duplicate" className="se-section-row-dup">⎘</button>
                    <button type="button" onClick={() => removeSectionAt(i)} title="Remove" className="se-section-row-rm">✕</button>
                  </div>
                </li>
              )
            })}
            {pageSections.length === 0 ? (
              <li className="se-section-empty">
                {isHomePage
                  ? 'No sections yet. Click one in the library on the left to add.'
                  : `No extra sections yet on ${activePage.label}. Click a section in the library to append it below the page's built-in content.`}
              </li>
            ) : null}
          </ol>

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

          {selectedSectionIdx !== null && pageSections[selectedSectionIdx] ? (
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
                Selected section: <code>{pageSections[selectedSectionIdx]}</code>
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

                {/* Sprint 2c + S10: image src + library (when element is <img>) */}
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
                    {/* Sprint 10 — uploaded image library */}
                    <UploadLibrary
                      wizardId={wizardId}
                      uploads={uploads}
                      setUploads={setUploads}
                      busy={uploadBusy}
                      setBusy={setUploadBusy}
                      onPick={(url) => previewAttr('src', url)}
                    />
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

                {/* Sprint 9 — Typography panel */}
                <div className="se-edit-block">
                  <p className="se-edit-block-title">Typography</p>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Size</span>
                    <div className="se-tg-buttons">
                      {(['text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl','text-6xl'] as const).map((c) => {
                        const FONT_SIZES = ['text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl','text-6xl','text-7xl','text-8xl','text-9xl'] as const
                        const active = activeClassFrom(FONT_SIZES) === c
                        return (
                          <button key={c} type="button" className={`se-tg-btn ${active ? 'on' : ''}`}
                            onClick={() => setExclusiveClass(FONT_SIZES, c)}
                            title={c}>{c.replace('text-','')}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Weight</span>
                    <div className="se-tg-buttons">
                      {([['font-light','300'],['font-normal','400'],['font-medium','500'],['font-semibold','600'],['font-bold','700'],['font-extrabold','800'],['font-black','900']] as const).map(([c,n]) => {
                        const FONT_WEIGHTS = ['font-thin','font-extralight','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold','font-black'] as const
                        const active = activeClassFrom(FONT_WEIGHTS) === c
                        return (
                          <button key={c} type="button" className={`se-tg-btn ${active ? 'on' : ''}`}
                            onClick={() => setExclusiveClass(FONT_WEIGHTS, c)}
                            title={c}>{n}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Align</span>
                    <div className="se-tg-buttons">
                      {(['text-left','text-center','text-right','text-justify'] as const).map((c) => {
                        const ALIGNS = ['text-left','text-center','text-right','text-justify'] as const
                        const active = activeClassFrom(ALIGNS) === c
                        const sym = { 'text-left': '◧', 'text-center': '☷', 'text-right': '◨', 'text-justify': '☰' }[c]
                        return (
                          <button key={c} type="button" className={`se-tg-btn ${active ? 'on' : ''}`}
                            onClick={() => setExclusiveClass(ALIGNS, c)}
                            title={c}>{sym}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Family</span>
                    <div className="se-tg-buttons">
                      {(['font-sans','font-serif','font-mono'] as const).map((c) => {
                        const FAMILIES = ['font-sans','font-serif','font-mono'] as const
                        const active = activeClassFrom(FAMILIES) === c
                        return (
                          <button key={c} type="button" className={`se-tg-btn ${active ? 'on' : ''}`}
                            onClick={() => setExclusiveClass(FAMILIES, c)}
                            title={c} style={{ fontFamily: c === 'font-serif' ? 'serif' : c === 'font-mono' ? 'monospace' : 'inherit' }}>
                            {c.replace('font-','')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Tracking</span>
                    <div className="se-tg-buttons">
                      {(['tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest'] as const).map((c) => {
                        const TRACK = ['tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest'] as const
                        const active = activeClassFrom(TRACK) === c
                        return (
                          <button key={c} type="button" className={`se-tg-btn ${active ? 'on' : ''}`}
                            onClick={() => setExclusiveClass(TRACK, c)}
                            title={c}>{c.replace('tracking-','').slice(0,4)}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Leading</span>
                    <div className="se-tg-buttons">
                      {(['leading-none','leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose'] as const).map((c) => {
                        const LEADING = ['leading-none','leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose'] as const
                        const active = activeClassFrom(LEADING) === c
                        return (
                          <button key={c} type="button" className={`se-tg-btn ${active ? 'on' : ''}`}
                            onClick={() => setExclusiveClass(LEADING, c)}
                            title={c}>{c.replace('leading-','').slice(0,4)}</button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Sprint 9 — Background (solid + gradient) */}
                <div className="se-edit-block">
                  <p className="se-edit-block-title">Background</p>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Solid</span>
                    <div className="se-swatch-row">
                      {['transparent','#000000','#ffffff','#6366f1','#a855f7','#ec4899','#ef4444','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#18181b'].map((c) => (
                        <button key={c} type="button" className="se-swatch"
                          style={{ background: c, border: c === 'transparent' ? '1px solid #475569' : undefined }}
                          onClick={() => applySolidBg(c)}
                          title={`bg-[${c}]`} />
                      ))}
                      <input type="color" defaultValue="#6366f1" onChange={(e) => applySolidBg(e.target.value)} className="se-swatch se-swatch-pick" />
                    </div>
                  </div>
                  <div className="se-tg-row">
                    <span className="se-tg-label">Gradient</span>
                    <div className="se-grad">
                      <div className="se-grad-stops">
                        <label className="se-grad-stop">
                          <span>From</span>
                          <input type="color" value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} />
                          <code>{gradFrom}</code>
                        </label>
                        <label className="se-grad-stop">
                          <input type="checkbox" checked={gradUseVia} onChange={(e) => setGradUseVia(e.target.checked)} />
                          <span>Via</span>
                          <input type="color" value={gradVia} onChange={(e) => setGradVia(e.target.value)} disabled={!gradUseVia} />
                          <code>{gradUseVia ? gradVia : '—'}</code>
                        </label>
                        <label className="se-grad-stop">
                          <span>To</span>
                          <input type="color" value={gradTo} onChange={(e) => setGradTo(e.target.value)} />
                          <code>{gradTo}</code>
                        </label>
                      </div>
                      <div className="se-grad-dirs">
                        <span className="se-tg-label">Direction</span>
                        {(['to-tl','to-t','to-tr','to-l','to-r','to-bl','to-b','to-br'] as const).map((d) => {
                          const sym = { 'to-tl':'↖','to-t':'↑','to-tr':'↗','to-l':'←','to-r':'→','to-bl':'↙','to-b':'↓','to-br':'↘' }[d]
                          return (
                            <button key={d} type="button"
                              className={`se-grad-dir ${gradDir === d ? 'on' : ''}`}
                              onClick={() => setGradDir(d)}
                              title={`bg-gradient-${d}`}>{sym}</button>
                          )
                        })}
                      </div>
                      <div className="se-grad-preview" style={{
                        background: `linear-gradient(${({
                          'to-r':'90deg','to-br':'135deg','to-b':'180deg','to-bl':'225deg',
                          'to-l':'270deg','to-tl':'315deg','to-t':'0deg','to-tr':'45deg',
                        } as Record<string,string>)[gradDir]}, ${gradFrom}, ${gradUseVia ? gradVia + ', ' : ''}${gradTo})`,
                      }} />
                      <button type="button" className="se-grad-apply"
                        onClick={() => applyGradient({ dir: gradDir, from: gradFrom, via: gradUseVia ? gradVia : null, to: gradTo })}>
                        Apply gradient
                      </button>
                    </div>
                  </div>
                </div>

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

/* ────────────────────────────────────────────────────────────────────
 * ThemePalette — Sprint 7a
 *
 * Renders all 75 theme packs as a scrollable swatch grid in the left
 * sidebar (not buried in a dropdown). Filterable by category + free-
 * text search. Click → applyTheme().
 * ──────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────
 * PhotoLibrary — Sprint 12a
 *
 * 8 categories × 12 hand-picked Picsum seeds = 96 CC-licensed photos.
 * No API key, no rate limits — picsum.photos serves deterministic
 * images for any given seed at any size.
 *
 * Clicking a tile:
 *   - if an <img> is selected → sets its src to the photo URL
 *   - else → copies URL to clipboard + toast
 * ──────────────────────────────────────────────────────────────────── */

const PHOTO_CATEGORIES = [
  { key: 'hero',     label: 'Hero',     icon: '🌅', seeds: ['ocean1','mountain1','city1','desert1','sky1','sunset1','aurora1','forest1','beach1','canyon1','meadow1','lake1'] },
  { key: 'people',   label: 'People',   icon: '👤', seeds: ['portrait1','smile1','team1','founder1','speaker1','customer1','dev1','designer1','student1','remote1','manager1','crowd1'] },
  { key: 'tech',     label: 'Tech',     icon: '💻', seeds: ['laptop1','code1','keyboard1','screen1','data1','network1','chip1','server1','phone1','ai1','vr1','robot1'] },
  { key: 'office',   label: 'Office',   icon: '🏢', seeds: ['coworking1','desk1','meeting1','glass1','rooftop1','lobby1','startup1','wework1','open1','minimal1','plant1','library1'] },
  { key: 'nature',   label: 'Nature',   icon: '🌿', seeds: ['leaves1','river1','peak1','wave1','garden1','bloom1','jungle1','snow1','autumn1','spring1','botany1','wild1'] },
  { key: 'food',     label: 'Food',     icon: '🍕', seeds: ['pasta1','burger1','sushi1','salad1','coffee1','wine1','dessert1','breakfast1','bakery1','farm1','plate1','cocktail1'] },
  { key: 'abstract', label: 'Abstract', icon: '🎨', seeds: ['gradient1','geometric1','texture1','liquid1','neon1','minimal2','mesh1','crystal1','paint1','holo1','retro1','dark1'] },
  { key: 'product',  label: 'Product',  icon: '📦', seeds: ['box1','bottle1','watch1','headphones1','shoe1','bag1','camera1','book1','ring1','candle1','game1','perfume1'] },
] as const

function picsumUrl(seed: string, w = 640, h = 360): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

function PhotoLibrary({
  category, setCategory, onPick,
}: {
  category: string
  setCategory: (c: string) => void
  onPick: (url: string) => void
}) {
  const cat = PHOTO_CATEGORIES.find((c) => c.key === category) ?? PHOTO_CATEGORIES[0]
  return (
    <>
      <div className="se-pane-head">
        <strong>Stock photos</strong>
        <span className="se-count">96 free</span>
      </div>
      <p className="se-help" style={{margin:'0 12px 8px', fontSize: 11, opacity: .8}}>
        Click any photo to apply it to the selected <code>&lt;img&gt;</code>.
        Photos served by <code>picsum.photos</code> (CC0).
      </p>
      <div className="se-theme-cats">
        {PHOTO_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`se-theme-cat-pill ${category === c.key ? 'on' : ''}`}
            onClick={() => setCategory(c.key)}
            title={c.label}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div className="se-photo-grid">
        {cat.seeds.map((seed) => {
          const url = picsumUrl(seed, 640, 360)
          const thumb = picsumUrl(seed, 240, 160)
          return (
            <button
              key={seed}
              type="button"
              className="se-photo-tile"
              onClick={() => onPick(url)}
              title={`${cat.label} · ${seed}`}
            >
              <img src={thumb} alt={seed} loading="lazy" />
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * AddPageMenu — Sprint 11a
 *
 * Renders a "+ New page" button at the end of the page-tabs row. Click
 * opens a popover with the 5 predefined extra-page templates (pricing,
 * about, contact, docs, blog) — disables ones already added. Click a
 * choice → calls onAdd which patches recipe.extraPages + regens.
 *
 * For totally custom routes (e.g. /our-team), the user has two options:
 *   - Open Code tab → add to app/our-team/page.tsx
 *   - Wait for Sprint 12 ("any custom slug" page builder)
 * ──────────────────────────────────────────────────────────────────── */

const EXTRA_PAGE_TEMPLATES: { id: 'pricing'|'about'|'contact'|'docs'|'blog'; label: string; desc: string; icon: string }[] = [
  { id: 'pricing', label: 'Pricing',  desc: '3-tier pricing + FAQ + CTA',         icon: '💰' },
  { id: 'about',   label: 'About',    desc: 'Story + team + values',              icon: '📖' },
  { id: 'contact', label: 'Contact',  desc: 'Form + map + office details',        icon: '✉' },
  { id: 'docs',    label: 'Docs',     desc: 'Sidebar nav + markdown shell',       icon: '📚' },
  { id: 'blog',    label: 'Blog',     desc: 'Index + post template',              icon: '📰' },
]

function AddPageMenu({
  existing,
  onAdd,
  onAddCustom,
}: {
  existing: string[]
  onAdd: (id: 'pricing'|'about'|'contact'|'docs'|'blog') => void | Promise<void>
  onAddCustom: (slug: string) => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [customSlug, setCustomSlug] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="se-add-page" ref={ref}>
      <button
        type="button"
        className="se-add-page-btn"
        onClick={() => setOpen((v) => !v)}
        title="Add a new page to this app"
      >＋ Page</button>
      {open ? (
        <div className="se-add-page-menu">
          <p className="se-add-page-title">Add page from template</p>
          {EXTRA_PAGE_TEMPLATES.map((tmpl) => {
            const already = existing.includes(tmpl.id)
            return (
              <button
                key={tmpl.id}
                type="button"
                className={`se-add-page-item ${already ? 'taken' : ''}`}
                onClick={() => { if (already) return; setOpen(false); void onAdd(tmpl.id) }}
                disabled={already}
                title={already ? 'Already in this app' : tmpl.desc}
              >
                <span className="se-add-page-icon">{tmpl.icon}</span>
                <span className="se-add-page-meta">
                  <strong>/{tmpl.id}</strong>
                  <em>{already ? '✓ Added' : tmpl.desc}</em>
                </span>
              </button>
            )
          })}
          {/* Sprint 12b — custom slug input */}
          <p className="se-add-page-title" style={{marginTop: 6}}>Custom route</p>
          <form
            className="se-add-page-custom"
            onSubmit={(e) => {
              e.preventDefault()
              const slug = customSlug.trim().toLowerCase()
              if (!slug) return
              setOpen(false)
              setCustomSlug('')
              void onAddCustom(slug)
            }}
          >
            <span className="se-add-page-prefix">/</span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
              placeholder="our-team, careers, case-study-x"
              pattern="^[a-z][a-z0-9-]{0,40}$"
              className="se-add-page-input"
              autoFocus
            />
            <button type="submit" className="se-add-page-go" disabled={!customSlug.trim()}>Create</button>
          </form>
        </div>
      ) : null}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * UploadLibrary — Sprint 10
 *
 * Shows uploaded images for the current wizard app + an upload button.
 * Click a thumbnail to set it as the image src on the selected element.
 * Files are POSTed to /api/wizard/apps/<id>/uploads (multipart).
 * They land under overrides/frontend/public/uploads/<name> so they
 * survive every wirer regen via the overlay step.
 * ──────────────────────────────────────────────────────────────────── */

function UploadLibrary({
  wizardId, uploads, setUploads, busy, setBusy, onPick,
}: {
  wizardId: string
  uploads: string[]
  setUploads: (files: string[]) => void
  busy: boolean
  setBusy: (b: boolean) => void
  onPick: (url: string) => void
}) {
  // Load list on mount + when wizardId changes
  useEffect(() => {
    fetch(`/api/wizard/apps/${wizardId}/uploads`)
      .then((r) => r.json())
      .then((d) => setUploads((d.files ?? []) as string[]))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardId])

  async function handleUpload(file: File) {
    setBusy(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await fetch(`/api/wizard/apps/${wizardId}/uploads`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.ok && data.file?.name) {
        setUploads([data.file.name, ...uploads.filter((u) => u !== data.file.name)])
        onPick(data.file.url)
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete ${name}? Any element using it will 404.`)) return
    await fetch(`/api/wizard/apps/${wizardId}/uploads?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
    setUploads(uploads.filter((u) => u !== name))
  }

  return (
    <div className="se-uploads">
      <p className="se-edit-block-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        Uploads <span className="se-left-tab-count">{uploads.length}</span>
      </p>
      <label className={`se-upload-btn ${busy ? 'busy' : ''}`}>
        {busy ? '⏳ Uploading…' : '＋ Upload image'}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0]
            if (f) void handleUpload(f)
            e.currentTarget.value = ''
          }}
          disabled={busy}
          style={{ display: 'none' }}
        />
      </label>
      {uploads.length === 0 ? (
        <p className="se-help" style={{ padding: '6px 0', fontSize: 10 }}>
          No uploads yet. Drop in a logo / hero photo / product shot.
        </p>
      ) : (
        <div className="se-upload-grid">
          {uploads.map((name) => {
            const url = `/uploads/${name}`
            const previewUrl = `http://localhost:3000${url}`
            return (
              <div key={name} className="se-upload-tile">
                <button type="button" className="se-upload-pick" onClick={() => onPick(url)} title={`Use ${name}`}>
                  <img src={previewUrl} alt={name} loading="lazy" />
                </button>
                <div className="se-upload-meta">
                  <code title={name}>{name}</code>
                  <button type="button" className="se-upload-rm" onClick={() => void handleDelete(name)} title="Delete">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * BrandPanel — Sprint 9
 *
 * Centralises branding controls in the left sidebar (Canva-style "Brand
 * Kit"). Edits the same recipe.branding the top-bar Save Brand button
 * does, but with all fields visible in one place + a live current-theme
 * preview swatch.
 * ──────────────────────────────────────────────────────────────────── */

function BrandPanel({
  name, setName,
  tagline, setTagline,
  primary, setPrimary,
  activeTheme,
  saving, save,
}: {
  name: string
  setName: (s: string) => void
  tagline: string
  setTagline: (s: string) => void
  primary: string
  setPrimary: (s: string) => void
  activeTheme: ThemePack | null
  saving: boolean
  save: () => void
}) {
  return (
    <div className="se-brand-pane">
      <div className="se-pane-head">
        <strong>Brand kit</strong>
      </div>
      <p className="se-help" style={{margin:'0 12px 8px', fontSize: 11}}>
        Edit these once — they flow into every section (titles, gradient
        accents, button colours, etc.) on the next save.
      </p>
      <label className="se-field">
        <span>App name</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="MyApp" />
      </label>
      <label className="se-field">
        <span>Tagline</span>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One-line pitch…" />
      </label>
      <label className="se-field">
        <span>Primary colour</span>
        <div className="se-swatch-row">
          {['#6366f1','#a855f7','#ec4899','#ef4444','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#18181b'].map((c) => (
            <button key={c} type="button" className={`se-swatch ${primary === c ? 'on' : ''}`}
              style={{ background: c }} onClick={() => setPrimary(c)} title={c} />
          ))}
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="se-swatch se-swatch-pick" />
        </div>
      </label>
      {activeTheme ? (
        <div className="se-brand-preview">
          <p className="se-tg-label">Active theme</p>
          <div className="se-brand-preview-tile">
            <span className="se-brand-preview-swatch" style={{ background: `linear-gradient(135deg, ${activeTheme.accent}, ${activeTheme.accent2 ?? activeTheme.accent})` }} />
            <div>
              <strong>{activeTheme.displayName}</strong>
              <em>{activeTheme.category}</em>
            </div>
          </div>
          <p className="se-help" style={{margin:'8px 0 0', fontSize: 10}}>
            Swap the theme from the Themes tab ←.
          </p>
        </div>
      ) : null}
      <div style={{padding: '12px 14px'}}>
        <button type="button" className="se-grad-apply" onClick={save} disabled={saving} style={{width: '100%', padding: '10px'}}>
          {saving ? 'Saving…' : '⌘S Save brand changes'}
        </button>
      </div>
    </div>
  )
}

function ThemePalette({
  themes, activeTheme, applyTheme, applying,
  search, setSearch, category, setCategory,
}: {
  themes: ThemePack[]
  activeTheme: string | null
  applyTheme: (id: string) => void
  applying: string | null
  search: string
  setSearch: (s: string) => void
  category: string
  setCategory: (c: string) => void
}) {
  // Build category list from themes.
  const cats = Array.from(new Set(themes.map((t) => t.category))).sort()
  const q = search.trim().toLowerCase()
  const filtered = themes.filter((t) => {
    if (category !== 'all' && t.category !== category) return false
    if (!q) return true
    return (
      t.id.toLowerCase().includes(q) ||
      t.displayName.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
    )
  })
  // Group by category for visual grouping when "all" selected.
  const groups: Record<string, ThemePack[]> = {}
  for (const t of filtered) {
    (groups[t.category] ??= []).push(t)
  }

  return (
    <>
      <div className="se-pane-head">
        <strong>Theme packs</strong>
        <span className="se-count">{filtered.length} / {themes.length}</span>
      </div>
      <input
        type="search"
        placeholder={`Search ${themes.length} themes…`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="se-palette-search"
      />
      {/* Pills row for category filter — small enough to fit a 240px sidebar. */}
      <div className="se-theme-cats">
        <button
          type="button"
          className={`se-theme-cat-pill ${category === 'all' ? 'on' : ''}`}
          onClick={() => setCategory('all')}
        >
          All <span className="se-theme-cat-pill-n">{themes.length}</span>
        </button>
        {cats.map((c) => {
          const count = themes.filter((t) => t.category === c).length
          return (
            <button
              key={c}
              type="button"
              className={`se-theme-cat-pill ${category === c ? 'on' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c} <span className="se-theme-cat-pill-n">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="se-theme-palette">
        {Object.keys(groups).sort().map((catKey) => (
          <div key={catKey} className="se-theme-palette-group">
            {category === 'all' ? <div className="se-palette-group-label">{catKey}</div> : null}
            <div className="se-theme-palette-grid">
              {groups[catKey]!.map((t) => {
                const isActive = activeTheme === t.id
                const isApplying = applying === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`se-theme-tile ${isActive ? 'on' : ''} ${isApplying ? 'applying' : ''}`}
                    title={t.description || t.id}
                    onClick={() => applyTheme(t.id)}
                    disabled={isApplying}
                  >
                    <span
                      className="se-theme-tile-swatch"
                      style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2 ?? t.accent})` }}
                    />
                    <span className="se-theme-tile-meta">
                      <strong>{t.displayName}</strong>
                      <em>{t.category}</em>
                    </span>
                    {isActive ? <span className="se-theme-tile-check">✓</span> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="se-theme-empty">No themes match. Try a different search or category.</p>
        ) : null}
      </div>
    </>
  )
}
