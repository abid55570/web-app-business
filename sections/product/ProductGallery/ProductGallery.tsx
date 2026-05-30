export type GalleryImage = {
  src: string
  alt: string
}

export type ProductGalleryProps = {
  images: GalleryImage[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  if (images.length === 0) return null
  const [first, ...rest] = images
  if (!first) return null
  return (
    <section className="px-6 py-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={first.src}
            alt={first.alt}
            className="aspect-square w-full object-cover"
          />
        </div>
        {rest.length > 0 ? (
          <ul className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto">
            {images.map((img, i) => (
              <li key={i} className="shrink-0 snap-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-20 w-20 cursor-pointer rounded-md border border-border object-cover hover:border-primary"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
