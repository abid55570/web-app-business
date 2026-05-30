export type FooterMinimalLink = { label: string; href: string }

export type FooterMinimalProps = {
  brandName: string
  links?: FooterMinimalLink[]
  legal?: string
}

export function FooterMinimal({
  brandName,
  links = [],
  legal,
}: FooterMinimalProps) {
  return (
    <footer className="border-t border-border px-6 py-6 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">{brandName}</p>
        {links.length > 0 ? (
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-4">
              {links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {legal ? (
          <p className="text-xs text-muted-foreground">{legal}</p>
        ) : null}
      </div>
    </footer>
  )
}
