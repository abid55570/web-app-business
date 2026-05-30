export type Scene3dHologramHudProps = {
  primaryLabel: string
  metricsLabel: string
  metrics: { label: string; value: string }[]
  glowColor?: string
}

/**
 * Hologram-style HUD panel — tilted card with corner brackets + scanline.
 * Sci-fi vibe. Pure CSS.
 */
export function Scene3dHologramHud({
  primaryLabel,
  metricsLabel,
  metrics,
  glowColor = '#22d3ee',
}: Scene3dHologramHudProps) {
  return (
    <section className="grid place-items-center bg-[#020617] px-6 py-16">
      <div style={{ perspective: 1000, width: 360, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(10deg) rotateY(-15deg)',
            color: glowColor,
            fontFamily: 'monospace',
            border: `1px solid ${glowColor}55`,
            background: `linear-gradient(180deg, ${glowColor}11, transparent)`,
            boxShadow: `0 0 30px ${glowColor}55, inset 0 0 30px ${glowColor}22`,
          }}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <span style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 14, borderLeft: `2px solid ${glowColor}`, borderTop: `2px solid ${glowColor}` }} />
            <span style={{ position: 'absolute', right: 0, top: 0, width: 14, height: 14, borderRight: `2px solid ${glowColor}`, borderTop: `2px solid ${glowColor}` }} />
            <span style={{ position: 'absolute', left: 0, bottom: 0, width: 14, height: 14, borderLeft: `2px solid ${glowColor}`, borderBottom: `2px solid ${glowColor}` }} />
            <span style={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRight: `2px solid ${glowColor}`, borderBottom: `2px solid ${glowColor}` }} />
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.2em', marginBottom: 4 }}>
              {primaryLabel.toUpperCase()}
            </p>
            <p style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>
              {metricsLabel}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 11 }}>
              {metrics.map((m, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: `1px solid ${glowColor}33` }}>
                  <span style={{ opacity: 0.7 }}>{m.label}</span>
                  <span style={{ fontWeight: 700 }}>{m.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
