export type VerseProps = {
  lines: string[]
  attribution?: string
  align?: 'left' | 'center'
}

export function Verse({
  lines,
  attribution,
  align = 'center',
}: VerseProps) {
  const cls = align === 'center' ? 'text-center' : 'text-left'
  return (
    <figure className={`my-8 mx-auto max-w-xl ${cls}`}>
      <div className="space-y-1">
        {lines.map((l, i) => (
          <p
            key={i}
            className="font-serif text-lg italic leading-relaxed text-foreground"
          >
            {l}
          </p>
        ))}
      </div>
      {attribution ? (
        <figcaption className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  )
}
