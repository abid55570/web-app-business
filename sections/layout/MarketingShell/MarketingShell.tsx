export type MarketingShellNavLink = {
  label: string
  href: string
}

export type MarketingShellProps = {
  brand: string
  navLinks: MarketingShellNavLink[]
  ctaLabel: string
  ctaHref: string
  copyright: string
  footerLinks: MarketingShellNavLink[]
  children?: React.ReactNode
}

export function MarketingShell({
  brand,
  navLinks,
  ctaLabel,
  ctaHref,
  copyright,
  footerLinks,
  children,
}: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface-raised/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p className="text-lg font-bold text-foreground">{brand}</p>
          <nav className="hidden md:block">
            <ul className="flex gap-6 text-sm">
              {navLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href} className="text-muted-foreground hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={ctaHref}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-surface-sunken">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>{copyright}</p>
          <ul className="flex gap-5">
            {footerLinks.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}
