export type ImageZoomProps = {
  src: string
  alt?: string
  caption?: string
}

export function ImageZoom({ src, alt = '', caption }: ImageZoomProps) {
  return (
    <figure className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full transition-transform duration-500 hover:scale-110"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
