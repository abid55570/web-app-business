export type FooterCtaProps = {
  ctaHeadline: string
  ctaBody?: string
  ctaLabel: string
  ctaHref: string
  copyright: string
  links: Array<{ label: string; href: string }>
}

export function FooterCta({
  ctaHeadline,
  ctaBody,
  ctaLabel,
  ctaHref,
  copyright,
  links,
}: FooterCtaProps) {
  return (
    <footer className="bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-10 text-center text-primary-foreground shadow-xl lg:px-12 lg:py-14">
          <h2 className="text-3xl font-bold lg:text-4xl">{ctaHeadline}</h2>
          {ctaBody ? (
            <p className="mx-auto mt-3 max-w-xl text-base opacity-90">
              {ctaBody}
            </p>
          ) : null}
          <a
            href={ctaHref}
            className="mt-6 inline-flex items-center rounded-full bg-surface-raised px-8 py-3 text-base font-semibold text-foreground hover:opacity-90"
          >
            {ctaLabel} →
          </a>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          <ul className="flex gap-5 text-sm text-muted-foreground">
            {links.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
