export type TwoColumnLayoutProps = {
  ratio?: '1-1' | '1-2' | '2-1' | '1-3' | '3-1'
  leftHtml: string
  rightHtml: string
}

const GRID_CLASS: Record<NonNullable<TwoColumnLayoutProps['ratio']>, string> = {
  '1-1': 'lg:grid-cols-2',
  '1-2': 'lg:grid-cols-[1fr_2fr]',
  '2-1': 'lg:grid-cols-[2fr_1fr]',
  '1-3': 'lg:grid-cols-[1fr_3fr]',
  '3-1': 'lg:grid-cols-[3fr_1fr]',
}

export function TwoColumnLayout({
  ratio = '1-1',
  leftHtml,
  rightHtml,
}: TwoColumnLayoutProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-1 gap-10 ${GRID_CLASS[ratio]}`}
      >
        <div
          className="prose max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: leftHtml }}
        />
        <div
          className="prose max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: rightHtml }}
        />
      </div>
    </section>
  )
}
