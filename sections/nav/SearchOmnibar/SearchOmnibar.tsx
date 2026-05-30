export type SearchOmnibarGroup = {
  heading: string
  items: Array<{ label: string; href: string; shortcut?: string }>
}

export type SearchOmnibarProps = {
  id: string
  triggerLabel: string
  placeholder?: string
  groups: SearchOmnibarGroup[]
}

export function SearchOmnibar({
  id,
  triggerLabel,
  placeholder = 'Search anything…',
  groups,
}: SearchOmnibarProps) {
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-raised px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
      >
        <span aria-hidden>🔍</span>
        {triggerLabel}
        <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="invisible fixed inset-0 z-50 bg-black/60 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <div className="mx-auto mt-20 w-full max-w-2xl overflow-hidden rounded-xl bg-surface-raised shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span aria-hidden className="text-muted-foreground">🔍</span>
            <input
              type="search"
              placeholder={placeholder}
              autoFocus
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <a
              href="#"
              aria-label="Close search"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Esc
            </a>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {groups.map((g, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {g.heading}
                </p>
                <ul>
                  {g.items.map((it, j) => (
                    <li key={j}>
                      <a
                        href={it.href}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        <span>{it.label}</span>
                        {it.shortcut ? (
                          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            {it.shortcut}
                          </kbd>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
