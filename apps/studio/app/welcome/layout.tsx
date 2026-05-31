import type { ReactNode } from 'react'

export const metadata = {
  title: 'Welcome to b-dash',
  description: 'Build a real, deployable website in 20 minutes.',
}

export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
