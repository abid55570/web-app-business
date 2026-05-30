export type Scene3dCorridorProps = {
  ringCount?: number
  ringColor?: string
  bgColor?: string
}

/**
 * Receding rectangular rings creating a corridor / tunnel illusion.
 * Pure CSS with Z-displacement.
 */
export function Scene3dCorridor({
  ringCount = 8,
  ringColor = '#22d3ee',
  bgColor = '#0f172a',
}: Scene3dCorridorProps) {
  return (
    <section
      className="relative h-[420px] overflow-hidden"
      style={{ background: bgColor, perspective: 600 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'scene3dcorridor-zoom 4s linear infinite',
        }}
      >
        {Array.from({ length: ringCount }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: '15%',
              border: `2px solid ${ringColor}`,
              borderRadius: 12,
              boxShadow: `0 0 20px ${ringColor}`,
              transform: `translateZ(${-i * 80}px)`,
              opacity: 1 - i * 0.1,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes scene3dcorridor-zoom {
        from { transform: translateZ(0); }
        to   { transform: translateZ(80px); }
      }`}</style>
    </section>
  )
}
