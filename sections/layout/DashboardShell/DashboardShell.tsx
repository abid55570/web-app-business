export type DashboardShellNavItem = {
  label: string
  href: string
  icon?: string
  active?: boolean
}

export type DashboardShellProps = {
  brand: string
  navItems: DashboardShellNavItem[]
  userName: string
  userEmail: string
  signOutAction: string
  children?: React.ReactNode
}

export function DashboardShell({
  brand,
  navItems,
  userName,
  userEmail,
  signOutAction,
  children,
}: DashboardShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[14rem_1fr]">
      <aside className="hidden border-r border-border bg-surface-sunken lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-4">
          <p className="text-base font-bold text-foreground">{brand}</p>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((it, i) => (
              <li key={i}>
                <a
                  href={it.href}
                  aria-current={it.active ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    it.active
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span aria-hidden className="text-base">
                    {it.icon ?? '·'}
                  </span>
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border px-4 py-3 text-xs">
          <p className="font-medium text-foreground">{userName}</p>
          <p className="truncate text-muted-foreground">{userEmail}</p>
          <form action={signOutAction} method="POST" className="mt-2">
            <button
              type="submit"
              className="text-xs font-semibold text-muted-foreground hover:text-red-600"
            >
              Sign out →
            </button>
          </form>
        </div>
      </aside>
      <main className="overflow-y-auto bg-surface-base p-6">{children}</main>
    </div>
  )
}
