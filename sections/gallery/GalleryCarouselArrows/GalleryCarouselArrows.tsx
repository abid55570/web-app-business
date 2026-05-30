export type GalleryCarouselArrowsProps = {
  heading?: string
  images: { url: string; caption?: string }[]
}
export function GalleryCarouselArrows({ heading, images }: GalleryCarouselArrowsProps) {
  return (
    <section className="px-6 py-12">
      {heading ? <h2 className="mx-auto mb-6 max-w-3xl text-xl font-semibold text-foreground">{heading}</h2> : null}
      <div className="relative mx-auto max-w-5xl">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {images.map((im, i) => (
            <li key={i} className="snap-start">
              <figure className="w-[480px] max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt={im.caption ?? ''} className="aspect-video w-full rounded-xl object-cover" />
                {im.caption ? <figcaption className="mt-2 text-center text-xs text-muted-foreground">{im.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-xs text-muted-foreground">← swipe →</p>
      </div>
    </section>
  )
}
