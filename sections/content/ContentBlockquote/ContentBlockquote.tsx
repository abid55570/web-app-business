export type ContentBlockquoteProps = {
  quote: string
  attribution?: string
}
export function ContentBlockquote({ quote, attribution }: ContentBlockquoteProps) {
  return (
    <blockquote className="mx-auto my-10 max-w-2xl px-6 text-center">
      <p className="text-3xl font-semibold leading-snug text-foreground sm:text-4xl">
        &ldquo;{quote}&rdquo;
      </p>
      {attribution ? (
        <footer className="mt-4 text-sm text-muted-foreground">— {attribution}</footer>
      ) : null}
    </blockquote>
  )
}
