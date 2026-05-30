export type FooterCenteredBrandProps = {
  brand: string
  tagline?: string
  links?: { label: string; href: string }[]
  socials?: { label: string; href: string }[]
  copyright?: string
}

export function FooterCenteredBrand({
  brand,
  tagline,
  links = [],
  socials = [],
  copyright,
}: FooterCenteredBrandProps) {
  return (
    <footer className="border-t border-border bg-surface-raised px-6 py-12 text-center">
      <p className="mb-1 text-2xl font-black text-foreground">{brand}</p>
      {tagline ? (
        <p className="mb-6 text-sm text-muted-foreground">{tagline}</p>
      ) : null}
      {links.length ? (
        <ul className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {links.map((l, i) => (
            <li key={i}>
              <a
                href={l.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {socials.length ? (
        <ul className="mb-6 flex justify-center gap-3">
          {socials.map((s, i) => (
            <li key={i}>
              <a
                href={s.href}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-overlay"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {copyright ? (
        <p className="text-xs text-muted-foreground">{copyright}</p>
      ) : null}
    </footer>
  )
}
