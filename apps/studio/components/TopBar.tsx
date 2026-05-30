'use client'

const VIEWPORTS: { id: 'sm' | 'md' | 'lg' | 'full'; icon: string; label: string }[] = [
  { id: 'sm', icon: '📱', label: 'Mobile' },
  { id: 'md', icon: '💻', label: 'Tablet' },
  { id: 'lg', icon: '🖥', label: 'Desktop' },
  { id: 'full', icon: '⬛', label: 'Full' },
]

export function TopBar({
  totalBlocks,
  savedAt,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onSave,
  onRender,
  themes,
  activeTheme,
  onThemeChange,
  viewport,
  onViewportChange,
  lastAction,
}: {
  totalBlocks: number
  savedAt: string | null
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onSave: () => void
  onRender: () => void
  themes: string[]
  activeTheme: string
  onThemeChange: (t: string) => void
  viewport: 'sm' | 'md' | 'lg' | 'full'
  onViewportChange: (v: 'sm' | 'md' | 'lg' | 'full') => void
  lastAction: string
}) {
  return (
    <header className="studio-top">
      <div className="topbar-left">
        <h1>
          b-dash Studio
          <span className="topbar-count">· {totalBlocks} block{totalBlocks === 1 ? '' : 's'}</span>
          {savedAt ? <span className="topbar-saved">saved {savedAt}</span> : null}
        </h1>
        <span className="topbar-action" title="Last action">
          {lastAction}
        </span>
      </div>
      <div className="topbar-middle">
        <select
          className="topbar-select"
          value={activeTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          title="Theme"
        >
          {themes.map((t) => (
            <option key={t} value={t}>
              🎨 {t}
            </option>
          ))}
        </select>
        <div className="topbar-viewports">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              type="button"
              title={v.label}
              className={`topbar-vp ${viewport === v.id ? 'active' : ''}`}
              onClick={() => onViewportChange(v.id)}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>
      <div className="studio-top-actions">
        <button
          type="button"
          className="btn"
          title="Undo (⌘Z)"
          disabled={!canUndo}
          onClick={onUndo}
        >
          ↶
        </button>
        <button
          type="button"
          className="btn"
          title="Redo (⌘⇧Z)"
          disabled={!canRedo}
          onClick={onRedo}
        >
          ↷
        </button>
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
        <button type="button" className="btn" onClick={onRender} title="Render to app">
          ▶ Render
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Save (⌘S)
        </button>
      </div>
    </header>
  )
}
