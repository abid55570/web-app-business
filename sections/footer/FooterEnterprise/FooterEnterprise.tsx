export type FooterEnterpriseColumn = {
  title: string
  links: { label: string; href: string }[]
}

export type FooterEnterpriseProps = {
  brand: string
  description?: string
  columns: FooterEnterpriseColumn[]
  certifications?: string[]
  legalLinks?: { label: string; href: string }[]
  copyright?: string
}

export function FooterEnterprise({
  brand,
  description,
  columns,
  certifications = [],
  legalLinks = [],
  copyright,
}: FooterEnterpriseProps) {
  return (
    <footer className="border-t border-border bg-surface-overlay px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <p className="mb-2 text-2xl font-black text-foreground">{brand}</p>
            {description ? (
              <p className="max-w-xs text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {columns.map((c, i) => (
              <div key={i}>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  {c.title}
                </h4>
                <ul className="space-y-1">
                  {c.links.map((l, j) => (
                    <li key={j}>
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
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
        {certifications.length ? (
          <div className="mb-6 flex flex-wrap gap-3">
            {certifications.map((c, i) => (
              <span
                key={i}
                className="rounded border border-border bg-surface-raised px-3 py-1 text-xs font-mono text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {copyright ? <p>{copyright}</p> : null}
        </div>
      </div>
    </footer>
  )
}
