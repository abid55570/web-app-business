export type CtaFinalLineProps = {
  headline: string
  ctaLabel: string
  ctaHref: string
  microcopy?: string
}

export function CtaFinalLine({
  headline,
  ctaLabel,
  ctaHref,
  microcopy,
}: CtaFinalLineProps) {
  return (
    <section className="px-6 py-28 text-center">
      <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-foreground lg:text-6xl">
        {headline}
      </h2>
      <a
        href={ctaHref}
        className="mt-10 inline-flex items-center rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:opacity-90"
      >
        {ctaLabel} →
      </a>
      {microcopy ? (
        <p className="mt-4 text-sm text-muted-foreground">{microcopy}</p>
      ) : null}
    </section>
  )
}
