/**
 * Emit /login, /signup, and /dashboard pages when auth-jwt ships in
 * the recipe. Without this step, the premium-landing CTA goes to a
 * 404 — the backend exposes /api/auth/signup + /api/auth/login but
 * nothing in the frontend ever calls them.
 *
 * Pages match the dark premium aesthetic of the Hero3DScene + use
 * Framer-motion for the form reveal so the visual continuity holds
 * across landing → signup → dashboard.
 *
 * No-op when auth-jwt is absent.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'

export type DeriveAuthPagesArgs = {
  plan: WirePlan
  outputDir: string
}

type Branding = { name: string; tagline?: string; primary?: string }

export async function deriveAuthPages(args: DeriveAuthPagesArgs): Promise<void> {
  const recipe = args.plan.resolvedRecipe.recipe as {
    modules?: Array<{ id: string }>
    branding: Branding
    sections?: string[]
  }
  const mods = recipe.modules ?? []
  const hasAuthJwt = mods.some((m) => m.id === 'auth-jwt')
  if (!hasAuthJwt) return

  const b: Branding = {
    name: recipe.branding?.name || 'My App',
    tagline: recipe.branding?.tagline,
    primary: recipe.branding?.primary || '#6366f1',
  }
  // Whether we should style for the premium dark aesthetic. Detected by
  // the presence of any premium section in the recipe — otherwise we
  // ship simpler, light-mode pages that fit the basic template's vibe.
  const sections = recipe.sections ?? []
  const dark = sections.some((s) =>
    ['Hero3DScene', 'FeatureScroll3D', 'CtaMagnetic', 'FeaturesStagger', 'TestimonialsMarqueePremium'].includes(s),
  )

  const appDir = path.join(args.outputDir, 'frontend', 'src', 'app')
  await mkdir(path.join(appDir, 'login'), { recursive: true })
  await mkdir(path.join(appDir, 'signup'), { recursive: true })
  await mkdir(path.join(appDir, 'dashboard'), { recursive: true })
  const libDir = path.join(args.outputDir, 'frontend', 'src', 'lib')
  await mkdir(libDir, { recursive: true })

  // ── Shared auth client ─────────────────────────────────────
  await writeFile(
    path.join(libDir, 'auth.ts'),
    buildAuthClient(),
    'utf-8',
  )

  // ── /signup page ───────────────────────────────────────────
  await writeFile(
    path.join(appDir, 'signup', 'page.tsx'),
    buildSignupPage(b, dark),
    'utf-8',
  )

  // ── /login page ────────────────────────────────────────────
  await writeFile(
    path.join(appDir, 'login', 'page.tsx'),
    buildLoginPage(b, dark),
    'utf-8',
  )

  // ── /dashboard page (guarded) ──────────────────────────────
  // If the user-posts module is in the recipe, ship a real posts CRUD
  // dashboard. Otherwise keep the simple welcome placeholder.
  const hasUserPosts = mods.some((m) => m.id === 'user-posts')
  await writeFile(
    path.join(appDir, 'dashboard', 'page.tsx'),
    hasUserPosts ? buildPostsDashboardPage(b, dark) : buildDashboardPage(b, dark),
    'utf-8',
  )
  if (hasUserPosts) {
    await writeFile(
      path.join(libDir, 'posts.ts'),
      buildPostsClient(),
      'utf-8',
    )
  }

  // ── next.config rewrite to proxy /api/* to backend ────────
  // Override the scaffold's next.config.ts with a version that proxies
  // /api/* to localhost:8000 so the form fetches work without CORS in
  // local dev. Production: terminate at a reverse proxy.
  await writeFile(
    path.join(args.outputDir, 'frontend', 'next.config.ts'),
    buildNextConfigWithProxy(),
    'utf-8',
  )
}

function buildAuthClient(): string {
  return `'use client'

/**
 * Tiny auth client — POSTs to FastAPI /api/auth/{signup,login} via the
 * Next.js rewrite, stores the access token in localStorage, exposes a
 * helper for guarded pages.
 */
export type AuthUser = { id: string; email: string; name?: string }
export type AuthResponse = {
  user: AuthUser
  session: { token: string; userId: string; expiresAt: string }
}

const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

function errMsg(j: unknown, fallback: string): string {
  // FastAPI returns either { detail: 'msg' } or { detail: { code, message } }.
  if (j && typeof j === 'object' && 'detail' in j) {
    const d = (j as { detail: unknown }).detail
    if (typeof d === 'string') return d
    if (d && typeof d === 'object' && 'message' in d) return String((d as { message: unknown }).message)
  }
  return fallback
}

