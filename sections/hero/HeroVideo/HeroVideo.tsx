export type HeroVideoProps = {
  videoUrl: string
  posterUrl?: string
  headline: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function HeroVideo({
  videoUrl,
  posterUrl,
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
}: HeroVideoProps) {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterUrl}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />
      <div className="px-6 py-20 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold leading-tight lg:text-6xl">
          {headline}
        </h1>
        {body ? (
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">{body}</p>
        ) : null}
        <a
          href={ctaHref}
          className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-semibold text-black hover:bg-white/90"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  )
}
