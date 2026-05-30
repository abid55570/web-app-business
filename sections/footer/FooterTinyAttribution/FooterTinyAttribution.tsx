export type FooterTinyAttributionProps = {
  brand: string
  attribution?: string
  href?: string
}

export function FooterTinyAttribution({
  brand,
  attribution = 'Built with B-Dash',
  href = 'https://b-dash.dev',
}: FooterTinyAttributionProps) {
  return (
    <footer className="border-t border-border bg-surface-raised px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {brand}</span>
        <a href={href} className="hover:text-foreground">
          {attribution}
        </a>
      </div>
    </footer>
  )
}
