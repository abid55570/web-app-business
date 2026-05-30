export type PressMention = {
  outletLogoUrl: string
  outletName: string
  quote: string
  href: string
}

export type PressMentionsProps = {
  heading?: string
  mentions: PressMention[]
}

export function PressMentions({ heading, mentions }: PressMentionsProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mentions.map((m, i) => (
          <li key={i}>
            <a
              href={m.href}
              className="block rounded-xl border border-border bg-surface-raised p-6 hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.outletLogoUrl}
                alt={m.outletName}
                className="h-6 w-auto opacity-80"
              />
              <p className="mt-4 text-sm italic leading-relaxed text-foreground">
                &ldquo;{m.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                Read more →
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
