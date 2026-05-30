/**
 * S5d — block-composition templates.
 *
 * Saves a named block list (e.g. "Landing hero combo" = HeroSplit + LogoStrip
 * + StatsImpactRow) as a reusable template. Templates are
 * project-scoped, stored in `<project>/output/studio-templates.json`.
 *
 * GET    /api/templates        → list all templates
 * POST   /api/templates        → save current selection as template
 * DELETE /api/templates?id=…  → remove template
 */
import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const TEMPLATES = resolve(process.cwd(), '..', '..', 'output', 'studio-templates.json')

type Template = {
  id: string
  name: string
  description?: string
  blocks: { blockId: string; props: Record<string, unknown> }[]
  createdAt: number
}

async function load(): Promise<Template[]> {
  try {
    return JSON.parse(await readFile(TEMPLATES, 'utf8')) as Template[]
  } catch {
    return []
  }
}
async function save(list: Template[]): Promise<void> {
  await mkdir(resolve(TEMPLATES, '..'), { recursive: true })
  await writeFile(TEMPLATES, JSON.stringify(list, null, 2), 'utf8')
}

export async function GET() {
  return NextResponse.json({ templates: await load() })
}

export async function POST(req: Request) {
  const body = (await req.json()) as Omit<Template, 'id' | 'createdAt'>
  const list = await load()
  const tpl: Template = {
    id: `tpl_${Date.now()}`,
    createdAt: Date.now(),
    ...body,
  }
  list.push(tpl)
  await save(list)
  return NextResponse.json({ template: tpl })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const list = (await load()).filter((t) => t.id !== id)
  await save(list)
  return NextResponse.json({ ok: true })
}
