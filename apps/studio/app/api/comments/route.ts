/**
 * S5c — comments backend.
 *
 * Figma-style comments attached to either a page or a specific block.
 * Stored in `<project>/output/studio-comments.json` (one record per
 * comment + replies thread).
 *
 * Requires auth (canEdit or canView).
 */
import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { authResolve } from '../../../lib/auth'

const COMMENTS = resolve(process.cwd(), '..', '..', 'output', 'studio-comments.json')

type Comment = {
  id: string
  pageId: string
  blockId?: string
  authorId: string
  authorName: string
  body: string
  createdAt: number
  resolved: boolean
  replies: { id: string; authorId: string; authorName: string; body: string; createdAt: number }[]
}

async function load(): Promise<Comment[]> {
  try {
    return JSON.parse(await readFile(COMMENTS, 'utf8')) as Comment[]
  } catch {
    return []
  }
}

async function save(list: Comment[]): Promise<void> {
  await mkdir(resolve(COMMENTS, '..'), { recursive: true })
  await writeFile(COMMENTS, JSON.stringify(list, null, 2), 'utf8')
}

export async function GET(req: Request) {
  const ctx = await authResolve(req)
  if (!ctx) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const url = new URL(req.url)
  const pageId = url.searchParams.get('pageId')
  const list = await load()
  return NextResponse.json({
    comments: pageId ? list.filter((c) => c.pageId === pageId) : list,
  })
}

export async function POST(req: Request) {
  const ctx = await authResolve(req)
  if (!ctx) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const body = (await req.json()) as { pageId: string; blockId?: string; body: string; parentId?: string }
  const list = await load()
  if (body.parentId) {
    const parent = list.find((c) => c.id === body.parentId)
    if (!parent) return NextResponse.json({ error: 'parent not found' }, { status: 404 })
    parent.replies.push({
      id: `rpl_${Date.now()}`,
      authorId: ctx.user.id,
      authorName: ctx.user.name,
      body: body.body,
      createdAt: Date.now(),
    })
  } else {
    list.push({
      id: `cmt_${Date.now()}`,
      pageId: body.pageId,
      blockId: body.blockId,
      authorId: ctx.user.id,
      authorName: ctx.user.name,
      body: body.body,
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    })
  }
  await save(list)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const ctx = await authResolve(req)
  if (!ctx) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const body = (await req.json()) as { id: string; resolved?: boolean }
  const list = await load()
  const c = list.find((x) => x.id === body.id)
  if (!c) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (typeof body.resolved === 'boolean') c.resolved = body.resolved
  await save(list)
  return NextResponse.json({ ok: true })
}
