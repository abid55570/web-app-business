export type FaqWithIllustrationProps = {
  heading: string
  illustrationUrl: string
  items: { q: string; a: string }[]
}

export function FaqWithIllustration({
  heading,
  illustrationUrl,
  items,
}: FaqWithIllustrationProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-24">
          <h2 className="mb-6 text-3xl font-bold text-foreground">
            {heading}
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={illustrationUrl}
            alt=""
            className="w-full max-w-xs text-muted-foreground"
          />
        </div>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-surface-raised"
            >
              <details>
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground">
                  {it.q}
                </summary>
                <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                  {it.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
