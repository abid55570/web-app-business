export type FilterDrawerSection = {
  heading: string
  options: Array<{ name: string; label: string; checked?: boolean }>
}

export type FilterDrawerProps = {
  id: string
  triggerLabel: string
  title: string
  sections: FilterDrawerSection[]
  action: string
  clearAction?: string
}

export function FilterDrawer({
  id,
  triggerLabel,
  title,
  sections,
  action,
  clearAction,
}: FilterDrawerProps) {
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        <span aria-hidden>⛃</span>
        {triggerLabel}
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="invisible fixed bottom-0 right-0 top-0 z-50 w-80 translate-x-full transform border-l border-border bg-surface-raised shadow-2xl transition-transform target:visible target:translate-x-0 [&:target]:visible [&:target]:translate-x-0"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <a
            href="#"
            aria-label="Close filters"
            className="text-2xl leading-none text-muted-foreground hover:text-foreground"
          >
            ×
          </a>
        </header>
        <form action={action} method="GET" className="flex h-[calc(100vh-7rem)] flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {sections.map((s, i) => (
              <fieldset key={i}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.heading}
                </legend>
                <ul className="space-y-1.5">
                  {s.options.map((o, j) => (
                    <li key={j}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          name={o.name}
                          defaultChecked={o.checked}
                          className="h-4 w-4 accent-primary"
                        />
                        {o.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border px-5 py-3">
            {clearAction ? (
              <a
                href={clearAction}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent"
              >
                Clear
              </a>
            ) : null}
            <button
              type="submit"
              className="ml-auto rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Apply filters
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
