export type HeroAvatarsProps = {
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  avatarUrls: string[]
  countLabel: string
}

export function HeroAvatars({
  headline,
  body,
  ctaLabel,
  ctaHref,
  avatarUrls,
  countLabel,
}: HeroAvatarsProps) {
  return (
    <section className="px-6 py-20 text-center lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {body}
        </p>
        <a
          href={ctaHref}
          className="mt-8 inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ul className="flex -space-x-2">
            {avatarUrls.slice(0, 6).map((u, i) => (
              <li key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-surface-base object-cover"
                />
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            <span className="text-amber-500">★★★★★</span> {countLabel}
          </p>
        </div>
      </div>
    </section>
  )
}
