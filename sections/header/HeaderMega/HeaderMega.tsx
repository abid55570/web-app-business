export type MegaLink = {
  label: string
  href: string
  description?: string
}

export type MegaColumn = {
  heading: string
  links: MegaLink[]
}

export type MegaMenu = {
  label: string
  columns: MegaColumn[]
}

export type HeaderMegaProps = {
  brandName: string
  brandHref?: string
  menus: MegaMenu[]
  ctaLabel?: string
  ctaHref?: string
}

export function HeaderMega({
  brandName,
  brandHref = '/',
  menus,
  ctaLabel,
  ctaHref,
}: HeaderMegaProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-raised/95 px-6 backdrop-blur lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
        <a
          href={brandHref}
          className="text-base font-bold text-foreground hover:text-primary"
        >
          {brandName}
        </a>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {menus.map((m, i) => (
              <li
                key={i}
                className="group relative"
              >
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {m.label}
                </button>
                <div
                  role="menu"
                  className="invisible absolute left-1/2 top-full z-40 mt-1 w-screen max-w-3xl -translate-x-1/2 rounded-lg border border-border bg-surface-raised p-6 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {m.columns.map((c, j) => (
                      <div key={j}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {c.heading}
                        </p>
                        <ul className="space-y-1">
                          {c.links.map((l, k) => (
                            <li key={k}>
                              <a
                                href={l.href}
                                className="block rounded-md p-2 hover:bg-accent"
                              >
                                <span className="block text-sm font-medium text-foreground">
                                  {l.label}
                                </span>
                                {l.description ? (
                                  <span className="block text-xs text-muted-foreground">
                                    {l.description}
                                  </span>
                                ) : null}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
        {ctaLabel ? (
          <a
            href={ctaHref ?? '#'}
            className="inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : (
          <span />
        )}
      </div>
    </header>
  )
}
