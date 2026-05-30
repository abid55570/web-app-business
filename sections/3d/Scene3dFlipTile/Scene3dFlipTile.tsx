export type Scene3dFlipTileProps = {
  frontHeading: string
  frontBody?: string
  backHeading: string
  backBody?: string
}

/**
 * Hover-flip 3D card tile. Pure CSS — useful for "before / after" or
 * stat / detail reveals.
 */
export function Scene3dFlipTile({
  frontHeading,
  frontBody,
  backHeading,
  backBody,
}: Scene3dFlipTileProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div className="group" style={{ perspective: 1000, width: 280, height: 200 }}>
        <div
          className="relative h-full w-full transition-transform duration-700 group-hover:[transform:rotateY(180deg)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 rounded-2xl border border-border bg-surface-raised p-6 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h3 className="text-xl font-bold text-foreground">{frontHeading}</h3>
            {frontBody ? (
              <p className="mt-2 text-sm text-muted-foreground">{frontBody}</p>
            ) : null}
          </div>
          <div
            className="absolute inset-0 rounded-2xl bg-primary p-6 text-center text-primary-foreground"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <h3 className="text-xl font-bold">{backHeading}</h3>
            {backBody ? <p className="mt-2 text-sm opacity-90">{backBody}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
