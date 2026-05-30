export type TeamLeadershipGridMember = {
  name: string
  role: string
  bio?: string
  imageUrl?: string
  linkedinUrl?: string
}

export type TeamLeadershipGridProps = {
  heading?: string
  members: TeamLeadershipGridMember[]
}

export function TeamLeadershipGrid({
  heading,
  members,
}: TeamLeadershipGridProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <article key={i} className="text-center">
            {m.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={m.imageUrl}
                alt=""
                className="mx-auto mb-3 h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <span className="mx-auto mb-3 grid h-32 w-32 place-items-center rounded-full bg-surface-overlay text-3xl font-bold text-muted-foreground">
                {m.name.charAt(0)}
              </span>
            )}
            <h3 className="text-base font-semibold text-foreground">
              {m.name}
            </h3>
            <p className="text-xs font-medium text-primary">{m.role}</p>
            {m.bio ? (
              <p className="mt-2 text-sm text-muted-foreground">{m.bio}</p>
            ) : null}
            {m.linkedinUrl ? (
              <a
                href={m.linkedinUrl}
                className="mt-2 inline-block text-xs font-semibold text-primary"
              >
                LinkedIn ↗
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
