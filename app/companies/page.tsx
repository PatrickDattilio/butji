'use client'

import { useState, useMemo, useEffect } from 'react'
import { Company, CompanyTag } from '@/types/company'
import CompanyCard from '@/components/CompanyCard'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

const allTags: CompanyTag[] = [
  'llm',
  'image-generation',
  'code-generation',
  'chatbot',
  'automation',
  'surveillance',
  'data-scraping',
  'layoffs',
  'controversy',
  'billionaire-owned',
  'major-player',
]

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<Set<CompanyTag>>(new Set())
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = useMemo(() => {
    return companies.filter((company: Company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ceo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.founders.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
        company.products.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTags = selectedTags.size === 0 || 
        company.tags.some((tag) => selectedTags.has(tag))

      return matchesSearch && matchesTags
    })
  }, [searchQuery, selectedTags, companies])

  const toggleTag = (tag: CompanyTag) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setSelectedTags(newTags)
  }

  const featuredCompanies = filteredCompanies.filter((c) => c.featured)
  const regularCompanies = filteredCompanies.filter((c) => !c.featured)

  return (
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
        {loading ? (
          <div className="text-center py-12">
            <p className="text-red-400/60 font-mono">&gt; Loading companies...</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="&gt; Search companies..." />
              
              {/* Tag Filter */}
              <div>
                <p className="text-sm text-red-400/60 font-mono mb-2">
                  &gt; Filter by tags:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-sm text-xs font-bold transition-all font-mono uppercase ${
                        selectedTags.has(tag)
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50 terminal-glow'
                          : 'bg-cyber-dark text-red-400/60 border border-red-500/30 hover:border-red-500/50 hover:text-red-400'
                      }`}
                    >
                      {tag.replace('-', ' ')}
                    </button>
                  ))}
                  {selectedTags.size > 0 && (
                    <button
                      onClick={() => setSelectedTags(new Set())}
                      className="px-3 py-1 rounded-sm text-xs font-bold bg-cyber-dark text-red-400/60 border border-red-500/30 hover:border-red-500/50 hover:text-red-400 font-mono uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-red-400/60 font-mono">
                &gt; {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
              </p>
            </div>

            {/* Featured Companies */}
            {featuredCompanies.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-red-500 mb-6 font-mono uppercase tracking-wider">
                  &gt; Featured Companies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </div>
            )}

            {/* All Companies */}
            {regularCompanies.length > 0 && (
              <div>
                {featuredCompanies.length > 0 && (
                  <h2 className="text-2xl font-bold text-red-500 mb-6 font-mono uppercase tracking-wider">
                    &gt; All Companies
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-red-400/70 text-lg font-mono">
                  &gt; No companies found matching your criteria.
                </p>
                <p className="text-red-400/50 text-sm mt-2 font-mono">
                  &gt; Try adjusting your search or filters.
                </p>
              </div>
            )}
          </>
        )}
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
  )
}
