'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api/client'

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    setBusy(true)
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setBusy(false)
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <Button variant="outline" onClick={onClick} disabled={busy} size="sm">
      {busy ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
