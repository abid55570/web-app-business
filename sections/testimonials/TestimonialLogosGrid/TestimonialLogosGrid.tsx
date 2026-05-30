export type TestimonialLogosCell = {
  logoUrl: string
  quote: string
  authorName: string
  authorRole: string
}

export type TestimonialLogosGridProps = {
  heading?: string
  cells: TestimonialLogosCell[]
}

export function TestimonialLogosGrid({
  heading,
  cells,
}: TestimonialLogosGridProps) {
  return (
    <section className="px-6 py-20">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-raised sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {cells.map((c, i) => (
          <li key={i} className="flex flex-col p-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.logoUrl}
              alt=""
              className="mb-4 h-7 w-auto self-start opacity-70"
            />
            <p className="flex-1 text-sm leading-relaxed text-foreground">
              &ldquo;{c.quote}&rdquo;
            </p>
            <p className="mt-4 text-xs">
              <span className="font-semibold text-foreground">
                {c.authorName}
              </span>
              <span className="text-muted-foreground"> · {c.authorRole}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
