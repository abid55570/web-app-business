export type NavTabsPillTab = {
  id: string
  label: string
  count?: number
}

export type NavTabsPillProps = {
  tabs: NavTabsPillTab[]
  defaultTabId?: string
}

export function NavTabsPill({ tabs, defaultTabId }: NavTabsPillProps) {
  const fallback = defaultTabId ?? tabs[0]?.id
  return (
    <nav className="px-6 py-4">
      <div className="mx-auto max-w-5xl">
        <ul className="inline-flex flex-wrap gap-1 rounded-full bg-surface-overlay p-1">
          {tabs.map((t) => (
            <li key={t.id} className="flex">
              <input
                type="radio"
                id={`navpill-${t.id}`}
                name="navpill"
                className="peer hidden"
                defaultChecked={t.id === fallback}
              />
              <label
                htmlFor={`navpill-${t.id}`}
                className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground peer-checked:bg-surface-raised peer-checked:text-foreground peer-checked:shadow"
              >
                {t.label}
                {t.count !== undefined ? (
                  <span className="ml-1.5 rounded-full bg-surface-overlay px-1.5 text-[10px] text-muted-foreground peer-checked:bg-primary/10 peer-checked:text-primary">
                    {t.count}
                  </span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
