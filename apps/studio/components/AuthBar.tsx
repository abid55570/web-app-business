'use client'
import { useEffect, useState } from 'react'

type Session = {
  authenticated: boolean
  user?: { id: string; email: string; name: string }
  workspace?: { id: string; name: string }
  role?: 'owner' | 'editor' | 'viewer'
}

export function AuthBar() {
  const [session, setSession] = useState<Session | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    const r = await fetch('/api/auth')
    setSession((await r.json()) as Session)
  }

  async function signin() {
    const email = prompt('Email?')
    if (!email) return
    setBusy(true)
    const r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'signin', email }),
    })
    setBusy(false)
    if (!r.ok) {
      const e = await r.json()
      alert(e.error)
      return
    }
    void refresh()
  }

  async function signup() {
    const name = prompt('Name?')
    if (!name) return
    const email = prompt('Email?')
    if (!email) return
    setBusy(true)
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'signup', email, name }),
    })
    setBusy(false)
    void refresh()
  }

  async function signout() {
    setBusy(true)
    await fetch('/api/auth', { method: 'DELETE' })
    setBusy(false)
    void refresh()
  }

  if (!session) return null
  if (!session.authenticated)
    return (
      <div className="auth-bar">
        <span className="auth-status">Not signed in</span>
        <button type="button" className="btn" onClick={signin} disabled={busy}>Sign in</button>
        <button type="button" className="btn btn-primary" onClick={signup} disabled={busy}>Sign up</button>
      </div>
    )
  return (
    <div className="auth-bar">
      <span className="auth-status">
        👤 {session.user?.name} · <strong>{session.workspace?.name}</strong> · role: <em>{session.role}</em>
      </span>
      <button type="button" className="btn" onClick={signout} disabled={busy}>Sign out</button>
    </div>
  )
}
