export type SidebarTreeNavNode = {
  label: string
  href?: string
  children?: SidebarTreeNavNode[]
}

export type SidebarTreeNavProps = {
  title?: string
  nodes: SidebarTreeNavNode[]
}

function Node({ node, depth }: { node: SidebarTreeNavNode; depth: number }) {
  if (node.children && node.children.length) {
    return (
      <li>
        <details open={depth < 1}>
          <summary
            className="flex cursor-pointer list-none items-center gap-1 rounded px-2 py-1 text-sm font-medium text-foreground hover:bg-surface-overlay"
            style={{ paddingLeft: depth * 12 + 8 }}
          >
            <span className="text-xs text-muted-foreground">▸</span>
            {node.label}
          </summary>
          <ul className="space-y-0.5">
            {node.children.map((c, i) => (
              <Node key={i} node={c} depth={depth + 1} />
            ))}
          </ul>
        </details>
      </li>
    )
  }
  return (
    <li>
      <a
        href={node.href ?? '#'}
        className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-surface-overlay hover:text-foreground"
        style={{ paddingLeft: depth * 12 + 20 }}
      >
        {node.label}
      </a>
    </li>
  )
}

export function SidebarTreeNav({ title, nodes }: SidebarTreeNavProps) {
  return (
    <aside className="border-r border-border bg-surface-raised p-4">
      {title ? (
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      ) : null}
      <ul className="space-y-0.5">
        {nodes.map((n, i) => (
          <Node key={i} node={n} depth={0} />
        ))}
      </ul>
    </aside>
  )
}
