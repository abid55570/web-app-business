/**
 * FooterMega — brand col + 3-4 nav cols + optional newsletter + social row.
 */
export type FooterColumn = {
  heading: string
  links: { label: string; href: string }[]
}

export type FooterSocial = {
  label: string
  href: string
}

export type FooterMegaProps = {
  brandName: string
  tagline?: string
  columns: FooterColumn[]
  newsletterAction?: string
  newsletterPlaceholder?: string
  social?: FooterSocial[]
  legal?: string
}

export function FooterMega({
  brandName,
  tagline,
  columns,
  newsletterAction,
  newsletterPlaceholder = 'you@example.com',
  social,
  legal,
}: FooterMegaProps) {
  return (
    <footer className="border-t border-border bg-surface-raised px-6 py-16 lg:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="mb-2 text-lg font-bold text-foreground">{brandName}</p>
          {tagline ? (
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              {tagline}
            </p>
          ) : null}
          {newsletterAction ? (
            <form
              action={newsletterAction}
              method="POST"
              className="flex max-w-sm gap-2"
            >
              <input
                type="email"
                name="email"
                required
                placeholder={newsletterPlaceholder}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          ) : null}
        </div>
        {columns.map((c, i) => (
          <nav key={i} aria-label={c.heading}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {c.heading}
            </p>
            <ul className="space-y-2">
              {c.links.map((l, j) => (
                <li key={j}>
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
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        {legal ? (
          <p className="text-xs text-muted-foreground">{legal}</p>
        ) : (
          <span />
        )}
        {social?.length ? (
          <ul className="flex flex-wrap gap-4">
            {social.map((s, i) => (
              <li key={i}>
                <a
                  href={s.href}
                  className="text-xs text-muted-foreground hover:text-primary"
                  rel="noopener"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  )
}
