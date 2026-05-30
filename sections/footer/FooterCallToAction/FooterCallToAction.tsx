export type FooterCallToActionProps = {
  heading: string
  ctaLabel: string
  ctaHref?: string
  brand: string
  copyright?: string
}

export function FooterCallToAction({
  heading,
  ctaLabel,
  ctaHref = '#',
  brand,
  copyright,
}: FooterCallToActionProps) {
  return (
    <footer className="border-t border-border bg-surface-raised">
      <div className="bg-gradient-to-br from-primary to-accent px-6 py-16 text-center text-primary-foreground">
        <h2 className="mx-auto mb-6 max-w-2xl text-3xl font-bold sm:text-4xl">
          {heading}
        </h2>
        <a
          href={ctaHref}
          className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black shadow-lg hover:bg-white/90"
        >
          {ctaLabel}
        </a>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground">
        <p className="font-bold text-foreground">{brand}</p>
        {copyright ? <p>{copyright}</p> : null}
      </div>
    </footer>
  )
}
