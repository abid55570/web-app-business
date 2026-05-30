export type FaqContactFallbackProps = {
  heading?: string
  body?: string
  email?: string
  chatLabel?: string
  chatHref?: string
}

export function FaqContactFallback({
  heading = "Didn't find what you were looking for?",
  body = 'Our team is one click away.',
  email = 'support@example.com',
  chatLabel = 'Open live chat',
  chatHref = '#',
}: FaqContactFallbackProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface-raised p-8 text-center">
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          {heading}
        </h3>
        <p className="mb-5 text-sm text-muted-foreground">{body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${email}`}
            className="rounded-lg border border-border bg-surface-base px-5 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay"
          >
            ✉ {email}
          </a>
          <a
            href={chatHref}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            💬 {chatLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
