export type StatsBigSingleProps = {
  eyebrow?: string
  value: string
  label: string
  caption?: string
}

export function StatsBigSingle({
  eyebrow,
  value,
  label,
  caption,
}: StatsBigSingleProps) {
  return (
    <section className="px-6 py-20 text-center">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <p className="mx-auto mb-2 text-7xl font-black tracking-tight text-foreground sm:text-9xl">
        {value}
      </p>
      <p className="mx-auto mb-2 max-w-md text-lg font-semibold text-foreground">
        {label}
      </p>
      {caption ? (
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {caption}
        </p>
      ) : null}
    </section>
  )
}
