export type AvatarRowTestimonial = {
  quote: string
  name: string
  role: string
  avatarUrl?: string
}

export type TestimonialAvatarRowProps = {
  heading?: string
  items: AvatarRowTestimonial[]
}

export function TestimonialAvatarRow({
  heading,
  items,
}: TestimonialAvatarRowProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-surface-raised p-5"
          >
            <p className="text-sm leading-relaxed text-foreground">
              &ldquo;{it.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              {it.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={it.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {it.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {it.name}
                </p>
                <p className="text-xs text-muted-foreground">{it.role}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
