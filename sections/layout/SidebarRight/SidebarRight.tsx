export type SidebarRightProps = {
  main: React.ReactNode
  sidebar: React.ReactNode
}

export function SidebarRight({ main, sidebar }: SidebarRightProps) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_18rem]">
      <main className="min-w-0">{main}</main>
      <aside className="lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
    </div>
  )
}
