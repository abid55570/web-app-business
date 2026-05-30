export type BlogTimelineYearProps = {
  year: string
  posts: { date: string; title: string; href: string }[]
}
export function BlogTimelineYear({ year, posts }: BlogTimelineYearProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[120px_1fr]">
        <p className="text-5xl font-black text-foreground opacity-20 lg:text-7xl">{year}</p>
        <ul className="space-y-3 border-l-2 border-border pl-6">
          {posts.map((p, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-surface-base" />
              <p className="font-mono text-xs text-muted-foreground">{p.date}</p>
              <a href={p.href} className="text-base font-medium text-foreground hover:text-primary">{p.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
