export type CodeBlockProps = {
  language?: string
  filename?: string
  code: string
}

export function CodeBlock({ language, filename, code }: CodeBlockProps) {
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-border bg-surface-sunken">
      {(language || filename) ? (
        <figcaption className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-2 text-xs">
          <span className="font-mono text-muted-foreground">
            {filename ?? language ?? 'code'}
          </span>
          {language ? (
            <span className="rounded bg-accent/50 px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
              {language}
            </span>
          ) : null}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto px-4 py-3 text-sm leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </figure>
  )
}
