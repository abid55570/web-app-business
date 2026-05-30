/**
 * MasonryGallery — CSS columns layout (no JS, no extra deps).
 * Items naturally tile to balanced columns at lg/md/sm breakpoints.
 */
export type MasonryImage = {
  src: string
  alt: string
  caption?: string
}

export type MasonryGalleryProps = {
  heading?: string
  images: MasonryImage[]
}

export function MasonryGallery({ heading, images }: MasonryGalleryProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      {heading ? (
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground lg:text-4xl">
          {heading}
        </h2>
      ) : null}
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4">
        {images.map((img, i) => (
          <figure key={i} className="mb-4 break-inside-avoid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className="w-full rounded-lg object-cover"
              loading="lazy"
            />
            {img.caption ? (
              <figcaption className="mt-2 text-sm text-muted-foreground">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  )
}
