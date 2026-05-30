export type ShareModalProps = {
  id?: string
  triggerLabel?: string
  heading?: string
  shareUrl: string
  channels?: { label: string; href: string }[]
}

export function ShareModal({
  id = 'share-modal',
  triggerLabel = 'Share',
  heading = 'Share this',
  shareUrl,
  channels = [],
}: ShareModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className="inline-block rounded-lg border border-border bg-surface-raised px-5 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay"
        >
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/50 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
          <h3 className="mb-4 text-lg font-bold text-foreground">{heading}</h3>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-md border border-border bg-surface-overlay px-3 py-2 font-mono text-xs text-foreground"
            />
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Copy
            </button>
          </div>
          {channels.length ? (
            <div className="grid grid-cols-3 gap-2">
              {channels.map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  className="rounded-md border border-border px-3 py-2 text-center text-xs font-medium text-foreground hover:bg-surface-overlay"
                >
                  {c.label}
                </a>
              ))}
            </div>
          ) : null}
          <div className="mt-4 text-right">
            <a
              href="#"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Close
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
