export type Scene3dRibbonLoopProps = {
  ribbonColor?: string
  bgColor?: string
}

/**
 * Twisting CSS gradient ribbon — uses conic-gradient + transform rotation.
 */
export function Scene3dRibbonLoop({
  ribbonColor = '#ec4899',
  bgColor = 'transparent',
}: Scene3dRibbonLoopProps) {
  return (
    <section
      className="relative h-[360px] overflow-hidden"
      style={{ background: bgColor, perspective: 800 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'scene3dribbon-spin 12s linear infinite',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 220,
              height: 60,
              marginLeft: -110,
              marginTop: -30,
              background: ribbonColor,
              opacity: 0.55,
              transform: `rotateY(${i * 30}deg) translateZ(140px)`,
              borderRadius: 8,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes scene3dribbon-spin {
        from { transform: rotateX(-15deg) rotateY(0deg); }
        to   { transform: rotateX(-15deg) rotateY(360deg); }
      }`}</style>
    </section>
  )
}
