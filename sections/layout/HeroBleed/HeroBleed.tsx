export type HeroBleedProps = {
  heroImageUrl: string
  heroHeadline: string
  heroBody: string
  ctaLabel: string
  ctaHref: string
  children?: React.ReactNode
}

export function HeroBleed({
  heroImageUrl,
  heroHeadline,
  heroBody,
  ctaLabel,
  ctaHref,
  children,
}: HeroBleedProps) {
  return (
    <main>
      <section
        className="relative grid min-h-[70vh] place-items-end px-6 py-16 lg:px-12"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%), url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl font-bold leading-tight lg:text-6xl">
            {heroHeadline}
          </h1>
          <p className="mt-4 max-w-lg text-base opacity-95 lg:text-lg">
            {heroBody}
          </p>
          <a
            href={ctaHref}
            className="mt-6 inline-flex items-center rounded-full bg-white px-7 py-3 text-base font-semibold text-black hover:opacity-90"
          >
            {ctaLabel} →
          </a>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 py-12">{children}</div>
    </main>
  )
}
