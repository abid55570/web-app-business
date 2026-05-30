export type Scene3dStaircaseProps = {
  stepCount?: number
  stepColor?: string
}

/**
 * Isometric staircase climbing diagonally — pure CSS with cumulative
 * translateZ + translateY per step.
 */
export function Scene3dStaircase({
  stepCount = 8,
  stepColor = '#6366f1',
}: Scene3dStaircaseProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1000, width: 280, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(60deg) rotateZ(-30deg)',
          }}
        >
          {Array.from({ length: stepCount }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * 24,
                top: i * 16,
                width: 80,
                height: 60,
                background: stepColor,
                opacity: 0.85,
                border: '1px solid rgba(255,255,255,.2)',
                transform: `translateZ(${i * 18}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
