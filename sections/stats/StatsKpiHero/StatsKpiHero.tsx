export type StatsKpiHeroProps = {
  eyebrow?: string
  primary: { value: string; label: string }
  secondary: { value: string; label: string }[]
}

export function StatsKpiHero({
  eyebrow,
  primary,
  secondary,
}: StatsKpiHeroProps) {
  return (
    <section className="px-6 py-20 text-center">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <p className="mb-2 text-7xl font-black text-foreground sm:text-9xl">
        {primary.value}
      </p>
      <p className="mb-12 text-base font-semibold text-foreground">
        {primary.label}
      </p>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-3">
        {secondary.map((s, i) => (
          <div key={i}>
            <p className="text-3xl font-black text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
