export type HeroCenterFullProps = {
  bgImageUrl: string
  eyebrow?: string
  headline: string
  body?: string
  ctaLabel: string
  ctaHref: string
}

export function HeroCenterFull({
  bgImageUrl,
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
}: HeroCenterFullProps) {
  return (
    <section
      className="relative grid min-h-[80vh] place-items-center px-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-center text-white">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold leading-tight lg:text-7xl">
          {headline}
        </h1>
        {body ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg opacity-95">{body}</p>
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
