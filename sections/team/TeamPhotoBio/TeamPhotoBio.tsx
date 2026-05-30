export type TeamPhotoBioMember = { name: string; role: string; bio: string; imageUrl?: string }
export type TeamPhotoBioProps = { heading?: string; members: TeamPhotoBioMember[] }
export function TeamPhotoBio({ heading, members }: TeamPhotoBioProps) {
  return (
    <section className="px-6 py-16">
      {heading ? <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">{heading}</h2> : null}
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
        {members.map((m, i) => (
          <article key={i} className="flex gap-5">
            {m.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={m.imageUrl} alt="" className="h-28 w-28 flex-shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="grid h-28 w-28 flex-shrink-0 place-items-center rounded-lg bg-surface-overlay text-3xl font-bold text-muted-foreground">{m.name.charAt(0)}</span>
            )}
            <div>
              <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
              <p className="text-xs font-medium text-primary">{m.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
