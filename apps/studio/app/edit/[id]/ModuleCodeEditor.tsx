'use client'

/**
 * Studio v2 Sprint 4 — Monaco code editor for module + section + page files.
 *
 * Left rail: collapsible tree (modules → files / pages / sections).
 * Right pane: Monaco editor (dynamic import — Monaco is large).
 * Toolbar: Save (writes to overrides/<path>) · Reset (delete override)
 *          · "uses override" badge.
 *
 * Save calls POST .../file?path=<rel>, which writes overrides/<rel>
 * + triggers wirer regen so the overlay step picks the file up on
 * every future regen too. Studio doesn't need to touch the generated
 * source directly — overrides/ is the safe path.
 */

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

// Monaco is HEAVY (~3 MB) — load only when this editor mounts.
const Monaco = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => <div style={{ padding: 16, color: '#94a3b8' }}>Loading Monaco editor…</div>,
})

export type FileEntry = { path: string; name: string; size: number }
export type FileTree = {
  modules: { id: string; files: FileEntry[] }[]
  pages: FileEntry[]
  sections: { id: string; files: FileEntry[] }[]
}

function languageOf(path: string): string {
  if (path.endsWith('.py')) return 'python'
  if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript'
  if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.yaml') || path.endsWith('.yml')) return 'yaml'
  if (path.endsWith('.css') || path.endsWith('.scss')) return 'css'
  if (path.endsWith('.md')) return 'markdown'
  if (path.endsWith('.prisma')) return 'prisma'
  if (path.endsWith('.sh') || path.endsWith('.bat')) return 'shell'
  return 'plaintext'
}

