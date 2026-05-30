export type ImageWithCaptionProps = {
  src: string
  alt?: string
  caption: string
  credit?: string
  width?: 'narrow' | 'full' | 'wide'
}

const WIDTH_CLASS: Record<NonNullable<ImageWithCaptionProps['width']>, string> = {
  narrow: 'max-w-xl',
  full: 'max-w-3xl',
  wide: 'max-w-5xl',
}

export function ImageWithCaption({
  src,
  alt = '',
  caption,
  credit,
  width = 'full',
}: ImageWithCaptionProps) {
  return (
    <figure className={`mx-auto my-8 ${WIDTH_CLASS[width]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg shadow-sm"
      />
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        {caption}
        {credit ? (
          <span className="block text-xs opacity-70">— {credit}</span>
        ) : null}
      </figcaption>
    </figure>
  )
}
