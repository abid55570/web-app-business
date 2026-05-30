export type HeroVideoBgProps = {
  videoUrl: string
  posterUrl?: string
  eyebrow?: string
  heading: string
  subheading?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
}

export function HeroVideoBg({
  videoUrl,
  posterUrl,
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref = '#',
}: HeroVideoBgProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src={videoUrl} />
      </video>
      <div className="absolute inset-0 -z-10 bg-black/60" />
      <div className="mx-auto max-w-4xl px-6 py-32 text-center text-white">
        {eyebrow ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-widest opacity-80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
          {heading}
        </h1>
        {subheading ? (
          <p className="mb-8 text-lg opacity-90 sm:text-xl">{subheading}</p>
        ) : null}
        {primaryCtaLabel ? (
          <a
            href={primaryCtaHref}
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-black hover:bg-white/90"
          >
            {primaryCtaLabel}
          </a>
        ) : null}
      </div>
    </section>
  )
}
