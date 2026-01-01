'use client'

import { useState, useMemo } from 'react'
import { Resource, ResourceCategory } from '@/types/resource'
import ResourceCard from '@/components/ResourceCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'

interface ResourceListProps {
  resources: Resource[]
}

export default function ResourceList({ resources: initialResources }: ResourceListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all')

  const filteredResources = useMemo(() => {
    return initialResources.filter((resource: Resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, initialResources])

  const featuredResources = filteredResources.filter((r) => r.featured)
  const regularResources = filteredResources.filter((r) => !r.featured)

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* Results Count */}
      <div className="mb-4 md:mb-6">
        <p className="text-xs md:text-sm text-cyber-cyan/60 font-mono">
          &gt; {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
        </p>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold neon-cyan mb-4 md:mb-6 font-mono uppercase tracking-wider">
            &gt; Featured Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            <h2 className="text-xl md:text-2xl font-bold neon-cyan mb-4 md:mb-6 font-mono uppercase tracking-wider">
              &gt; All Resources
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {regularResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <p className="text-cyber-cyan/70 text-base md:text-lg font-mono">
            &gt; No resources found matching your criteria.
          </p>
          <p className="text-cyber-cyan/50 text-xs md:text-sm mt-2 font-mono">
            &gt; Try adjusting your search or filters.
          </p>
        </div>
      )}
    </>
  )
}
