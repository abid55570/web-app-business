export type GalleryMasonryHoverItem = {
  imageUrl: string
  caption: string
  href?: string
}

export type GalleryMasonryHoverProps = {
  items: GalleryMasonryHoverItem[]
}

export function GalleryMasonryHover({
  items,
}: GalleryMasonryHoverProps) {
  return (
    <section className="px-6 py-12">
      <ul className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <a href={it.href ?? '#'} className="block h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.imageUrl}
                alt={it.caption}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 grid items-end bg-gradient-to-t from-black/70 via-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <span className="p-4 text-sm font-semibold text-white">
                  {it.caption}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
