export type HeroFooterProps = {
  brand: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  bgImageUrl?: string
  footerLinks: Array<{ label: string; href: string }>
  copyright: string
}

export function HeroFooter({
  brand,
  headline,
  body,
  ctaLabel,
  ctaHref,
  bgImageUrl,
  footerLinks,
  copyright,
}: HeroFooterProps) {
  return (
    <main className="flex min-h-screen flex-col">
      <section
        className="relative flex flex-1 items-center px-6 py-24 lg:px-12"
        style={
          bgImageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="mx-auto max-w-4xl text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
            {brand}
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight lg:text-6xl">
            {headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg opacity-90">{body}</p>
          <a
            href={ctaHref}
            className="mt-8 inline-flex items-center rounded-full bg-white px-8 py-3 text-base font-semibold text-black hover:opacity-90"
          >
            {ctaLabel} →
          </a>
        </div>
      </section>
      <footer className="border-t border-border bg-surface-sunken px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
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
    </main>
  )
}
