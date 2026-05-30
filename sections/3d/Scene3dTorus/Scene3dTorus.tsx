export type Scene3dTorusProps = {
  ringColor?: string
  spinSeconds?: number
}

/**
 * Approximated torus made of N small spheres along a ring rotating in 3D.
 */
export function Scene3dTorus({
  ringColor = '#06b6d4',
  spinSeconds = 12,
}: Scene3dTorusProps) {
  const count = 24
  const radius = 100
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 800, width: 260, height: 260 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(70deg)',
            animation: `scene3dtorus-spin ${spinSeconds}s linear infinite`,
          }}
        >
          {Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * 360
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 24,
                  height: 24,
                  marginLeft: -12,
                  marginTop: -12,
                  borderRadius: '50%',
                  background: ringColor,
                  boxShadow: `0 0 10px ${ringColor}`,
                  transform: `rotateZ(${angle}deg) translateX(${radius}px)`,
                }}
              />
            )
          })}
        </div>
      </div>
      <style>{`@keyframes scene3dtorus-spin {
        from { transform: rotateX(70deg) rotateZ(0); }
        to   { transform: rotateX(70deg) rotateZ(360deg); }
      }`}</style>
    </section>
  )
}
