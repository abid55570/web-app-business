export type SidebarSearchSection = {
  heading: string
  items: Array<{ label: string; href: string; active?: boolean }>
}

export type SidebarSearchProps = {
  action: string
  q?: string
  sections: SidebarSearchSection[]
}

export function SidebarSearch({
  action,
  q = '',
  sections,
}: SidebarSearchProps) {
  return (
    <aside className="w-full max-w-xs border-r border-border bg-surface-sunken">
      <form action={action} method="GET" className="border-b border-border p-3">
        <label htmlFor="b-dash-sidebar-q" className="sr-only">
          Filter sidebar
        </label>
        <input
          id="b-dash-sidebar-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Filter…"
          className="block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </form>
      <nav className="p-3">
        {sections.map((s, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {s.heading}
            </p>
            <ul className="space-y-0.5">
              {s.items.map((it, j) => (
                <li key={j}>
                  <a
                    href={it.href}
                    aria-current={it.active ? 'page' : undefined}
                    className={`block rounded-md px-2 py-1.5 text-sm ${
                      it.active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
