export type PromotionalModalProps = {
  id?: string
  triggerLabel?: string
  heading: string
  body: string
  promoCode?: string
  ctaLabel?: string
  ctaHref?: string
  dismissLabel?: string
  imageUrl?: string
}
export function PromotionalModal({ id = 'promo-modal', triggerLabel = 'See offer', heading, body, promoCode, ctaLabel = 'Claim now', ctaHref = '#', dismissLabel = 'Maybe later', imageUrl }: PromotionalModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a href={`#${id}`} className="inline-block rounded-full bg-gradient-to-r from-warning-fg to-error-fg px-5 py-2.5 text-sm font-semibold text-white">{triggerLabel}</a>
      </div>
      <div id={id} className="invisible fixed inset-0 z-50 grid place-items-center bg-black/70 opacity-0 transition target:visible target:opacity-100">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-surface-raised shadow-2xl">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imageUrl} alt="" className="h-40 w-full object-cover" />
          ) : null}
          <div className="p-6 text-center">
            <h3 className="mb-2 text-2xl font-bold text-foreground">{heading}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{body}</p>
            {promoCode ? (
              <p className="mb-4 rounded-lg border-2 border-dashed border-primary bg-primary/5 px-4 py-2 font-mono text-lg font-bold text-primary">{promoCode}</p>
            ) : null}
            <a href={ctaHref} className="mb-2 block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{ctaLabel}</a>
            <a href="#" className="block text-xs font-medium text-muted-foreground hover:text-foreground">{dismissLabel}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
