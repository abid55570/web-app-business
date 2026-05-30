export type Scene3dRingOrbitProps = {
  ringColor?: string
  satellites?: number
  spinSeconds?: number
}

/**
 * Tilted ring with satellite dots orbiting around a central core.
 * Pure CSS animation.
 */
export function Scene3dRingOrbit({
  ringColor = '#6366f1',
  satellites = 6,
  spinSeconds = 14,
}: Scene3dRingOrbitProps) {
  const radius = 110
  return (
    <section className="grid place-items-center px-6 py-16">
      <div
        style={{
          perspective: 800,
          width: radius * 2 + 40,
          height: radius * 2 + 40,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: 'rotateX(70deg)',
            transformStyle: 'preserve-3d',
            animation: `scene3dring-spin ${spinSeconds}s linear infinite`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 20,
              border: `2px dashed ${ringColor}`,
              borderRadius: '50%',
              opacity: 0.5,
            }}
          />
          {Array.from({ length: satellites }).map((_, i) => {
            const angle = (i / satellites) * 360
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: ringColor,
                  marginLeft: -8,
                  marginTop: -8,
                  transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                }}
              />
            )
          })}
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: ringColor,
              marginLeft: -20,
              marginTop: -20,
              transform: 'rotateX(-70deg)',
              boxShadow: `0 0 40px ${ringColor}`,
            }}
          />
        </div>
      </div>
      <style>{`@keyframes scene3dring-spin {
        from { transform: rotateX(70deg) rotateZ(0deg); }
        to   { transform: rotateX(70deg) rotateZ(360deg); }
      }`}</style>
    </section>
  )
}
