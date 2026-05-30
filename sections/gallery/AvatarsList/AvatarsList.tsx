export type AvatarsListPerson = {
  name: string
  role?: string
  avatarUrl?: string
  href?: string
}

export type AvatarsListProps = {
  heading?: string
  people: AvatarsListPerson[]
}

export function AvatarsList({ heading, people }: AvatarsListProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-5xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {people.map((p, i) => {
          const inner = (
            <>
              {p.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.avatarUrl}
                  alt=""
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
                >
                  {p.name.charAt(0).toUpperCase()}
                </span>
              )}
              <p className="mt-2 text-sm font-semibold text-foreground">
                {p.name}
              </p>
              {p.role ? (
                <p className="text-xs text-muted-foreground">{p.role}</p>
              ) : null}
            </>
          )
          return (
            <li key={i} className="text-center">
              {p.href ? (
                <a href={p.href} className="block hover:opacity-80">
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
