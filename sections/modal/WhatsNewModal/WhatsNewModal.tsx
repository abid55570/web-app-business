export type WhatsNewModalChange = {
  emoji?: string
  title: string
  body: string
}

export type WhatsNewModalProps = {
  id?: string
  triggerLabel?: string
  version: string
  date: string
  changes: WhatsNewModalChange[]
}

export function WhatsNewModal({
  id = 'whats-new-modal',
  triggerLabel = "What's new",
  version,
  date,
  changes,
}: WhatsNewModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay"
        >
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
            New
          </span>
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-2xl">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-xl font-bold text-foreground">
              What&apos;s new
            </h3>
            <span className="font-mono text-xs text-muted-foreground">
              {version} · {date}
            </span>
          </div>
          <ul className="space-y-3">
            {changes.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-xl">{c.emoji ?? '✨'}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {c.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-right">
            <a
              href="#"
              className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Got it
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
