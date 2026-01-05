import type { Metadata } from 'next'
import { getApprovedResources } from '@/lib/resources'
import ResourceList from '@/components/ResourceList'
import DiscordButton from '@/components/DiscordButton'
import MobileNav from '@/components/MobileNav'
import Link from 'next/link'
import { generateCollectionPageSchema, renderStructuredData } from '@/lib/seo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Butji - Anti-AI Tools & Resources | Butlerian Jihad',
  description: 'A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines. Discover privacy-focused tools, anti-AI resources, and join the Butlerian Jihad.',
  keywords: ['anti-AI', 'Butlerian Jihad', 'anti-AI tools', 'privacy tools', 'AI resistance', 'human creativity', 'anti-automation'],
  openGraph: {
    title: 'Butji - Anti-AI Tools & Resources',
    description: 'A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.',
    url: 'https://butji.com',
    siteName: 'Butji',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Butji - Anti-AI Tools & Resources',
    description: 'A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.',
  },
  alternates: {
    canonical: 'https://butji.com',
  },
}

export default async function Home() {
  const resources = await getApprovedResources()
  const collectionSchema = generateCollectionPageSchema(
    'Anti-AI Resources',
    baseUrl,
    'A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.'
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(collectionSchema),
        }}
      />
      <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="bg-cyber-dark border-b border-cyber-cyan/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold neon-cyan mb-2 font-mono tracking-wider glitch-text" data-text="BUTlerian JIhad">
                BUTlerian JIhad
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-cyber-cyan/80 font-mono">
                &gt; A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.
              </p>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-4" aria-label="Main navigation">
              <DiscordButton url="https://discord.gg/Kv9gJFMuJ" />
              <Link
                href="/manifesto"
                className="px-4 py-2 bg-cyber-dark border border-cyber-magenta/40 text-cyber-magenta rounded-sm hover:bg-cyber-magenta/10 hover:border-cyber-magenta/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                Manifesto
              </Link>
              <Link
                href="/companies"
                className="px-4 py-2 bg-cyber-dark border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500/10 hover:border-red-500/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                Companies
              </Link>
              <Link
                href="/news"
                className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                News
              </Link>
              <Link
                href="/submit"
                className="px-4 py-2 resistance-accent text-cyber-cyan rounded-sm hover:opacity-90 transition-all hover:scale-105 font-mono font-bold uppercase text-sm border border-cyber-cyan/60 terminal-glow"
              >
                Submit Resource
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan/70 rounded-sm hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                Admin
              </Link>
            </nav>
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <ResourceList resources={resources} />
      </main>

      {/* Footer */}
      <footer className="bg-cyber-dark border-t border-cyber-cyan/40 mt-8 md:mt-16 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <p className="text-center text-cyber-cyan/60 text-xs md:text-sm font-mono">
            &gt; Butji.com - Organizing the effort against the machines
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}
