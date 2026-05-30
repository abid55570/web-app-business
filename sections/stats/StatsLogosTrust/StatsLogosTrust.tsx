export type StatsLogosTrustProps = {
  primaryStat: { value: string; label: string }
  logos: { label: string }[]
}

export function StatsLogosTrust({
  primaryStat,
  logos,
}: StatsLogosTrustProps) {
  return (
    <section className="border-y border-border bg-surface-raised px-6 py-12">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="text-center lg:text-left">
          <p className="text-5xl font-black text-primary sm:text-6xl">
            {primaryStat.value}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {primaryStat.label}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {logos.map((l, i) => (
            <li
              key={i}
              className="text-center text-base font-bold text-muted-foreground opacity-70"
            >
              {l.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
