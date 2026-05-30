export type Scene3dInfinityLoopProps = {
  trackColor?: string
  spinSeconds?: number
}

/**
 * Two stacked rings forming an infinity-shape moving rotation. Pure CSS.
 */
export function Scene3dInfinityLoop({
  trackColor = '#a855f7',
  spinSeconds = 10,
}: Scene3dInfinityLoopProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 800, width: 280, height: 200 }}>
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
              left: 0,
              top: 30,
              width: 140,
              height: 140,
              border: `3px solid ${trackColor}`,
              borderRadius: '50%',
              transform: 'rotateY(70deg)',
              animation: `scene3dinf-l ${spinSeconds}s linear infinite`,
              boxShadow: `0 0 20px ${trackColor}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 30,
              width: 140,
              height: 140,
              border: `3px solid ${trackColor}`,
              borderRadius: '50%',
              transform: 'rotateY(-70deg)',
              animation: `scene3dinf-r ${spinSeconds}s linear infinite`,
              boxShadow: `0 0 20px ${trackColor}`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes scene3dinf-l { from { transform: rotateY(70deg); } to { transform: rotateY(430deg); } }
        @keyframes scene3dinf-r { from { transform: rotateY(-70deg); } to { transform: rotateY(-430deg); } }
      `}</style>
    </section>
  )
}
