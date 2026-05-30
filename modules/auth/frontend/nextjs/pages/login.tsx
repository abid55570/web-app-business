/**
 * Login page (server component). Already-signed-in users redirect to /dashboard.
 *
 * Wirer placement: <output>/frontend/src/app/(auth)/login/page.tsx
 */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getSessionToken } from '@/lib/auth/session'

export default async function LoginPage() {
  if (await getSessionToken()) {
    redirect('/dashboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back. Enter your credentials below.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Don&apos;t have an account?
        <Link href="/signup" className="ml-1 font-medium text-primary hover:underline">
          Create one
        </Link>
      </CardFooter>
    </Card>
  )
}
