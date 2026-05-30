export type InfoModalProps = {
  id?: string
  triggerLabel?: string
  heading: string
  body: string
  closeLabel?: string
}

export function InfoModal({
  id = 'info-modal',
  triggerLabel = 'Learn more',
  heading,
  body,
  closeLabel = 'Got it',
}: InfoModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className="inline-block rounded-full border border-border bg-surface-raised px-5 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay"
        >
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/50 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-info-bg text-info-fg">
              i
            </span>
            <h3 className="text-lg font-bold text-foreground">{heading}</h3>
          </div>
          <p className="mb-6 pl-13 text-sm text-muted-foreground">{body}</p>
          <div className="text-right">
            <a
              href="#"
              className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              {closeLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
