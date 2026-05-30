export type Scene3dGalaxyDotsProps = {
  count?: number
  starColor?: string
  bgColor?: string
}

/**
 * Field of stars at random depths floating in 3D — slow drift to simulate
 * a galaxy pan. Pure CSS.
 */
export function Scene3dGalaxyDots({
  count = 80,
  starColor = '#fff',
  bgColor = '#020617',
}: Scene3dGalaxyDotsProps) {
  const stars = Array.from({ length: count }).map((_, i) => {
    const seed = (i + 1) * 53
    return {
      x: (seed * 7) % 100,
      y: (seed * 11) % 100,
      z: -400 + ((seed * 13) % 800),
      size: 1 + (seed % 4),
      delay: (seed % 8) * -1 + 's',
      i,
    }
  })
  return (
    <section
      className="relative h-[420px] overflow-hidden"
      style={{ background: bgColor, perspective: 1200 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'scene3dgalaxy-pan 30s linear infinite',
        }}
      >
        {stars.map((s) => (
          <span
            key={s.i}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: starColor,
              transform: `translateZ(${s.z}px)`,
              opacity: 0.6 + Math.abs(s.z) / 2000,
              boxShadow: `0 0 ${s.size * 2}px ${starColor}`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes scene3dgalaxy-pan {
        from { transform: rotateY(0); }
        to   { transform: rotateY(360deg); }
      }`}</style>
    </section>
  )
}
