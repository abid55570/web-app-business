export type HeroBeforeAfterSliderProps = {
  heading?: string
  beforeImageUrl: string
  afterImageUrl: string
  beforeLabel?: string
  afterLabel?: string
}

export function HeroBeforeAfterSlider({
  heading,
  beforeImageUrl,
  afterImageUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: HeroBeforeAfterSliderProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h1 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground sm:text-5xl">
          {heading}
        </h1>
      ) : null}
      <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="group absolute inset-0 overflow-hidden"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {afterLabel}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {beforeLabel}
        </span>
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-lg"
        />
      </div>
    </section>
  )
}
