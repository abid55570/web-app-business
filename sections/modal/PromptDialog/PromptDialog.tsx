export type PromptDialogProps = {
  id: string
  triggerLabel: string
  title: string
  body?: string
  inputLabel: string
  inputPlaceholder?: string
  inputName?: string
  inputType?: 'text' | 'email' | 'number'
  submitLabel?: string
  action: string
}

export function PromptDialog({
  id,
  triggerLabel,
  title,
  body,
  inputLabel,
  inputPlaceholder,
  inputName = 'value',
  inputType = 'text',
  submitLabel = 'Submit',
  action,
}: PromptDialogProps) {
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
            {title}
          </h2>
          {body ? (
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          ) : null}
          <form action={action} method="POST" className="mt-4">
            <label htmlFor={`${id}-input`} className="mb-1 block text-sm font-semibold text-foreground">
              {inputLabel}
            </label>
            <input
              id={`${id}-input`}
              type={inputType}
              name={inputName}
              placeholder={inputPlaceholder}
              required
              autoFocus
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <a
                href="#"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
