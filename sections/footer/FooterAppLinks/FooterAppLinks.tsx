export type FooterAppLinksColumn = {
  heading: string
  links: Array<{ label: string; href: string }>
}

export type FooterAppLinksProps = {
  brand: string
  tagline?: string
  columns: FooterAppLinksColumn[]
  appStoreUrl?: string
  playStoreUrl?: string
  copyright: string
}

export function FooterAppLinks({
  brand,
  tagline,
  columns,
  appStoreUrl,
  playStoreUrl,
  copyright,
}: FooterAppLinksProps) {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <p className="text-xl font-bold text-foreground">{brand}</p>
            {tagline ? (
              <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
            ) : null}
            <ul className="mt-5 flex flex-wrap gap-3">
              {appStoreUrl ? (
                <li>
                  <a
                    href={appStoreUrl}
                    className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                  >
                     App Store
                  </a>
                </li>
              ) : null}
              {playStoreUrl ? (
                <li>
                  <a
                    href={playStoreUrl}
                    className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                  >
                    ▶ Google Play
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((c, i) => (
              <div key={i}>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {c.heading}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {c.links.map((l, j) => (
                    <li key={j}>
                      <a
                        href={l.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
          {copyright}
        </p>
      </div>
    </footer>
  )
}
