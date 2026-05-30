export type FeatureVideoEmbedProps = {
  eyebrow?: string
  headline: string
  body: string
  bullets?: string[]
  videoEmbedUrl: string
  videoTitle: string
}

export function FeatureVideoEmbed({
  eyebrow,
  headline,
  body,
  bullets,
  videoEmbedUrl,
  videoTitle,
}: FeatureVideoEmbedProps) {
  return (
    <section className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            {headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{body}</p>
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
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-sunken shadow-xl">
          <iframe
            src={videoEmbedUrl}
            title={videoTitle}
            className="aspect-video w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
