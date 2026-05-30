export type HeroAnnouncementProps = {
  announcement: { label: string; href: string }
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
}

export function HeroAnnouncement({
  announcement,
  headline,
  body,
  ctaLabel,
  ctaHref,
}: HeroAnnouncementProps) {
  return (
    <section className="px-6 py-20 text-center lg:py-24">
      <a
        href={announcement.href}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
      >
        <span aria-hidden className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
          NEW
        </span>
        {announcement.label}
        <span aria-hidden>→</span>
      </a>
      <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-foreground lg:text-6xl">
        {headline}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
        {body}
      </p>
      <a
        href={ctaHref}
        className="mt-8 inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
      >
        {ctaLabel} →
      </a>
    </section>
  )
}
