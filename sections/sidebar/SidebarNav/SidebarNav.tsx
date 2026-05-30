/**
 * SidebarNav — vertical nav rail. Sticky on lg, scrolls inside parent below.
 * Caller decides which item is active by passing active: true.
 */
export type SidebarItem = {
  label: string
  href: string
  active?: boolean
}

export type SidebarGroup = {
  heading: string
  items: SidebarItem[]
}

export type SidebarNavProps = {
  brandName?: string
  groups: SidebarGroup[]
}

export function SidebarNav({ brandName, groups }: SidebarNavProps) {
  return (
    <aside className="w-full border-r border-border bg-surface-raised p-6 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto">
      {brandName ? (
        <p className="mb-6 text-base font-bold text-foreground">{brandName}</p>
      ) : null}
      <nav aria-label="Sidebar">
        {groups.map((g, i) => (
          <div key={i} className="mb-6 last:mb-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {g.heading}
            </p>
            <ul className="space-y-1">
              {g.items.map((item, j) => (
                <li key={j}>
                  <a
                    href={item.href}
                    aria-current={item.active ? 'page' : undefined}
                    className={`block rounded-md px-3 py-1.5 text-sm ${
                      item.active
                        ? 'bg-primary/10 font-semibold text-primary'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
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
