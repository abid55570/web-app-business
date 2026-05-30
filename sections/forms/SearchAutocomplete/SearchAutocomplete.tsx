export type SearchAutocompleteSuggestion = {
  value: string
  label?: string
}

export type SearchAutocompleteProps = {
  action: string
  name?: string
  placeholder?: string
  suggestions: SearchAutocompleteSuggestion[]
  ctaLabel?: string
}

export function SearchAutocomplete({
  action,
  name = 'q',
  placeholder = 'Search…',
  suggestions,
  ctaLabel = 'Search',
}: SearchAutocompleteProps) {
  const listId = `${name}-suggestions`
  return (
    <form action={action} method="GET" className="flex max-w-xl gap-2">
      <label htmlFor={`${name}-input`} className="sr-only">
        Search
      </label>
      <input
        id={`${name}-input`}
        name={name}
        type="search"
        list={listId}
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </datalist>
      <button
        type="submit"
        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {ctaLabel}
      </button>
    </form>
  )
}
