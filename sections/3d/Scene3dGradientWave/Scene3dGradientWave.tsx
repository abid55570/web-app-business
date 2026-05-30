export type Scene3dGradientWaveProps = {
  fromColor?: string
  toColor?: string
}

/**
 * Animated gradient mesh wave. Pure CSS keyframes shift conic + radial
 * gradients to create a slow morphing wave.
 */
export function Scene3dGradientWave({
  fromColor = '#6366f1',
  toColor = '#ec4899',
}: Scene3dGradientWaveProps) {
  return (
    <section
      className="relative h-[420px] overflow-hidden"
      style={{ perspective: 800 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: 'rotateX(45deg) translateY(-10%)',
          transformOrigin: 'center bottom',
          background: `
            radial-gradient(circle at 20% 20%, ${fromColor} 0%, transparent 40%),
            radial-gradient(circle at 80% 60%, ${toColor} 0%, transparent 45%),
            radial-gradient(circle at 50% 90%, ${fromColor} 0%, transparent 50%)
          `,
          filter: 'blur(40px)',
          animation: 'scene3dwave-morph 12s ease-in-out infinite alternate',
        }}
      />
      <style>{`@keyframes scene3dwave-morph {
        0%   { transform: rotateX(45deg) translateY(-10%) translateX(0); }
        50%  { transform: rotateX(50deg) translateY(-5%)  translateX(8%); }
        100% { transform: rotateX(40deg) translateY(-15%) translateX(-6%); }
      }`}</style>
    </section>
  )
}
