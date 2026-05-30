export type Scene3dHoverTiltProps = {
  imageUrl: string
  heading?: string
  body?: string
}

/**
 * Image card that tilts on hover via CSS transforms. Pure CSS, no JS.
 * Used for product mockups, screenshots, brand showcases.
 */
export function Scene3dHoverTilt({
  imageUrl,
  heading,
  body,
}: Scene3dHoverTiltProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div style={{ perspective: 1200, width: 420 }}>
        <div className="group">
          <div
            className="rounded-2xl border border-border bg-surface-raised p-3 shadow-2xl transition-transform duration-500 group-hover:[transform:rotateX(8deg)_rotateY(-12deg)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="rounded-xl"
              style={{ transform: 'translateZ(20px)' }}
            />
            {heading ? (
              <h3
                className="mt-4 px-2 text-lg font-semibold text-foreground"
                style={{ transform: 'translateZ(30px)' }}
              >
                {heading}
              </h3>
            ) : null}
            {body ? (
              <p
                className="px-2 pb-2 text-sm text-muted-foreground"
                style={{ transform: 'translateZ(30px)' }}
              >
                {body}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
