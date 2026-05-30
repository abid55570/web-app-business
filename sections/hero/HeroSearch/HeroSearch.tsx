export type HeroSearchPopular = {
  label: string
  href: string
}

export type HeroSearchProps = {
  headline: string
  body?: string
  action: string
  placeholder?: string
  ctaLabel?: string
  popular?: HeroSearchPopular[]
}

export function HeroSearch({
  headline,
  body,
  action,
  placeholder = 'Search anything…',
  ctaLabel = 'Search',
  popular,
}: HeroSearchProps) {
  return (
    <section className="px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        {body ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {body}
          </p>
        ) : null}
        <form
          action={action}
          method="GET"
          className="mx-auto mt-8 flex max-w-xl gap-2"
        >
          <label htmlFor="b-dash-hero-q" className="sr-only">
            Search
          </label>
          <input
            id="b-dash-hero-q"
            type="search"
            name="q"
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-border bg-background px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </button>
        </form>
        {popular?.length ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Popular:{' '}
            {popular.map((p, i) => (
              <span key={i}>
                <a href={p.href} className="text-primary hover:underline">
                  {p.label}
                </a>
                {i < popular.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </section>
  )
}
