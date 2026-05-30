export type Scene3dCountdownTimerProps = {
  days: number
  hours: number
  minutes: number
  seconds: number
  tileColor?: string
}

/**
 * Flip-clock-style countdown — each digit tile is a 3D card.
 * Static snapshot (not live-ticking).
 */
export function Scene3dCountdownTimer({
  days,
  hours,
  minutes,
  seconds,
  tileColor = '#18181b',
}: Scene3dCountdownTimerProps) {
  const groups = [
    { value: days, label: 'days' },
    { value: hours, label: 'hours' },
    { value: minutes, label: 'mins' },
    { value: seconds, label: 'secs' },
  ]
  return (
    <section className="grid place-items-center px-6 py-16">
      <div className="flex gap-4" style={{ perspective: 800 }}>
        {groups.map((g, i) => (
          <div key={i} className="text-center">
            <div
              style={{
                width: 80,
                height: 100,
                background: tileColor,
                color: '#fff',
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                fontSize: 44,
                fontWeight: 900,
                fontFamily: 'monospace',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,.3)',
                transform: 'rotateX(8deg)',
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  top: '50%',
                  background: 'rgba(255,255,255,.04)',
                }}
              />
              {String(g.value).padStart(2, '0')}
            </div>
            <p
              style={{
                marginTop: 8,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#71717a',
              }}
            >
              {g.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
