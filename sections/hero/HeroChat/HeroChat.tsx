export type HeroChatSuggestion = {
  label: string
  query: string
}

export type HeroChatProps = {
  eyebrow?: string
  headline: string
  body?: string
  action: string
  placeholder?: string
  ctaLabel?: string
  suggestions?: HeroChatSuggestion[]
}

export function HeroChat({
  eyebrow,
  headline,
  body,
  action,
  placeholder = 'Ask anything…',
  ctaLabel = 'Ask',
  suggestions,
}: HeroChatProps) {
  return (
    <section className="px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
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
          method="POST"
          className="mx-auto mt-8 flex max-w-2xl rounded-2xl border border-border bg-surface-raised p-2 shadow-lg"
        >
          <label htmlFor="b-dash-hero-chat" className="sr-only">
            Prompt
          </label>
          <input
            id="b-dash-hero-chat"
            name="q"
            type="text"
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel} ↵
          </button>
        </form>
        {suggestions?.length ? (
          <ul className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
            {suggestions.map((s, i) => (
              <li key={i}>
                <form action={action} method="POST">
                  <input type="hidden" name="q" value={s.query} />
                  <button
                    type="submit"
                    className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                  >
                    {s.label}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
