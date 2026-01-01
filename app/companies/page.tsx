import type { Metadata } from 'next'
import { getAllCompanies } from '@/lib/companies'
import CompanyList from '@/components/CompanyList'
import Link from 'next/link'
import { generateCollectionPageSchema, generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

export const metadata: Metadata = {
  title: 'AI Company Database - Butji.com | Tracking the Machines',
  description: 'Track AI companies, their billionaires, controversies, and layoffs. Know your enemy. A comprehensive database of AI companies and their impact on workers.',
  keywords: ['AI companies', 'AI billionaires', 'tech layoffs', 'AI surveillance', 'big tech', 'AI controversies'],
  openGraph: {
    title: 'AI Company Database - Butji.com',
    description: 'Track AI companies, their billionaires, controversies, and layoffs. Know your enemy.',
    url: 'https://butji.com/companies',
    siteName: 'Butji',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Company Database - Butji.com',
    description: 'Track AI companies, their billionaires, controversies, and layoffs. Know your enemy.',
  },
  alternates: {
    canonical: 'https://butji.com/companies',
  },
}

export default async function CompaniesPage() {
  const companies = await getAllCompanies()
  const collectionSchema = generateCollectionPageSchema(
    'AI Company Database',
    `${baseUrl}/companies`,
    'Track AI companies, their billionaires, controversies, and layoffs. Know your enemy.'
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Companies', url: `${baseUrl}/companies` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(collectionSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(breadcrumbSchema),
        }}
      />
      <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.03) 2px, rgba(239, 68, 68, 0.03) 4px)'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="bg-cyber-dark border-b border-red-500/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-bold text-red-500 mb-2 font-mono tracking-wider glitch-text" data-text="AI Company Database">
                AI Company Database
              </h1>
              <p className="text-lg text-red-400/80 font-mono">
                &gt; Tracking the billionaires and their machines. Know your enemy.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/companies/submit"
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-sm hover:opacity-90 transition-all hover:scale-105 font-mono font-bold uppercase text-sm border border-red-500/60 terminal-glow"
              >
                Submit Company
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-cyber-dark border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500/10 hover:border-red-500/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                ← Resources
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyList companies={companies} />
      </main>

      {/* Footer */}
      <footer className="bg-cyber-dark border-t border-red-500/40 mt-16 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-red-400/60 text-sm font-mono">
            &gt; Butji.com - Organizing the effort against the machines
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}
