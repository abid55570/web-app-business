export type FooterStackedSocial = {
  label: string
  href: string
  icon: string
}

export type FooterStackedProps = {
  brand: string
  tagline?: string
  links: Array<{ label: string; href: string }>
  socials?: FooterStackedSocial[]
  copyright: string
}

export function FooterStacked({
  brand,
  tagline,
  links,
  socials,
  copyright,
}: FooterStackedProps) {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-lg font-bold text-foreground">{brand}</p>
        {tagline ? (
          <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
        ) : null}
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {links.map((l, i) => (
            <li key={i}>
              <a href={l.href} className="text-muted-foreground hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {socials?.length ? (
          <ul className="mt-5 flex justify-center gap-3">
            {socials.map((s, i) => (
              <li key={i}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-raised text-muted-foreground hover:text-foreground"
                >
                  <span aria-hidden>{s.icon}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-6 text-xs text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  )
}