export async function signup(email: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(errMsg(json, 'Signup failed'))
  const data = json as AuthResponse
  saveSession(data)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(errMsg(json, 'Login failed'))
  const data = json as AuthResponse
  saveSession(data)
  return data
}

export function logout(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as AuthUser } catch { return null }
}

function saveSession(data: AuthResponse): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, data.session.token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(data.user))
}
`
}

function buildSignupPage(b: Branding, dark: boolean): string {
  if (dark) return darkAuthPage('signup', b)
  return lightAuthPage('signup', b)
}
function buildLoginPage(b: Branding, dark: boolean): string {
  if (dark) return darkAuthPage('login', b)
  return lightAuthPage('login', b)
}

function darkAuthPage(mode: 'signup' | 'login', b: Branding): string {
  const isSignup = mode === 'signup'
  const title = isSignup ? 'Create your account' : 'Welcome back'
  const sub = isSignup ? 'Start building in under a minute.' : 'Sign in to continue.'
  const cta = isSignup ? 'Create account' : 'Sign in'
  const swap = isSignup
    ? `<p className="mt-6 text-center text-sm text-white/60">Already have an account? <a href="/login" className="font-semibold underline" style={{color}}>Sign in</a></p>`
    : `<p className="mt-6 text-center text-sm text-white/60">No account yet? <a href="/signup" className="font-semibold underline" style={{color}}>Create one</a></p>`
  const fn = isSignup ? 'signup' : 'login'
  const callArgs = isSignup ? 'email, password, name' : 'email, password'
  const nameField = isSignup
    ? `<label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/40 focus:bg-white/[0.06]"
              />
            </label>`
    : ''
  return `'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ${fn} } from '@/lib/auth'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

export default function ${isSignup ? 'SignupPage' : 'LoginPage'}() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')${isSignup ? "\n  const [name, setName] = useState('')" : ''}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await ${fn}(${callArgs})
      router.push('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl" style={{ background: \`radial-gradient(circle, \${color}, transparent 70%)\` }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <motion.a
          href="/"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 inline-block text-sm text-white/60 hover:text-white"
        >
          ← Back to {brand}
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.8, 0.36, 1] }}
        >
          <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ background: \`linear-gradient(135deg, #fff 0%, \${color} 50%, #ec4899 100%)\`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            ${title}
          </h1>
          <p className="mb-8 text-white/60">${sub}</p>

          <form onSubmit={onSubmit} className="space-y-4">
            ${nameField}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/40 focus:bg-white/[0.06]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/40 focus:bg-white/[0.06]"
              />
            </label>

            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </motion.p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 w-full overflow-hidden rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-2xl transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-60"
              style={{ background: \`linear-gradient(135deg, \${color}, #ec4899)\` }}
            >
              {loading ? 'Working…' : '${cta} →'}
            </button>
          </form>

          ${swap}
        </motion.div>
      </div>
    </main>
  )
}
`
}

function lightAuthPage(mode: 'signup' | 'login', b: Branding): string {
  const isSignup = mode === 'signup'
  const title = isSignup ? 'Create your account' : 'Welcome back'
  const cta = isSignup ? 'Create account' : 'Sign in'
  const swap = isSignup
    ? `<p className="mt-6 text-center text-sm text-gray-600">Have an account? <a href="/login" className="font-semibold underline">Sign in</a></p>`
    : `<p className="mt-6 text-center text-sm text-gray-600">No account? <a href="/signup" className="font-semibold underline">Create one</a></p>`
  const fn = isSignup ? 'signup' : 'login'
  const callArgs = isSignup ? 'email, password, name' : 'email, password'
  const nameInput = isSignup
    ? `<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />`
    : ''
  return `'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ${fn} } from '@/lib/auth'

export default function ${isSignup ? 'SignupPage' : 'LoginPage'}() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')${isSignup ? "\n  const [name, setName] = useState('')" : ''}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try { await ${fn}(${callArgs}); router.push('/dashboard') }
    catch (err) { setError((err as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <a href="/" className="mb-8 text-sm text-gray-600 hover:text-gray-900">← Back</a>
      <h1 className="mb-2 text-3xl font-bold">${title}</h1>
      <p className="mb-8 text-gray-600">${JSON.stringify(b.tagline || '')}</p>
      <form onSubmit={onSubmit} className="space-y-3">
        ${nameInput}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ chars)" className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />
        {error ? <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-black disabled:opacity-50">
          {loading ? 'Working…' : '${cta}'}
        </button>
      </form>
      ${swap}
    </main>
  )
}
`
}

