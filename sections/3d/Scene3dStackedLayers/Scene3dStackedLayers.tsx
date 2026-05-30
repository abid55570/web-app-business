export type Scene3dStackedLayersLayer = {
  label: string
  color: string
}

export type Scene3dStackedLayersProps = {
  layers: Scene3dStackedLayersLayer[]
}

/**
 * Layered rectangles stacked on the Z-axis with a slight Y-tilt. Pure CSS.
 * Great for "architecture stack" or "what's under the hood" diagrams.
 */
export function Scene3dStackedLayers({ layers }: Scene3dStackedLayersProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1200, width: 360, height: 280 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(55deg) rotateZ(-30deg)',
          }}
        >
          {layers.map((l, i) => (
            <div
              key={i}
              className="absolute inset-x-6 inset-y-12 rounded-xl text-sm font-semibold text-white shadow-2xl"
              style={{
                background: l.color,
                transform: `translateZ(${i * 36}px)`,
                opacity: 0.92,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
