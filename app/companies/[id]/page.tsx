import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompanyById } from '@/lib/companies'
import Link from 'next/link'
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'
import CitationLink from '@/components/CitationLink'
import CitationList from '@/components/CitationList'
import { Citation } from '@/types/company'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

interface CompanyPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { id } = await params
  const company = await getCompanyById(id)
  
  if (!company) {
    return {
      title: 'Company Not Found - Butji.com',
    }
  }

  return {
    title: `${company.name} - AI Company Database | Butji.com`,
    description: company.description.substring(0, 160),
    keywords: ['AI companies', company.name, ...company.tags, ...(company.products || [])].join(', '),
    openGraph: {
      title: `${company.name} - AI Company Database`,
      description: company.description.substring(0, 160),
      url: `${baseUrl}/companies/${id}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} - AI Company Database`,
      description: company.description.substring(0, 160),
    },
    alternates: {
      canonical: `${baseUrl}/companies/${id}`,
    },
  }
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { id } = await params
  const company = await getCompanyById(id)

  if (!company) {
    notFound()
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Companies', url: `${baseUrl}/companies` },
    { name: company.name, url: `${baseUrl}/companies/${id}` },
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
                <div className="flex-shrink-0">
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-sm border border-red-500/30 bg-cyber-darker/50 p-2"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-red-500 mb-2 font-mono uppercase tracking-wider glitch-text" data-text={company.name}>
                  {company.name}
                </h1>
                {company.featured && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-sm bg-red-500/20 text-red-400 border border-red-500/50 font-mono uppercase terminal-glow">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <article className="bg-cyber-dark rounded-sm border border-red-500/30 cyber-border p-8 terminal-glow space-y-6">
            {/* Description */}
            <section>
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
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Founders */}
            {company.founders.length > 0 && (
              <section>
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
              <section>
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
              <section>
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
                            {company.funding.investors.map((investor, index) => (
                              <li key={index}>{investor}</li>
                            ))}
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
              <section>
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
              <section>
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

            {/* Tags */}
            <section>
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
