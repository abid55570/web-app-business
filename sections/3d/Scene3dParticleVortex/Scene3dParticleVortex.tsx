export type Scene3dParticleVortexProps = {
  particleColor?: string
  bgColor?: string
}

/**
 * Spiraling particle vortex — 60 dots arranged on a logarithmic spiral
 * rotating in 3D. Pure CSS.
 */
export function Scene3dParticleVortex({
  particleColor = '#a855f7',
  bgColor = '#020617',
}: Scene3dParticleVortexProps) {
  const particles = Array.from({ length: 60 }).map((_, i) => {
    const t = i / 60
    const angle = t * 720
    const radius = 30 + t * 100
    const z = -120 + t * 240
    return { i, angle, radius, z, opacity: 0.4 + t * 0.6 }
  })
  return (
    <section
      className="relative h-[400px] overflow-hidden"
      style={{ background: bgColor, perspective: 800 }}
    >
      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'scene3dvortex-spin 12s linear infinite',
        }}
      >
        <div style={{ position: 'relative', width: 0, height: 0, transformStyle: 'preserve-3d' }}>
          {particles.map((p) => (
            <span
              key={p.i}
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                marginLeft: -3,
                marginTop: -3,
                borderRadius: '50%',
                background: particleColor,
                boxShadow: `0 0 8px ${particleColor}`,
                opacity: p.opacity,
                transform: `rotateZ(${p.angle}deg) translateX(${p.radius}px) translateZ(${p.z}px)`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes scene3dvortex-spin {
        from { transform: rotateY(0); }
        to   { transform: rotateY(360deg); }
      }`}</style>
    </section>
  )
}
