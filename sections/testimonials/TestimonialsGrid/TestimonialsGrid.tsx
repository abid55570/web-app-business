/**
 * TestimonialsGrid — quote cards with avatar, author, role.
 * Static grid (no carousel) so first-paint is fast + no JS deps.
 */
export type Testimonial = {
  quote: string
  author: string
  role?: string
  avatarUrl?: string
}

export type TestimonialsGridProps = {
  eyebrow?: string
  headline?: string
  testimonials: Testimonial[]
}

export function TestimonialsGrid({
  eyebrow,
  headline,
  testimonials,
}: TestimonialsGridProps) {
  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        {headline ? (
          <h2 className="text-3xl font-bold text-foreground">{headline}</h2>
        ) : null}
      </div>
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={`${t.author}-${i}`}
            className="rounded-lg border border-border bg-card p-6"
          >
            <blockquote className="text-base text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {t.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={t.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted" aria-hidden />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t.author}
                </p>
                {t.role ? (
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                ) : null}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
