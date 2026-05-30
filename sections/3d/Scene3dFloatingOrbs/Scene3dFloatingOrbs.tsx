export type Scene3dFloatingOrbsProps = {
  orbCount?: number
  primaryColor?: string
  accentColor?: string
}

/**
 * Background scene of multi-color blurred orbs floating in 3D space.
 * Pure CSS — great as a hero backdrop.
 */
export function Scene3dFloatingOrbs({
  orbCount = 5,
  primaryColor = '#6366f1',
  accentColor = '#ec4899',
}: Scene3dFloatingOrbsProps) {
  const orbs = Array.from({ length: orbCount }).map((_, i) => {
    const seed = (i + 1) * 37
    const size = 120 + (seed % 200)
    const x = (seed * 13) % 80
    const y = (seed * 17) % 70
    const z = -200 + ((seed * 7) % 400)
    const color = i % 2 === 0 ? primaryColor : accentColor
    const delay = (seed % 8) + 's'
    return { size, x, y, z, color, delay, i }
  })
  return (
    <section
      className="relative h-[420px] overflow-hidden bg-surface-overlay"
      style={{ perspective: 1200 }}
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {orbs.map((o) => (
          <span
            key={o.i}
            style={{
              position: 'absolute',
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.size,
              height: o.size,
              borderRadius: '50%',
              background: o.color,
              filter: 'blur(40px)',
              opacity: 0.55,
              transform: `translateZ(${o.z}px)`,
              animation: `scene3dorbs-float 8s ease-in-out ${o.delay} infinite alternate`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes scene3dorbs-float {
        from { transform: translateZ(var(--z, 0)) translateY(0); }
        to   { transform: translateZ(var(--z, 0)) translateY(-40px); }
      }`}</style>
    </section>
  )
}