function buildDashboardPage(b: Branding, dark: boolean): string {
  if (!dark) {
    return `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, logout, type AuthUser } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const u = getUser()
    if (!u) router.replace('/login')
    else setUser(u)
  }, [router])

  if (!user) return <main className="p-8 text-gray-600">Loading…</main>

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">${b.name}</h1>
        <button type="button" onClick={() => { logout(); router.push('/') }} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">Sign out</button>
      </div>
      <p className="text-gray-700">Welcome, {user.name ?? user.email}.</p>
      <p className="mt-4 text-sm text-gray-500">This is your dashboard. Build the rest of your app here.</p>
    </main>
  )
}
`
  }
  return `'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, logout, type AuthUser } from '@/lib/auth'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const u = getUser()
    if (!u) router.replace('/login')
    else setUser(u)
  }, [router])

  if (!user) {
    return <main className="grid min-h-screen place-items-center bg-black text-white/60">Loading…</main>
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl" style={{ background: \`radial-gradient(circle, \${color}, transparent 70%)\` }} />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <a href="/" className="text-lg font-bold" style={{ background: \`linear-gradient(135deg, #fff, \${color})\`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          {brand}
        </a>
        <button
          type="button"
          onClick={() => { logout(); router.push('/') }}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
        >
          Sign out
        </button>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl px-6 py-20"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>
          Dashboard
        </p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          Welcome back, <span style={{ color }}>{(user.name && user.name.trim()) || user.email.split('@')[0]}</span>.
        </h1>
        <p className="mb-12 max-w-xl text-lg text-white/60">
          You&apos;re signed in. This is your starting point — build the rest of {brand} from here.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Account" body={user.email} accent={color} />
          <Card title="Status" body="Active" accent={color} />
          <Card title="Plan" body="Free tier" accent={color} />
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-bold">Next steps</h2>
          <ul className="space-y-2 text-white/70">
            <li>• Build pages under <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">src/app/</code></li>
            <li>• Call your API at <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">/api/*</code> (proxied to FastAPI)</li>
            <li>• Drop overrides under <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">overrides/</code> to survive regens</li>
          </ul>
        </div>
      </motion.section>
    </main>
  )
}

function Card({ title, body, accent }: { title: string; body: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>{title}</p>
      <p className="text-base font-semibold">{body}</p>
    </div>
  )
}
`
}

function buildPostsClient(): string {
  return `'use client'

import { getToken } from '@/lib/auth'

export type Post = {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string | null
  coverUrl: string | null
  status: 'draft' | 'published' | 'archived'
  authorId: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}
export type PostList = { items: Post[]; total: number }
export type PostInput = {
  title: string
  slug: string
  body: string
  excerpt?: string
  coverUrl?: string
  status?: 'draft' | 'published' | 'archived'
}

const base = '/api/my/posts'

function authHeaders(): HeadersInit {
  const t = getToken()
  return t ? { 'content-type': 'application/json', authorization: 'Bearer ' + t } : { 'content-type': 'application/json' }
}

async function json<T>(p: Promise<Response>): Promise<T> {
  const res = await p
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data as { detail?: unknown }).detail
    throw new Error(typeof msg === 'string' ? msg : (msg && typeof msg === 'object' && 'message' in msg ? String((msg as { message: unknown }).message) : 'Request failed'))
  }
  return data as T
}

export function listMyPosts(): Promise<PostList> {
  return json<PostList>(fetch(base, { headers: authHeaders(), cache: 'no-store' }))
}

export function createPost(body: PostInput): Promise<Post> {
  return json<Post>(fetch(base, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }))
}

export function updatePost(id: string, body: Partial<PostInput>): Promise<Post> {
  return json<Post>(fetch(\`\${base}/\${id}\`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) }))
}

export function changeStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<Post> {
  return json<Post>(fetch(\`\${base}/\${id}/status\`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) }))
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(\`\${base}/\${id}\`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok && res.status !== 204) throw new Error('Delete failed')
}

/** Convenience: turn a title into a URL-safe slug. */
export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'untitled-' + Date.now()
}
`
}

