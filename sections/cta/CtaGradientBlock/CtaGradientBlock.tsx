export type CtaGradientBlockProps = {
  eyebrow?: string
  heading: string
  subheading?: string
  primaryCtaLabel: string
  primaryCtaHref?: string
}

export function CtaGradientBlock({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref = '#',
}: CtaGradientBlockProps) {
  return (
    <section className="px-6 py-16">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent p-10 text-center text-primary-foreground sm:p-16">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.25),transparent_60%)]"
        />
        {eyebrow ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-widest opacity-80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mb-4 text-3xl font-bold sm:text-5xl">{heading}</h2>
        {subheading ? (
          <p className="mb-8 text-base opacity-90 sm:text-lg">{subheading}</p>
        ) : null}
        <a
          href={primaryCtaHref}
          className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black shadow-lg hover:bg-white/90"
        >
          {primaryCtaLabel}
        </a>
      </div>
    </section>
  )
}
