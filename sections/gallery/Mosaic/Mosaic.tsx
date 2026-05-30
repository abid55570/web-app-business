export type MosaicItem = {
  imageUrl: string
  alt?: string
  span?: 1 | 2
  rowSpan?: 1 | 2
}

export type MosaicProps = {
  heading?: string
  items: MosaicItem[]
}

export function Mosaic({ heading, items }: MosaicProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-5xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul
        className="mx-auto grid max-w-5xl auto-rows-[160px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        style={{ gridAutoFlow: 'dense' }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            className={`overflow-hidden rounded-lg ${
              it.span === 2 ? 'col-span-2' : ''
            } ${it.rowSpan === 2 ? 'row-span-2' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.imageUrl}
              alt={it.alt ?? ''}
              className="h-full w-full object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
