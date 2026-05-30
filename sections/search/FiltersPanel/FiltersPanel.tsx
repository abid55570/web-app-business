export type FilterOption = {
  label: string
  value: string
  selected?: boolean
}

export type FilterGroup = {
  heading: string
  name: string
  options: FilterOption[]
}

export type FiltersPanelProps = {
  groups: FilterGroup[]
  action: string
}

export function FiltersPanel({ groups, action }: FiltersPanelProps) {
  return (
    <aside
      aria-label="Filters"
      className="w-full max-w-xs border-r border-border bg-surface-raised p-5"
    >
      <form action={action} method="GET" className="space-y-6">
        {groups.map((g, i) => (
          <fieldset key={i}>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {g.heading}
            </legend>
            <ul className="space-y-1">
              {g.options.map((o, j) => (
                <li key={j}>
                  <label className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm text-foreground hover:bg-accent">
                    <input
                      type="checkbox"
                      name={g.name}
                      value={o.value}
                      defaultChecked={o.selected}
                    />
                    {o.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Apply
          </button>
          <a
            href={action}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            Clear
          </a>
        </div>
      </form>
    </aside>
  )
}
