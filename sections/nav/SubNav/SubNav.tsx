export type SubNavSection = {
  label: string
  href: string
  active?: boolean
}

export type SubNavProps = {
  parentLabel?: string
  sections: SubNavSection[]
}

export function SubNav({ parentLabel, sections }: SubNavProps) {
  return (
    <nav
      aria-label={`${parentLabel ?? 'Subsection'} navigation`}
      className="border-b border-border bg-surface-sunken"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-2 text-sm">
        {parentLabel ? (
          <p className="font-semibold text-foreground">{parentLabel}</p>
        ) : null}
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {sections.map((s, i) => (
            <li key={i}>
              <a
                href={s.href}
                aria-current={s.active ? 'page' : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 font-medium ${
                  s.active
                    ? 'bg-surface-raised text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-surface-raised hover:text-foreground'
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
