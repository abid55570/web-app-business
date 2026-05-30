export type NavSidebarStickyGroup = {
  title: string
  links: { label: string; href: string; active?: boolean }[]
}

export type NavSidebarStickyProps = {
  brand?: string
  groups: NavSidebarStickyGroup[]
  footer?: { label: string; href: string }
}

export function NavSidebarSticky({
  brand,
  groups,
  footer,
}: NavSidebarStickyProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-border bg-surface-raised">
      {brand ? (
        <div className="border-b border-border px-5 py-4">
          <p className="text-base font-bold text-foreground">{brand}</p>
        </div>
      ) : null}
      <nav className="flex-1 overflow-y-auto p-3">
        {groups.map((g, i) => (
          <div key={i} className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <ul className="space-y-0.5">
              {g.links.map((l, j) => (
                <li key={j}>
                  <a
                    href={l.href}
                    className={
                      l.active
                        ? 'block rounded px-2 py-1.5 text-sm font-semibold text-primary bg-primary/10'
                        : 'block rounded px-2 py-1.5 text-sm text-foreground hover:bg-surface-overlay'
                    }
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {footer ? (
        <div className="border-t border-border p-3">
          <a
            href={footer.href}
            className="block rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-surface-overlay hover:text-foreground"
          >
            {footer.label}
          </a>
        </div>
      ) : null}
    </aside>
  )
}
