export type CompanyWallCell = {
  logoUrl: string
  companyName: string
  quote: string
  authorName: string
  authorRole: string
}

export type CompanyWallProps = {
  heading?: string
  cells: CompanyWallCell[]
}

export function CompanyWall({ heading, cells }: CompanyWallProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-3 lg:grid-cols-4">
        {cells.map((c, i) => (
          <li
            key={i}
            className="group relative grid h-32 place-items-center bg-surface-raised"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.logoUrl}
              alt={c.companyName}
              className="h-8 w-auto opacity-70 transition-opacity group-hover:opacity-0"
            />
            <div className="absolute inset-0 flex flex-col justify-between bg-primary p-3 text-left text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xs leading-tight">&ldquo;{c.quote}&rdquo;</p>
              <p className="text-[10px] font-semibold opacity-90">
                {c.authorName} · {c.authorRole}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
