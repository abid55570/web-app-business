/**
 * S5b — workspace membership routes.
 *
 * POST   /api/workspaces/members   { workspaceId, email, role } → add user
 * PATCH  /api/workspaces/members   { workspaceId, userId, role } → change role
 * DELETE /api/workspaces/members?workspaceId=…&userId=…         → remove user
 *
 * All require role=owner on the workspace.
 */
import { NextResponse } from 'next/server'
import {
  authResolve,
  canManageMembers,
  loadStore,
  saveStore,
  type Role,
} from '../../../../lib/auth'

export async function POST(req: Request) {
  const body = (await req.json()) as { workspaceId: string; email: string; role: Role }
  const ctx = await authResolve(req, body.workspaceId)
  if (!ctx || !canManageMembers(ctx.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const store = await loadStore()
  const ws = store.workspaces.find((w) => w.id === body.workspaceId)
  const user = store.users.find((u) => u.email === body.email)
  if (!ws || !user) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (ws.members.some((m) => m.userId === user.id))
    return NextResponse.json({ error: 'already a member' }, { status: 409 })
  ws.members.push({ userId: user.id, role: body.role })
  await saveStore(store)
  return NextResponse.json({ ok: true, workspace: ws })
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { workspaceId: string; userId: string; role: Role }
  const ctx = await authResolve(req, body.workspaceId)
  if (!ctx || !canManageMembers(ctx.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const store = await loadStore()
  const ws = store.workspaces.find((w) => w.id === body.workspaceId)
  if (!ws) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const member = ws.members.find((m) => m.userId === body.userId)
  if (!member) return NextResponse.json({ error: 'not a member' }, { status: 404 })
  member.role = body.role
  await saveStore(store)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const workspaceId = url.searchParams.get('workspaceId') ?? ''
  const userId = url.searchParams.get('userId') ?? ''
  const ctx = await authResolve(req, workspaceId)
  if (!ctx || !canManageMembers(ctx.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const store = await loadStore()
  const ws = store.workspaces.find((w) => w.id === workspaceId)
  if (!ws) return NextResponse.json({ error: 'not found' }, { status: 404 })
  ws.members = ws.members.filter((m) => m.userId !== userId)
  await saveStore(store)
  return NextResponse.json({ ok: true })
}
