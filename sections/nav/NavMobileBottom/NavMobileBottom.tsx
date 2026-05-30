export type NavMobileBottomItem = {
  icon: string
  label: string
  href: string
  active?: boolean
  badge?: number
}

export type NavMobileBottomProps = {
  items: NavMobileBottomItem[]
}

export function NavMobileBottom({ items }: NavMobileBottomProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-raised pb-[env(safe-area-inset-bottom)] sm:hidden">
      <ul className="flex">
        {items.map((it, i) => (
          <li key={i} className="flex-1">
            <a
              href={it.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${
                it.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="relative text-xl">
                {it.icon}
                {it.badge ? (
                  <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error-fg px-1 text-[9px] font-bold text-white">
                    {it.badge}
                  </span>
                ) : null}
              </span>
              <span className="font-medium">{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
