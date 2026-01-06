'use client'

import { Company } from '@/types/company'
import Link from 'next/link'
import ReportButton from './ReportButton'

interface CompanyCardProps {
  company: Company
}

const tagColors: Record<Company['tags'][number], string> = {
  'llm': 'bg-red-500/10 text-red-400 border border-red-500/40',
  'image-generation': 'bg-red-600/10 text-red-500 border border-red-600/40',
  'code-generation': 'bg-red-500/10 text-red-400 border border-red-500/40',
  'chatbot': 'bg-red-500/10 text-red-400 border border-red-500/40',
  'automation': 'bg-red-600/10 text-red-500 border border-red-600/40',
  'surveillance': 'bg-red-700/20 text-red-400 border border-red-700/50',
  'data-scraping': 'bg-red-600/20 text-red-500 border border-red-600/50',
  'layoffs': 'bg-red-700/20 text-red-400 border border-red-700/50',
  'controversy': 'bg-red-700/30 text-red-300 border border-red-700/60',
  'billionaire-owned': 'bg-red-800/30 text-red-300 border border-red-800/60',
  'major-player': 'bg-red-700/20 text-red-400 border border-red-700/50',
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      href={`/companies/${company.slug || company.id}`}
      className="block group"
    >
      <div className="h-full p-6 bg-cyber-dark rounded-sm border border-red-500/30 cyber-border hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200 relative group">
        <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
          <ReportButton
            type="company"
            targetId={company.id}
            targetName={company.name}
          />
        </div>
        {company.featured && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-sm bg-red-500/20 text-red-400 border border-red-500/50 font-mono uppercase terminal-glow">
              Featured
            </span>
          </div>
        )}
        <div className="flex items-start justify-between mb-3 gap-3">
          {company.logoUrl && (
            <div className="flex-shrink-0">
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="w-12 h-12 object-contain rounded-sm border border-red-500/30 bg-cyber-darker/50 p-1"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <h3 className="text-lg font-bold text-red-400 group-hover:text-red-300 transition-colors font-mono flex-1">
            &gt; {company.name}
          </h3>
        </div>
        <p className="text-red-400/70 mb-4 line-clamp-3 font-mono text-sm">
          {company.description}
        </p>
        <div className="space-y-2 mb-4">
          {company.ceo && (
            <p className="text-xs text-red-400/60 font-mono">
              CEO: {company.ceo}
            </p>
          )}
          {company.foundedYear && (
            <p className="text-xs text-red-400/60 font-mono">
              Founded: {company.foundedYear}
            </p>
          )}
          {company.valuation && (
            <p className="text-xs text-red-400/60 font-mono">
              Valuation: {company.valuation}
            </p>
          )}
          {company.locations && company.locations.length > 0 && (
            <div className="text-xs text-red-400/60 font-mono">
              <p className="mb-1">Locations:</p>
              {company.locations
                .filter(loc => loc.type === 'headquarters')
                .map((loc, idx) => (
                  <p key={idx} className="pl-2">
                    HQ: {[loc.city, loc.state, loc.country].filter(Boolean).join(', ')}
                  </p>
                ))}
              {company.locations.filter(loc => loc.type === 'office').length > 0 && (
                <p className="pl-2 text-red-400/50">
                  +{company.locations.filter(loc => loc.type === 'office').length} office(s)
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.isArray(company.tags) && company.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium font-mono ${tagColors[tag] || 'bg-cyber-dark text-red-400/60 border border-red-500/30'}`}
            >
              {tag.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
