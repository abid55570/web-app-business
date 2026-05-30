export type HeaderTransparentLink = {
  label: string
  href: string
}

export type HeaderTransparentProps = {
  brand: string
  links: HeaderTransparentLink[]
  ctaLabel?: string
  ctaHref?: string
}

export function HeaderTransparent({
  brand,
  links,
  ctaLabel,
  ctaHref,
}: HeaderTransparentProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-white">
        <p className="text-lg font-bold">{brand}</p>
        <nav>
          <ul className="hidden gap-6 text-sm md:flex">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.href}
                  className="opacity-80 hover:opacity-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {ctaLabel && ctaHref ? (
          <a
            href={ctaHref}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </header>
  )
}
