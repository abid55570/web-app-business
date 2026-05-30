export type DefinitionProps = {
  term: string
  partOfSpeech?: string
  pronunciation?: string
  definitions: string[]
  example?: string
}

export function Definition({
  term,
  partOfSpeech,
  pronunciation,
  definitions,
  example,
}: DefinitionProps) {
  return (
    <article className="my-6 rounded-xl border border-border bg-surface-raised p-6">
      <header className="flex flex-wrap items-baseline gap-3">
        <h3 className="font-serif text-3xl font-bold text-foreground">
          {term}
        </h3>
        {partOfSpeech ? (
          <span className="font-mono text-xs italic text-muted-foreground">
            {partOfSpeech}
          </span>
        ) : null}
        {pronunciation ? (
          <span className="font-mono text-sm text-muted-foreground">
            /{pronunciation}/
          </span>
        ) : null}
      </header>
      <ol className="mt-3 space-y-1.5 text-sm text-foreground">
        {definitions.map((d, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {i + 1}.
            </span>
            <span>{d}</span>
          </li>
        ))}
      </ol>
      {example ? (
        <p className="mt-4 border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
          “{example}”
        </p>
      ) : null}
    </article>
  )
}
