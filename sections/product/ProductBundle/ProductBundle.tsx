export type ProductBundleItem = {
  name: string
  imageUrl?: string
  individualPrice: string
}

export type ProductBundleProps = {
  heading: string
  items: ProductBundleItem[]
  totalIndividual: string
  bundlePrice: string
  saveLabel?: string
  ctaLabel?: string
  ctaHref?: string
}

export function ProductBundle({
  heading,
  items,
  totalIndividual,
  bundlePrice,
  saveLabel,
  ctaLabel = 'Buy bundle',
  ctaHref = '#',
}: ProductBundleProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">{heading}</h2>
        <ul className="mb-4 flex flex-wrap items-center gap-3">
          {items.map((it, i) => (
            <li key={i} className="flex flex-1 items-center gap-2">
              {it.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={it.imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-lg border border-border object-cover"
                />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface-overlay text-lg font-bold text-muted-foreground">
                  {it.name.charAt(0)}
                </span>
              )}
              <div className="text-xs">
                <p className="font-medium text-foreground">{it.name}</p>
                <p className="text-muted-foreground line-through">
                  {it.individualPrice}
                </p>
              </div>
              {i < items.length - 1 ? (
                <span aria-hidden className="text-xl text-muted-foreground">
                  +
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground line-through">
              {totalIndividual}
            </p>
            <p className="text-3xl font-black text-foreground">{bundlePrice}</p>
            {saveLabel ? (
              <p className="text-xs font-semibold text-success-fg">
                {saveLabel}
              </p>
            ) : null}
          </div>
          <a
            href={ctaHref}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
