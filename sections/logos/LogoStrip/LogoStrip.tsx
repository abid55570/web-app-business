/**
 * LogoStrip — caption + logo row. Optional monochrome filter so logos
 * read as social proof without visual noise.
 */
export type Logo = { name: string; src: string; href?: string }

export type LogoStripProps = {
  caption?: string
  logos: Logo[]
  monochrome?: boolean
}

export function LogoStrip({
  caption = 'Trusted by teams at',
  logos,
  monochrome = true,
}: LogoStripProps) {
  const filterClass = monochrome
    ? 'opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0'
    : 'opacity-90 hover:opacity-100'
  return (
    <section className="border-y border-border bg-card px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-6xl text-center">
        {caption ? (
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {caption}
          </p>
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {logos.map((l) => {
            const inner = (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={l.src}
                alt={l.name}
                className={`h-8 w-auto ${filterClass}`}
              />
            )
            return (
              <li key={l.name}>
                {l.href ? <a href={l.href}>{inner}</a> : inner}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
