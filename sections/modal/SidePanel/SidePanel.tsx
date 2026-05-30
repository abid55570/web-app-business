export type SidePanelProps = {
  id: string
  side?: 'right' | 'left'
  title: string
  bodyHtml: string
}

export function SidePanel({
  id,
  side = 'right',
  title,
  bodyHtml,
}: SidePanelProps) {
  const sideClass =
    side === 'right' ? 'right-0 border-l' : 'left-0 border-r'
  return (
    <aside
      id={id}
      role="dialog"
      aria-label={title}
      className={`fixed top-0 z-40 hidden h-full w-full max-w-md ${sideClass} border-border bg-surface-raised shadow-xl target:flex flex-col`}
    >
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <a
          href="#"
          aria-label="Close side panel"
          className="rounded-md p-1 text-muted-foreground hover:bg-accent"
        >
          ×
        </a>
      </header>
      <div
        className="flex-1 overflow-y-auto p-5 text-sm text-foreground"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </aside>
  )
}
