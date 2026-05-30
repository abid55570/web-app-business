/**
 * AnnouncementBar — slim full-bleed bar above the fold. Tone drives bg color.
 * Zero-JS; consumers can wrap to add a dismiss-with-cookie if needed.
 */
export type AnnouncementBarProps = {
  message: string
  ctaLabel?: string
  ctaHref?: string
  tone?: 'info' | 'success' | 'warning' | 'promo'
}

const TONE_CLASSES: Record<NonNullable<AnnouncementBarProps['tone']>, string> = {
  info: 'bg-primary text-primary-foreground',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-black',
  promo: 'bg-fuchsia-600 text-white',
}

export function AnnouncementBar({
  message,
  ctaLabel,
  ctaHref,
  tone = 'info',
}: AnnouncementBarProps) {
  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={`flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-sm ${TONE_CLASSES[tone]}`}
    >
      <span>{message}</span>
      {ctaLabel ? (
        <a
          href={ctaHref ?? '#'}
          className="font-semibold underline-offset-2 hover:underline"
        >
          {ctaLabel} →
        </a>
      ) : null}
    </div>
  )
}
