export type CtaAppBadgesProps = {
  headline: string
  body?: string
  appStoreUrl?: string
  playStoreUrl?: string
  appStoreBadgeUrl?: string
  playStoreBadgeUrl?: string
}

export function CtaAppBadges({
  headline,
  body,
  appStoreUrl,
  playStoreUrl,
  appStoreBadgeUrl = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
  playStoreBadgeUrl = 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
}: CtaAppBadgesProps) {
  return (
    <section className="px-6 py-20 text-center">
      <h2 className="text-3xl font-bold text-foreground">{headline}</h2>
      {body ? (
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          {body}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {appStoreUrl ? (
          <a href={appStoreUrl} aria-label="Download on the App Store">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={appStoreBadgeUrl}
              alt="Download on the App Store"
              className="h-12"
            />
          </a>
        ) : null}
        {playStoreUrl ? (
          <a href={playStoreUrl} aria-label="Get it on Google Play">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={playStoreBadgeUrl}
              alt="Get it on Google Play"
              className="h-12"
            />
          </a>
        ) : null}
      </div>
    </section>
  )
}
