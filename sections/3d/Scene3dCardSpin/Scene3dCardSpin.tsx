export type Scene3dCardSpinProps = {
  heading: string
  body?: string
  cardColor?: string
  spinSeconds?: number
}

/**
 * Single rotating card around its vertical axis with depth shadow. Pure CSS.
 */
export function Scene3dCardSpin({
  heading,
  body,
  cardColor = '#fff',
  spinSeconds = 10,
}: Scene3dCardSpinProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1400, width: 300, height: 200 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `scene3dcardspin-spin ${spinSeconds}s linear infinite`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: cardColor,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 30px 60px rgba(0,0,0,.3)',
              border: '1px solid rgba(0,0,0,.1)',
              backfaceVisibility: 'hidden',
            }}
          >
            <h3
              className="text-xl font-bold"
              style={{ color: '#0f172a' }}
            >
              {heading}
            </h3>
            {body ? (
              <p className="mt-2 text-sm" style={{ color: '#64748b' }}>
                {body}
              </p>
            ) : null}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${cardColor}, ${cardColor}cc)`,
              borderRadius: 16,
              boxShadow: '0 30px 60px rgba(0,0,0,.3)',
              border: '1px solid rgba(0,0,0,.1)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          />
        </div>
      </div>
      <style>{`@keyframes scene3dcardspin-spin {
        from { transform: rotateY(0); }
        to   { transform: rotateY(360deg); }
      }`}</style>
    </section>
  )
}
