export type QuickViewProps = {
  imageUrl: string
  name: string
  price: string
  rating?: number
  reviewCount?: number
  shortDescription: string
  viewHref: string
  addToCartAction: string
}

export function QuickView({
  imageUrl,
  name,
  price,
  rating,
  reviewCount,
  shortDescription,
  viewHref,
  addToCartAction,
}: QuickViewProps) {
  return (
    <article className="mx-auto grid max-w-3xl gap-6 rounded-2xl border border-border bg-surface-raised p-6 sm:grid-cols-[200px_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="aspect-square w-full rounded-lg object-cover"
      />
      <div>
        <h2 className="text-lg font-semibold text-foreground">{name}</h2>
        {rating !== undefined ? (
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="text-amber-500">
              {'★'.repeat(Math.round(rating))}
              {'☆'.repeat(5 - Math.round(rating))}
            </span>{' '}
            {reviewCount !== undefined ? `(${reviewCount} reviews)` : null}
          </p>
        ) : null}
        <p className="mt-3 text-xl font-bold text-primary">{price}</p>
        <p className="mt-3 text-sm text-muted-foreground">{shortDescription}</p>
        <div className="mt-5 flex gap-2">
          <form action={addToCartAction} method="POST" className="flex-1">
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Add to cart
            </button>
          </form>
          <a
            href={viewHref}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            View
          </a>
        </div>
      </div>
    </article>
  )
}
