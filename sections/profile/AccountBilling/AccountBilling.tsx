export type AccountBillingProps = {
  planName: string
  planPrice: string
  planCadence: string
  renewsAt: string
  cardBrand: string
  cardLast4: string
  cardExpiry: string
  portalUrl: string
}

export function AccountBilling({
  planName,
  planPrice,
  planCadence,
  renewsAt,
  cardBrand,
  cardLast4,
  cardExpiry,
  portalUrl,
}: AccountBillingProps) {
  return (
    <article className="mx-auto max-w-2xl rounded-xl border border-border bg-surface-raised p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current plan
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{planName}</p>
          <p className="text-sm text-muted-foreground">
            {planPrice} / {planCadence} · renews {renewsAt}
          </p>
        </div>
        <a
          href={portalUrl}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
        >
          Manage
        </a>
      </header>
      <div className="mt-6 rounded-lg border border-border bg-surface-sunken p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Payment method
        </p>
        <p className="mt-1 font-mono text-sm text-foreground">
          {cardBrand} •••• {cardLast4}
        </p>
        <p className="text-xs text-muted-foreground">Expires {cardExpiry}</p>
      </div>
    </article>
  )
}
