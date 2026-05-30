/**
 * FooterColumns — brand block + N link columns + legal strip.
 *
 * Theme-agnostic — borders use CSS-var-driven tokens so dark/light
 * variants from any theme render correctly.
 */
export type FooterLink = { label: string; href: string }
export type FooterColumn = { title: string; links: FooterLink[] }

export type FooterColumnsProps = {
  brandName: string
  tagline?: string
  columns?: FooterColumn[]
  legal?: string
}

export function FooterColumns({
  brandName,
  tagline,
  columns = [],
  legal,
}: FooterColumnsProps) {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-card px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-foreground">
              {brandName}
            </p>
            {tagline ? (
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {tagline}
              </p>
            ) : null}
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
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
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          {legal ?? `© ${year} ${brandName}`}
        </p>
      </div>
    </footer>
  )
}
