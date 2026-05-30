export type SearchOmniBarShortcut = {
  key: string
  label: string
  href: string
}

export type SearchOmniBarProps = {
  placeholder?: string
  shortcuts?: SearchOmniBarShortcut[]
  recent?: string[]
}

export function SearchOmniBar({
  placeholder = 'Search anything…',
  shortcuts = [],
  recent = [],
}: SearchOmniBarProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-surface-overlay px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>
        {recent.length ? (
          <div className="border-b border-border px-4 py-2">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Recent
            </p>
            <ul className="space-y-1">
              {recent.map((r, i) => (
                <li
                  key={i}
                  className="cursor-pointer rounded px-2 py-1 text-sm text-foreground hover:bg-surface-overlay"
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {shortcuts.length ? (
          <div className="px-4 py-2">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Jump to
            </p>
            <ul className="space-y-1">
              {shortcuts.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.href}
                    className="flex items-center justify-between rounded px-2 py-1 text-sm text-foreground hover:bg-surface-overlay"
                  >
                    <span>{s.label}</span>
                    <kbd className="rounded border border-border bg-surface-overlay px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {s.key}
                    </kbd>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
