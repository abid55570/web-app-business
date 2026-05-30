export type Scene3dCubeRowProps = {
  count?: number
  cubeColor?: string
  spinSeconds?: number
}

/**
 * Row of small spinning cubes — each cube delayed for a wave effect.
 */
export function Scene3dCubeRow({
  count = 7,
  cubeColor = '#6366f1',
  spinSeconds = 4,
}: Scene3dCubeRowProps) {
  const size = 50
  const half = size / 2
  return (
    <section className="grid place-items-center px-6 py-16">
      <div className="flex gap-4" style={{ perspective: 800 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              transformStyle: 'preserve-3d',
              animation: `scene3dcuberow-spin ${spinSeconds}s linear infinite`,
              animationDelay: `${i * -0.4}s`,
            }}
          >
            {[
              { t: `translateZ(${half}px)` },
              { t: `rotateY(180deg) translateZ(${half}px)` },
              { t: `rotateY(90deg) translateZ(${half}px)` },
              { t: `rotateY(-90deg) translateZ(${half}px)` },
              { t: `rotateX(90deg) translateZ(${half}px)` },
              { t: `rotateX(-90deg) translateZ(${half}px)` },
            ].map((f, j) => (
              <div
                key={j}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  background: cubeColor,
                  opacity: 0.7,
                  border: '1px solid rgba(255,255,255,.2)',
                  transform: f.t,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes scene3dcuberow-spin {
        from { transform: rotateX(0) rotateY(0); }
        to   { transform: rotateX(360deg) rotateY(360deg); }
      }`}</style>
    </section>
  )
}
