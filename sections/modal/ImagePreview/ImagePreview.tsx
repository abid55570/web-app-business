export type ImagePreviewProps = {
  id: string
  thumbnailUrl: string
  fullUrl: string
  alt?: string
  caption?: string
}

export function ImagePreview({
  id,
  thumbnailUrl,
  fullUrl,
  alt = '',
  caption,
}: ImagePreviewProps) {
  return (
    <>
      <a href={`#${id}`} className="block overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={alt}
          className="aspect-square w-full object-cover transition-transform hover:scale-105"
        />
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/85 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <a
          href="#"
          aria-label="Close preview"
          className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
        >
          ×
        </a>
        <figure className="max-h-[90vh] max-w-[90vw]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullUrl}
            alt={alt}
            className="max-h-[80vh] w-auto rounded-lg object-contain"
          />
          {caption ? (
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </>
  )
}
