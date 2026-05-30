export type Scene3dGyroscopeProps = {
  ringColor?: string
  spinSeconds?: number
}

/**
 * Three nested orthogonal rings rotating around different axes — a gyroscope.
 * Pure CSS.
 */
export function Scene3dGyroscope({
  ringColor = '#facc15',
  spinSeconds = 8,
}: Scene3dGyroscopeProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1000, width: 220, height: 220 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `3px solid ${ringColor}`,
              borderRadius: '50%',
              animation: `scene3dgyro-x ${spinSeconds}s linear infinite`,
              boxShadow: `0 0 12px ${ringColor}66`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 20,
              border: `3px solid ${ringColor}`,
              borderRadius: '50%',
              opacity: 0.7,
              animation: `scene3dgyro-y ${spinSeconds * 0.8}s linear infinite`,
              boxShadow: `0 0 12px ${ringColor}66`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 40,
              border: `3px solid ${ringColor}`,
              borderRadius: '50%',
              opacity: 0.5,
              animation: `scene3dgyro-z ${spinSeconds * 1.2}s linear infinite`,
              boxShadow: `0 0 12px ${ringColor}66`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              background: ringColor,
              borderRadius: '50%',
              boxShadow: `0 0 24px ${ringColor}`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes scene3dgyro-x { from { transform: rotateX(0); } to { transform: rotateX(360deg); } }
        @keyframes scene3dgyro-y { from { transform: rotateY(0); } to { transform: rotateY(360deg); } }
        @keyframes scene3dgyro-z { from { transform: rotateZ(0); } to { transform: rotateZ(360deg); } }
      `}</style>
    </section>
  )
}
