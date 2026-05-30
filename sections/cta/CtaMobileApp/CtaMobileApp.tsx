export type CtaMobileAppProps = {
  heading: string
  body?: string
  appStoreHref?: string
  playStoreHref?: string
  qrCodeUrl?: string
}
export function CtaMobileApp({ heading, body, appStoreHref, playStoreHref, qrCodeUrl }: CtaMobileAppProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-8 rounded-2xl bg-foreground p-8 text-surface-base">
        <div className="flex-1">
          <h2 className="mb-3 text-3xl font-bold">{heading}</h2>
          {body ? <p className="mb-6 text-sm opacity-80">{body}</p> : null}
          <div className="flex flex-wrap gap-2">
            {appStoreHref ? <a href={appStoreHref} className="rounded-lg bg-surface-base px-5 py-2.5 text-xs font-bold text-foreground">⬇ App Store</a> : null}
            {playStoreHref ? <a href={playStoreHref} className="rounded-lg bg-surface-base px-5 py-2.5 text-xs font-bold text-foreground">⬇ Google Play</a> : null}
          </div>
        </div>
        {qrCodeUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={qrCodeUrl} alt="QR code" className="h-32 w-32 rounded-lg bg-surface-base p-2" />
        ) : null}
      </div>
    </section>
  )
}
