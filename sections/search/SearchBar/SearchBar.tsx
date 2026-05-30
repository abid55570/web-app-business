export type SearchBarProps = {
  heading?: string
  placeholder?: string
  action: string
  suggestions?: string[]
}

export function SearchBar({
  heading,
  placeholder = 'Search…',
  action,
  suggestions = [],
}: SearchBarProps) {
  return (
    <section className="px-6 py-12 text-center lg:py-16">
      {heading ? (
        <h2 className="mb-6 text-2xl font-bold text-foreground lg:text-3xl">
          {heading}
        </h2>
      ) : null}
      <form
        action={action}
        method="GET"
        className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface-raised p-2 shadow-sm"
      >
        <input
          type="search"
          name="q"
          required
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Search
        </button>
      </form>
      {suggestions.length > 0 ? (
        <ul className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          {suggestions.map((s, i) => (
            <li key={i}>
              <a
                href={`${action}?q=${encodeURIComponent(s)}`}
                className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {s}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
