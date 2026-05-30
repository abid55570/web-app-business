export type PricingFAQItem = {
  question: string
  answer: string
}

export type PricingFAQProps = {
  heading?: string
  items: PricingFAQItem[]
}

export function PricingFAQ({
  heading = 'Common questions about billing',
  items,
}: PricingFAQProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-20">
      <h2 className="mb-10 text-center text-2xl font-bold text-foreground lg:text-3xl">
        {heading}
      </h2>
      <dl className="mx-auto max-w-3xl divide-y divide-border">
        {items.map((it, i) => (
          <div key={i} className="py-5">
            <dt className="mb-2 text-base font-semibold text-foreground">
              {it.question}
            </dt>
            <dd className="text-sm text-muted-foreground">{it.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
