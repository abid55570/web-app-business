export type NavMegaColumn = {
  title: string
  links: { label: string; href: string; description?: string }[]
}

export type NavMegaProps = {
  brand: string
  columns: NavMegaColumn[]
  ctaLabel?: string
  ctaHref?: string
}

export function NavMega({
  brand,
  columns,
  ctaLabel,
  ctaHref = '#',
}: NavMegaProps) {
  return (
    <header className="border-b border-border bg-surface-raised">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-foreground">{brand}</span>
        <details className="group relative">
          <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
            Products ▾
          </summary>
          <div className="absolute right-0 z-10 mt-3 w-[640px] rounded-xl border border-border bg-surface-raised p-6 shadow-xl">
            <div className="grid grid-cols-3 gap-6">
              {columns.map((c, i) => (
                <div key={i}>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {c.title}
                  </h4>
                  <ul className="space-y-2">
                    {c.links.map((l, j) => (
                      <li key={j}>
                        <a
                          href={l.href}
                          className="block text-sm font-medium text-foreground hover:text-primary"
                        >
                          {l.label}
                        </a>
                        {l.description ? (
                          <p className="text-xs text-muted-foreground">
                            {l.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </details>
        {ctaLabel ? (
          <a
            href={ctaHref}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </header>
  )
}
