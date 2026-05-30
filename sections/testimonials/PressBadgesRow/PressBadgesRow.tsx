export type PressBadgesRowBadge = {
  publication: string
  quote: string
}

export type PressBadgesRowProps = {
  heading?: string
  badges: PressBadgesRowBadge[]
}

export function PressBadgesRow({
  heading = 'As featured in',
  badges,
}: PressBadgesRowProps) {
  return (
    <section className="border-y border-border bg-surface-overlay px-6 py-10">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {heading}
      </p>
      <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b, i) => (
          <li key={i} className="text-center">
            <p className="text-lg font-black text-foreground opacity-70">
              {b.publication}
            </p>
            <p className="mt-1 text-xs italic text-muted-foreground">
              &ldquo;{b.quote}&rdquo;
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
