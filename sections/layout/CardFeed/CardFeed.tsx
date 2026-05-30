export type CardFeedProps = {
  heading?: string
  children?: React.ReactNode
}

export function CardFeed({ heading, children }: CardFeedProps) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {heading ? (
        <h1 className="mb-6 text-2xl font-bold text-foreground">{heading}</h1>
      ) : null}
      <div className="space-y-4 [&>*]:rounded-xl [&>*]:border [&>*]:border-border [&>*]:bg-surface-raised [&>*]:p-5">
        {children}
      </div>
    </main>
  )
}
