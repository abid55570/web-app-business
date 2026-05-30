export type FooterCompactProps = {
  brand: string
  links: Array<{ label: string; href: string }>
  copyright: string
}

export function FooterCompact({
  brand,
  links,
  copyright,
}: FooterCompactProps) {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs">
        <p className="font-semibold text-foreground">{brand}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
          {links.map((l, i) => (
            <li key={i}>
              <a href={l.href} className="hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  )
}
