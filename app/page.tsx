'use client'

import { useState, useMemo, useEffect } from 'react'
import { Resource, ResourceCategory } from '@/types/resource'
import ResourceCard from '@/components/ResourceCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import Link from 'next/link'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources')
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = useMemo(() => {
    return resources.filter((resource: Resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, resources])

  const featuredResources = filteredResources.filter((r) => r.featured)
  const regularResources = filteredResources.filter((r) => !r.featured)

  return (
    <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="bg-cyber-dark border-b border-cyber-cyan/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-bold neon-cyan mb-2 font-mono tracking-wider glitch-text" data-text="BUTlerian JIhad">
              BUTlerian JIhad
              </h1>
              <p className="text-lg text-cyber-cyan/80 font-mono">
                &gt; A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.
              </p>
            </div>
            <div className="flex gap-4">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-cyber-cyan/60 font-mono">
                &gt; {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
              </p>
            </div>

            {/* Featured Resources */}
            {featuredResources.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold neon-cyan mb-6 font-mono uppercase tracking-wider">
                  &gt; Featured Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            )}

            {/* All Resources */}
            {regularResources.length > 0 && (
              <div>
                {featuredResources.length > 0 && (
                  <h2 className="text-2xl font-bold neon-cyan mb-6 font-mono uppercase tracking-wider">
                    &gt; All Resources
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-cyber-cyan/70 text-lg font-mono">
                  &gt; No resources found matching your criteria.
                </p>
                <p className="text-cyber-cyan/50 text-sm mt-2 font-mono">
                  &gt; Try adjusting your search or filters.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-cyber-dark border-t border-cyber-cyan/40 mt-16 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-cyber-cyan/60 text-sm font-mono">
            &gt; Butji.com - Organizing the effort against the machines
          </p>
        </div>
      </footer>
    </div>
  )
}


