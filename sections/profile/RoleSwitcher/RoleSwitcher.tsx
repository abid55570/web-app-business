export type RoleSwitcherRole = {
  id: string
  label: string
  description?: string
  active?: boolean
}

export type RoleSwitcherProps = {
  roles: RoleSwitcherRole[]
  action: string
}

export function RoleSwitcher({ roles, action }: RoleSwitcherProps) {
  return (
    <details className="relative inline-block">
      <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-semibold text-foreground list-none hover:bg-accent">
        <span aria-hidden>👤</span>
        <span>
          {roles.find((r) => r.active)?.label ?? 'Switch role'}
        </span>
        <span aria-hidden className="text-xs text-muted-foreground">
          ▾
        </span>
      </summary>
      <form
        action={action}
        method="POST"
        className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg"
      >
        <ul className="py-1">
          {roles.map((r) => (
            <li key={r.id}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-accent">
                <input
                  type="radio"
                  name="role"
                  value={r.id}
                  defaultChecked={r.active}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-foreground">{r.label}</p>
                  {r.description ? (
                    <p className="text-xs text-muted-foreground">
                      {r.description}
                    </p>
                  ) : null}
                </div>
              </label>
            </li>
          ))}
        </ul>
        <div className="border-t border-border bg-surface-sunken px-3 py-2 text-right">
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Switch
          </button>
        </div>
      </form>
    </details>
  )
}
