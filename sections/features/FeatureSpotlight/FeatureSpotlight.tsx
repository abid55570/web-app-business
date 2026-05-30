export type FeatureSpotlightProps = {
  eyebrow?: string
  title: string
  body: string
  bullets?: string[]
  imageUrl: string
  ctaLabel?: string
  ctaHref?: string
}

export function FeatureSpotlight({
  eyebrow,
  title,
  body,
  bullets,
  imageUrl,
  ctaLabel,
  ctaHref,
}: FeatureSpotlightProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-surface-raised p-8 lg:p-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            {eyebrow ? (
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">{body}</p>
            {bullets?.length ? (
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="text-primary">
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
            {ctaLabel && ctaHref ? (
              <a
                href={ctaHref}
                className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                {ctaLabel} →
              </a>
            ) : null}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="rounded-2xl object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}
