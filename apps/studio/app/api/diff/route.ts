/**
 * S4 — diff endpoint.
 *
 * Compares the in-memory studio state (POSTed) to the last-saved
 * `studio-state.json` and reports per-page block additions, removals,
 * moves, and prop edits.
 */
import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

const STATE_FILE = resolve(process.cwd(), '..', '..', 'studio-state.json')

type CanvasBlock = { instanceId: string; blockId: string; props: Record<string, unknown> }
type Page = { id: string; blocks: CanvasBlock[] }
type State = { pages: Page[] }

export async function POST(req: Request) {
  const next = (await req.json()) as State

  let prev: State = { pages: [] }
  try {
    prev = JSON.parse(await readFile(STATE_FILE, 'utf8'))
  } catch {
    // no previous state
  }

  const diff = next.pages.map((np) => {
    const pp = prev.pages.find((x) => x.id === np.id)
    if (!pp) return { pageId: np.id, status: 'new-page', added: np.blocks.length, removed: 0, edited: 0 }
    const added: string[] = []
    const removed: string[] = []
    const edited: string[] = []
    const ppMap = new Map(pp.blocks.map((b) => [b.instanceId, b]))
    const npMap = new Map(np.blocks.map((b) => [b.instanceId, b]))
    for (const b of np.blocks) {
      const o = ppMap.get(b.instanceId)
      if (!o) added.push(b.instanceId)
      else if (JSON.stringify(o.props) !== JSON.stringify(b.props)) edited.push(b.instanceId)
    }
    for (const b of pp.blocks) {
      if (!npMap.has(b.instanceId)) removed.push(b.instanceId)
    }
    return {
      pageId: np.id,
      status: 'modified',
      added: added.length,
      removed: removed.length,
      edited: edited.length,
      details: { added, removed, edited },
    }
  })

  // Pages removed entirely
  for (const pp of prev.pages) {
    if (!next.pages.find((x) => x.id === pp.id)) {
      diff.push({ pageId: pp.id, status: 'removed-page', added: 0, removed: pp.blocks.length, edited: 0 })
    }
  }

  return NextResponse.json({ diff })
}
