export type CtaFullBleedProps = {
  bgImageUrl?: string
  eyebrow?: string
  headline: string
  body?: string
  ctaLabel: string
  ctaHref: string
}

export function CtaFullBleed({
  bgImageUrl,
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
}: CtaFullBleedProps) {
  return (
    <section
      className="relative isolate grid min-h-[60vh] place-items-center px-6 py-20 text-white"
      style={
        bgImageUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${bgImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundImage: 'linear-gradient(135deg, var(--color-primary, #6366f1) 0%, var(--color-accent, #ec4899) 100%)' }
      }
    >
      <div className="text-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest opacity-90">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight lg:text-6xl">
          {headline}
        </h2>
        {body ? (
          <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">{body}</p>
        ) : null}
        <a
          href={ctaHref}
          className="mt-8 inline-flex items-center rounded-full bg-white px-8 py-3 text-base font-semibold text-black hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
    </section>
  )
}
