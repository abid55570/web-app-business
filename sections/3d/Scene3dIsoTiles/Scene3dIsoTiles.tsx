export type Scene3dIsoTilesProps = {
  rows?: number
  cols?: number
  baseColor?: string
  raisedColor?: string
}

/**
 * Isometric grid of tiles — some raised, some flat — rendered in pure CSS.
 */
export function Scene3dIsoTiles({
  rows = 5,
  cols = 7,
  baseColor = '#e5e7eb',
  raisedColor = '#6366f1',
}: Scene3dIsoTilesProps) {
  const tiles = Array.from({ length: rows * cols }).map((_, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const seed = (row * 7 + col * 13) % 100
    const raised = seed > 65
    return { row, col, raised, height: raised ? 16 + (seed % 24) : 0 }
  })
  return (
    <section className="grid place-items-center px-6 py-16">
      <div
        style={{
          perspective: 1200,
          width: cols * 56,
          height: rows * 56 + 80,
        }}
      >
        <div
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(60deg) rotateZ(-45deg)',
            width: '100%',
            height: '100%',
          }}
        >
          {tiles.map((t) => (
            <div
              key={`${t.row}-${t.col}`}
              style={{
                position: 'absolute',
                left: t.col * 56,
                top: t.row * 56,
                width: 50,
                height: 50,
                background: t.raised ? raisedColor : baseColor,
                transform: `translateZ(${t.height}px)`,
                border: '1px solid rgba(0,0,0,.08)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
