export type RelatedProduct = {
  name: string
  price: number
  currency: string
  imageUrl?: string
  href: string
}

export type RelatedProductsProps = {
  heading?: string
  products: RelatedProduct[]
}

export function RelatedProducts({
  heading = 'You might also like',
  products,
}: RelatedProductsProps) {
  return (
    <section className="px-6 py-10 lg:px-12">
      <h2 className="mb-6 text-xl font-semibold text-foreground lg:text-2xl">
        {heading}
      </h2>
      <ul
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
        style={{ scrollPaddingInline: '1.5rem' }}
      >
        {products.map((p, i) => (
          <li
            key={i}
            className="w-44 shrink-0 snap-start sm:w-52"
          >
            <a
              href={p.href}
              className="block overflow-hidden rounded-lg border border-border bg-surface-raised"
            >
              {p.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.imageUrl}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              ) : null}
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {p.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {p.currency}
                  {p.price}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
