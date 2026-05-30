export type ProfileSocial = { label: string; href: string }

export type ProfileCardProps = {
  name: string
  tagline?: string
  bio?: string
  avatarUrl?: string
  socials?: ProfileSocial[]
}

export function ProfileCard({
  name,
  tagline,
  bio,
  avatarUrl,
  socials = [],
}: ProfileCardProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <article className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-border bg-surface-raised p-8 text-center">
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt=""
            className="mb-6 h-28 w-28 rounded-full object-cover ring-4 ring-primary/20"
          />
        ) : null}
        <h2 className="text-2xl font-bold text-foreground">{name}</h2>
        {tagline ? (
          <p className="mt-1 text-sm text-primary">{tagline}</p>
        ) : null}
        {bio ? (
          <p className="mt-4 max-w-prose text-base text-muted-foreground">
            {bio}
          </p>
        ) : null}
        {socials.length > 0 ? (
          <ul className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {socials.map((s, i) => (
              <li key={i}>
                <a
                  href={s.href}
                  rel="noopener"
                  className="rounded-full border border-border px-4 py-1.5 text-foreground hover:bg-accent"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </section>
  )
}
