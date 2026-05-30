export type MetricSparkOnlyProps = {
  values: number[]
  lineColor?: string
  fillColor?: string
}
export function MetricSparkOnly({ values, lineColor = '#6366f1', fillColor = 'rgba(99,102,241,0.15)' }: MetricSparkOnlyProps) {
  const w = 320
  const h = 80
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  const fillPath = `0,${h} ${pts} ${w},${h}`
  return (
    <section className="px-6 py-8">
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto h-20 w-full max-w-md" preserveAspectRatio="none">
        <polygon points={fillPath} fill={fillColor} />
        <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2" />
      </svg>
    </section>
  )
}
