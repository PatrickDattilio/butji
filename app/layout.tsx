import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Butji - Anti-AI Tools & Resources',
  description: 'A curated collection of tools, websites, and resources to help organize the effort against AI automation.',
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


