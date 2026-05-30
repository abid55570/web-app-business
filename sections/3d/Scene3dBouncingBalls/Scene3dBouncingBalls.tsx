export type Scene3dBouncingBallsProps = {
  count?: number
  ballColor?: string
}

/**
 * Row of balls bouncing in 3D with staggered phase. Pure CSS keyframes.
 */
export function Scene3dBouncingBalls({
  count = 6,
  ballColor = '#06b6d4',
}: Scene3dBouncingBallsProps) {
  return (
    <section
      className="grid place-items-center px-6 py-16"
      style={{ perspective: 600 }}
    >
      <div className="flex items-end gap-3" style={{ height: 160 }}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${ballColor}, ${ballColor}55)`,
              boxShadow: `0 0 20px ${ballColor}66`,
              animation: 'scene3dballs-bounce 1.4s ease-in-out infinite',
              animationDelay: `${i * -0.15}s`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes scene3dballs-bounce {
        0%,100% { transform: translateY(0) translateZ(0) scale(1); }
        50%     { transform: translateY(-100px) translateZ(50px) scale(1.05); }
      }`}</style>
    </section>
  )
}