function buildPostsDashboardPage(b: Branding, dark: boolean): string {
  if (!dark) return buildPostsDashboardLight(b)
  return buildPostsDashboardDark(b)
}

function buildPostsDashboardDark(b: Branding): string {
  return `'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, logout, type AuthUser } from '@/lib/auth'
import {
  listMyPosts,
  createPost,
  updatePost,
  changeStatus,
  deletePost,
  slugify,
  type Post,
} from '@/lib/posts'

const color = ${JSON.stringify(b.primary || '#6366f1')}
const brand = ${JSON.stringify(b.name)}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [selected, setSelected] = useState<Post | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [savingPostId, setSavingPostId] = useState<string | null>(null)

  // Local form state for the editor pane.
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const refresh = useCallback(async () => {
    try {
      const list = await listMyPosts()
      setPosts(list.items)
      // Keep selection if still in list.
      if (selected) {
        const fresh = list.items.find((p) => p.id === selected.id) ?? null
        setSelected(fresh)
        if (fresh) { setTitle(fresh.title); setBody(fresh.body) }
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }, [selected])

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/login'); return }
    setUser(u)
    void refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  function startNew() {
    setComposing(true)
    setSelected(null)
    setTitle(''); setBody('')
    setError(null)
  }

  function selectPost(p: Post) {
    setComposing(false)
    setSelected(p)
    setTitle(p.title); setBody(p.body)
    setError(null)
  }

  async function save() {
    setError(null)
    try {
      if (composing) {
        if (!title.trim() || !body.trim()) { setError('Title and body required.'); return }
        const created = await createPost({
          title: title.trim(),
          slug: slugify(title),
          body: body.trim(),
          status: 'draft',
        })
        setComposing(false)
        await refresh()
        setSelected(created)
      } else if (selected) {
        setSavingPostId(selected.id)
        await updatePost(selected.id, { title: title.trim(), body: body.trim() })
        await refresh()
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSavingPostId(null)
    }
  }

  async function publishToggle(p: Post) {
    setSavingPostId(p.id)
    try {
      const next = p.status === 'published' ? 'draft' : 'published'
      await changeStatus(p.id, next)
      await refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSavingPostId(null)
    }
  }

  async function remove(p: Post) {
    if (!confirm('Delete \\"' + p.title + '\\"? This cannot be undone.')) return
    setSavingPostId(p.id)
    try {
      await deletePost(p.id)
      if (selected?.id === p.id) { setSelected(null); setTitle(''); setBody('') }
      await refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSavingPostId(null)
    }
  }

  if (!user) {
    return <main className="grid min-h-screen place-items-center bg-black text-white/60">Loading…</main>
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl" style={{ background: \`radial-gradient(circle, \${color}, transparent 70%)\` }} />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="text-lg font-bold" style={{ background: \`linear-gradient(135deg, #fff, \${color})\`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          {brand}
        </a>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span className="hidden md:inline">{(user.name && user.name.trim()) || user.email.split('@')[0]}</span>
          <button type="button" onClick={() => { logout(); router.push('/') }} className="rounded-full border border-white/15 px-4 py-2 font-medium transition hover:border-white/30 hover:text-white">
            Sign out
          </button>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>Your posts</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {posts === null ? 'Loading…' : posts.length === 0 ? 'Write your first post' : (posts.length + ' post' + (posts.length === 1 ? '' : 's'))}
            </h1>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.02]"
            style={{ background: \`linear-gradient(135deg, \${color}, #ec4899)\` }}
          >
            + New post
          </button>
        </div>

        {error ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left rail — post list */}
          <aside className="space-y-2">
            {posts === null ? (
              <p className="text-sm text-white/40">Loading…</p>
            ) : posts.length === 0 && !composing ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                <p className="mb-3 text-sm text-white/60">No posts yet.</p>
                <button type="button" onClick={startNew} className="text-sm font-semibold underline" style={{ color }}>
                  Compose one →
                </button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {posts.map((p) => {
                  const active = selected?.id === p.id && !composing
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => selectPost(p)}
                      className={'group block w-full rounded-xl border p-4 text-left transition ' + (active ? 'border-white/40 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]')}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <strong className="truncate text-sm font-semibold">{p.title}</strong>
                        <span className={'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' + (p.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' : p.status === 'archived' ? 'bg-white/10 text-white/40' : 'bg-amber-500/20 text-amber-300')}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{new Date(p.updatedAt).toLocaleString()}</p>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            )}
          </aside>

          {/* Right pane — editor */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            {composing || selected ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-xl font-bold outline-none transition focus:border-white/30"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your post…"
                  rows={14}
                  className="w-full resize-none rounded-lg border border-white/10 bg-transparent p-4 text-base leading-relaxed text-white/90 outline-none transition focus:border-white/30"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={save}
                    disabled={savingPostId !== null}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: \`linear-gradient(135deg, \${color}, #ec4899)\` }}
                  >
                    {composing ? 'Create draft' : (savingPostId === selected?.id ? 'Saving…' : 'Save changes')}
                  </button>
                  {!composing && selected ? (
                    <>
                      <button type="button" onClick={() => publishToggle(selected)} disabled={savingPostId !== null} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-50">
                        {selected.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button type="button" onClick={() => remove(selected)} disabled={savingPostId !== null} className="ml-auto rounded-full border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-400/50 hover:text-red-200 disabled:opacity-50">
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
                {selected ? (
                  <p className="text-xs text-white/30">/{selected.slug} · created {new Date(selected.createdAt).toLocaleDateString()}</p>
                ) : null}
              </div>
            ) : (
              <div className="grid h-full min-h-[300px] place-items-center text-center">
                <div>
                  <p className="mb-2 text-sm text-white/50">Select a post on the left, or</p>
                  <button type="button" onClick={startNew} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.02]" style={{ background: \`linear-gradient(135deg, \${color}, #ec4899)\` }}>
                    + Start a new post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
`
}

