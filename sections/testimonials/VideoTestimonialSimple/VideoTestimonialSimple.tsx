export type VideoTestimonialCard = {
  videoUrl: string
  posterUrl: string
  authorName: string
  authorRole: string
  quote: string
}

export type VideoTestimonialSimpleProps = {
  heading?: string
  cards: VideoTestimonialCard[]
}

export function VideoTestimonialSimple({
  heading,
  cards,
}: VideoTestimonialSimpleProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-surface-raised"
          >
            <video
              controls
              preload="none"
              poster={c.posterUrl}
              className="aspect-video w-full bg-surface-sunken object-cover"
            >
              <source src={c.videoUrl} type="video/mp4" />
            </video>
            <div className="p-4">
              <p className="text-sm italic leading-relaxed text-foreground">
                &ldquo;{c.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs">
                <span className="font-semibold text-foreground">
                  {c.authorName}
                </span>
                <span className="text-muted-foreground"> · {c.authorRole}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
