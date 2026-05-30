export type HeaderSearchStickyProps = {
  brand: string
  searchAction: string
  searchPlaceholder?: string
  navLinks: Array<{ label: string; href: string }>
  ctaLabel?: string
  ctaHref?: string
}

export function HeaderSearchSticky({
  brand,
  searchAction,
  searchPlaceholder = 'Search…',
  navLinks,
  ctaLabel,
  ctaHref,
}: HeaderSearchStickyProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
        <p className="text-lg font-bold text-foreground">{brand}</p>
        <form action={searchAction} method="GET" className="ml-auto flex flex-1 max-w-md">
          <label htmlFor="b-dash-hss-q" className="sr-only">
            Search
          </label>
          <input
            id="b-dash-hss-q"
            type="search"
            name="q"
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </form>
        <nav className="hidden lg:block">
          <ul className="flex gap-5 text-sm">
            {navLinks.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="text-muted-foreground hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {ctaLabel && ctaHref ? (
          <a
            href={ctaHref}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </header>
  )
}
