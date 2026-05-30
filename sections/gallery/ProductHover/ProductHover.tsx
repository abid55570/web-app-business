export type ProductHoverItem = {
  href: string
  primaryImageUrl: string
  hoverImageUrl: string
  name: string
  price: string
  badge?: string
}

export type ProductHoverProps = {
  heading?: string
  items: ProductHoverItem[]
}

export function ProductHover({ heading, items }: ProductHoverProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-6xl text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <li key={i}>
            <a href={it.href} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-sunken">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.primaryImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.hoverImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                {it.badge ? (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                    {it.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground group-hover:underline">
                {it.name}
              </p>
              <p className="text-sm font-bold text-primary">{it.price}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
