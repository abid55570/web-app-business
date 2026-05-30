export type ContentTwoColumnPullquoteProps = {
  paragraphs: string[]
  quote: string
  attribution?: string
}

export function ContentTwoColumnPullquote({
  paragraphs,
  quote,
  attribution,
}: ContentTwoColumnPullquoteProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_2fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="border-l-4 border-primary pl-4 text-2xl font-semibold leading-snug text-foreground">
            &ldquo;{quote}&rdquo;
          </p>
          {attribution ? (
            <p className="mt-3 pl-4 text-sm text-muted-foreground">
              — {attribution}
            </p>
          ) : null}
        </aside>
        <div className="space-y-4 text-base leading-relaxed text-foreground">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
