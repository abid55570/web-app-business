export type LightboxImage = {
  src: string
  alt: string
  caption?: string
}

export type LightboxGridProps = {
  images: LightboxImage[]
}

export function LightboxGrid({ images }: LightboxGridProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => {
          const id = `lb-${i}`
          return (
            <li key={i}>
              <a href={`#${id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover transition-transform hover:scale-[1.02]"
                />
              </a>
              <div
                id={id}
                className="fixed inset-0 z-50 hidden bg-black/85 target:flex items-center justify-center p-6"
              >
                <a
                  href="#"
                  className="absolute right-5 top-5 text-white text-2xl"
                  aria-label="Close lightbox"
                >
                  ×
                </a>
                <figure className="max-w-5xl text-center text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="max-h-[80vh] w-full rounded-lg object-contain"
                  />
                  {img.caption ? (
                    <figcaption className="mt-3 text-sm text-white/80">
                      {img.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
