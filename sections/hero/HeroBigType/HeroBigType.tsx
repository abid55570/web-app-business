export type HeroBigTypeProps = {
  heading: string
  accentWord?: string
  subheading?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
}

export function HeroBigType({
  heading,
  accentWord,
  subheading,
  primaryCtaLabel,
  primaryCtaHref = '#',
}: HeroBigTypeProps) {
  const renderHeading = () => {
    if (!accentWord) return heading
    const parts = heading.split(accentWord)
    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {accentWord}
        </span>
        {parts.slice(1).join(accentWord)}
      </>
    )
  }
  return (
    <section className="px-6 py-24 text-center">
      <h1 className="mx-auto mb-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-[8rem]">
        {renderHeading()}
      </h1>
      {subheading ? (
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          {subheading}
        </p>
      ) : null}
      {primaryCtaLabel ? (
        <a
          href={primaryCtaHref}
          className="inline-block rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-surface-base"
        >
          {primaryCtaLabel}
        </a>
      ) : null}
    </section>
  )
}
