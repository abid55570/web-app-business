export type Scene3dPaperPlaneProps = {
  planeColor?: string
  trailColor?: string
}

/**
 * Origami-style paper plane swooping along a curved 3D path with a trail.
 */
export function Scene3dPaperPlane({
  planeColor = '#fff',
  trailColor = '#6366f1',
}: Scene3dPaperPlaneProps) {
  return (
    <section
      className="relative h-[300px] overflow-hidden bg-gradient-to-br from-primary/30 to-accent/20"
      style={{ perspective: 800 }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 60,
          height: 60,
          marginTop: -30,
          marginLeft: -30,
          animation: 'scene3dplane-fly 10s ease-in-out infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 30,
            width: 80,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${trailColor})`,
            opacity: 0.6,
            filter: 'blur(2px)',
          }}
        />
        <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
          <path d="M5 30L55 5 L40 55 L30 38 L5 30Z" fill={planeColor} stroke={planeColor} strokeLinejoin="round"/>
          <path d="M30 38L55 5" stroke="rgba(0,0,0,.3)" strokeWidth="1" fill="none"/>
        </svg>
      </div>
      <style>{`@keyframes scene3dplane-fly {
        0%   { transform: translate(-200%, 0) rotate(20deg); }
        50%  { transform: translate(0%, -40px) rotate(-10deg); }
        100% { transform: translate(200%, 20px) rotate(20deg); }
      }`}</style>
    </section>
  )
}
