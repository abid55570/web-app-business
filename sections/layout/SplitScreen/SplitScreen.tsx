export type SplitScreenProps = {
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
  reverse?: boolean
}

export function SplitScreen({
  headline,
  body,
  ctaLabel,
  ctaHref,
  imageUrl,
  reverse = false,
}: SplitScreenProps) {
  return (
    <section
      className={`grid min-h-[60vh] grid-cols-1 lg:grid-cols-2 ${
        reverse ? 'lg:[direction:rtl]' : ''
      }`}
    >
      <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:[direction:ltr]">
        <h2 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
          {headline}
        </h2>
        <p className="mt-4 max-w-md text-base text-muted-foreground">{body}</p>
        <a
          href={ctaHref}
          className="mt-6 inline-flex w-fit items-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="h-64 w-full object-cover lg:h-auto lg:[direction:ltr]"
      />
    </section>
  )
}
