export type Scene3dPyramidProps = {
  size?: number
  faceColor?: string
  spinSeconds?: number
}

/**
 * Rotating 4-faced CSS pyramid. Pure CSS.
 */
export function Scene3dPyramid({
  size = 180,
  faceColor = '#6366f1',
  spinSeconds = 18,
}: Scene3dPyramidProps) {
  const apex = size
  const half = size / 2
  const faces = [
    { name: 'front', rotateY: 0 },
    { name: 'right', rotateY: 90 },
    { name: 'back', rotateY: 180 },
    { name: 'left', rotateY: -90 },
  ]
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1200, width: size, height: size }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `scene3dpyr-spin ${spinSeconds}s linear infinite`,
          }}
        >
          {faces.map((f) => (
            <div
              key={f.name}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: 0,
                height: 0,
                borderLeft: `${half}px solid transparent`,
                borderRight: `${half}px solid transparent`,
                borderBottom: `${apex}px solid ${faceColor}`,
                opacity: 0.85,
                marginLeft: -half,
                transformOrigin: `50% ${apex}px`,
                transform: `rotateY(${f.rotateY}deg) rotateX(-30deg)`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes scene3dpyr-spin {
        from { transform: rotateY(0); }
        to   { transform: rotateY(360deg); }
      }`}</style>
    </section>
  )
}
