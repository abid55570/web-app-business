export type Scene3dDotMeshProps = {
  rows?: number
  cols?: number
  dotColor?: string
}

/**
 * Grid of dots displaced on Z based on distance to center — creates a soft
 * "field" surface. Pure CSS.
 */
export function Scene3dDotMesh({
  rows = 9,
  cols = 13,
  dotColor = '#6366f1',
}: Scene3dDotMeshProps) {
  const cx = (cols - 1) / 2
  const cy = (rows - 1) / 2
  return (
    <section className="grid place-items-center px-6 py-16">
      <div
        style={{
          perspective: 1000,
          width: cols * 28,
          height: rows * 28 + 60,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(60deg) rotateZ(-15deg)',
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const row = Math.floor(i / cols)
            const col = i % cols
            const dx = col - cx
            const dy = row - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            const z = Math.max(0, 60 - dist * 10)
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: col * 28,
                  top: row * 28,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: dotColor,
                  opacity: 0.6 + z / 200,
                  transform: `translateZ(${z}px)`,
                }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
