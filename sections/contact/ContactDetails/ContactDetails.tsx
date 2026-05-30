export type ContactDetailsProps = {
  heading?: string
  address?: string
  phone?: string
  email?: string
  hours?: string
  mapUrl?: string
}

export function ContactDetails({
  heading = 'Get in touch',
  address,
  phone,
  email,
  hours,
  mapUrl,
}: ContactDetailsProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface-raised p-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground lg:text-3xl">
          {heading}
        </h2>
        <dl className="grid gap-4 text-sm">
          {address ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Address
              </dt>
              <dd className="mt-1 whitespace-pre-line text-foreground">
                {address}
              </dd>
            </div>
          ) : null}
          {phone ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phone
              </dt>
              <dd className="mt-1">
                <a
                  href={`tel:${phone}`}
                  className="text-foreground hover:text-primary"
                >
                  {phone}
                </a>
              </dd>
            </div>
          ) : null}
          {email ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${email}`}
                  className="text-foreground hover:text-primary"
                >
                  {email}
                </a>
              </dd>
            </div>
          ) : null}
          {hours ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hours
              </dt>
              <dd className="mt-1 whitespace-pre-line text-foreground">
                {hours}
              </dd>
            </div>
          ) : null}
        </dl>
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:underline"
          >
            View on map →
          </a>
        ) : null}
      </div>
    </section>
  )
}
