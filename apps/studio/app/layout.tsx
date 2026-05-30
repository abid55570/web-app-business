import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'b-dash Studio',
  description: 'Visual builder for b-dash sections',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
