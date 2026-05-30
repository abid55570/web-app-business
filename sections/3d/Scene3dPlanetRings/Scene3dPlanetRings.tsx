export type Scene3dPlanetRingsProps = {
  planetColor?: string
  ringColor?: string
  bgColor?: string
}

/**
 * Planet with tilted Saturn-style ring system. Pure CSS 3D.
 */
export function Scene3dPlanetRings({
  planetColor = '#f97316',
  ringColor = '#fbbf24',
  bgColor = '#020617',
}: Scene3dPlanetRingsProps) {
  return (
    <section
      className="grid place-items-center px-6 py-16"
      style={{ background: bgColor }}
    >
      <div style={{ perspective: 1000, width: 320, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(75deg)',
            animation: 'scene3dplanet-spin 20s linear infinite',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${planetColor}, ${planetColor}99 60%, ${planetColor}55)`,
              boxShadow: `inset -10px -10px 30px rgba(0,0,0,.5), 0 0 40px ${planetColor}66`,
              transform: 'rotateX(-75deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 280,
              height: 280,
              marginLeft: -140,
              marginTop: -140,
              borderRadius: '50%',
              border: `6px solid ${ringColor}88`,
              boxShadow: `0 0 12px ${ringColor}66`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 240,
              height: 240,
              marginLeft: -120,
              marginTop: -120,
              borderRadius: '50%',
              border: `3px solid ${ringColor}55`,
            }}
          />
        </div>
      </div>
      <style>{`@keyframes scene3dplanet-spin {
        from { transform: rotateX(75deg) rotateZ(0); }
        to   { transform: rotateX(75deg) rotateZ(360deg); }
      }`}</style>
    </section>
  )
}
