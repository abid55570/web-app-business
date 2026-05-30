export type Subscription = {
  id: string
  serviceName: string
  planName: string
  amount: string
  cadence: string
  nextRenewal: string
  status: 'active' | 'canceled' | 'paused'
  manageHref: string
}

export type SubscriptionsListProps = {
  subscriptions: Subscription[]
}

const STATUS_BADGE: Record<Subscription['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800',
  canceled: 'bg-red-100 text-red-800',
  paused: 'bg-amber-100 text-amber-800',
}

export function SubscriptionsList({
  subscriptions,
}: SubscriptionsListProps) {
  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        Subscriptions
      </h2>
      <ul className="space-y-3">
        {subscriptions.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-4"
          >
            <div>
              <p className="font-semibold text-foreground">
                {s.serviceName}
                <span
                  className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-bold uppercase ${
                    STATUS_BADGE[s.status]
                  }`}
                >
                  {s.status}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {s.planName} · {s.amount}/{s.cadence}
              </p>
              <p className="text-xs text-muted-foreground">
                Next renewal: {s.nextRenewal}
              </p>
            </div>
            <a
              href={s.manageHref}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Manage
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
