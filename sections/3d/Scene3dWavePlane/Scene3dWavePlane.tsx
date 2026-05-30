export type Scene3dWavePlaneProps = {
  rows?: number
  cols?: number
  waveColor?: string
}

/**
 * Plane of small bars displaced on Z by a sinusoidal function → wave surface.
 * Pure CSS, deterministic.
 */
export function Scene3dWavePlane({
  rows = 10,
  cols = 18,
  waveColor = '#06b6d4',
}: Scene3dWavePlaneProps) {
  const bars = Array.from({ length: rows * cols }).map((_, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const phase = (col / cols) * Math.PI * 2 + (row / rows) * Math.PI
    const height = 20 + Math.sin(phase) * 30
    return { row, col, height }
  })
  return (
    <section className="grid place-items-center px-6 py-16">
      <div
        style={{
          perspective: 1400,
          width: cols * 14,
          height: rows * 14 + 60,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(65deg) rotateZ(-20deg)',
          }}
        >
          {bars.map((b, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: b.col * 14,
                top: b.row * 14,
                width: 10,
                height: 10,
                background: waveColor,
                borderRadius: 2,
                transform: `translateZ(${b.height}px)`,
                opacity: 0.55 + b.height / 200,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
