export type BeforeAfterProps = {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  caption?: string
}

export function BeforeAfter({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  caption,
}: BeforeAfterProps) {
  return (
    <figure className="mx-auto max-w-3xl">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="aspect-square w-full object-cover"
          />
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            {beforeLabel}
          </span>
        </div>
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterUrl}
            alt={afterLabel}
            className="aspect-square w-full object-cover"
          />
          <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            {afterLabel}
          </span>
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
