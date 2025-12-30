'use client'

import { ResourceCategory } from '@/types/resource'

const categories: { value: ResourceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tool', label: 'Tools' },
  { value: 'website', label: 'Websites' },
  { value: 'article', label: 'Articles' },
  { value: 'community', label: 'Communities' },
  { value: 'service', label: 'Services' },
  { value: 'extension', label: 'Extensions' },
  { value: 'other', label: 'Other' },
]

interface CategoryFilterProps {
  selected: ResourceCategory | 'all'
  onChange: (category: ResourceCategory | 'all') => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={`px-4 py-2 rounded-sm text-sm font-bold transition-all font-mono uppercase ${
            selected === category.value
              ? 'resistance-accent text-cyber-cyan border border-cyber-cyan/60 terminal-glow'
              : 'bg-cyber-dark text-cyber-cyan/60 border border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:text-cyber-cyan cyber-border hover:terminal-glow'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}


