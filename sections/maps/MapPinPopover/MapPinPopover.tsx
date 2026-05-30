export type MapPinPopoverPin = {
  id: string
  x: number
  y: number
  label: string
  body?: string
}

export type MapPinPopoverProps = {
  imageUrl: string
  pins: MapPinPopoverPin[]
}

export function MapPinPopover({ imageUrl, pins }: MapPinPopoverProps) {
  return (
    <section className="px-6 py-12">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="w-full" />
        {pins.map((p) => (
          <div
            key={p.id}
            className="group absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span className="absolute -translate-x-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 rounded-full bg-primary ring-4 ring-primary/30" />
            </span>
            <div className="invisible absolute left-3 top-3 z-10 w-48 rounded-lg border border-border bg-surface-raised p-3 text-xs shadow-xl group-hover:visible">
              <p className="font-semibold text-foreground">{p.label}</p>
              {p.body ? (
                <p className="mt-1 text-muted-foreground">{p.body}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
