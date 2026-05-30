export type ConfirmDeleteProps = {
  id: string
  triggerLabel: string
  resourceName: string
  confirmText?: string
  action: string
}

export function ConfirmDelete({
  id,
  triggerLabel,
  resourceName,
  confirmText,
  action,
}: ConfirmDeleteProps) {
  const phrase = confirmText ?? resourceName
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        {triggerLabel}
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
          <h2
            id={`${id}-title`}
            className="text-lg font-semibold text-foreground"
          >
            Delete {resourceName}?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is permanent and cannot be undone.
          </p>
          <form action={action} method="POST" className="mt-5">
            <label className="text-xs font-semibold text-muted-foreground">
              Type <span className="font-mono text-foreground">{phrase}</span> to confirm
            </label>
            <input
              type="text"
              name="confirm"
              required
              pattern={phrase}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-red-500 focus:outline-none"
            />
            <div className="mt-5 flex justify-end gap-2">
              <a
                href="#"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete forever
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
