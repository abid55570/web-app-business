export type HeroBrandIntroProps = {
  brand: string
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
}
export function HeroBrandIntro({ brand, heading, subheading, ctaLabel, ctaHref = '#' }: HeroBrandIntroProps) {
  return (
    <section className="px-6 py-20 text-center">
      <p className="mb-4 inline-block rounded-full border border-border bg-surface-raised px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">{brand}</p>
      <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold text-foreground sm:text-6xl">{heading}</h1>
      {subheading ? <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">{subheading}</p> : null}
      {ctaLabel ? <a href={ctaHref} className="inline-block rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground">{ctaLabel}</a> : null}
    </section>
  )
}
