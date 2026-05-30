export type Scene3dRotatingDisksProps = {
  diskCount?: number
  diskColor?: string
  spinSeconds?: number
}

/**
 * Stack of translucent disks rotating around the vertical axis at different
 * speeds. Pure CSS.
 */
export function Scene3dRotatingDisks({
  diskCount = 5,
  diskColor = '#22d3ee',
  spinSeconds = 8,
}: Scene3dRotatingDisksProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 800, width: 240, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(60deg)',
          }}
        >
          {Array.from({ length: diskCount }).map((_, i) => {
            const size = 200 - i * 30
            const offset = (240 - size) / 2
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: offset,
                  top: offset,
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  border: `2px solid ${diskColor}`,
                  background: `${diskColor}11`,
                  animation: `scene3ddisks-spin ${
                    spinSeconds + i * 1.5
                  }s linear infinite`,
                  animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                  boxShadow: `0 0 10px ${diskColor}55`,
                  transform: `translateZ(${i * 12}px)`,
                }}
              />
            )
          })}
        </div>
      </div>
      <style>{`@keyframes scene3ddisks-spin {
        from { transform: rotateZ(0); }
        to   { transform: rotateZ(360deg); }
      }`}</style>
    </section>
  )
}
