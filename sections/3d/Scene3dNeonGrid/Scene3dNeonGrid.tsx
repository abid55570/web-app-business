export type Scene3dNeonGridProps = {
  lineColor?: string
  bgColor?: string
}

/**
 * Perspective neon grid floor receding to the horizon. Pure CSS.
 * Synthwave / retro-futurist vibe.
 */
export function Scene3dNeonGrid({
  lineColor = '#22d3ee',
  bgColor = '#0f172a',
}: Scene3dNeonGridProps) {
  return (
    <section
      className="relative h-[420px] overflow-hidden"
      style={{ background: bgColor, perspective: 600 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: 'rotateX(60deg) translateY(20%)',
          transformOrigin: 'center bottom',
          backgroundImage: `
            linear-gradient(${lineColor} 1px, transparent 1px),
            linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'scene3dneon-scroll 4s linear infinite',
          boxShadow: `inset 0 -60px 80px ${bgColor}`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-1/2 h-1 -translate-y-px"
        style={{
          background: lineColor,
          boxShadow: `0 0 20px ${lineColor}, 0 0 40px ${lineColor}`,
        }}
      />
      <style>{`@keyframes scene3dneon-scroll {
        from { background-position: 0 0; }
        to   { background-position: 0 40px; }
      }`}</style>
    </section>
  )
}
