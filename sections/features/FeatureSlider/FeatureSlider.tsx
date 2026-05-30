export type FeatureSlide = {
  id: string
  title: string
  body: string
  imageUrl: string
}

export type FeatureSliderProps = {
  heading?: string
  slides: FeatureSlide[]
  groupId: string
}

export function FeatureSlider({
  heading,
  slides,
  groupId,
}: FeatureSliderProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-5xl">
        {slides.map((s, i) => (
          <input
            key={`r-${i}`}
            type="radio"
            id={`${groupId}-${s.id}`}
            name={groupId}
            defaultChecked={i === 0}
            className="peer/f sr-only"
          />
        ))}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
          {slides.map((s) => (
            <div
              key={s.id}
              className="hidden items-center gap-8 p-8 peer-checked/f:grid lg:grid-cols-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt=""
                className="aspect-video w-full rounded-xl object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-3 text-base text-muted-foreground">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <nav className="mt-4 flex justify-center gap-2">
          {slides.map((s, i) => (
            <label
              key={s.id}
              htmlFor={`${groupId}-${s.id}`}
              className="h-2 w-8 cursor-pointer rounded-full bg-border peer-checked/f:bg-primary hover:bg-primary/60"
            >
              <span className="sr-only">Slide {i + 1}</span>
            </label>
          ))}
        </nav>
      </div>
    </section>
  )
}
