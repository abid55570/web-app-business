export type Scene3dCardStackCard = {
  title: string
  subtitle?: string
}

export type Scene3dCardStackProps = {
  cards: Scene3dCardStackCard[]
}

/**
 * Perspective-tilted stack of 3-4 cards fanned in 3D space. CSS-only.
 */
export function Scene3dCardStack({ cards }: Scene3dCardStackProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1200, width: 320, height: 220 }}>
        <div
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(15deg) rotateY(-15deg)',
          }}
        >
          {cards.map((c, i) => (
            <div
              key={i}
              className="absolute rounded-2xl border border-border bg-surface-raised shadow-2xl"
              style={{
                width: 320,
                height: 200,
                transform: `translateY(${i * 18}px) translateZ(${
                  -i * 40
                }px) translateX(${i * 14}px)`,
                opacity: 1 - i * 0.18,
              }}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {c.title}
                </h3>
                {c.subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
