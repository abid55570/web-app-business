export type ConsentCategory = {
  id: string
  label: string
  description: string
  required?: boolean
  defaultChecked?: boolean
}

export type ConsentPreferencesProps = {
  id: string
  triggerLabel: string
  title: string
  description: string
  categories: ConsentCategory[]
  saveAction: string
}

export function ConsentPreferences({
  id,
  triggerLabel,
  title,
  description,
  categories,
  saveAction,
}: ConsentPreferencesProps) {
  return (
    <>
      <a
        href={`#${id}`}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
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
        <div className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-raised shadow-2xl">
          <header className="border-b border-border px-6 py-4">
            <h2
              id={`${id}-title`}
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </header>
          <form action={saveAction} method="POST">
            <ul className="divide-y divide-border">
              {categories.map((c) => (
                <li key={c.id} className="flex items-start gap-3 px-6 py-4">
                  <input
                    type="checkbox"
                    id={`${id}-${c.id}`}
                    name={c.id}
                    defaultChecked={c.required || c.defaultChecked}
                    disabled={c.required}
                    className="mt-1 h-4 w-4 rounded border-border accent-primary"
                  />
                  <label htmlFor={`${id}-${c.id}`} className="flex-1 text-sm">
                    <span className="block font-medium text-foreground">
                      {c.label}
                      {c.required ? (
                        <span className="ml-2 rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                          required
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {c.description}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
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
                Save preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
