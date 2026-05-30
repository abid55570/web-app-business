export type EmailPreference = {
  id: string
  label: string
  description: string
  required?: boolean
  defaultChecked?: boolean
}

export type EmailPreferencesProps = {
  heading?: string
  preferences: EmailPreference[]
  action: string
  unsubscribeAllAction?: string
}

export function EmailPreferences({
  heading = 'Email preferences',
  preferences,
  action,
  unsubscribeAllAction,
}: EmailPreferencesProps) {
  return (
    <form action={action} method="POST" className="mx-auto max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{heading}</h2>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {preferences.map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-4 px-4 py-4">
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {p.label}
                {p.required ? (
                  <span className="ml-2 rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    required
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.description}
              </p>
            </div>
            <input
              type="checkbox"
              name={p.id}
              defaultChecked={p.required || p.defaultChecked}
              disabled={p.required}
              className="peer/p sr-only"
            />
            <span
              aria-hidden
              className="relative mt-1 inline-block h-6 w-11 flex-none rounded-full bg-surface-sunken transition-colors peer-checked/p:bg-primary peer-disabled/p:opacity-50"
            >
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked/p:translate-x-5" />
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {unsubscribeAllAction ? (
          <button
            type="submit"
            formAction={unsubscribeAllAction}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Unsubscribe from all
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Save preferences
        </button>
      </div>
    </form>
  )
}
