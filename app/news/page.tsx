import type { Metadata } from 'next'
import { getAllNewsArticles } from '@/lib/news'
import NewsList from '@/components/NewsList'
import Link from 'next/link'
import { generateCollectionPageSchema, generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

export const metadata: Metadata = {
  title: 'AI News Feed - Butji.com | Latest Headlines on AI & Tech',
  description: 'Latest headlines about AI companies, layoffs, and industry news. Stay informed about the machines and their impact on workers.',
  keywords: ['AI news', 'tech news', 'AI layoffs', 'tech industry', 'AI companies', 'tech headlines'],
  openGraph: {
    title: 'AI News Feed - Butji.com',
    description: 'Latest headlines about AI companies, layoffs, and industry news.',
    url: 'https://butji.com/news',
    siteName: 'Butji',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI News Feed - Butji.com',
    description: 'Latest headlines about AI companies, layoffs, and industry news.',
  },
  alternates: {
    canonical: 'https://butji.com/news',
  },
}

export default async function NewsPage() {
  const articles = await getAllNewsArticles(100)
  const collectionSchema = generateCollectionPageSchema(
    'AI News Feed',
    `${baseUrl}/news`,
    'Latest headlines about AI companies, layoffs, and industry news.'
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'News', url: `${baseUrl}/news` },
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
      <div className="min-h-screen bg-cyber-black text-cyber-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 terminal-glow">
                AI News Feed
              </h1>
              <p className="text-cyber-cyan/70 text-sm md:text-base">
                Latest headlines about AI companies, layoffs, and industry news
              </p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 text-sm text-cyber-cyan/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-cyber-cyan transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>News</span>
          </nav>
        </header>

        {/* News Grid */}
        <main>
          <NewsList initialArticles={articles} />
        </main>
      </div>
    </div>
    </>
  )
}
