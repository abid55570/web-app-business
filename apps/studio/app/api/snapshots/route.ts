/**
 * S5d — version history snapshots.
 *
 * Named point-in-time backups of the entire studio state. Stored in
 * `<project>/output/studio-snapshots.json` — each snapshot is the full
 * StudioMultiPageState plus a label + timestamp.
 *
 * GET    /api/snapshots         → list (id, label, at, page count, block count)
 * POST   /api/snapshots         → { label, state } → record snapshot
 * GET    /api/snapshots?id=…   → fetch full snapshot for restore/diff
 * DELETE /api/snapshots?id=…   → delete
 */
import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const SNAPS = resolve(process.cwd(), '..', '..', 'output', 'studio-snapshots.json')

type Snapshot = {
  id: string
  label: string
  at: number
  state: unknown
}

async function load(): Promise<Snapshot[]> {
  try {
    return JSON.parse(await readFile(SNAPS, 'utf8')) as Snapshot[]
  } catch {
    return []
  }
}
async function save(list: Snapshot[]): Promise<void> {
  await mkdir(resolve(SNAPS, '..'), { recursive: true })
  await writeFile(SNAPS, JSON.stringify(list, null, 2), 'utf8')
}

export async function GET(req: Request) {
  const list = await load()
  const id = new URL(req.url).searchParams.get('id')
  if (id) {
    const snap = list.find((s) => s.id === id)
    if (!snap) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(snap)
  }
  // Return summary list, not full state, to keep response small.
  return NextResponse.json({
    snapshots: list.map((s) => {
      const st = s.state as { pages?: { blocks?: unknown[] }[] }
      const pages = st.pages?.length ?? 0
      const blocks =
        st.pages?.reduce((acc, p) => acc + (p.blocks?.length ?? 0), 0) ?? 0
      return { id: s.id, label: s.label, at: s.at, pages, blocks }
    }),
  })
}

export async function POST(req: Request) {
  const body = (await req.json()) as { label: string; state: unknown }
  const list = await load()
  const snap: Snapshot = { id: `snap_${Date.now()}`, label: body.label, at: Date.now(), state: body.state }
  list.push(snap)
  await save(list)
  return NextResponse.json({ snapshot: { id: snap.id, label: snap.label, at: snap.at } })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const list = (await load()).filter((s) => s.id !== id)
  await save(list)
  return NextResponse.json({ ok: true })
}
