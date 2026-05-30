export type SidebarToggleItem = {
  icon: string
  label: string
  href: string
  active?: boolean
}

export type SidebarToggleProps = {
  id?: string
  brand: string
  items: SidebarToggleItem[]
}

export function SidebarToggle({
  id = 'sidebar-toggle',
  brand,
  items,
}: SidebarToggleProps) {
  return (
    <aside
      id={id}
      className="group/sb sticky top-0 flex h-screen w-16 flex-col border-r border-border bg-surface-sunken target:w-56 transition-[width] [&:target]:w-56"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <p className="overflow-hidden truncate text-sm font-bold text-foreground opacity-0 group-target/sb:opacity-100 [&[target]]:opacity-100">
          {brand}
        </p>
        <a
          href={`#${id}`}
          aria-label="Toggle sidebar"
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-accent"
        >
          ≡
        </a>
      </div>
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i}>
              <a
                href={it.href}
                aria-current={it.active ? 'page' : undefined}
                title={it.label}
                className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
                  it.active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <span aria-hidden className="flex-none text-lg">
                  {it.icon}
                </span>
                <span className="hidden truncate group-target/sb:inline">
                  {it.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
