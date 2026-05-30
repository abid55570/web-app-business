export type Scene3dHourglassProps = {
  glassColor?: string
  sandColor?: string
  flipSeconds?: number
}

/**
 * CSS hourglass — two stacked triangles + middle gap + slow flip animation.
 */
export function Scene3dHourglass({
  glassColor = 'rgba(99,102,241,0.2)',
  sandColor = '#facc15',
  flipSeconds = 12,
}: Scene3dHourglassProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 800, width: 160, height: 240 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            animation: `scene3dhg-flip ${flipSeconds}s ease-in-out infinite`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              borderLeft: '80px solid transparent',
              borderRight: '80px solid transparent',
              borderTop: `110px solid ${glassColor}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 0,
              height: 0,
              borderLeft: '80px solid transparent',
              borderRight: '80px solid transparent',
              borderBottom: `110px solid ${glassColor}`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              borderRadius: '50%',
              background: sandColor,
              boxShadow: `0 0 10px ${sandColor}`,
              animation: `scene3dhg-drop ${
                flipSeconds / 2
              }s ease-in infinite`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes scene3dhg-flip {
          0%,45%   { transform: rotate(0); }
          50%,95%  { transform: rotate(180deg); }
          100%     { transform: rotate(360deg); }
        }
        @keyframes scene3dhg-drop {
          0%   { transform: translate(-50%,-50%) translateY(-40px); opacity: 1; }
          100% { transform: translate(-50%,-50%) translateY(40px); opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}
