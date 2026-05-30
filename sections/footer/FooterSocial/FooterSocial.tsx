export type FooterSocialLink = { label: string; href: string }

export type FooterSocialProps = {
  brandName: string
  socials?: FooterSocialLink[]
  legal?: string
}

export function FooterSocial({
  brandName,
  socials = [],
  legal,
}: FooterSocialProps) {
  return (
    <footer className="border-t border-border px-6 py-10 text-center lg:px-12">
      <p className="text-base font-bold text-foreground">{brandName}</p>
      {socials.length > 0 ? (
        <ul className="mt-4 flex justify-center gap-4">
          {socials.map((s, i) => (
            <li key={i}>
              <a
                href={s.href}
                rel="noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm text-foreground hover:bg-accent"
                aria-label={s.label}
              >
                {s.label.slice(0, 2).toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {legal ? (
        <p className="mt-6 text-xs text-muted-foreground">{legal}</p>
      ) : null}
    </footer>
  )
}
