export type ConfirmModalProps = {
  id?: string
  triggerLabel?: string
  heading: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export function ConfirmModal({
  id = 'confirm-modal',
  triggerLabel = 'Delete…',
  heading,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
}: ConfirmModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className={`inline-block rounded-lg px-5 py-2.5 text-sm font-semibold ${
            destructive
              ? 'bg-error-bg text-error-fg'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
          <h3 className="mb-2 text-lg font-bold text-foreground">{heading}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{body}</p>
          <div className="flex justify-end gap-2">
            <a
              href="#"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay"
            >
              {cancelLabel}
            </a>
            <a
              href="#"
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                destructive
                  ? 'bg-error-fg text-white'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {confirmLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
