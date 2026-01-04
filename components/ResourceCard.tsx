'use client'

import { Resource } from '@/types/resource'
import Link from 'next/link'
import ReportButton from './ReportButton'

interface ResourceCardProps {
  resource: Resource
}

const categoryColors: Record<Resource['category'], string> = {
  tool: 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/40 terminal-glow',
  website: 'bg-cyber-magenta/10 text-cyber-magenta border border-cyber-magenta/40 terminal-glow',
  article: 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/40 terminal-glow',
  community: 'bg-cyber-green/10 text-cyber-green border border-cyber-green/40 terminal-glow',
  service: 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/40 terminal-glow',
  extension: 'bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/40 terminal-glow',
  other: 'bg-cyber-dark text-cyber-cyan/60 border border-cyber-cyan/30',
}

const categoryLabels: Record<Resource['category'], string> = {
  tool: 'Tool',
  website: 'Website',
  article: 'Article',
  community: 'Community',
  service: 'Service',
  extension: 'Extension',
  other: 'Other',
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="block group"
    >
      <div className="h-full p-4 md:p-6 bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border hover:border-cyber-cyan/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-200 relative group">
        <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
          <ReportButton
            type="resource"
            targetId={resource.id}
            targetName={resource.title}
          />
        </div>
        {resource.featured && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-sm bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 font-mono uppercase terminal-glow">
              Featured
            </span>
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-cyber-cyan group-hover:text-cyber-magenta transition-colors font-mono group-hover:neon-cyan">
            &gt; {resource.title}
          </h3>
        </div>
        <p className="text-cyber-cyan/70 mb-4 line-clamp-3 font-mono text-sm">
          {resource.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold font-mono uppercase ${categoryColors[resource.category]}`}>
            {categoryLabels[resource.category]}
          </span>
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-cyber-dark text-cyber-cyan/60 border border-cyber-cyan/30 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}


