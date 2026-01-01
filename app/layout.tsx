import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import './globals.css'
import { generateOrganizationSchema, generateWebSiteSchema, renderStructuredData } from '@/lib/seo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

export const metadata: Metadata = {
  title: 'Butji - Anti-AI Tools & Resources',
  description: 'A curated collection of tools, websites, and resources to help organize the effort against AI automation.',
  metadataBase: new URL(baseUrl),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema(baseUrl)
  const websiteSchema = generateWebSiteSchema(baseUrl)

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData(websiteSchema),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


