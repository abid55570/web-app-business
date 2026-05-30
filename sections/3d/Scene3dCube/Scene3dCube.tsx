export type Scene3dCubeProps = {
  size?: number
  faceColor?: string
  spinSeconds?: number
}

/**
 * Pure CSS 3D rotating cube. No JS, no three.js.
 * Useful as a brand mark, loading scene, or decorative hero element.
 */
export function Scene3dCube({
  size = 160,
  faceColor = 'var(--color-primary, #6366f1)',
  spinSeconds = 12,
}: Scene3dCubeProps) {
  const half = size / 2
  const faces: { name: string; transform: string }[] = [
    { name: 'front', transform: `translateZ(${half}px)` },
    { name: 'back', transform: `rotateY(180deg) translateZ(${half}px)` },
    { name: 'right', transform: `rotateY(90deg) translateZ(${half}px)` },
    { name: 'left', transform: `rotateY(-90deg) translateZ(${half}px)` },
    { name: 'top', transform: `rotateX(90deg) translateZ(${half}px)` },
    { name: 'bottom', transform: `rotateX(-90deg) translateZ(${half}px)` },
  ]
  return (
    <section className="grid place-items-center px-6 py-16">
      <div
        style={{
          width: size,
          height: size,
          perspective: size * 4,
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            position: 'relative',
            transformStyle: 'preserve-3d',
            animation: `scene3dcube-spin ${spinSeconds}s linear infinite`,
          }}
        >
          {faces.map((f) => (
            <div
              key={f.name}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                background: faceColor,
                opacity: 0.75,
                border: '1px solid rgba(255,255,255,.25)',
                transform: f.transform,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes scene3dcube-spin {
        from { transform: rotateX(0) rotateY(0); }
        to   { transform: rotateX(360deg) rotateY(360deg); }
      }`}</style>
    </section>
  )
}
