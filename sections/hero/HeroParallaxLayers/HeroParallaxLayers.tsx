export type HeroParallaxLayersProps = {
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  backLayerUrl: string
  midLayerUrl: string
  frontLayerUrl: string
}

export function HeroParallaxLayers({
  headline,
  body,
  ctaLabel,
  ctaHref,
  backLayerUrl,
  midLayerUrl,
  frontLayerUrl,
}: HeroParallaxLayersProps) {
  return (
    <section className="relative isolate grid min-h-[80vh] place-items-center overflow-hidden px-6 py-20 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backLayerUrl}
        alt=""
        className="absolute inset-0 -z-30 h-full w-full animate-drift-up object-cover opacity-60"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={midLayerUrl}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full animate-drift-down object-cover opacity-80"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frontLayerUrl}
        alt=""
        className="absolute inset-x-0 bottom-0 -z-10 w-full"
      />
      <div className="relative text-center">
        <h1 className="text-5xl font-bold leading-tight drop-shadow-lg lg:text-7xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg opacity-95 drop-shadow">
          {body}
        </p>
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
