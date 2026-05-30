export type Scene3dHelixProps = {
  beadCount?: number
  beadColor?: string
  spinSeconds?: number
}

/**
 * DNA-like double helix of dots winding in 3D space. Pure CSS, no JS.
 */
export function Scene3dHelix({
  beadCount = 24,
  beadColor = '#a855f7',
  spinSeconds = 14,
}: Scene3dHelixProps) {
  const beads = Array.from({ length: beadCount }).map((_, i) => {
    const t = i / beadCount
    const y = (t - 0.5) * 280
    return { i, y, angle: t * 720 }
  })
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1200, width: 180, height: 320 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `scene3dhelix-spin ${spinSeconds}s linear infinite`,
          }}
        >
          {beads.map((b) => (
            <span
              key={`a${b.i}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 16,
                height: 16,
                marginLeft: -8,
                marginTop: -8,
                borderRadius: '50%',
                background: beadColor,
                transform: `translateY(${b.y}px) rotateY(${b.angle}deg) translateZ(60px)`,
              }}
            />
          ))}
          {beads.map((b) => (
            <span
              key={`b${b.i}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 16,
                height: 16,
                marginLeft: -8,
                marginTop: -8,
                borderRadius: '50%',
                background: beadColor,
                opacity: 0.6,
                transform: `translateY(${b.y}px) rotateY(${b.angle + 180}deg) translateZ(60px)`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes scene3dhelix-spin {
        from { transform: rotateY(0); }
        to   { transform: rotateY(360deg); }
      }`}</style>
    </section>
  )
}
