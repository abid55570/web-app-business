export type Scene3dParallaxLayer = {
  imageUrl: string
  depth: number
}

export type Scene3dParallaxLayersProps = {
  layers: Scene3dParallaxLayer[]
  heading?: string
}

/**
 * Layered images displaced on Z-axis for a depth parallax illusion.
 * Pure CSS, depth-sorted automatically.
 */
export function Scene3dParallaxLayers({
  layers,
  heading,
}: Scene3dParallaxLayersProps) {
  return (
    <section
      className="relative overflow-hidden bg-surface-overlay"
      style={{ perspective: 600 }}
    >
      <div className="relative h-[420px]" style={{ transformStyle: 'preserve-3d' }}>
        {layers.map((l, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={i}
            src={l.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: `translateZ(${l.depth}px) scale(${
                1 - l.depth / 600
              })`,
              opacity: 1 - Math.abs(l.depth) / 800,
            }}
          />
        ))}
      </div>
      {heading ? (
        <h2 className="absolute inset-x-0 bottom-8 text-center text-3xl font-bold text-foreground drop-shadow">
          {heading}
        </h2>
      ) : null}
    </section>
  )
}
