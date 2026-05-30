export type AddToCartCardProps = {
  name: string
  price: number
  currency?: string
  imageUrl?: string
  description?: string
  action: string
  inStock?: boolean
}

export function AddToCartCard({
  name,
  price,
  currency = 'USD',
  imageUrl,
  description,
  action,
  inStock = true,
}: AddToCartCardProps) {
  return (
    <article className="mx-auto max-w-md overflow-hidden rounded-xl border border-border bg-surface-raised">
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt=""
          className="aspect-square w-full object-cover"
        />
      ) : null}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-2xl font-bold text-primary">
          {currency}
          {price}
        </p>
        {description ? (
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        ) : null}
        <form action={action} method="POST" className="mt-5 flex gap-2">
          <label className="sr-only" htmlFor="b-dash-qty">
            Quantity
          </label>
          <input
            id="b-dash-qty"
            name="qty"
            type="number"
            min={1}
            defaultValue={1}
            disabled={!inStock}
            className="w-16 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <button
            type="submit"
            disabled={!inStock}
            className="flex-1 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inStock ? 'Add to cart' : 'Out of stock'}
          </button>
        </form>
      </div>
    </article>
  )
}
