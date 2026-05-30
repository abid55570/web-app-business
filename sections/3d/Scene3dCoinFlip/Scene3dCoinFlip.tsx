export type Scene3dCoinFlipProps = {
  obverseLabel: string
  reverseLabel: string
  coinColor?: string
  spinSeconds?: number
}

/**
 * Spinning coin with obverse + reverse faces. Pure CSS.
 */
export function Scene3dCoinFlip({
  obverseLabel,
  reverseLabel,
  coinColor = '#facc15',
  spinSeconds = 6,
}: Scene3dCoinFlipProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 800, width: 180, height: 180 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `scene3dcoin-spin ${spinSeconds}s linear infinite`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: coinColor,
              display: 'grid',
              placeItems: 'center',
              fontSize: 48,
              fontWeight: 900,
              color: 'rgba(0,0,0,.7)',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,.2)',
            }}
          >
            {obverseLabel}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: coinColor,
              display: 'grid',
              placeItems: 'center',
              fontSize: 48,
              fontWeight: 900,
              color: 'rgba(0,0,0,.7)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,.2)',
            }}
          >
            {reverseLabel}
          </div>
        </div>
      </div>
      <style>{`@keyframes scene3dcoin-spin {
        from { transform: rotateY(0); }
        to   { transform: rotateY(360deg); }
      }`}</style>
    </section>
  )
}