export function ModuleCodeEditor({ wizardId }: { wizardId: string }) {
  const [tree, setTree] = useState<FileTree | null>(null)
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({})
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState<string | null>(null)
  const [isOverride, setIsOverride] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [log, setLog] = useState<string[]>([])

  // Load tree on mount
  useEffect(() => {
    fetch(`/api/wizard/apps/${wizardId}/files`)
      .then((r) => r.json())
      .then((d) => setTree(d as FileTree))
      .catch(() => {})
  }, [wizardId])

  // Load file content when selectedPath changes
  useEffect(() => {
    if (!selectedPath) return
    setContent('')
    setOriginalContent(null)
    setDirty(false)
    fetch(`/api/wizard/apps/${wizardId}/file?path=${encodeURIComponent(selectedPath)}`)
      .then((r) => r.json())
      .then((d) => {
        if ('error' in d) { setContent(`# ${d.error}`); return }
        setContent(d.content ?? '')
        setIsOverride(!!d.isOverride)
        setOriginalContent(d.originalContent ?? null)
      })
      .catch(() => setContent('# load error'))
  }, [wizardId, selectedPath])

  async function save() {
    if (!selectedPath) return
    setSaving(true)
    setLog((l) => [`→ save ${selectedPath}`, ...l])
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/file?path=${encodeURIComponent(selectedPath)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.ok) {
        setLog((l) => [`✓ saved → overrides/${selectedPath} + regen`, ...l])
        setDirty(false)
        setIsOverride(true)
      } else {
        setLog((l) => [`✗ save failed`, ...((data.log ?? []) as string[]).slice(-3), ...l])
      }
    } catch (e) {
      setLog((l) => [`✗ ${(e as Error).message}`, ...l])
    } finally {
      setSaving(false)
    }
  }

  async function resetOverride() {
    if (!selectedPath) return
    if (!confirm('Delete override + revert to baked default?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/wizard/apps/${wizardId}/file?path=${encodeURIComponent(selectedPath)}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setLog((l) => [`↩ removed override`, ...l])
        setIsOverride(false)
        // Reload baked
        const fresh = await fetch(`/api/wizard/apps/${wizardId}/file?path=${encodeURIComponent(selectedPath)}`).then((r) => r.json())
        setContent(fresh.content ?? '')
        setOriginalContent(null)
        setDirty(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const language = useMemo(() => (selectedPath ? languageOf(selectedPath) : 'plaintext'), [selectedPath])

  return (
    <div className="se-code-editor">
      {/* Tree */}
      <aside className="se-code-tree">
        <p className="se-code-tree-title">Modules ({tree?.modules.length ?? '…'})</p>
        {tree?.modules.map((m) => (
          <div key={m.id} className="se-code-tree-group">
            <button type="button" className="se-code-tree-row se-code-tree-group-head" onClick={() => setOpenModules((s) => ({ ...s, [m.id]: !s[m.id] }))}>
              <span style={{ width: 12, display: 'inline-block' }}>{openModules[m.id] ? '▾' : '▸'}</span>
              <strong>{m.id}</strong>
              <span style={{ marginLeft: 'auto', opacity: .5, fontSize: 10 }}>{m.files.length}</span>
            </button>
            {openModules[m.id] ? m.files.map((f) => (
              <button
                key={f.path}
                type="button"
                className={`se-code-tree-row se-code-tree-file ${selectedPath === f.path ? 'on' : ''}`}
                onClick={() => setSelectedPath(f.path)}
                title={f.path}
              >
                <span style={{ marginLeft: 18 }}>📄 {f.name}</span>
              </button>
            )) : null}
          </div>
        ))}

        <p className="se-code-tree-title" style={{ marginTop: 16 }}>Pages ({tree?.pages.length ?? '…'})</p>
        {tree?.pages.map((f) => (
          <button
            key={f.path}
            type="button"
            className={`se-code-tree-row se-code-tree-file ${selectedPath === f.path ? 'on' : ''}`}
            onClick={() => setSelectedPath(f.path)}
            title={f.path}
          >
            📄 {f.path.replace('frontend/src/app/', '')}
          </button>
        ))}

        <p className="se-code-tree-title" style={{ marginTop: 16 }}>Sections ({tree?.sections.length ?? '…'})</p>
        {tree?.sections.map((s) => (
          <div key={s.id} className="se-code-tree-group">
            <button type="button" className="se-code-tree-row se-code-tree-group-head" onClick={() => setOpenSection((st) => ({ ...st, [s.id]: !st[s.id] }))}>
              <span style={{ width: 12, display: 'inline-block' }}>{openSection[s.id] ? '▾' : '▸'}</span>
              <strong>{s.id}</strong>
            </button>
            {openSection[s.id] ? s.files.map((f) => (
              <button
                key={f.path}
                type="button"
                className={`se-code-tree-row se-code-tree-file ${selectedPath === f.path ? 'on' : ''}`}
                onClick={() => setSelectedPath(f.path)}
                title={f.path}
              >
                <span style={{ marginLeft: 18 }}>📄 {f.name}</span>
              </button>
            )) : null}
          </div>
        ))}
      </aside>

      {/* Editor */}
      <div className="se-code-main">
        {selectedPath ? (
          <>
            <div className="se-code-toolbar">
              <code className="se-code-toolbar-path">{selectedPath}</code>
              {isOverride ? <span className="se-code-tag se-code-tag-override">override</span> : <span className="se-code-tag">baked</span>}
              {dirty ? <span className="se-code-tag se-code-tag-dirty">● unsaved</span> : null}
              <span style={{ flex: 1 }} />
              {isOverride ? (
                <button type="button" className="se-btn se-btn-ghost" onClick={resetOverride} disabled={saving}>↩ Revert override</button>
              ) : null}
              <button type="button" className="se-btn se-btn-primary" onClick={save} disabled={!dirty || saving}>
                {saving ? '⏳ Saving…' : '💾 Save'}
              </button>
            </div>
            <div className="se-code-monaco">
              <Monaco
                height="100%"
                language={language}
                value={content}
                theme="vs-dark"
                onChange={(v) => { setContent(v ?? ''); setDirty(true) }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
            {log.length > 0 ? (
              <div className="se-code-log">{log.slice(0, 4).map((l, i) => <div key={i}>{l}</div>)}</div>
            ) : null}
          </>
        ) : (
          <div className="se-code-empty">
            <p className="se-code-empty-icon">📂</p>
            <h3>Pick a file from the tree</h3>
            <p>Edit module routers, schemas, models, page composers, or section components.<br />Saves write to <code>overrides/&lt;path&gt;</code> — wirer applies them after every regen so your edits survive structural changes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
