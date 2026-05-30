export type AnchorLink = {
  label: string
  href: string
  active?: boolean
}

export type AnchorNavProps = {
  links: AnchorLink[]
  sticky?: boolean
}

export function AnchorNav({ links, sticky = true }: AnchorNavProps) {
  return (
    <nav
      aria-label="Section navigation"
      className={`${
        sticky ? 'sticky top-0 z-30' : ''
      } border-b border-border bg-surface-raised/95 backdrop-blur`}
    >
      <ul className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-6 py-3 text-sm [scrollbar-width:none]">
        {links.map((l, i) => (
          <li key={i}>
            <a
              href={l.href}
              aria-current={l.active ? 'true' : undefined}
              className={`whitespace-nowrap border-b-2 pb-2 -mb-3 font-medium ${
                l.active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
