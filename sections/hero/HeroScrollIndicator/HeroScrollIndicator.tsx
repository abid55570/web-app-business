export type HeroScrollIndicatorProps = {
  headline: string
  body: string
  scrollHint?: string
  nextSectionId: string
}

export function HeroScrollIndicator({
  headline,
  body,
  scrollHint = 'Scroll',
  nextSectionId,
}: HeroScrollIndicatorProps) {
  return (
    <section className="relative grid min-h-screen place-items-center bg-surface-base px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold leading-tight text-foreground lg:text-7xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {body}
        </p>
      </div>
      <a
        href={`#${nextSectionId}`}
        aria-label={scrollHint}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        {scrollHint}
        <span
          aria-hidden
          className="grid h-10 w-6 place-items-start rounded-full border-2 border-current p-1"
        >
          <span className="block h-2 w-1 animate-bounce-soft rounded-full bg-current" />
        </span>
      </a>
    </section>
  )
}
