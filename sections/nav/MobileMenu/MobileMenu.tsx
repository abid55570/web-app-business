export type MobileMenuItem = {
  label: string
  href: string
}

export type MobileMenuProps = {
  id?: string
  brand: string
  items: MobileMenuItem[]
  ctaLabel?: string
  ctaHref?: string
}

export function MobileMenu({
  id = 'mobile-menu',
  brand,
  items,
  ctaLabel,
  ctaHref,
}: MobileMenuProps) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-3">
        <p className="text-lg font-bold text-foreground">{brand}</p>
        <a
          href={`#${id}`}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground hover:bg-accent"
        >
          ☰
        </a>
      </header>
      <div
        id={id}
        role="dialog"
        aria-label={`${brand} menu`}
        className="invisible fixed inset-0 z-50 bg-surface-base opacity-0 transition-all target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-lg font-bold text-foreground">{brand}</p>
          <a
            href="#"
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground hover:bg-accent"
          >
            ×
          </a>
        </div>
        <nav className="px-4 py-6">
          <ul className="space-y-1">
            {items.map((it, i) => (
              <li key={i}>
                <a
                  href={it.href}
                  className="block rounded-md px-4 py-3 text-base text-foreground hover:bg-accent"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              className="mt-6 block rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {ctaLabel}
            </a>
          ) : null}
        </nav>
      </div>
    </>
  )
}
