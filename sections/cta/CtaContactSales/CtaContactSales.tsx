export type CtaContactSalesProps = {
  heading: string
  body?: string
  contactLabel?: string
  contactHref?: string
  phoneNumber?: string
}
export function CtaContactSales({ heading, body, contactLabel = 'Talk to sales', contactHref = '#', phoneNumber }: CtaContactSalesProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-surface-raised p-8">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{heading}</h2>
          {body ? <p className="text-sm text-muted-foreground">{body}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <a href={contactHref} className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{contactLabel}</a>
          {phoneNumber ? <a href={`tel:${phoneNumber}`} className="text-xs text-muted-foreground hover:text-foreground">or call {phoneNumber}</a> : null}
        </div>
      </div>
    </section>
  )
}
