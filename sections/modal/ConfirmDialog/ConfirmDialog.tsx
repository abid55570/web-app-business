export type ConfirmDialogProps = {
  open?: boolean
  title: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
}

export function ConfirmDialog({
  open = false,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
}: ConfirmDialogProps) {
  return (
    <dialog
      open={open}
      className="rounded-xl border border-border bg-surface-raised p-6 shadow-xl backdrop:bg-black/50"
    >
      <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
      {body ? (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{body}</p>
      ) : null}
      <form method="dialog" className="flex justify-end gap-2">
        <button
          value="cancel"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
        >
          {cancelLabel}
        </button>
        <button
          value="confirm"
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 ${
            tone === 'danger' ? 'bg-red-600' : 'bg-primary'
          }`}
        >
          {confirmLabel}
        </button>
      </form>
    </dialog>
  )
}
