export type AlertDialogProps = {
  id: string
  triggerLabel: string
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  action: string
  variant?: 'default' | 'danger'
}

export function AlertDialog({
  id,
  triggerLabel,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  action,
  variant = 'default',
}: AlertDialogProps) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-primary hover:opacity-90'
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        {triggerLabel}
      </a>
      <div
        id={id}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
          <h2
            id={`${id}-title`}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <div className="mt-5 flex justify-end gap-2">
            <a
              href="#"
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              {cancelLabel}
            </a>
            <form action={action} method="POST">
              <button
                type="submit"
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${confirmClass}`}
              >
                {confirmLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
