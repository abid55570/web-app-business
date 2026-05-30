export type ContentInterviewQAExchange = {
  speaker: 'interviewer' | 'guest'
  text: string
}

export type ContentInterviewQAProps = {
  title: string
  guestName: string
  guestRole?: string
  intro?: string
  exchanges: ContentInterviewQAExchange[]
}

export function ContentInterviewQA({
  title,
  guestName,
  guestRole,
  intro,
  exchanges,
}: ContentInterviewQAProps) {
  return (
    <section className="px-6 py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-border pb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Interview
          </p>
          <h1 className="mb-3 text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            with <strong className="text-foreground">{guestName}</strong>
            {guestRole ? ` · ${guestRole}` : ''}
          </p>
        </header>
        {intro ? (
          <p className="mb-8 text-base italic text-muted-foreground">{intro}</p>
        ) : null}
        <div className="space-y-6">
          {exchanges.map((e, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[80px_1fr]">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  e.speaker === 'interviewer'
                    ? 'text-muted-foreground'
                    : 'text-primary'
                }`}
              >
                {e.speaker === 'interviewer' ? 'Q' : 'A'}
              </p>
              <p
                className={
                  e.speaker === 'interviewer'
                    ? 'text-base font-semibold text-foreground'
                    : 'text-base text-foreground'
                }
              >
                {e.text}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
