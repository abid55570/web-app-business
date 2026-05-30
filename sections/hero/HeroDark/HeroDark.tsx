export type HeroDarkProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function HeroDark({
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: HeroDarkProps) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 px-6 py-24 text-neutral-100 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary opacity-20 blur-3xl"
      />
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold leading-tight lg:text-6xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-300">
          {body}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={ctaHref}
            className="rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel} →
          </a>
          {secondaryLabel && secondaryHref ? (
            <a
              href={secondaryHref}
              className="rounded-lg border border-neutral-700 px-7 py-3 text-base font-semibold text-neutral-100 hover:bg-neutral-800"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
