/**
 * S5b — auth + workspaces + RBAC.
 *
 * MVP implementation: cookie-backed sessions, JSON-file workspace store
 * under `<project>/output/studio-workspaces.json`. Two tables:
 *   - users[]: { id, email, name }
 *   - workspaces[]: { id, name, ownerId, members: [{ userId, role }] }
 *
 * Roles:
 *   - owner   — full control (delete workspace, manage members, edit)
 *   - editor  — edit pages, render, manage assets
 *   - viewer  — read-only (cannot save, render, or upload)
 *
 * Production path: swap the JSON store for Postgres + a real OAuth
 * provider (next-auth). The middleware (lib/rbac.ts) reads the cookie
 * and rejects unauthorised requests before they reach the API routes.
 */
import { resolve } from 'node:path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'

const STORE = resolve(process.cwd(), '..', '..', 'output', 'studio-workspaces.json')

export type Role = 'owner' | 'editor' | 'viewer'

export type User = { id: string; email: string; name: string }
export type Workspace = {
  id: string
  name: string
  ownerId: string
  members: { userId: string; role: Role }[]
  createdAt: number
}
export type Session = { token: string; userId: string; createdAt: number }
export type Store = {
  users: User[]
  workspaces: Workspace[]
  sessions: Session[]
}

const EMPTY: Store = { users: [], workspaces: [], sessions: [] }

export async function loadStore(): Promise<Store> {
  try {
    const raw = await readFile(STORE, 'utf8')
    return JSON.parse(raw) as Store
  } catch {
    return EMPTY
  }
}

export async function saveStore(s: Store): Promise<void> {
  await mkdir(resolve(STORE, '..'), { recursive: true })
  await writeFile(STORE, JSON.stringify(s, null, 2), 'utf8')
}

export function newToken(): string {
  return randomBytes(24).toString('hex')
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString('hex')}`
}

/** Look up the session token from the cookie header and resolve to user + role
 * within the active workspace. */
export async function authResolve(req: Request, workspaceId?: string): Promise<{
  user: User
  workspace: Workspace | null
  role: Role | null
} | null> {
  const cookie = req.headers.get('cookie') ?? ''
  const m = /studio_session=([^;]+)/.exec(cookie)
  if (!m) return null
  const token = m[1]
  const store = await loadStore()
  const session = store.sessions.find((s) => s.token === token)
  if (!session) return null
  const user = store.users.find((u) => u.id === session.userId)
  if (!user) return null
  const workspace = workspaceId
    ? store.workspaces.find((w) => w.id === workspaceId) ?? null
    : store.workspaces.find((w) => w.members.some((mm) => mm.userId === user.id)) ?? null
  const role = workspace
    ? workspace.members.find((mm) => mm.userId === user.id)?.role ?? null
    : null
  return { user, workspace, role }
}

export function canEdit(role: Role | null): boolean {
  return role === 'owner' || role === 'editor'
}
export function canManageMembers(role: Role | null): boolean {
  return role === 'owner'
}
