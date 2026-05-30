export type SidebarCollapsibleSection = {
  heading: string
  links: Array<{ label: string; href: string; active?: boolean }>
}

export type SidebarCollapsibleProps = {
  brand: string
  sections: SidebarCollapsibleSection[]
  children?: React.ReactNode
}

export function SidebarCollapsible({
  brand,
  sections,
  children,
}: SidebarCollapsibleProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-surface-sunken lg:block">
        <div className="border-b border-border px-5 py-4">
          <p className="text-base font-bold text-foreground">{brand}</p>
        </div>
        <nav className="px-2 py-4">
          {sections.map((s, i) => (
            <details key={i} open className="group mb-1">
              <summary className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent list-none">
                {s.heading}
                <span
                  aria-hidden
                  className="text-xs transition-transform group-open:rotate-90"
                >
                  ▸
                </span>
              </summary>
              <ul className="mt-1 space-y-0.5">
                {s.links.map((l, j) => (
                  <li key={j}>
                    <a
                      href={l.href}
                      aria-current={l.active ? 'page' : undefined}
                      className={`block rounded-md px-6 py-1.5 text-sm ${
                        l.active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </aside>
      <main className="overflow-y-auto bg-surface-base p-6">{children}</main>
    </div>
  )
}
