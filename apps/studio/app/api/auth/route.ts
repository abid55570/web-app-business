/**
 * S5b — auth routes.
 *
 * POST /api/auth   { action: 'signup', email, name } → creates user + first workspace + session cookie
 * POST /api/auth   { action: 'signin', email }       → resolves user by email, issues session cookie
 * GET  /api/auth                                       → returns current session
 * DELETE /api/auth                                     → clears session
 *
 * No password: dev MVP. Production swap = next-auth with email/oauth providers.
 */
import { NextResponse } from 'next/server'
import { authResolve, loadStore, newId, newToken, saveStore } from '../../../lib/auth'

export async function GET(req: Request) {
  const ctx = await authResolve(req)
  if (!ctx) return NextResponse.json({ authenticated: false })
  return NextResponse.json({
    authenticated: true,
    user: ctx.user,
    workspace: ctx.workspace,
    role: ctx.role,
  })
}

export async function POST(req: Request) {
  const body = (await req.json()) as { action: 'signup' | 'signin'; email: string; name?: string }
  const store = await loadStore()

  if (body.action === 'signup') {
    if (!body.email || !body.name)
      return NextResponse.json({ error: 'email + name required' }, { status: 400 })
    if (store.users.some((u) => u.email === body.email))
      return NextResponse.json({ error: 'email exists' }, { status: 409 })
    const user = { id: newId('usr'), email: body.email, name: body.name }
    const workspace = {
      id: newId('ws'),
      name: `${body.name}'s workspace`,
      ownerId: user.id,
      members: [{ userId: user.id, role: 'owner' as const }],
      createdAt: Date.now(),
    }
    const token = newToken()
    store.users.push(user)
    store.workspaces.push(workspace)
    store.sessions.push({ token, userId: user.id, createdAt: Date.now() })
    await saveStore(store)
    return sessionResponse(token, { user, workspace })
  }

  if (body.action === 'signin') {
    const user = store.users.find((u) => u.email === body.email)
    if (!user) return NextResponse.json({ error: 'no such user' }, { status: 404 })
    const token = newToken()
    store.sessions.push({ token, userId: user.id, createdAt: Date.now() })
    await saveStore(store)
    const workspace = store.workspaces.find((w) =>
      w.members.some((m) => m.userId === user.id),
    )
    return sessionResponse(token, { user, workspace })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.headers.append(
    'set-cookie',
    `studio_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  )
  return res
}

function sessionResponse(token: string, payload: unknown): NextResponse {
  const res = NextResponse.json(payload)
  res.headers.append(
    'set-cookie',
    `studio_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
  )
  return res
}
