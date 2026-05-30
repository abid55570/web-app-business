export type Scene3dPolygonFieldProps = {
  fillColor?: string
  strokeColor?: string
}

/**
 * Animated polygon mesh — SVG triangulated field that subtly shifts.
 * Pure CSS + SVG.
 */
export function Scene3dPolygonField({
  fillColor = 'rgba(99,102,241,0.15)',
  strokeColor = 'rgba(99,102,241,0.4)',
}: Scene3dPolygonFieldProps) {
  return (
    <section
      className="relative h-[360px] overflow-hidden"
      style={{ perspective: 1200 }}
    >
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(50deg)',
          animation: 'scene3dpoly-pan 18s ease-in-out infinite alternate',
        }}
      >
        <defs>
          <pattern id="polytri" x="0" y="0" width="80" height="70" patternUnits="userSpaceOnUse">
            <polygon points="0,0 80,0 40,35" fill={fillColor} stroke={strokeColor} strokeWidth="1"/>
            <polygon points="0,70 80,70 40,35" fill="none" stroke={strokeColor} strokeWidth="1"/>
            <polygon points="0,0 0,70 40,35" fill={fillColor} stroke={strokeColor} strokeWidth="1"/>
            <polygon points="80,0 80,70 40,35" fill="none" stroke={strokeColor} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#polytri)"/>
      </svg>
      <style>{`@keyframes scene3dpoly-pan {
        from { transform: rotateX(50deg) translateY(0); }
        to   { transform: rotateX(50deg) translateY(-30px); }
      }`}</style>
    </section>
  )
}
