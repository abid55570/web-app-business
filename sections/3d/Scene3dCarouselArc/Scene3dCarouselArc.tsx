export type Scene3dCarouselArcCard = {
  title: string
  body?: string
}

export type Scene3dCarouselArcProps = {
  cards: Scene3dCarouselArcCard[]
}

/**
 * Cards arranged on a 3D arc curving toward the viewer. Pure CSS.
 */
export function Scene3dCarouselArc({ cards }: Scene3dCarouselArcProps) {
  const count = cards.length
  const radius = 360
  return (
    <section className="grid place-items-center overflow-hidden px-6 py-20">
      <div style={{ perspective: 1400, width: 320, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-8deg)',
          }}
        >
          {cards.map((c, i) => {
            const angle = (i - (count - 1) / 2) * 20
            return (
              <div
                key={i}
                className="absolute inset-0 rounded-2xl border border-border bg-surface-raised p-6 shadow-xl"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformOrigin: '50% 50%',
                  backfaceVisibility: 'hidden',
                }}
              >
                <h3 className="text-xl font-semibold text-foreground">
                  {c.title}
                </h3>
                {c.body ? (
                  <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
