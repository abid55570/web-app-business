export type ThreePaneProps = {
  left: React.ReactNode
  middle: React.ReactNode
  right?: React.ReactNode
}

export function ThreePane({ left, middle, right }: ThreePaneProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_1fr_20rem]">
      <aside className="border-r border-border bg-surface-sunken">
        <div className="sticky top-0 h-screen overflow-y-auto p-4">{left}</div>
      </aside>
      <main className="overflow-y-auto bg-surface-base p-6">{middle}</main>
      {right ? (
        <aside className="hidden border-l border-border bg-surface-sunken lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto p-4">{right}</div>
        </aside>
      ) : null}
    </div>
  )
}
