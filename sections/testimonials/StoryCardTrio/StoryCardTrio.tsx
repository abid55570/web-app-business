export type StoryCardTrioStory = {
  customerName: string
  customerLogoText: string
  quote: string
  metric: string
  href?: string
}

export type StoryCardTrioProps = {
  heading?: string
  stories: StoryCardTrioStory[]
}

export function StoryCardTrio({ heading, stories }: StoryCardTrioProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {stories.map((s, i) => (
          <article
            key={i}
            className="flex flex-col rounded-2xl border border-border bg-surface-raised p-6"
          >
            <p className="mb-4 text-base font-bold text-foreground opacity-60">
              {s.customerLogoText}
            </p>
            <blockquote className="mb-4 flex-1 text-sm italic text-foreground">
              &ldquo;{s.quote}&rdquo;
            </blockquote>
            <p className="mb-3 text-2xl font-black text-primary">{s.metric}</p>
            <p className="mb-3 text-xs text-muted-foreground">
              — {s.customerName}
            </p>
            {s.href ? (
              <a
                href={s.href}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Read story →
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
