export type ChecklistItem = {
  label: string
  href?: string
  done?: boolean
}

export type ChecklistOnboardingProps = {
  heading?: string
  items: ChecklistItem[]
}

export function ChecklistOnboarding({
  heading = 'Get started',
  items,
}: ChecklistOnboardingProps) {
  const done = items.filter((i) => i.done).length
  return (
    <section className="px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface-raised p-6">
        <header className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
          <span className="text-xs text-muted-foreground">
            {done} of {items.length} complete
          </span>
        </header>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-md border border-border p-3 ${
                it.done ? 'opacity-60' : 'hover:bg-accent'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  it.done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border'
                }`}
              >
                {it.done ? '✓' : null}
              </span>
              {it.href && !it.done ? (
                <a
                  href={it.href}
                  className="flex-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  {it.label}
                </a>
              ) : (
                <span
                  className={`flex-1 text-sm ${it.done ? 'line-through' : 'text-foreground'}`}
                >
                  {it.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
