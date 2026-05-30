export type TeamMemberSpotlightProps = {
  name: string
  role: string
  bio: string
  imageUrl?: string
  socials?: { label: string; href: string }[]
}

export function TeamMemberSpotlight({
  name,
  role,
  bio,
  imageUrl,
  socials = [],
}: TeamMemberSpotlightProps) {
  return (
    <section className="px-6 py-16">
      <article className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[280px_1fr]">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="aspect-square w-full rounded-2xl object-cover"
          />
        ) : (
          <span className="grid aspect-square w-full place-items-center rounded-2xl bg-surface-overlay text-6xl font-bold text-muted-foreground">
            {name.charAt(0)}
          </span>
        )}
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
            {role}
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground">{name}</h2>
          <p className="mb-5 text-base text-muted-foreground">{bio}</p>
          {socials.length ? (
            <ul className="flex flex-wrap gap-3">
              {socials.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.href}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-overlay"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </section>
  )
}
