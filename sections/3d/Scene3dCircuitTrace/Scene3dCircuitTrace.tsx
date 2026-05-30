export type Scene3dCircuitTraceProps = {
  traceColor?: string
  bgColor?: string
}

/**
 * SVG circuit board traces with animated dashed pulses traveling along.
 * Pure CSS + SVG.
 */
export function Scene3dCircuitTrace({
  traceColor = '#22d3ee',
  bgColor = '#020617',
}: Scene3dCircuitTraceProps) {
  return (
    <section
      className="grid place-items-center px-6 py-16"
      style={{ background: bgColor }}
    >
      <svg
        viewBox="0 0 400 240"
        style={{ width: '100%', maxWidth: 600 }}
        fill="none"
        stroke={traceColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 60h80l30 30h120l30 -30h80M20 180h120l40 -40h60l40 40h100" opacity="0.4"/>
        <path d="M20 60h80l30 30h120l30 -30h80" strokeDasharray="6 10" style={{ animation: 'circuit-dash 3s linear infinite' }}/>
        <path d="M20 180h120l40 -40h60l40 40h100" strokeDasharray="6 10" style={{ animation: 'circuit-dash 4s linear infinite reverse' }}/>
        {[
          [100, 60], [230, 90], [280, 60], [140, 180], [180, 140], [240, 140], [280, 180],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill={traceColor} style={{ filter: `drop-shadow(0 0 6px ${traceColor})` }}/>
        ))}
        <style>{`
          @keyframes circuit-dash {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -100; }
          }
        `}</style>
      </svg>
    </section>
  )
}
