/**
 * TeamGrid — responsive card grid (1/2/3 cols at sm/md/lg).
 */
export type TeamMember = {
  name: string
  role: string
  avatarUrl: string
  bio?: string
  twitter?: string
  linkedin?: string
}

export type TeamGridProps = {
  heading?: string
  members: TeamMember[]
}

export function TeamGrid({ heading = 'Meet the team', members }: TeamGridProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <li
            key={i}
            className="flex flex-col items-center rounded-lg border border-border p-6 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.avatarUrl}
              alt={m.name}
              className="mb-4 h-24 w-24 rounded-full object-cover"
              loading="lazy"
            />
            <p className="text-lg font-semibold text-foreground">{m.name}</p>
            <p className="mb-3 text-sm text-primary">{m.role}</p>
            {m.bio ? (
              <p className="mb-4 text-sm text-muted-foreground">{m.bio}</p>
            ) : null}
            <div className="flex gap-3">
              {m.twitter ? (
                <a
                  href={m.twitter}
                  className="text-sm text-muted-foreground hover:text-primary"
                  rel="noopener"
                >
                  Twitter
                </a>
              ) : null}
              {m.linkedin ? (
                <a
                  href={m.linkedin}
                  className="text-sm text-muted-foreground hover:text-primary"
                  rel="noopener"
                >
                  LinkedIn
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
