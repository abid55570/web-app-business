export type TwoColMagazineProps = {
  dropCap?: boolean
  children?: React.ReactNode
}

export function TwoColMagazine({
  dropCap = true,
  children,
}: TwoColMagazineProps) {
  return (
    <article
      className={`mx-auto max-w-4xl px-6 py-10 text-foreground sm:columns-2 sm:gap-10 [&>p]:mb-4 [&>p]:text-justify ${
        dropCap
          ? '[&>p:first-of-type::first-letter]:float-left [&>p:first-of-type::first-letter]:mr-2 [&>p:first-of-type::first-letter]:text-5xl [&>p:first-of-type::first-letter]:font-bold [&>p:first-of-type::first-letter]:leading-[0.9] [&>p:first-of-type::first-letter]:text-primary'
          : ''
      }`}
    >
      {children}
    </article>
  )
}
