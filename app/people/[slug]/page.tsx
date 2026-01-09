import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPersonBySlug, getPersonById, getPersonWithRelationships } from '@/lib/people'
import Link from 'next/link'
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'
import CompanyCard from '@/components/CompanyCard'
import PersonImage from '@/components/PersonImage'
import CompanyLogoImage from '@/components/CompanyLogoImage'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

interface PersonPageProps {
  params: Promise<{ slug: string }>
}

// Helper to check if a string looks like a CUID (typically starts with 'c' and is 25 chars)
function looksLikeId(str: string): boolean {
  return str.length === 25 && str.match(/^c[a-z0-9]+$/) !== null
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Try to find by slug first, then by ID (for backward compatibility)
  let person = await getPersonBySlug(slug)
  if (!person && looksLikeId(slug)) {
    person = await getPersonById(slug)
  }
  
  if (!person) {
    return {
      title: 'Person Not Found - Butji.com',
    }
  }

  // If found by ID but has slug, redirect to slug URL in component
  const urlPath = person.slug || slug
  const url = `${baseUrl}/people/${urlPath}`

  return {
    title: `${person.name} - AI Industry Database | Butji.com`,
    description: person.bio ? person.bio.substring(0, 160) : `Profile of ${person.name} in the AI industry.`,
    keywords: ['AI industry', person.name, 'executive', 'founder', 'investor'],
    openGraph: {
      title: `${person.name} - AI Industry Database`,
      description: person.bio ? person.bio.substring(0, 160) : `Profile of ${person.name}.`,
      url,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${person.name} - AI Industry Database`,
      description: person.bio ? person.bio.substring(0, 160) : `Profile of ${person.name}.`,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function PersonDetailPage({ params }: PersonPageProps) {
  const { slug } = await params
  
  // Try to find by slug first, then by ID (for backward compatibility)
  let person = await getPersonBySlug(slug)
  if (!person && looksLikeId(slug)) {
    person = await getPersonById(slug)
    // If found by ID but has slug, redirect to slug URL
    if (person && person.slug) {
      redirect(`/people/${person.slug}`)
    }
  }

  if (!person) {
    notFound()
  }

  // Get relationships
  const relationships = await getPersonWithRelationships(person.id)
  const urlPath = person.slug || slug
  const personUrl = `${baseUrl}/people/${urlPath}`

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'People', url: `${baseUrl}/people` },
    { name: person.name, url: personUrl },
  ])

  // Calculate stats for dossier
  const totalConnections = 
    (relationships?.foundedCompanies.length || 0) +
    (relationships?.boardPositions.length || 0) +
    (relationships?.investments.length || 0)
  
  const dossierDate = new Date().toISOString().split('T')[0]
  const dossierTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(breadcrumbSchema),
        }}
      />
      <div className="min-h-screen bg-cyber-darker relative overflow-hidden">
        {/* Scan line overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-20">
          <div className="h-full w-full" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.05) 2px, rgba(0, 255, 255, 0.05) 4px)'
          }}></div>
        </div>
        
        {/* Dossier Header */}
        <header className="bg-cyber-dark border-b-2 border-cyber-cyan/50 cyber-border relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top bar with classification and metadata */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-red-500/20 border border-red-500/60 rounded-sm">
                  <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider">CLASSIFIED</span>
                </div>
                <div className="px-3 py-1 bg-cyber-cyan/20 border border-cyber-cyan/60 rounded-sm">
                  <span className="text-cyber-cyan font-mono text-xs font-bold uppercase tracking-wider">DIGITAL DOSSIER</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs font-mono text-cyber-cyan/60">
                <div>
                  <span className="text-cyber-cyan/40">DATE:</span> {dossierDate}
                </div>
                <div>
                  <span className="text-cyber-cyan/40">TIME:</span> {dossierTime}
                </div>
                <div>
                  <span className="text-cyber-cyan/40">ID:</span> {person.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link 
                href="/companies/graph"
                className="inline-flex items-center gap-2 text-cyber-cyan hover:text-cyber-cyan/80 font-mono text-sm transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
                <span>RETURN TO GRAPH</span>
              </Link>
            </nav>

            {/* Subject Header */}
            <div className="flex items-start gap-6 flex-wrap">
              {person.photoUrl && (
                <div className="flex-shrink-0 relative">
                  <div className="absolute -inset-1 bg-cyber-cyan/30 blur-sm rounded-full"></div>
                  <PersonImage
                    src={person.photoUrl}
                    alt={person.name}
                    size="large"
                    className="relative border-2 border-cyber-cyan/60"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyber-dark border border-cyber-cyan/40 rounded-sm">
                    <span className="text-cyber-cyan/60 font-mono text-xs">PHOTO ID VERIFIED</span>
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider">SUBJECT:</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-cyber-cyan font-mono uppercase tracking-wider glitch-text mb-2" data-text={person.name}>
                  {person.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap mt-4">
                  <Link
                    href={`/companies/graph?focus=${person.slug || person.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/50 hover:border-cyber-cyan hover:bg-cyber-cyan/20 font-mono uppercase transition-all terminal-glow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    VIEW RELATIONSHIP NETWORK
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Dossier Document */}
          <article className="bg-cyber-dark border-2 border-cyber-cyan/40 cyber-border terminal-glow">
            {/* Document Header Strip */}
            <div className="border-b border-cyber-cyan/30 bg-cyber-darker/50 px-6 py-3">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="font-mono text-xs text-cyber-cyan/60">
                  <span className="text-cyber-cyan/40">DOSSIER REF:</span> BUTJI-{person.id.substring(0, 8).toUpperCase()}
                </div>
                <div className="font-mono text-xs text-cyber-cyan/60">
                  <span className="text-cyber-cyan/40">CONNECTIONS:</span> {totalConnections} ENTITIES
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Identity Section */}
              <section id="identity" className="border-b border-cyber-cyan/20 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-cyber-cyan"></div>
                  <h2 className="text-2xl font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                    IDENTITY
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
                  <div className="bg-cyber-darker/50 border border-cyber-cyan/20 p-4">
                    <div className="text-cyber-cyan/40 text-xs uppercase mb-1">FULL NAME</div>
                    <div className="text-cyber-cyan font-bold">{person.name}</div>
                  </div>
                  <div className="bg-cyber-darker/50 border border-cyber-cyan/20 p-4">
                    <div className="text-cyber-cyan/40 text-xs uppercase mb-1">SUBJECT ID</div>
                    <div className="text-cyber-cyan font-mono">{person.id}</div>
                  </div>
                  {person.slug && (
                    <div className="bg-cyber-darker/50 border border-cyber-cyan/20 p-4">
                      <div className="text-cyber-cyan/40 text-xs uppercase mb-1">SLUG</div>
                      <div className="text-cyber-cyan font-mono">{person.slug}</div>
                    </div>
                  )}
                </div>
              </section>

              {/* Biography Section */}
              {person.bio && (
                <section id="biography" className="border-b border-cyber-cyan/20 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-cyber-cyan"></div>
                    <h2 className="text-2xl font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                      BIOGRAPHY
                    </h2>
                  </div>
                  <div className="bg-cyber-darker/50 border border-cyber-cyan/20 p-6">
                    <p className="text-cyber-cyan/90 font-mono leading-relaxed text-sm">
                      {person.bio}
                    </p>
                  </div>
                </section>
              )}

              {/* Digital Footprint */}
              {(person.linkedinUrl || person.twitterHandle || person.wikipediaUrl) && (
                <section id="digital-footprint" className="border-b border-cyber-cyan/20 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-cyber-cyan"></div>
                    <h2 className="text-2xl font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                      DIGITAL FOOTPRINT
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {person.linkedinUrl && (
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-cyber-darker/50 border border-cyber-cyan/30 p-4 hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                      >
                        <div className="font-mono text-xs text-cyber-cyan/40 uppercase mb-2">LINKEDIN</div>
                        <div className="text-cyber-cyan font-mono text-sm group-hover:text-cyber-cyan/80">
                          ACCESS PROFILE →
                        </div>
                      </a>
                    )}
                    {person.twitterHandle && (
                      <a
                        href={`https://twitter.com/${person.twitterHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-cyber-darker/50 border border-cyber-cyan/30 p-4 hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                      >
                        <div className="font-mono text-xs text-cyber-cyan/40 uppercase mb-2">TWITTER</div>
                        <div className="text-cyber-cyan font-mono text-sm group-hover:text-cyber-cyan/80">
                          @{person.twitterHandle.replace('@', '')} →
                        </div>
                      </a>
                    )}
                    {person.wikipediaUrl && (
                      <a
                        href={person.wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-cyber-darker/50 border border-cyber-cyan/30 p-4 hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                      >
                        <div className="font-mono text-xs text-cyber-cyan/40 uppercase mb-2">WIKIPEDIA</div>
                        <div className="text-cyber-cyan font-mono text-sm group-hover:text-cyber-cyan/80">
                          ACCESS ENTRY →
                        </div>
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Corporate Affiliations */}
              {relationships && (
                <>
                  {/* Founded Companies */}
                  {relationships.foundedCompanies.length > 0 && (
                    <section id="founded-companies" className="border-b border-cyber-cyan/20 pb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-cyber-cyan"></div>
                        <h2 className="text-2xl font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                          FOUNDED ENTITIES
                        </h2>
                        <span className="text-cyber-cyan/40 font-mono text-sm">({relationships.foundedCompanies.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relationships.foundedCompanies.map((fc) => (
                          <Link 
                            key={fc.companyId} 
                            href={`/companies/${fc.company.slug || fc.companyId}`}
                            className="block bg-cyber-darker/50 border border-cyber-cyan/30 p-4 hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <CompanyLogoImage
                                src={fc.company.logoUrl}
                                alt={fc.company.name}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-cyber-cyan font-mono font-bold text-sm group-hover:text-cyber-cyan/80 truncate">
                                  {fc.company.name}
                                </h3>
                                <div className="text-cyber-cyan/40 font-mono text-xs mt-1">FOUNDER</div>
                              </div>
                            </div>
                            <div className="text-cyber-cyan/60 font-mono text-xs mt-2 group-hover:text-cyber-cyan/40">
                              VIEW DETAILS →
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Board Positions */}
                  {relationships.boardPositions.length > 0 && (
                    <section id="board-positions" className="border-b border-cyber-cyan/20 pb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-cyber-cyan"></div>
                        <h2 className="text-2xl font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                          BOARD POSITIONS
                        </h2>
                        <span className="text-cyber-cyan/40 font-mono text-sm">({relationships.boardPositions.length})</span>
                      </div>
                      <div className="space-y-3">
                        {relationships.boardPositions.map((bp) => (
                          <Link
                            key={bp.id}
                            href={`/companies/${bp.company.slug || bp.companyId}`}
                            className="block bg-cyber-darker/50 border border-cyber-cyan/30 p-4 hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <CompanyLogoImage
                                  src={bp.company.logoUrl}
                                  alt={bp.company.name}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-cyber-cyan font-mono font-bold text-sm group-hover:text-cyber-cyan/80 truncate">
                                    {bp.company.name}
                                  </h3>
                                  {bp.title && (
                                    <div className="text-cyber-cyan/60 font-mono text-xs mt-1">{bp.title}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {(bp.startDate || bp.endDate) && (
                                  <div className="text-cyber-cyan/40 font-mono text-xs">
                                    {bp.startDate && new Date(bp.startDate).getFullYear()}
                                    {bp.endDate ? ` - ${new Date(bp.endDate).getFullYear()}` : ' - PRESENT'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Investments */}
                  {relationships.investments.length > 0 && (
                    <section id="investments">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-cyber-cyan"></div>
                        <h2 className="text-2xl font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                          INVESTMENT ACTIVITY
                        </h2>
                        <span className="text-cyber-cyan/40 font-mono text-sm">({relationships.investments.length})</span>
                      </div>
                      <div className="space-y-3">
                        {relationships.investments.map((inv) => (
                          <Link
                            key={inv.id}
                            href={`/companies/${inv.company.slug || inv.companyId}`}
                            className="block bg-cyber-darker/50 border border-cyber-cyan/30 p-4 hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <CompanyLogoImage
                                  src={inv.company.logoUrl}
                                  alt={inv.company.name}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-cyber-cyan font-mono font-bold text-sm group-hover:text-cyber-cyan/80 truncate">
                                    {inv.company.name}
                                  </h3>
                                  {inv.role && (
                                    <div className="text-cyber-cyan/60 font-mono text-xs mt-1">{inv.role}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 space-y-1">
                                {inv.amount && (
                                  <div className="text-cyber-cyan font-mono text-sm font-bold">{inv.amount}</div>
                                )}
                                {inv.round && (
                                  <div className="text-cyber-cyan/60 font-mono text-xs">{inv.round}</div>
                                )}
                                {inv.date && (
                                  <div className="text-cyber-cyan/40 font-mono text-xs">{new Date(inv.date).getFullYear()}</div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Document Footer */}
            <div className="border-t border-cyber-cyan/30 bg-cyber-darker/50 px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4 font-mono text-xs text-cyber-cyan/40">
                <div>
                  <span className="text-cyber-cyan/60">LAST UPDATED:</span> {person.updatedAt ? new Date(person.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-2 py-1 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm">
                    <span className="text-cyber-cyan/60">SOURCE:</span> BUTJI INTELLIGENCE
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>

        {/* Footer */}
        <footer className="bg-cyber-dark border-t border-cyber-cyan/40 mt-12 cyber-border relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-cyber-cyan/60 text-sm font-mono">
              &gt; BUTJI.COM - ORGANIZING THE EFFORT AGAINST THE MACHINES
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
