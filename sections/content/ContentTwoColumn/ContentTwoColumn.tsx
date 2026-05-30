export type ContentTwoColumnProps = {
  heading?: string
  leftHeading: string
  leftBody: string
  rightHeading: string
  rightBody: string
}

export function ContentTwoColumn({
  heading,
  leftHeading,
  leftBody,
  rightHeading,
  rightBody,
}: ContentTwoColumnProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {heading ? (
          <h2 className="mb-8 text-2xl font-semibold text-foreground">
            {heading}
          </h2>
        ) : null}
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {leftHeading}
            </h3>
            <p className="text-base text-muted-foreground">{leftBody}</p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {rightHeading}
            </h3>
            <p className="text-base text-muted-foreground">{rightBody}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
