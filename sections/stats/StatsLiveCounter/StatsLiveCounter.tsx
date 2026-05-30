export type StatsLiveCounterProps = {
  label: string
  value: number
  unit?: string
  pulseColor?: string
}
export function StatsLiveCounter({ label, value, unit = '', pulseColor = '#22c55e' }: StatsLiveCounterProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span aria-hidden className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: pulseColor }} />
            <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: pulseColor }} />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LIVE</p>
        </div>
        <p className="text-6xl font-black text-foreground sm:text-8xl tabular-nums">
          {value.toLocaleString()}<span className="text-2xl font-normal text-muted-foreground">{unit}</span>
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">{label}</p>
      </div>
    </section>
  )
}
