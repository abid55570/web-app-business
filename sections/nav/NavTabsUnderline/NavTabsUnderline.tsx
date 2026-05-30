export type NavTabsUnderlineTab = {
  id: string
  label: string
  href?: string
  active?: boolean
}

export type NavTabsUnderlineProps = {
  tabs: NavTabsUnderlineTab[]
}

export function NavTabsUnderline({ tabs }: NavTabsUnderlineProps) {
  return (
    <nav className="border-b border-border bg-surface-raised">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
        {tabs.map((t) => (
          <a
            key={t.id}
            href={t.href ?? `#${t.id}`}
            className={
              t.active
                ? 'whitespace-nowrap border-b-2 border-primary px-3 py-3 text-sm font-semibold text-primary'
                : 'whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground'
            }
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
