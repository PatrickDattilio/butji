import type { Metadata } from 'next'
import Link from 'next/link'
import { buildGraphData } from '@/lib/companyRelationships'
import { getCompanyBySlug, getAllCompanies } from '@/lib/companies'
import CompanyRelationshipGraph from '@/components/CompanyRelationshipGraph'
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'
import LogoDevAttribution from '@/components/LogoDevAttribution'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Company Relationships Graph - Butji.com',
  description: 'Interactive network graph showing relationships between AI companies, investors, board members, and data centers.',
  keywords: ['company relationships', 'investment network', 'corporate connections', 'AI companies'],
  openGraph: {
    title: 'Company Relationships Graph - Butji.com',
    description: 'Interactive network graph showing relationships between AI companies, investors, board members, and data centers.',
    url: `${baseUrl}/companies/graph`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company Relationships Graph - Butji.com',
    description: 'Interactive network graph showing relationships between AI companies.',
  },
  alternates: {
    canonical: `${baseUrl}/companies/graph`,
  },
}

interface GraphPageProps {
  searchParams: Promise<{ focus?: string }>
}

export default async function CompanyGraphPage({ searchParams }: GraphPageProps) {
  const params = await searchParams
  const focusSlug = params.focus

  // Get company IDs to focus on if a focus parameter is provided
  let initialCompanyIds: string[] | undefined = undefined
  let focusedCompanyName: string | undefined = undefined

  if (focusSlug) {
    const focusedCompany = await getCompanyBySlug(focusSlug)
    if (focusedCompany) {
      initialCompanyIds = [focusedCompany.id]
      focusedCompanyName = focusedCompany.name
    }
  }

  // Build graph data
  // For performance, limit to top 100 companies if not focusing on specific companies
  // When focusing, include related companies (connections)
  let graphData = await buildGraphData(initialCompanyIds, {
    includePeople: true,
    includeDataCenters: true,
    includePartnerships: true,
    maxDepth: focusSlug ? 2 : 1, // Deeper depth when focusing on specific companies
  })
  
  // Ensure graphData has the correct structure (defensive check)
  if (!graphData || !Array.isArray(graphData.nodes)) {
    graphData = { nodes: [], links: [] }
  }
  if (!Array.isArray(graphData.links)) {
    graphData.links = []
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Companies', url: `${baseUrl}/companies` },
    { name: 'Relationships Graph', url: `${baseUrl}/companies/graph` },
  ])

  return (
    <>
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
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
          }}></div>
        </div>
        
        <header className="bg-cyber-dark border-b border-cyber-cyan/40 cyber-border relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav aria-label="Breadcrumb">
              <Link 
                href="/companies"
                className="inline-flex items-center gap-2 text-cyber-cyan hover:text-cyber-cyan/80 font-mono mb-4 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
                <span>Back to Companies</span>
              </Link>
            </nav>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold neon-cyan font-mono uppercase tracking-wider glitch-text" data-text="Company Relationships">
                  Company Relationships
                </h1>
                <p className="text-lg text-cyber-cyan/80 font-mono mt-2">
                  &gt; Interactive network graph showing connections between companies, investors, board members, and data centers
                </p>
                {focusedCompanyName && (
                  <p className="text-sm text-cyber-cyan/60 font-mono mt-2">
                    Focusing on: <span className="text-cyber-cyan">{focusedCompanyName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Instructions */}
          <div className="mb-6 bg-cyber-dark border border-cyber-cyan/30 rounded-sm p-4 cyber-border">
            <h2 className="text-lg font-bold neon-cyan mb-2 font-mono uppercase">How to Use</h2>
            <ul className="space-y-1 text-cyber-cyan/80 font-mono text-sm">
              <li>&gt; <strong>Click nodes</strong> to navigate to company detail pages</li>
              <li>&gt; <strong>Hover nodes/links</strong> to see detailed information</li>
              <li>&gt; <strong>Drag nodes</strong> to rearrange the graph</li>
              <li>&gt; <strong>Scroll to zoom</strong>, or use the controls to filter by node type or relationship type</li>
              <li>&gt; <strong>Search</strong> for specific companies or people</li>
            </ul>
          </div>

          {/* Graph Visualization */}
          <div className="bg-cyber-dark border border-cyber-cyan/30 rounded-sm cyber-border overflow-hidden" style={{ height: '800px' }}>
            <CompanyRelationshipGraph
              graphData={graphData}
              initialCompanyIds={initialCompanyIds}
              showInvestors={true}
              showSubsidiaries={true}
              showBoardMembers={true}
              showPartnerships={true}
              showDataCenters={true}
            />
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-cyber-dark border border-cyber-cyan/30 rounded-sm p-4 cyber-border">
              <div className="text-2xl font-bold text-cyber-cyan font-mono">
                {Array.isArray(graphData?.nodes) ? graphData.nodes.filter(n => n.type === 'company').length : 0}
              </div>
              <div className="text-sm text-cyber-cyan/60 font-mono uppercase">Companies</div>
            </div>
            <div className="bg-cyber-dark border border-cyber-cyan/30 rounded-sm p-4 cyber-border">
              <div className="text-2xl font-bold text-cyber-cyan font-mono">
                {Array.isArray(graphData?.nodes) ? graphData.nodes.filter(n => n.type === 'person').length : 0}
              </div>
              <div className="text-sm text-cyber-cyan/60 font-mono uppercase">People</div>
            </div>
            <div className="bg-cyber-dark border border-cyber-cyan/30 rounded-sm p-4 cyber-border">
              <div className="text-2xl font-bold text-cyber-cyan font-mono">
                {Array.isArray(graphData?.links) ? graphData.links.length : 0}
              </div>
              <div className="text-sm text-cyber-cyan/60 font-mono uppercase">Relationships</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-cyber-dark border-t border-cyber-cyan/40 mt-16 cyber-border relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-cyber-cyan/60 text-sm font-mono mb-2">
              &gt; Butji.com - Organizing the effort against the machines
            </p>
            <div className="text-center">
              <LogoDevAttribution variant="footer" />
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
