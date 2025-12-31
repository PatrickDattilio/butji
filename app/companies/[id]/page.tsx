'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Company } from '@/types/company'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const params = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCompany(params.id as string)
    }
  }, [params.id])

  const fetchCompany = async (id: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
      }
    } catch (error) {
      console.error('Error fetching company:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-darker relative flex items-center justify-center">
        <p className="text-red-400 font-mono">&gt; Loading...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-cyber-darker relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-red-400/70 text-lg font-mono">
            &gt; Company not found.
          </p>
          <Link
            href="/companies"
            className="mt-4 inline-block px-4 py-2 bg-cyber-dark border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500/10 transition-all font-mono uppercase text-sm"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.03) 2px, rgba(239, 68, 68, 0.03) 4px)'
        }}></div>
      </div>
      
      <header className="bg-cyber-dark border-b border-red-500/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/companies"
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-400/80 font-mono mb-4 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
            <span>Back to Companies</span>
          </Link>
          <h1 className="text-5xl font-bold text-red-500 mb-2 font-mono uppercase tracking-wider glitch-text" data-text={company.name}>
            {company.name}
          </h1>
          {company.featured && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-sm bg-red-500/20 text-red-400 border border-red-500/50 font-mono uppercase terminal-glow">
              Featured
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-cyber-dark rounded-sm border border-red-500/30 cyber-border p-8 terminal-glow space-y-6">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
              &gt; About
            </h2>
            <p className="text-red-400/90 font-mono leading-relaxed">
              {company.description}
            </p>
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
                <p className="text-red-400/90 font-mono">{company.ceo}</p>
              </div>
            )}
            {company.foundedYear && (
              <div>
                <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Founded</h3>
                <p className="text-red-400/90 font-mono">{company.foundedYear}</p>
              </div>
            )}
            {company.valuation && (
              <div>
                <h3 className="text-sm font-bold text-red-400/60 mb-1 font-mono uppercase">Valuation</h3>
                <p className="text-red-400/90 font-mono">{company.valuation}</p>
              </div>
            )}
          </section>

          {/* Founders */}
          {company.founders.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                &gt; Founders
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.founders.map((founder, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyber-dark border border-red-500/30 text-red-400 rounded-sm font-mono text-sm"
                  >
                    {founder}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Products */}
          {company.products.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase tracking-wider">
                &gt; Products & Services
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.products.map((product, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/10 border border-red-600/30 text-red-400 rounded-sm font-mono text-sm"
                  >
                    {product}
                  </span>
                ))}
              </div>
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
                  <p>{company.funding}</p>
                ) : (
                  <div className="space-y-2">
                    {company.funding.total && (
                      <p><strong>Total:</strong> {company.funding.total}</p>
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
                      <p className="font-bold text-red-400 font-mono">{layoff.date}</p>
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
          {company.controversies && (
            <section>
              <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono uppercase tracking-wider">
                &gt; Controversies
              </h2>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
                <p className="text-red-200/90 font-mono leading-relaxed whitespace-pre-line">
                  {company.controversies}
                </p>
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
        </div>
      </main>
    </div>
  )
}
