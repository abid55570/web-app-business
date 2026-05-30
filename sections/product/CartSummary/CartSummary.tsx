export type CartLine = {
  name: string
  qty: number
  unitPrice: number
  amount: number
}

export type CartSummaryProps = {
  lines: CartLine[]
  currency?: string
  subtotal: number
  tax?: number
  shipping?: number
  total: number
  checkoutHref?: string
}

export function CartSummary({
  lines,
  currency = 'USD',
  subtotal,
  tax,
  shipping,
  total,
  checkoutHref = '/checkout',
}: CartSummaryProps) {
  return (
    <section className="px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Your cart</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3 text-foreground">{l.name}</td>
                <td className="py-3 text-right text-muted-foreground">
                  {l.qty} × {currency}
                  {l.unitPrice}
                </td>
                <td className="py-3 text-right font-medium text-foreground">
                  {currency}
                  {l.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground">
              {currency}
              {subtotal}
            </dd>
          </div>
          {tax != null ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-foreground">
                {currency}
                {tax}
              </dd>
            </div>
          ) : null}
          {shipping != null ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-foreground">
                {currency}
                {shipping}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
            <dt className="text-foreground">Total</dt>
            <dd className="text-primary">
              {currency}
              {total}
            </dd>
          </div>
        </dl>
        <a
          href={checkoutHref}
          className="mt-6 block w-full rounded-md bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Proceed to checkout →
        </a>
      </div>
    </section>
  )
}
