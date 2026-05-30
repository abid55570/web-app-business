export type SearchResultGroup = {
  heading: string
  items: Array<{ label: string; href: string; subtitle?: string }>
}

export type SearchBarDropdownProps = {
  action: string
  placeholder?: string
  groups: SearchResultGroup[]
  q?: string
}

export function SearchBarDropdown({
  action,
  placeholder = 'Search…',
  groups,
  q = '',
}: SearchBarDropdownProps) {
  return (
    <details className="relative inline-block w-full max-w-md">
      <summary className="cursor-pointer list-none">
        <form action={action} method="GET" className="flex">
          <label htmlFor="b-dash-srdd-q" className="sr-only">
            Search
          </label>
          <input
            id="b-dash-srdd-q"
            type="search"
            name="q"
            placeholder={placeholder}
            defaultValue={q}
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </form>
      </summary>
      <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-surface-raised shadow-lg">
        {groups.map((g, i) => (
          <div key={i} className="border-b border-border last:border-0">
            <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {g.heading}
            </p>
            <ul className="pb-2">
              {g.items.map((it, j) => (
                <li key={j}>
                  <a
                    href={it.href}
                    className="block px-4 py-2 hover:bg-accent"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {it.label}
                    </p>
                    {it.subtitle ? (
                      <p className="text-xs text-muted-foreground">
                        {it.subtitle}
                      </p>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  )
}
