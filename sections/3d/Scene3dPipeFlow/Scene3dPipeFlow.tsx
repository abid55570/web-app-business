export type Scene3dPipeFlowProps = {
  pipeColor?: string
  flowColor?: string
}

/**
 * Isometric pipe with flowing dashed-pulse fluid along its path. Pure CSS + SVG.
 */
export function Scene3dPipeFlow({
  pipeColor = '#71717a',
  flowColor = '#06b6d4',
}: Scene3dPipeFlowProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <svg
        viewBox="0 0 400 200"
        style={{ width: '100%', maxWidth: 500 }}
      >
        <path
          d="M30 100 L130 100 L170 60 L270 60 L310 100 L370 100"
          fill="none"
          stroke={pipeColor}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30 100 L130 100 L170 60 L270 60 L310 100 L370 100"
          fill="none"
          stroke={flowColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="12 24"
          style={{
            filter: `drop-shadow(0 0 8px ${flowColor})`,
            animation: 'scene3dpipe-flow 2s linear infinite',
          }}
        />
        <circle cx="30" cy="100" r="14" fill={pipeColor}/>
        <circle cx="370" cy="100" r="14" fill={pipeColor}/>
        <style>{`@keyframes scene3dpipe-flow {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -36; }
        }`}</style>
      </svg>
    </section>
  )
}
