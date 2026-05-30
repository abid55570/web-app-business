export type HeaderLink = { label: string; href: string }

export type HeaderMinimalProps = {
  brandName: string
  brandHref?: string
  links?: HeaderLink[]
  ctaLabel?: string
  ctaHref?: string
}

export function HeaderMinimal({
  brandName,
  brandHref = '/',
  links = [],
  ctaLabel,
  ctaHref,
}: HeaderMinimalProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-raised/90 px-6 backdrop-blur lg:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <a
          href={brandHref}
          className="text-base font-bold text-foreground hover:text-primary"
        >
          {brandName}
        </a>
        {links.length > 0 ? (
          <nav aria-label="Primary">
            <ul className="hidden gap-6 md:flex">
              {links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
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
