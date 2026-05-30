export type BlogAuthorLink = {
  label: string
  href: string
}

export type BlogAuthorCardProps = {
  name: string
  role: string
  bio: string
  avatarUrl?: string
  links?: BlogAuthorLink[]
}

export function BlogAuthorCard({
  name,
  role,
  bio,
  avatarUrl,
  links,
}: BlogAuthorCardProps) {
  return (
    <aside className="mx-auto max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex-1">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
          <p className="mt-2 text-sm text-muted-foreground">{bio}</p>
          {links?.length ? (
            <ul className="mt-3 flex flex-wrap gap-3 text-xs">
              {links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    className="text-primary hover:underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
