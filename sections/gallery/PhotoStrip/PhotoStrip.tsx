export type PhotoStripPhoto = {
  src: string
  alt?: string
}

export type PhotoStripProps = {
  heading?: string
  photos: PhotoStripPhoto[]
  height?: 'sm' | 'md' | 'lg'
}

const HEIGHT_CLASS: Record<NonNullable<PhotoStripProps['height']>, string> = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
}

export function PhotoStrip({
  heading,
  photos,
  height = 'md',
}: PhotoStripProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-5 max-w-6xl text-lg font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {photos.map((p, i) => (
          <li key={i} className="flex-none snap-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.alt ?? ''}
              className={`w-auto rounded-lg object-cover ${HEIGHT_CLASS[height]}`}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
