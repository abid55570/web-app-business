export type Tab = {
  label: string
  href: string
  active?: boolean
}

export type TabsBarProps = {
  tabs: Tab[]
}

export function TabsBar({ tabs }: TabsBarProps) {
  return (
    <nav
      aria-label="Tabs"
      className="border-b border-border px-6 lg:px-12"
    >
      <ul className="flex flex-wrap gap-1">
        {tabs.map((t, i) => (
          <li key={i}>
            <a
              href={t.href}
              aria-current={t.active ? 'page' : undefined}
              className={`-mb-px inline-block border-b-2 px-4 py-3 text-sm font-medium ${
                t.active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
