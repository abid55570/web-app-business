'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Palette } from '../components/Palette'
import { Canvas } from '../components/Canvas'
import { PropertiesPane } from '../components/PropertiesPane'
import { PagesPanel } from '../components/PagesPanel'
import { TopBar } from '../components/TopBar'
import { RenderModal } from '../components/RenderModal'
import { Tour } from '../components/Tour'
import { hasCompletedTour, loadTourProgress, resetTour } from '../lib/tour'
import { STUDIO_TOUR_STEPS } from '../lib/tour-steps'
import {
  initHistory,
  pushHistory,
  undo as undoH,
  redo as redoH,
  canUndo,
  canRedo,
  type History,
} from '../lib/history'
import { setClip, getClip } from '../lib/clipboard'
import type {
  CanvasBlock,
  PuckBlockManifest,
  StudioMultiPageState,
  StudioPage,
} from '../lib/types'

/** Snapshot used by history — the full multi-page workspace state. */
type Snap = StudioMultiPageState

export default function StudioPage() {
  const [manifests, setManifests] = useState<PuckBlockManifest[]>([])
  const [themes, setThemes] = useState<string[]>([])
  const [activeTheme, setActiveTheme] = useState<string>('nordic')
  const [viewport, setViewport] = useState<'sm' | 'md' | 'lg' | 'full'>('full')
  const [loading, setLoading] = useState(true)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activePageId, setActivePageId] = useState<string>('home')
  const [renderOpen, setRenderOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [tourStartIdx, setTourStartIdx] = useState(0)

  // First-run: auto-open the tour for new users.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!hasCompletedTour()) {
      // Small delay so initial paint happens before backdrop dims it.
      const t = setTimeout(() => {
        setTourStartIdx(loadTourProgress())
        setTourOpen(true)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [])
  const [history, setHistory] = useState<History<Snap>>(() =>
    initHistory<Snap>({ pages: [emptyPage('home')], activePageId: 'home' }, 'init'),
  )

  const state = history.present.snapshot
  const activePage =
    state.pages.find((p) => p.id === activePageId) ?? state.pages[0]
  const page = activePage?.blocks ?? []

  useEffect(() => {
    void reload()
  }, [])

  async function reload() {
    setLoading(true)
    const res = await fetch('/api/sections')
    const data = (await res.json()) as {
      blocks: PuckBlockManifest[]
      themes: string[]
      state: StudioMultiPageState | { blocks: CanvasBlock[] }
    }
    setManifests(data.blocks)
    setThemes(data.themes ?? [])
    // Migrate legacy { blocks } → multi-page
    const next: StudioMultiPageState =
      'pages' in (data.state ?? {})
        ? (data.state as StudioMultiPageState)
        : {
            pages: [
              {
                id: 'home',
                name: 'Home',
                route: '/',
                blocks: (data.state as { blocks?: CanvasBlock[] })?.blocks ?? [],
              },
            ],
            activePageId: 'home',
          }
    setActivePageId(next.activePageId)
    setHistory(initHistory(next, 'load'))
    setLoading(false)
  }

  function commit(snapshot: Snap, action: string) {
    setHistory((h) => pushHistory(h, snapshot, action))
  }

  function patchActivePage(
    mut: (page: StudioPage) => StudioPage,
    action: string,
  ) {
    commit(
      {
        ...state,
        pages: state.pages.map((p) => (p.id === activePageId ? mut(p) : p)),
      },
      action,
    )
  }

  const manifestsById = Object.fromEntries(manifests.map((m) => [m.id, m]))

  const insert = useCallback(
    (blockId: string, atIndex?: number) => {
      const m = manifests.find((x) => x.id === blockId)
      if (!m) return
      const instanceId = `${blockId}-${nextInstance()}`
      const newBlock: CanvasBlock = {
        instanceId,
        blockId,
        props: { ...m.defaultProps },
      }
      patchActivePage((p) => {
        const idx = atIndex ?? p.blocks.length
        const blocks = [...p.blocks.slice(0, idx), newBlock, ...p.blocks.slice(idx)]
        return { ...p, blocks }
      }, `Add ${m.displayName}`)
      setSelectedId(instanceId)
    },
    [manifests, activePageId, state],
  )

  const move = useCallback(
    (id: string, dir: -1 | 1) => {
      patchActivePage((p) => {
        const idx = p.blocks.findIndex((b) => b.instanceId === id)
        if (idx < 0) return p
        const swap = idx + dir
        if (swap < 0 || swap >= p.blocks.length) return p
        const blocks = p.blocks.slice()
        const tmp = blocks[idx]!
        blocks[idx] = blocks[swap]!
        blocks[swap] = tmp
        return { ...p, blocks }
      }, `Move block ${dir > 0 ? 'down' : 'up'}`)
    },
    [activePageId, state],
  )

  const reorder = useCallback(
    (fromId: string, toIndex: number) => {
      patchActivePage((p) => {
        const fromIdx = p.blocks.findIndex((b) => b.instanceId === fromId)
        if (fromIdx < 0) return p
        const blocks = p.blocks.slice()
        const moved = blocks.splice(fromIdx, 1)[0]!
        const insertAt = toIndex > fromIdx ? toIndex - 1 : toIndex
        blocks.splice(insertAt, 0, moved)
        return { ...p, blocks }
      }, `Reorder block`)
    },
    [activePageId, state],
  )

  const del = useCallback(
    (id: string) => {
      patchActivePage(
        (p) => ({ ...p, blocks: p.blocks.filter((b) => b.instanceId !== id) }),
        'Delete block',
      )
      setSelectedId((cur) => (cur === id ? null : cur))
    },
    [activePageId, state],
  )

  const duplicate = useCallback(
    (id: string) => {
      const src = page.find((b) => b.instanceId === id)
      if (!src) return
      const instanceId = `${src.blockId}-${nextInstance()}`
      const copy: CanvasBlock = { ...src, instanceId, props: { ...src.props } }
      patchActivePage((p) => {
        const idx = p.blocks.findIndex((b) => b.instanceId === id)
        const blocks = [...p.blocks.slice(0, idx + 1), copy, ...p.blocks.slice(idx + 1)]
        return { ...p, blocks }
      }, 'Duplicate block')
      setSelectedId(instanceId)
    },
    [activePageId, state, page],
  )

  const updateProp = useCallback(
    (propName: string, value: unknown) => {
      if (!selectedId) return
      patchActivePage(
        (p) => ({
          ...p,
          blocks: p.blocks.map((b) =>
            b.instanceId === selectedId
              ? { ...b, props: { ...b.props, [propName]: value } }
              : b,
          ),
        }),
        `Edit ${propName}`,
      )
    },
    [selectedId, activePageId, state],
  )

  const undo = useCallback(() => {
    if (!canUndo(history)) return
    setHistory(undoH(history))
  }, [history])

  const redo = useCallback(() => {
    if (!canRedo(history)) return
    setHistory(redoH(history))
  }, [history])

  // ── Pages ────────────────────────────────────────────────────
  const addPage = useCallback(
    (name: string) => {
      const id = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)
      commit(
        {
          ...state,
          pages: [...state.pages, { id, name, route: `/${slugify(name)}`, blocks: [] }],
          activePageId: id,
        },
        `Add page ${name}`,
      )
      setActivePageId(id)
    },
    [state],
  )

  const renamePage = useCallback(
    (id: string, name: string) => {
      commit(
        {
          ...state,
          pages: state.pages.map((p) => (p.id === id ? { ...p, name } : p)),
        },
        `Rename page → ${name}`,
      )
    },
    [state],
  )

  const deletePage = useCallback(
    (id: string) => {
      if (state.pages.length <= 1) return
      const next = state.pages.filter((p) => p.id !== id)
      commit({ ...state, pages: next, activePageId: next[0].id }, 'Delete page')
      setActivePageId(next[0].id)
    },
    [state],
  )

  // ── Save ────────────────────────────────────────────────────
  async function save() {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state satisfies StudioMultiPageState),
    })
    if (res.ok) setSavedAt(new Date().toLocaleTimeString())
  }

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      const inField =
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      const mod = e.metaKey || e.ctrlKey
      if (e.key === '/' && !inField) {
        e.preventDefault()
        document
          .querySelector<HTMLInputElement>('.palette-search-input')
          ?.focus()
        return
      }
      if (e.key === 'Escape' && !inField) {
        setSelectedId(null)
        return
      }
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault()
        redo()
        return
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
        return
      }
      if (!selectedId || inField) return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        del(selectedId)
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicate(selectedId)
      }
      if (mod && e.key.toLowerCase() === 'c') {
        const src = page.find((b) => b.instanceId === selectedId)
        if (src) setClip(src)
      }
      if (mod && e.key.toLowerCase() === 'v') {
        const c = getClip()
        if (c) {
          const instanceId = `${c.blockId}-${nextInstance()}`
          patchActivePage((p) => ({ ...p, blocks: [...p.blocks, { ...c, instanceId, props: { ...c.props } }] }), 'Paste block')
          setSelectedId(instanceId)
        }
      }
      if (mod && e.key === 'ArrowUp') { e.preventDefault(); move(selectedId, -1) }
      if (mod && e.key === 'ArrowDown') { e.preventDefault(); move(selectedId, 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedId, del, duplicate, page, move, activePageId, state])

  const selectedBlock = page.find((b) => b.instanceId === selectedId) ?? null
  const selectedManifest = selectedBlock
    ? manifestsById[selectedBlock.blockId] ?? null
    : null

  const totalBlocks = useMemo(
    () => state.pages.reduce((acc, p) => acc + p.blocks.length, 0),
    [state],
  )

  if (loading) {
    return (
      <div className="canvas-empty" style={{ height: '100vh' }}>
        Loading section catalog…
      </div>
    )
  }

  return (
    <div className="studio-shell">
      <TopBar
        totalBlocks={totalBlocks}
        savedAt={savedAt}
        canUndo={canUndo(history)}
        canRedo={canRedo(history)}
        onUndo={undo}
        onRedo={redo}
        onReset={() => void reload()}
        onSave={() => void save()}
        onRender={() => setRenderOpen(true)}
        onTour={() => {
          resetTour()
          setTourStartIdx(0)
          setTourOpen(true)
        }}
        themes={themes}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        viewport={viewport}
        onViewportChange={setViewport}
        lastAction={history.present.action}
      />
      <PagesPanel
        pages={state.pages}
        activePageId={activePageId}
        onSwitch={setActivePageId}
        onAdd={addPage}
        onRename={renamePage}
        onDelete={deletePage}
      />
      <Palette blocks={manifests} onInsert={insert} />
      <Canvas
        page={page}
        manifestsById={manifestsById}
        selectedId={selectedId}
        viewport={viewport}
        onSelect={setSelectedId}
        onMove={move}
        onDelete={del}
        onDuplicate={duplicate}
        onReorder={reorder}
        onInsertAt={insert}
        onInlineEdit={(id, key, value) => {
          setSelectedId(id)
          patchActivePage(
            (p) => ({
              ...p,
              blocks: p.blocks.map((b) =>
                b.instanceId === id ? { ...b, props: { ...b.props, [key]: value } } : b,
              ),
            }),
            `Edit ${key}`,
          )
        }}
      />
      <PropertiesPane
        block={selectedBlock}
        manifest={selectedManifest}
        onChange={updateProp}
      />
      <RenderModal
        open={renderOpen}
        state={state}
        onClose={() => setRenderOpen(false)}
      />
      {tourOpen ? (
        <Tour
          steps={STUDIO_TOUR_STEPS}
          initialIndex={tourStartIdx}
          onClose={() => setTourOpen(false)}
        />
      ) : null}
    </div>
  )
}

function emptyPage(id: string): StudioPage {
  return { id, name: 'Home', route: '/', blocks: [] }
}

let _counter = 0
function nextInstance() {
  _counter += 1
  return String(_counter).padStart(4, '0')
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'page'
}
