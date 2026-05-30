export type BlogTopicHeroProps = {
  topic: string
  description: string
  postCount: number
  followerCount?: number
  followAction?: string
  coverImageUrl?: string
}

export function BlogTopicHero({
  topic,
  description,
  postCount,
  followerCount,
  followAction,
  coverImageUrl,
}: BlogTopicHeroProps) {
  return (
    <header
      className="relative isolate px-6 py-16 lg:py-24"
      style={
        coverImageUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
            }
          : { background: 'var(--color-surface-sunken)' }
      }
    >
      <div className="mx-auto max-w-4xl">
        <p
          className={`text-xs font-semibold uppercase tracking-widest ${
            coverImageUrl ? 'opacity-90' : 'text-primary'
          }`}
        >
          Topic
        </p>
        <h1
          className={`mt-2 text-5xl font-bold leading-tight lg:text-6xl ${
            coverImageUrl ? '' : 'text-foreground'
          }`}
        >
          {topic}
        </h1>
        <p
          className={`mt-3 max-w-2xl text-lg ${
            coverImageUrl ? 'opacity-95' : 'text-muted-foreground'
          }`}
        >
          {description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          <span className={coverImageUrl ? 'opacity-90' : 'text-muted-foreground'}>
            {postCount} posts
          </span>
          {followerCount !== undefined ? (
            <span className={coverImageUrl ? 'opacity-90' : 'text-muted-foreground'}>
              · {followerCount.toLocaleString()} followers
            </span>
          ) : null}
          {followAction ? (
            <form action={followAction} method="POST" className="ml-auto">
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Follow topic
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  )
}
