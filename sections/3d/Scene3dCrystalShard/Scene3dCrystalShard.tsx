export type Scene3dCrystalShardProps = {
  faceColor?: string
  spinSeconds?: number
}

/**
 * Hexagonal "crystal shard" rotating in 3D. Pure CSS, six trapezoidal faces.
 */
export function Scene3dCrystalShard({
  faceColor = '#a855f7',
  spinSeconds = 16,
}: Scene3dCrystalShardProps) {
  const faces = Array.from({ length: 6 }).map((_, i) => ({
    rotateY: i * 60,
  }))
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1200, width: 160, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `scene3dshard-spin ${spinSeconds}s linear infinite`,
          }}
        >
          {faces.map((f, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${faceColor}cc, ${faceColor}66)`,
                clipPath:
                  'polygon(50% 0, 100% 30%, 100% 70%, 50% 100%, 0 70%, 0 30%)',
                transform: `rotateY(${f.rotateY}deg) translateZ(60px)`,
                opacity: 0.85,
                border: '1px solid rgba(255,255,255,.2)',
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes scene3dshard-spin {
        from { transform: rotateY(0) rotateZ(-5deg); }
        to   { transform: rotateY(360deg) rotateZ(-5deg); }
      }`}</style>
    </section>
  )
}
