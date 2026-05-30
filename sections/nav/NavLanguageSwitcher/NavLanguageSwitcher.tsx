export type NavLanguageSwitcherLocale = {
  code: string
  label: string
  href: string
  active?: boolean
}

export type NavLanguageSwitcherProps = {
  locales: NavLanguageSwitcherLocale[]
}

export function NavLanguageSwitcher({
  locales,
}: NavLanguageSwitcherProps) {
  const active = locales.find((l) => l.active) ?? locales[0]
  return (
    <details className="relative inline-block">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-overlay">
        🌐 {active?.label ?? 'Language'} ▾
      </summary>
      <ul className="absolute right-0 z-10 mt-1 min-w-[160px] rounded-md border border-border bg-surface-raised py-1 shadow-xl">
        {locales.map((l) => (
          <li key={l.code}>
            <a
              href={l.href}
              className={`flex items-center justify-between px-3 py-1.5 text-xs ${
                l.active
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-foreground hover:bg-surface-overlay'
              }`}
            >
              <span>{l.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {l.code}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
