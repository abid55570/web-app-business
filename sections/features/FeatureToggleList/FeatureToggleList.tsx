export type FeatureToggle = {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}

export type FeatureToggleListProps = {
  heading?: string
  action: string
  toggles: FeatureToggle[]
}

export function FeatureToggleList({
  heading,
  action,
  toggles,
}: FeatureToggleListProps) {
  return (
    <form
      action={action}
      method="POST"
      className="mx-auto max-w-2xl space-y-1 rounded-xl border border-border bg-surface-raised p-2"
    >
      {heading ? (
        <h2 className="px-4 py-3 text-base font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      {toggles.map((t) => (
        <label
          key={t.name}
          className="flex cursor-pointer items-start justify-between gap-4 rounded-lg px-4 py-3 hover:bg-accent"
        >
          <div className="flex-1">
            <p className="font-medium text-foreground">{t.label}</p>
            {t.description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t.description}
              </p>
            ) : null}
          </div>
          <input
            type="checkbox"
            name={t.name}
            defaultChecked={t.defaultChecked}
            className="peer/sw sr-only"
          />
          <span
            aria-hidden
            className="relative mt-1 inline-block h-6 w-11 flex-none rounded-full bg-surface-sunken transition-colors peer-checked/sw:bg-primary"
          >
            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked/sw:translate-x-5" />
          </span>
        </label>
      ))}
      <div className="px-4 py-3">
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
