export type ThreeColumnLayoutProps = {
  leftHtml: string
  middleHtml: string
  rightHtml: string
}

export function ThreeColumnLayout({
  leftHtml,
  middleHtml,
  rightHtml,
}: ThreeColumnLayoutProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">
        <div
          className="prose max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: leftHtml }}
        />
        <div
          className="prose max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: middleHtml }}
        />
        <div
          className="prose max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: rightHtml }}
        />
      </div>
    </section>
  )
}
