export type FooterNewsletterColumnProps = {
  brand: string
  newsletterHeading?: string
  newsletterBody?: string
  signupLabel?: string
  links: { title: string; items: { label: string; href: string }[] }[]
}
export function FooterNewsletterColumn({ brand, newsletterHeading = 'Subscribe to updates', newsletterBody, signupLabel = 'Subscribe', links }: FooterNewsletterColumnProps) {
  return (
    <footer className="border-t border-border bg-surface-overlay px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_3fr]">
        <div>
          <p className="mb-3 text-2xl font-black text-foreground">{brand}</p>
          <h4 className="mb-2 text-sm font-semibold text-foreground">{newsletterHeading}</h4>
          {newsletterBody ? <p className="mb-3 text-xs text-muted-foreground">{newsletterBody}</p> : null}
          <form className="flex gap-2">
            <input type="email" placeholder="you@example.com" className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm" />
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">{signupLabel}</button>
          </form>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {links.map((c, i) => (
            <div key={i}>
              <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">{c.title}</h5>
              <ul className="space-y-1">
                {c.items.map((l, j) => (
                  <li key={j}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
