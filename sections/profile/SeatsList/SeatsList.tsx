export type SeatsListSeat = {
  id: string
  name: string
  email: string
  role: string
  pending?: boolean
  removeAction?: string
}

export type SeatsListProps = {
  seatsUsed: number
  seatsTotal: number
  seats: SeatsListSeat[]
  inviteAction: string
}

export function SeatsList({
  seatsUsed,
  seatsTotal,
  seats,
  inviteAction,
}: SeatsListProps) {
  const pct = Math.round((seatsUsed / seatsTotal) * 100)
  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Seats</h2>
          <p className="text-xs text-muted-foreground">
            {seatsUsed} of {seatsTotal} used ({pct}%)
          </p>
        </div>
        <form action={inviteAction} method="POST">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            + Invite
          </button>
        </form>
      </header>
      <div
        className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="block h-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {seats.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {s.name}
                {s.pending ? (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                    pending
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.email} · {s.role}
              </p>
            </div>
            {s.removeAction ? (
              <form action={s.removeAction} method="POST">
                <button
                  type="submit"
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
