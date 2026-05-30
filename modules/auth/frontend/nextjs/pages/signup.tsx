/**
 * Signup page (server component). Already-signed-in users redirect to /dashboard.
 *
 * Wirer placement: <output>/frontend/src/app/(auth)/signup/page.tsx
 */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignupForm } from '@/components/auth/signup-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getSessionToken } from '@/lib/auth/session'

export default async function SignupPage() {
  if (await getSessionToken()) {
    redirect('/dashboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start with email and password. Add more later.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?
        <Link href="/login" className="ml-1 font-medium text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
