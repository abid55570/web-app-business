export type SearchFilterChip = {
  value: string
  label: string
  active?: boolean
}

export type SearchFilterSort = {
  value: string
  label: string
}

export type FormSearchFilterProps = {
  action: string
  q?: string
  placeholder?: string
  chips: SearchFilterChip[]
  sortOptions: SearchFilterSort[]
  currentSort?: string
}

export function FormSearchFilter({
  action,
  q = '',
  placeholder = 'Search…',
  chips,
  sortOptions,
  currentSort,
}: FormSearchFilterProps) {
  return (
    <form action={action} method="GET" className="rounded-xl border border-border bg-surface-raised p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="b-dash-fsf-q" className="sr-only">
          Search
        </label>
        <input
          id="b-dash-fsf-q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <select
          name="sort"
          defaultValue={currentSort}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Apply
        </button>
      </div>
      <fieldset className="mt-3 flex flex-wrap gap-2">
        <legend className="sr-only">Filter</legend>
        {chips.map((c, i) => (
          <label
            key={i}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${
              c.active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary'
            }`}
          >
            <input
              type="checkbox"
              name="filter"
              value={c.value}
              defaultChecked={c.active}
              className="sr-only"
            />
            {c.label}
          </label>
        ))}
      </fieldset>
    </form>
  )
}
