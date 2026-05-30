export type FooterContactProps = {
  brand: string
  tagline?: string
  contact: {
    email?: string
    phone?: string
    address?: string
    hours?: string
  }
  columns: Array<{ heading: string; links: Array<{ label: string; href: string }> }>
  copyright: string
}

export function FooterContact({
  brand,
  tagline,
  contact,
  columns,
  copyright,
}: FooterContactProps) {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <p className="text-xl font-bold text-foreground">{brand}</p>
            {tagline ? (
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {tagline}
              </p>
            ) : null}
            <dl className="mt-5 space-y-2 text-sm">
              {contact.email ? (
                <div className="flex gap-2">
                  <dt aria-hidden className="text-muted-foreground">✉</dt>
                  <dd>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-foreground hover:underline"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {contact.phone ? (
                <div className="flex gap-2">
                  <dt aria-hidden className="text-muted-foreground">☎</dt>
                  <dd>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="text-foreground hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {contact.address ? (
                <div className="flex gap-2">
                  <dt aria-hidden className="text-muted-foreground">⌂</dt>
                  <dd className="text-muted-foreground">{contact.address}</dd>
                </div>
              ) : null}
              {contact.hours ? (
                <div className="flex gap-2">
                  <dt aria-hidden className="text-muted-foreground">◷</dt>
                  <dd className="text-muted-foreground">{contact.hours}</dd>
                </div>
              ) : null}
            </dl>
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
