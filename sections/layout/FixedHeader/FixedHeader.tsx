export type FixedHeaderProps = {
  brand: string
  navLinks: Array<{ label: string; href: string }>
  ctaLabel?: string
  ctaHref?: string
  children?: React.ReactNode
}

export function FixedHeader({
  brand,
  navLinks,
  ctaLabel,
  ctaHref,
  children,
}: FixedHeaderProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-border bg-surface-raised/90 backdrop-blur">
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
      <div className="pt-16">{children}</div>
    </>
  )
}
