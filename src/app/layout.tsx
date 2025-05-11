import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { Providers } from './auth/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreadSpire',
  description: 'A modern thread-based discussion platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 