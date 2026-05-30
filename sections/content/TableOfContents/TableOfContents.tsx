export type TocItem = {
  href: string
  label: string
  level?: 2 | 3
}

export type TableOfContentsProps = {
  heading?: string
  items: TocItem[]
  activeHref?: string
}

export function TableOfContents({
  heading = 'On this page',
  items,
  activeHref,
}: TableOfContentsProps) {
  return (
    <nav
      aria-labelledby="b-dash-toc-heading"
      className="sticky top-24 hidden w-56 flex-none lg:block"
    >
      <p
        id="b-dash-toc-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {heading}
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((it, i) => {
          const isActive = it.href === activeHref
          return (
            <li key={i} className={it.level === 3 ? 'pl-3' : ''}>
              <a
                href={it.href}
                className={`block border-l -ml-px pl-3 py-0.5 text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {it.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
