export type BlogAuthorBoxStat = {
  label: string
  value: string
}

export type BlogAuthorBoxProps = {
  name: string
  role: string
  bio: string
  avatarUrl?: string
  coverUrl?: string
  stats?: BlogAuthorBoxStat[]
  links?: Array<{ label: string; href: string }>
}

export function BlogAuthorBox({
  name,
  role,
  bio,
  avatarUrl,
  coverUrl,
  stats,
  links,
}: BlogAuthorBoxProps) {
  return (
    <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface-raised">
      {coverUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={coverUrl}
          alt=""
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20" />
      )}
      <div className="px-6 pb-6">
        <div className="-mt-10 flex items-end gap-4">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full border-4 border-surface-raised object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-20 w-20 place-items-center rounded-full border-4 border-surface-raised bg-primary text-2xl font-bold text-primary-foreground"
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1 pb-2">
            <p className="text-lg font-bold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{bio}</p>
        {stats?.length ? (
          <dl className="mt-4 flex gap-6">
            {stats.map((s, i) => (
              <div key={i}>
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="text-lg font-bold text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {links?.length ? (
          <ul className="mt-4 flex flex-wrap gap-3 text-xs">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.href}
                  className="font-semibold text-primary hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
