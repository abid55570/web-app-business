export type SearchFormChip = {
  label: string
  value: string
  active?: boolean
}

export type SearchFormProps = {
  action: string
  placeholder?: string
  q?: string
  chips?: SearchFormChip[]
}

export function SearchForm({
  action,
  placeholder = 'Search…',
  q = '',
  chips,
}: SearchFormProps) {
  return (
    <form action={action} method="GET" className="mx-auto max-w-2xl">
      <div className="flex gap-2">
        <label htmlFor="b-dash-search-q" className="sr-only">
          Search
        </label>
        <input
          id="b-dash-search-q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Search
        </button>
      </div>
      {chips?.length ? (
        <fieldset className="mt-3 flex flex-wrap gap-2">
          <legend className="sr-only">Filter</legend>
          {chips.map((c, i) => (
            <label
              key={i}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium ${
                c.active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface-raised text-muted-foreground hover:border-primary'
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
      ) : null}
    </form>
  )
}
