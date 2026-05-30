export type MoodboardItem = {
  imageUrl: string
  alt?: string
  label?: string
  rotateDeg?: number
}

export type MoodboardWallProps = {
  heading?: string
  items: MoodboardItem[]
}

export function MoodboardWall({ heading, items }: MoodboardWallProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it, i) => (
          <li
            key={i}
            style={{ transform: `rotate(${it.rotateDeg ?? (i % 2 === 0 ? -2 : 2)}deg)` }}
            className="overflow-hidden rounded-lg border border-border bg-surface-raised shadow-sm transition-transform hover:rotate-0 hover:scale-105"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.imageUrl}
              alt={it.alt ?? ''}
              className="aspect-square w-full object-cover"
            />
            {it.label ? (
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                {it.label}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
