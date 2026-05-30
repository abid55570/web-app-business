export type FooterSocialOnlyProps = {
  copyright: string
  socials: Array<{ label: string; href: string; icon: string }>
}

export function FooterSocialOnly({
  copyright,
  socials,
}: FooterSocialOnlyProps) {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <p className="text-xs text-muted-foreground">{copyright}</p>
        <ul className="flex gap-2">
          {socials.map((s, i) => (
            <li key={i}>
              <a
                href={s.href}
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-raised text-base text-muted-foreground hover:text-foreground"
              >
                <span aria-hidden>{s.icon}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
