export type LayoutHeroSplitProps = {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  reverseOnMobile?: boolean
}

export function LayoutHeroSplit({
  leftContent,
  rightContent,
  reverseOnMobile = false,
}: LayoutHeroSplitProps) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 ${
          reverseOnMobile ? 'flex-col-reverse' : ''
        }`}
      >
        <div>{leftContent}</div>
        <div>{rightContent}</div>
      </div>
    </section>
  )
}
