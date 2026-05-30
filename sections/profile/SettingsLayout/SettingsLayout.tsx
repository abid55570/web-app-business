export type SettingsItem = {
  label: string
  href: string
  active?: boolean
}

export type SettingsGroup = {
  heading: string
  items: SettingsItem[]
}

export type SettingsLayoutProps = {
  groups: SettingsGroup[]
  contentHtml: string
}

export function SettingsLayout({
  groups,
  contentHtml,
}: SettingsLayoutProps) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[14rem_1fr] lg:px-12">
      <nav aria-label="Settings">
        {groups.map((g, i) => (
          <div key={i} className="mb-6 last:mb-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {g.heading}
            </p>
            <ul className="space-y-1">
              {g.items.map((it, j) => (
                <li key={j}>
                  <a
                    href={it.href}
                    aria-current={it.active ? 'page' : undefined}
                    className={`block rounded-md px-3 py-1.5 text-sm ${
                      it.active
                        ? 'bg-primary/10 font-semibold text-primary'
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
      <main
        className="prose max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  )
}
