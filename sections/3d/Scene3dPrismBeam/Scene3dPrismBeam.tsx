export type Scene3dPrismBeamProps = {
  prismColor?: string
  beamColor?: string
}

/**
 * Triangular prism splitting a white beam into rainbow components.
 * Pure CSS — geometric refraction illustration.
 */
export function Scene3dPrismBeam({
  prismColor = 'rgba(255,255,255,0.15)',
  beamColor = '#fff',
}: Scene3dPrismBeamProps) {
  const rainbow = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7',
  ]
  return (
    <section
      className="relative h-[300px] overflow-hidden bg-black"
      style={{ perspective: 1000 }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '40%',
          height: 4,
          marginTop: -2,
          background: beamColor,
          boxShadow: `0 0 20px ${beamColor}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '38%',
          width: 0,
          height: 0,
          marginTop: -60,
          borderLeft: '60px solid transparent',
          borderRight: '60px solid transparent',
          borderBottom: `120px solid ${prismColor}`,
          filter: `drop-shadow(0 0 20px ${beamColor}44)`,
          transform: 'rotateY(20deg)',
        }}
      />
      {rainbow.map((color, i) => {
        const angle = (i - rainbow.length / 2) * 6
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50%',
              height: 3,
              marginTop: -1,
              background: color,
              boxShadow: `0 0 10px ${color}`,
              transformOrigin: 'left center',
              transform: `rotate(${angle}deg)`,
            }}
          />
        )
      })}
    </section>
  )
}
