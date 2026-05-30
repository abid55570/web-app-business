export type HeroLogosProps = {
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  trustLine: string
  logos: Array<{ src: string; alt: string }>
}

export function HeroLogos({
  headline,
  body,
  ctaLabel,
  ctaHref,
  trustLine,
  logos,
}: HeroLogosProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
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
      </div>
      <div className="mx-auto mt-14 max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {trustLine}
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((l, i) => (
            <li key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.src}
                alt={l.alt}
                className="h-7 w-auto opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
