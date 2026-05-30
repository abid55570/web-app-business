'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiClientError, apiFetch } from '@/lib/api/client'

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

type SignupValues = z.infer<typeof schema>

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = async (values: SignupValues) => {
    setError(null)
    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: { ...values, name: values.name?.trim() || undefined },
      })
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          err.code === 'AUTH_EMAIL_TAKEN'
            ? 'An account with this email already exists.'
            : err.message,
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name (optional)</Label>
        <Input id="name" type="text" autoComplete="name" {...form.register('name')} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
