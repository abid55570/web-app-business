export type AwardBadge = {
  imageUrl: string
  label: string
  href?: string
  year?: string
}

export type AwardBadgesProps = {
  heading?: string
  badges: AwardBadge[]
}

export function AwardBadges({ heading, badges }: AwardBadgesProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto flex max-w-5xl flex-wrap items-end justify-center gap-x-10 gap-y-8">
        {badges.map((b, i) => {
          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.imageUrl}
                alt={b.label}
                className="mx-auto h-20 w-auto"
              />
              <p className="mt-2 text-xs font-semibold text-foreground">
                {b.label}
              </p>
              {b.year ? (
                <p className="text-[10px] text-muted-foreground">{b.year}</p>
              ) : null}
            </>
          )
          return (
            <li key={i} className="text-center">
              {b.href ? (
                <a href={b.href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
