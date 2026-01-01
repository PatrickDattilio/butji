'use client'

import { useState, useMemo } from 'react'
import { Company, CompanyTag } from '@/types/company'
import CompanyCard from '@/components/CompanyCard'
import SearchBar from '@/components/SearchBar'

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

interface CompanyListProps {
  companies: Company[]
}

export default function CompanyList({ companies: initialCompanies }: CompanyListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<Set<CompanyTag>>(new Set())

  const filteredCompanies = useMemo(() => {
    return initialCompanies.filter((company: Company) => {
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
  }, [searchQuery, selectedTags, initialCompanies])

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
  )
}
