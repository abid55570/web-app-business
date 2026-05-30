export type CardHoverItem = {
  imageUrl: string
  title: string
  subtitle?: string
  href: string
}

export type CardHoverProps = {
  heading?: string
  items: CardHoverItem[]
}

export function CardHover({ heading, items }: CardHoverProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-5xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={i}>
            <a
              href={it.href}
              className="group relative block overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.imageUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 py-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-semibold text-white">{it.title}</p>
                {it.subtitle ? (
                  <p className="mt-0.5 text-xs text-white/80">{it.subtitle}</p>
                ) : null}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
