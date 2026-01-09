import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getCompanyBySlug, getCompanyById, getCompanyByName } from '@/lib/companies'
import Link from 'next/link'
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'
import CitationLink from '@/components/CitationLink'
import CitationList from '@/components/CitationList'
import { Citation } from '@/types/company'
import ReportButton from '@/components/ReportButton'
import DataCenterCard from '@/components/DataCenterCard'
import CompanyQuickNav from '@/components/CompanyQuickNav'
import CompanyLogo from '@/components/CompanyLogo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

// Helper to check if a string looks like a CUID (typically starts with 'c' and is 25 chars)
function looksLikeId(str: string): boolean {
  return str.length === 25 && str.match(/^c[a-z0-9]+$/) !== null
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Try to find by slug first, then by ID (for backward compatibility)
  let company = await getCompanyBySlug(slug)
  if (!company && looksLikeId(slug)) {
    company = await getCompanyById(slug)
  }
  
  if (!company) {
    return {
      title: 'Company Not Found - Butji.com',
    }
  }

  // If found by ID but has slug, redirect to slug URL in component
  // For metadata, use the slug URL if available
  const urlPath = company.slug || slug
  const url = `${baseUrl}/companies/${urlPath}`

  return {
    title: `${company.name} - AI Company Database | Butji.com`,
    description: company.description.substring(0, 160),
    keywords: ['AI companies', company.name, ...company.tags, ...(company.products || [])].join(', '),
    openGraph: {
      title: `${company.name} - AI Company Database`,
      description: company.description.substring(0, 160),
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} - AI Company Database`,
      description: company.description.substring(0, 160),
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params
  
  // Try to find by slug first, then by ID (for backward compatibility)
  let company = await getCompanyBySlug(slug)
  if (!company && looksLikeId(slug)) {
    company = await getCompanyById(slug)
    // If found by ID but has slug, redirect to slug URL
    if (company && company.slug) {
      redirect(`/companies/${company.slug}`)
    }
  }

  if (!company) {
    notFound()
  }

  const urlPath = company.slug || slug
  const companyUrl = `${baseUrl}/companies/${urlPath}`

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Companies', url: `${baseUrl}/companies` },
    { name: company.name, url: companyUrl },
  ])

  // Calculate citation numbers for each field
  // Note: controversies are excluded from flat citations since they have embedded citations
  const citationFields = ['description', 'ceo', 'foundedYear', 'valuation', 'funding', 'founders', 'products']
  let citationCounter = 1
  const citationMap: Record<string, { start: number; citations: Citation[] }> = {}
  
  citationFields.forEach((field) => {
    const citations = company.citations?.[field]
    if (citations && citations.length > 0) {
      citationMap[field] = { start: citationCounter, citations }
      citationCounter += citations.length
    }
  })

  // Calculate citation numbers for controversies (each controversy has its own citations)
  let controversyCitationStart = citationCounter
  const controversyCitationMap: Array<{ start: number; citations: Citation[] }> = []
  if (company.controversies && Array.isArray(company.controversies)) {
    company.controversies.forEach((controversy) => {
      if (controversy.citations && controversy.citations.length > 0) {
        controversyCitationMap.push({
          start: controversyCitationStart,
          citations: controversy.citations,
        })
        controversyCitationStart += controversy.citations.length
      } else {
        controversyCitationMap.push({ start: controversyCitationStart, citations: [] })
      }
    })
  }

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
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.03) 2px, rgba(239, 68, 68, 0.03) 4px)'
          }}></div>
        </div>
        
        <header className="bg-cyber-dark border-b border-red-500/40 cyber-border relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav aria-label="Breadcrumb">
              <Link 
                href="/companies"
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-400/80 font-mono mb-4 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
                <span>Back to Companies</span>
              </Link>
            </nav>
            <div className="flex items-center gap-4 mb-4">
              {company.logoUrl && (
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  companyName={company.name}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-5xl font-bold text-red-500 font-mono uppercase tracking-wider glitch-text" data-text={company.name}>
                    {company.name}
                  </h1>
                  <ReportButton
                    type="company"
                    targetId={company.id}
                    targetName={company.name}
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {company.featured && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-sm bg-red-500/20 text-red-400 border border-red-500/50 font-mono uppercase terminal-glow">
                      Featured
                    </span>
                  )}
                  <Link
                    href={`/companies/graph?focus=${company.slug || company.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-sm bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/20 font-mono uppercase transition-all terminal-glow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    View Relationships
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Quick Navigation - Desktop Sidebar (fixed, outside flex container) */}
          <CompanyQuickNav
            availableSections={[
              'about',
              company.website || company.ceo || company.foundedYear || company.valuation ? 'basic-info' : '',
              company.socialMedia ? 'social-media' : '',
              company.contactInfo ? 'contact-info' : '',
              company.founders.length > 0 ? 'founders' : '',
              company.products.length > 0 ? 'products' : '',
              company.funding ? 'funding' : '',
              company.layoffs && company.layoffs.length > 0 ? 'layoffs' : '',
              company.controversies && Array.isArray(company.controversies) && company.controversies.length > 0 ? 'controversies' : '',
              company.directAction && company.directAction.length > 0 ? 'direct-action' : '',
              (company.unionInfo || company.employeeCount) ? 'union-labor' : '',
              company.locations && company.locations.length > 0 ? 'locations' : '',
              company.dataCenters && company.dataCenters.length > 0 ? 'datacenters' : '',
              'tags',
            ].filter(Boolean) as string[]}
          />
          
          {/* Main Content with left margin for sidebar */}
          <article className="bg-cyber-dark rounded-sm border border-red-500/30 cyber-border p-8 terminal-glow space-y-6 max-w-4xl lg:ml-56">
            {/* Description */}
            <section id="about">
              <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                &gt; About
              </h2>
              <p className="text-red-400/90 font-mono leading-relaxed inline">
                {company.description}
                {citationMap.description && (
                  <span className="ml-1">
                    {citationMap.description.citations.map((citation: Citation, index: number) => (
                      <CitationLink key={index} citation={citation} index={citationMap.description.start + index - 1} />
                    ))}
                  </span>
                )}
              </p>
              {citationMap.description && (
                <div className="mt-2">
                  <CitationList citations={citationMap.description.citations} fieldName="Description" />
                </div>
              )}
            </section>

            {/* Basic Info */}
            <section id="basic-info" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.website && (
                <div>
                  <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Website</h3>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 transition-colors font-mono"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {company.ceo && (
                <div>
                  <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">CEO</h3>
                  <p className="text-red-400/90 font-mono inline">
                    {company.ceo}
                    {citationMap.ceo && (
                      <span className="ml-1">
                        {citationMap.ceo.citations.map((citation: Citation, index: number) => (
                          <CitationLink key={index} citation={citation} index={citationMap.ceo.start + index - 1} />
                        ))}
                      </span>
                    )}
                  </p>
                  {citationMap.ceo && (
                    <div className="mt-1">
                      <CitationList citations={citationMap.ceo.citations} fieldName="CEO" />
                    </div>
                  )}
                </div>
              )}
              {company.foundedYear && (
                <div>
                  <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Founded</h3>
                  <p className="text-red-400/90 font-mono inline">
                    {company.foundedYear}
                    {citationMap.foundedYear && (
                      <span className="ml-1">
                        {citationMap.foundedYear.citations.map((citation: Citation, index: number) => (
                          <CitationLink key={index} citation={citation} index={citationMap.foundedYear.start + index - 1} />
                        ))}
                      </span>
                    )}
                  </p>
                  {citationMap.foundedYear && (
                    <div className="mt-1">
                      <CitationList citations={citationMap.foundedYear.citations} fieldName="Founded" />
                    </div>
                  )}
                </div>
              )}
              {company.valuation && (
                <div>
                  <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Valuation</h3>
                  <p className="text-red-400/90 font-mono inline">
                    {company.valuation}
                    {citationMap.valuation && (
                      <span className="ml-1">
                        {citationMap.valuation.citations.map((citation: Citation, index: number) => (
                          <CitationLink key={index} citation={citation} index={citationMap.valuation.start + index - 1} />
                        ))}
                      </span>
                    )}
                  </p>
                  {citationMap.valuation && (
                    <div className="mt-1">
                      <CitationList citations={citationMap.valuation.citations} fieldName="Valuation" />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Social Media */}
            {company.socialMedia && (
              <section id="social-media">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Social Media
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.socialMedia.twitter && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Twitter/X</h3>
                      <a
                        href={`https://twitter.com/${company.socialMedia.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors font-mono"
                      >
                        @{company.socialMedia.twitter.replace('@', '')}
                      </a>
                    </div>
                  )}
                  {company.socialMedia.linkedin && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">LinkedIn</h3>
                      <a
                        href={company.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                      >
                        {company.socialMedia.linkedin}
                      </a>
                    </div>
                  )}
                  {company.socialMedia.facebook && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Facebook</h3>
                      <a
                        href={company.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                      >
                        {company.socialMedia.facebook}
                      </a>
                    </div>
                  )}
                  {company.socialMedia.instagram && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Instagram</h3>
                      <a
                        href={`https://instagram.com/${company.socialMedia.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors font-mono"
                      >
                        @{company.socialMedia.instagram.replace('@', '')}
                      </a>
                    </div>
                  )}
                  {company.socialMedia.youtube && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">YouTube</h3>
                      <a
                        href={company.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                      >
                        {company.socialMedia.youtube}
                      </a>
                    </div>
                  )}
                  {company.socialMedia.tiktok && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">TikTok</h3>
                      <a
                        href={`https://tiktok.com/@${company.socialMedia.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors font-mono"
                      >
                        @{company.socialMedia.tiktok.replace('@', '')}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact Information */}
            {company.contactInfo && (
              <section id="contact-info">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.contactInfo.email && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Email</h3>
                      <a
                        href={`mailto:${company.contactInfo.email}`}
                        className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                      >
                        {company.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {company.contactInfo.pressEmail && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Press/Media</h3>
                      <a
                        href={`mailto:${company.contactInfo.pressEmail}`}
                        className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                      >
                        {company.contactInfo.pressEmail}
                      </a>
                    </div>
                  )}
                  {company.contactInfo.investorRelations && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Investor Relations</h3>
                      {company.contactInfo.investorRelations.includes('@') ? (
                        <a
                          href={`mailto:${company.contactInfo.investorRelations}`}
                          className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                        >
                          {company.contactInfo.investorRelations}
                        </a>
                      ) : (
                        <a
                          href={company.contactInfo.investorRelations}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-300 transition-colors font-mono break-all"
                        >
                          {company.contactInfo.investorRelations}
                        </a>
                      )}
                    </div>
                  )}
                  {company.contactInfo.phone && (
                    <div>
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Phone</h3>
                      <a
                        href={`tel:${company.contactInfo.phone.replace(/\s/g, '')}`}
                        className="text-red-400 hover:text-red-300 transition-colors font-mono"
                      >
                        {company.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {company.contactInfo.address && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Mailing Address</h3>
                      <p className="text-red-400/90 font-mono">
                        {company.contactInfo.address}
                      </p>
                    </div>
                  )}
                  {company.contactInfo.notes && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Notes</h3>
                      <p className="text-red-400/90 font-mono text-sm">
                        {company.contactInfo.notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Founders */}
            {company.founders.length > 0 && (
              <section id="founders">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Founders
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  {company.founders.map((founder, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cyber-dark border border-red-500/30 text-red-400 rounded-sm font-mono text-sm inline-flex items-center"
                    >
                      {founder}
                    </span>
                  ))}
                  {citationMap.founders && (
                    <span className="ml-2">
                      {citationMap.founders.citations.map((citation: Citation, index: number) => (
                        <CitationLink key={index} citation={citation} index={citationMap.founders.start + index - 1} />
                      ))}
                    </span>
                  )}
                </div>
                {citationMap.founders && (
                  <div className="mt-2">
                    <CitationList citations={citationMap.founders.citations} fieldName="Founders" />
                  </div>
                )}
              </section>
            )}

            {/* Products */}
            {company.products.length > 0 && (
              <section id="products">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Products & Services
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  {company.products.map((product, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-600/10 border border-red-600/30 text-red-400 rounded-sm font-mono text-sm inline-flex items-center"
                    >
                      {product}
                    </span>
                  ))}
                  {citationMap.products && (
                    <span className="ml-2">
                      {citationMap.products.citations.map((citation: Citation, index: number) => (
                        <CitationLink key={index} citation={citation} index={citationMap.products.start + index - 1} />
                      ))}
                    </span>
                  )}
                </div>
                {citationMap.products && (
                  <div className="mt-2">
                    <CitationList citations={citationMap.products.citations} fieldName="Products" />
                  </div>
                )}
              </section>
            )}

            {/* Funding */}
            {company.funding && (
              <section id="funding">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Funding
                </h2>
                <div className="text-red-400/90 font-mono">
                  {typeof company.funding === 'string' ? (
                    <p className="inline">
                      {company.funding}
                      {citationMap.funding && (
                        <span className="ml-1">
                          {citationMap.funding.citations.map((citation: Citation, index: number) => (
                            <CitationLink key={index} citation={citation} index={citationMap.funding.start + index - 1} />
                          ))}
                        </span>
                      )}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {company.funding.total && (
                        <p className="inline">
                          <strong>Total:</strong> {company.funding.total}
                          {citationMap.funding && (
                            <span className="ml-1">
                              {citationMap.funding.citations.map((citation: Citation, index: number) => (
                                <CitationLink key={index} citation={citation} index={citationMap.funding.start + index - 1} />
                              ))}
                            </span>
                          )}
                        </p>
                      )}
                      {company.funding.latestRound && (
                        <p><strong>Latest Round:</strong> {company.funding.latestRound}</p>
                      )}
                      {company.funding.investors && company.funding.investors.length > 0 && (
                        <div>
                          <p><strong>Investors:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {await Promise.all(
                              company.funding.investors.map(async (investor, index) => {
                                const investorCompany = await getCompanyByName(investor)
                                if (investorCompany) {
                                  return (
                                    <li key={index}>
                                      <Link
                                        href={`/companies/${investorCompany.slug || investorCompany.id}`}
                                        className="text-red-400 hover:text-red-300 transition-colors font-mono underline"
                                      >
                                        {investor}
                                      </Link>
                                    </li>
                                  )
                                }
                                return (
                                  <li key={index} className="text-red-400/90 font-mono">
                                    {investor}
                                  </li>
                                )
                              })
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {citationMap.funding && (
                  <div className="mt-2">
                    <CitationList citations={citationMap.funding.citations} fieldName="Funding" />
                  </div>
                )}
              </section>
            )}

            {/* Layoffs */}
            {company.layoffs && company.layoffs.length > 0 && (
              <section id="layoffs">
                <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono uppercase tracking-wider">
                  &gt; Layoffs
                </h2>
                <div className="space-y-3">
                  {company.layoffs.map((layoff, index) => (
                    <div
                      key={index}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <time className="font-bold text-red-400 font-mono" dateTime={layoff.date}>{layoff.date}</time>
                        {(layoff.count || layoff.percentage) && (
                          <p className="text-red-300 font-mono text-sm">
                            {layoff.count ? `${layoff.count} employees` : ''}
                            {layoff.count && layoff.percentage ? ' • ' : ''}
                            {layoff.percentage ? `${layoff.percentage}` : ''}
                          </p>
                        )}
                      </div>
                      {layoff.reason && (
                        <p className="text-red-200/80 font-mono text-sm mb-2">{layoff.reason}</p>
                      )}
                      {layoff.source && (
                        <a
                          href={layoff.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-300 hover:text-red-200 text-xs font-mono underline"
                        >
                          Source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Controversies */}
            {company.controversies && Array.isArray(company.controversies) && company.controversies.length > 0 && (
              <section id="controversies">
                <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono uppercase tracking-wider">
                  &gt; Controversies
                </h2>
                <div className="space-y-3">
                  {company.controversies.map((controversy, index) => {
                    const citationInfo = controversyCitationMap[index]
                    return (
                      <div
                        key={index}
                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          {controversy.date && (
                            <time className="font-bold text-red-400 font-mono" dateTime={controversy.date}>
                              {controversy.date}
                            </time>
                          )}
                        </div>
                        <p className="text-red-200/90 font-mono leading-relaxed inline">
                          {controversy.text}
                          {citationInfo && citationInfo.citations.length > 0 && (
                            <span className="ml-1">
                              {citationInfo.citations.map((citation: Citation, citIndex: number) => (
                                <CitationLink 
                                  key={citIndex} 
                                  citation={citation} 
                                  index={citationInfo.start + citIndex - 1} 
                                />
                              ))}
                            </span>
                          )}
                        </p>
                        {citationInfo && citationInfo.citations.length > 0 && (
                          <div className="mt-2">
                            <CitationList 
                              citations={citationInfo.citations} 
                              fieldName={`Controversy ${index + 1}`} 
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Direct Action */}
            {company.directAction && company.directAction.length > 0 && (
              <section id="direct-action">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Direct Action
                </h2>
                <div className="space-y-3">
                  {company.directAction.map((action, index) => {
                    const typeColors: Record<string, string> = {
                      petition: 'bg-red-500/20 border-red-500/40',
                      boycott: 'bg-red-600/20 border-red-600/40',
                      protest: 'bg-red-700/20 border-red-700/40',
                      organizing: 'bg-red-500/20 border-red-500/40',
                      legal: 'bg-red-600/20 border-red-600/40',
                      other: 'bg-red-500/10 border-red-500/30',
                    }
                    const typeColor = typeColors[action.type] || typeColors.other
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 border rounded-sm ${typeColor}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <a
                              href={action.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-400 hover:text-red-300 font-mono font-bold text-lg transition-colors inline-block"
                            >
                              {action.title}
                            </a>
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-sm bg-red-500/30 text-red-300 border border-red-500/50 font-mono uppercase">
                              {action.type}
                            </span>
                            {action.status === 'active' && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-sm bg-green-500/20 text-green-400 border border-green-500/50 font-mono uppercase">
                                Active
                              </span>
                            )}
                            {action.status === 'completed' && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-sm bg-gray-500/20 text-gray-400 border border-gray-500/50 font-mono uppercase">
                                Completed
                              </span>
                            )}
                          </div>
                          {action.date && (
                            <time className="text-red-400/60 font-mono text-sm" dateTime={action.date}>
                              {action.date}
                            </time>
                          )}
                        </div>
                        {action.description && (
                          <p className="text-red-200/80 font-mono text-sm mb-2">{action.description}</p>
                        )}
                        <a
                          href={action.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-300 hover:text-red-200 text-xs font-mono underline inline-block"
                        >
                          Take Action →
                        </a>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Union & Labor */}
            {(company.unionInfo || company.employeeCount) && (
              <section id="union-labor">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Union & Labor
                </h2>
                <div className="space-y-4">
                  {/* Employee Count */}
                  {company.employeeCount && (
                    <div className="p-4 bg-cyber-dark border border-red-500/30 rounded-sm">
                      <h3 className="text-sm font-bold text-red-400/60 mb-2 font-mono uppercase">Employee Count</h3>
                      <p className="text-red-400/90 font-mono text-lg font-bold">
                        {company.employeeCount.toLocaleString()} employees
                      </p>
                    </div>
                  )}

                  {/* Union Status */}
                  {company.unionInfo && (
                    <div className="space-y-4">
                      {/* Union Status Badge */}
                      <div className="p-4 bg-cyber-dark border border-red-500/30 rounded-sm">
                        <h3 className="text-sm font-bold text-red-400/60 mb-2 font-mono uppercase">Union Status</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 text-sm font-bold rounded-sm font-mono uppercase ${
                            company.unionInfo.status === 'unionized' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                              : company.unionInfo.status === 'organizing'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                              : company.unionInfo.status === 'non-union'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                          }`}>
                            {company.unionInfo.status === 'unionized' ? '✓ Unionized' :
                             company.unionInfo.status === 'organizing' ? '⚡ Organizing' :
                             company.unionInfo.status === 'non-union' ? '✗ Non-Union' :
                             'Unknown'}
                          </span>
                        </div>
                        {company.unionInfo.union && (
                          <div className="mt-3">
                            <p className="text-red-400/90 font-mono font-bold">
                              {company.unionInfo.union.name}
                            </p>
                            {company.unionInfo.union.description && (
                              <p className="text-red-300/70 font-mono text-sm mt-1">
                                {company.unionInfo.union.description}
                              </p>
                            )}
                            {company.unionInfo.union.url && (
                              <a
                                href={company.unionInfo.union.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 hover:text-red-300 text-sm font-mono underline mt-2 inline-block"
                              >
                                Visit Union Website →
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Organizing Efforts */}
                      {company.unionInfo.organizingEfforts && company.unionInfo.organizingEfforts.length > 0 && (
                        <div className="p-4 bg-cyber-dark border border-red-500/30 rounded-sm">
                          <h3 className="text-sm font-bold text-red-400/60 mb-3 font-mono uppercase">Organizing Efforts</h3>
                          <div className="space-y-3">
                            {company.unionInfo.organizingEfforts.map((effort, index) => (
                              <div key={index} className="border-l-2 border-red-500/50 pl-3">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    <p className="text-red-400/90 font-mono font-bold">{effort.description}</p>
                                    {effort.union && (
                                      <p className="text-red-300/70 font-mono text-sm mt-1">Union: {effort.union}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {effort.date && (
                                      <time className="text-red-400/60 font-mono text-xs" dateTime={effort.date}>
                                        {effort.date}
                                      </time>
                                    )}
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-sm font-mono uppercase ${
                                      effort.status === 'active'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                        : effort.status === 'completed'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                                    }`}>
                                      {effort.status}
                                    </span>
                                  </div>
                                </div>
                                {effort.url && (
                                  <a
                                    href={effort.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-400 hover:text-red-300 text-xs font-mono underline mt-1 inline-block"
                                  >
                                    Learn More →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Labor Violations */}
                      {company.unionInfo.laborViolations && company.unionInfo.laborViolations.length > 0 && (
                        <div className="p-4 bg-cyber-dark border border-red-500/30 rounded-sm">
                          <h3 className="text-sm font-bold text-red-400/60 mb-3 font-mono uppercase">Labor Violations</h3>
                          <div className="space-y-3">
                            {company.unionInfo.laborViolations.map((violation, index) => {
                              const violationTypeColors: Record<string, string> = {
                                'strike': 'bg-red-600/20 border-red-600/40',
                                'walkout': 'bg-red-500/20 border-red-500/40',
                                'unfair-labor-practice': 'bg-orange-500/20 border-orange-500/40',
                                'wage-theft': 'bg-yellow-500/20 border-yellow-500/40',
                                'safety-violation': 'bg-red-700/20 border-red-700/40',
                                'discrimination': 'bg-purple-500/20 border-purple-500/40',
                                'retaliation': 'bg-red-600/20 border-red-600/40',
                                'other': 'bg-red-500/10 border-red-500/30',
                              }
                              const typeColor = violationTypeColors[violation.type] || violationTypeColors.other
                              
                              return (
                                <div key={index} className={`p-3 border rounded-sm ${typeColor}`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-red-500/30 text-red-300 border border-red-500/50 font-mono uppercase mr-2">
                                        {violation.type.replace('-', ' ')}
                                      </span>
                                      {violation.agency && (
                                        <span className="text-red-300/70 font-mono text-xs">
                                          {violation.agency}
                                        </span>
                                      )}
                                    </div>
                                    {violation.date && (
                                      <time className="text-red-400/60 font-mono text-xs" dateTime={violation.date}>
                                        {violation.date}
                                      </time>
                                    )}
                                  </div>
                                  <p className="text-red-200/80 font-mono text-sm mb-2">{violation.description}</p>
                                  {violation.status && (
                                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm font-mono uppercase mr-2 ${
                                      violation.status === 'pending'
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                        : violation.status === 'resolved'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                    }`}>
                                      {violation.status}
                                    </span>
                                  )}
                                  {violation.url && (
                                    <a
                                      href={violation.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-red-300 hover:text-red-200 text-xs font-mono underline inline-block"
                                    >
                                      View Details →
                                    </a>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Office Locations */}
            {company.locations && company.locations.length > 0 && (
              <section id="locations">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Office Locations
                </h2>
                <div className="space-y-3">
                  {company.locations.map((location, index) => {
                    const locationParts = [
                      location.address,
                      location.city,
                      location.state,
                      location.country,
                    ].filter(Boolean)
                    const locationString = locationParts.join(', ')
                    
                    return (
                      <div
                        key={index}
                        className="p-4 bg-cyber-dark border border-red-500/30 rounded-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-2 py-1 text-xs font-bold rounded-sm bg-red-500/20 text-red-400 border border-red-500/50 font-mono uppercase">
                            {location.type === 'headquarters' ? 'HQ' : location.type.replace('-', ' ')}
                          </span>
                          {location.coordinates && (
                            <a
                              href={`https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-300 hover:text-red-200 text-xs font-mono underline"
                            >
                              Map
                            </a>
                          )}
                        </div>
                        <p className="text-red-400/90 font-mono">
                          {locationString || location.country}
                        </p>
                        {location.notes && (
                          <p className="text-red-400/60 font-mono text-sm mt-1">{location.notes}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Data Centers */}
            {company.dataCenters && company.dataCenters.length > 0 && (
              <section id="datacenters">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                  &gt; Data Centers
                </h2>
                <div className="space-y-4">
                  {company.dataCenters.map((dataCenter) => {
                    // Check if this company owns this data center
                    const isOwner = dataCenter.owner?.id === company.id
                    return (
                      <DataCenterCard
                        key={dataCenter.id}
                        dataCenter={dataCenter}
                        isOwner={isOwner}
                        userConfidence={dataCenter.userConfidence}
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {/* Tags */}
            <section id="tags">
              <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                &gt; Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-sm font-mono text-sm"
                  >
                    {tag.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </section>
          </article>
        </main>
      </div>
    </>
  )
}