function buildPostsDashboardLight(b: Branding): string {
  return `'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, logout, type AuthUser } from '@/lib/auth'
import { listMyPosts, createPost, updatePost, changeStatus, deletePost, slugify, type Post } from '@/lib/posts'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [sel, setSel] = useState<Post | null>(null)
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { const l = await listMyPosts(); setPosts(l.items) } catch (e) { setError((e as Error).message) }
  }, [])

  useEffect(() => { const u = getUser(); if (!u) router.replace('/login'); else { setUser(u); void load() } }, [router, load])

  if (!user) return <main className="p-8">Loading…</main>

  async function save() {
    try {
      if (composing) {
        if (!title || !body) return setError('Title + body required.')
        const p = await createPost({ title, slug: slugify(title), body, status: 'draft' })
        setComposing(false); setSel(p); await load()
      } else if (sel) {
        await updatePost(sel.id, { title, body }); await load()
      }
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">${b.name}</h1>
        <button onClick={() => { logout(); router.push('/') }} className="text-sm underline">Sign out</button>
      </header>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your posts ({posts.length})</h2>
        <button onClick={() => { setComposing(true); setSel(null); setTitle(''); setBody('') }} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white">+ New</button>
      </div>
      {error ? <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="grid grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-2">
          {posts.map(p => (
            <button key={p.id} onClick={() => { setSel(p); setComposing(false); setTitle(p.title); setBody(p.body) }} className={'block w-full rounded-md border p-3 text-left text-sm ' + (sel?.id === p.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50')}>
              <strong>{p.title}</strong>
              <span className="ml-2 text-xs text-gray-500">{p.status}</span>
            </button>
          ))}
        </aside>
        <div className="rounded-md border border-gray-200 p-4">
          {(composing || sel) ? (
            <div className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-md border px-3 py-2 text-lg font-semibold" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={12} className="w-full rounded-md border px-3 py-2" />
              <div className="flex gap-2">
                <button onClick={save} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white">{composing ? 'Create' : 'Save'}</button>
                {sel ? <>
                  <button onClick={async () => { await changeStatus(sel.id, sel.status === 'published' ? 'draft' : 'published'); await load() }} className="rounded-md border border-gray-300 px-4 py-2 text-sm">{sel.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await deletePost(sel.id); setSel(null); await load() } }} className="ml-auto rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete</button>
                </> : null}
              </div>
            </div>
          ) : <p className="text-sm text-gray-500">Pick a post or create one.</p>}
        </div>
      </div>
    </main>
  )
}
`
}

function buildNextConfigWithProxy(): string {
  return `import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Proxy /api/* to the FastAPI backend on port 8000 in dev. In production,
 * either terminate at a reverse proxy (nginx, Caddy) or override this
 * rewrite via overrides/.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000') + '/api/:path*',
      },
    ]
  },
}

export default nextConfig
`
}
