export type QuickAction = {
  label: string
  href?: string
  action?: string
  icon: string
  variant?: 'default' | 'primary' | 'danger'
}

export type QuickActionsProps = {
  heading?: string
  actions: QuickAction[]
}

const VARIANT: Record<NonNullable<QuickAction['variant']>, string> = {
  default: 'border-border bg-surface-raised text-foreground hover:bg-accent',
  primary: 'border-primary bg-primary text-primary-foreground hover:opacity-90',
  danger: 'border-red-300 bg-red-50 text-red-900 hover:bg-red-100',
}

export function QuickActions({ heading, actions }: QuickActionsProps) {
  return (
    <section>
      {heading ? (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {heading}
        </h3>
      ) : null}
      <ul className="flex flex-wrap gap-2">
        {actions.map((a, i) => {
          const cls = `inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold ${
            VARIANT[a.variant ?? 'default']
          }`
          return (
            <li key={i}>
              {a.href ? (
                <a href={a.href} className={cls}>
                  <span aria-hidden>{a.icon}</span>
                  {a.label}
                </a>
              ) : a.action ? (
                <form action={a.action} method="POST">
                  <button type="submit" className={cls}>
                    <span aria-hidden>{a.icon}</span>
                    {a.label}
                  </button>
                </form>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
