export type Scene3dEnergyOrbProps = {
  orbColor?: string
  bgColor?: string
}

/**
 * Pulsing energy orb with rotating gradient halo and inner glow. Pure CSS.
 */
export function Scene3dEnergyOrb({
  orbColor = '#a855f7',
  bgColor = '#0f172a',
}: Scene3dEnergyOrbProps) {
  return (
    <section
      className="grid place-items-center px-6 py-16"
      style={{ background: bgColor }}
    >
      <div
        style={{ perspective: 800, width: 280, height: 280, position: 'relative' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 60,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${orbColor}, ${orbColor}55 60%, transparent)`,
            boxShadow: `0 0 80px ${orbColor}99, inset 0 0 40px ${orbColor}cc`,
            animation: 'scene3dorb-pulse 2.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            border: `2px dashed ${orbColor}88`,
            opacity: 0.6,
            animation: 'scene3dorb-rotate 8s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px dashed ${orbColor}66`,
            opacity: 0.4,
            animation: 'scene3dorb-rotate 12s linear infinite reverse',
          }}
        />
      </div>
      <style>{`
        @keyframes scene3dorb-pulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.08); }
        }
        @keyframes scene3dorb-rotate {
          from { transform: rotate(0); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
