export type FooterLegalProps = {
  companyLegalName: string
  registrationNumber?: string
  vatNumber?: string
  registeredAddress: string
  legalLinks: Array<{ label: string; href: string }>
  copyright: string
}

export function FooterLegal({
  companyLegalName,
  registrationNumber,
  vatNumber,
  registeredAddress,
  legalLinks,
  copyright,
}: FooterLegalProps) {
  return (
    <footer className="border-t border-border bg-surface-sunken text-xs text-muted-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          {legalLinks.map((l, i) => (
            <li key={i}>
              <a href={l.href} className="hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="leading-relaxed">
          <span className="font-semibold text-foreground">{companyLegalName}</span>
          {registrationNumber ? ` · Reg ${registrationNumber}` : ''}
          {vatNumber ? ` · VAT ${vatNumber}` : ''}
          <br />
          {registeredAddress}
        </p>
        <p className="mt-3">{copyright}</p>
      </div>
    </footer>
  )
}
