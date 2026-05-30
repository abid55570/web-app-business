export type HoverCaptionItem = {
  imageUrl: string
  title: string
  caption: string
  href: string
}

export type HoverCaptionProps = {
  heading?: string
  items: HoverCaptionItem[]
}

export function HoverCaption({ heading, items }: HoverCaptionProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-6xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={i}>
            <a
              href={it.href}
              className="group relative block overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.imageUrl}
                alt=""
                className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 translate-y-1/3 bg-gradient-to-t from-black/90 to-transparent p-5 text-white transition-transform group-hover:translate-y-0">
                <p className="text-lg font-bold">{it.title}</p>
                <p className="mt-1 text-sm opacity-90">{it.caption}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
