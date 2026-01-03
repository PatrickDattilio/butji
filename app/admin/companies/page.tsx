'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Company, CompanyTag } from '@/types/company'
import Link from 'next/link'

const availableTags: { value: CompanyTag; label: string }[] = [
  { value: 'llm', label: 'LLM' },
  { value: 'image-generation', label: 'Image Generation' },
  { value: 'code-generation', label: 'Code Generation' },
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'automation', label: 'Automation' },
  { value: 'surveillance', label: 'Surveillance' },
  { value: 'data-scraping', label: 'Data Scraping' },
  { value: 'layoffs', label: 'Layoffs' },
  { value: 'controversy', label: 'Controversy' },
  { value: 'billionaire-owned', label: 'Billionaire Owned' },
  { value: 'major-player', label: 'Major Player' },
]

export default function AdminCompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Company> & {
    founders?: string[] | string
    products?: string[] | string
  }>({
    name: '',
    description: '',
    website: '',
    logoUrl: '',
    founders: [],
    ceo: '',
    foundedYear: undefined,
    funding: '',
    valuation: '',
    products: [],
    controversies: '',
    layoffs: [],
    tags: [],
    featured: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCompanies()
    }
  }, [session])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companies')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch companies')
      }
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      logoUrl: '',
      founders: [],
      ceo: '',
      foundedYear: undefined,
      funding: '',
      valuation: '',
      products: [],
      controversies: '',
      layoffs: [],
      tags: [],
      featured: false,
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/companies/${editingId}` : '/api/companies'
      const method = editingId ? 'PATCH' : 'POST'

      // Helper to convert founders/products to array
      const getArrayFromValue = (value: string[] | string | undefined): string[] => {
        if (Array.isArray(value)) {
          return value
        }
        if (typeof value === 'string') {
          return value.split(',').map(v => v.trim()).filter(Boolean)
        }
        return []
      }
      
      const foundersArray = getArrayFromValue(formData.founders)
      const productsArray = getArrayFromValue(formData.products)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          founders: foundersArray,
          products: productsArray,
        }),
      })

      if (response.ok) {
        resetForm()
        fetchCompanies()
      }
    } catch (error) {
      console.error('Error saving company:', error)
      alert('Failed to save company')
    }
  }

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name,
      description: company.description,
      website: company.website || '',
      logoUrl: company.logoUrl || '',
      founders: company.founders,
      ceo: company.ceo || '',
      foundedYear: company.foundedYear,
      funding: typeof company.funding === 'string' ? company.funding : JSON.stringify(company.funding),
      valuation: company.valuation || '',
      products: company.products,
      controversies: company.controversies || '',
      layoffs: company.layoffs || [],
      tags: company.tags,
      featured: company.featured || false,
    })
    setEditingId(company.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return

    try {
      const response = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchCompanies()
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company')
    }
  }

  const toggleTag = (tag: CompanyTag) => {
    const currentTags = formData.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    setFormData({ ...formData, tags: newTags })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cyber-darker relative flex items-center justify-center">
        <p className="text-red-400 font-mono">&gt; Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-cyber-darker relative">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.03) 2px, rgba(239, 68, 68, 0.03) 4px)'
        }}></div>
      </div>
      
      <header className="bg-cyber-dark border-b border-red-500/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-red-500 mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Manage Companies">
                Manage Companies
              </h1>
              <p className="text-lg text-red-400/80 font-mono">
                &gt; Add, edit, and manage AI company profiles
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-mono uppercase text-sm border border-red-500/40 rounded-sm hover:border-red-500/80 terminal-glow"
              >
                ← Submissions
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-mono uppercase text-sm border border-red-500/40 rounded-sm hover:border-red-500/80 terminal-glow"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm()
              setShowAddForm(!showAddForm)
            }}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-sm hover:opacity-90 transition-opacity font-mono font-bold uppercase text-sm border border-red-500/60"
          >
            {showAddForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-8 bg-cyber-dark border border-red-500/30 cyber-border p-6 terminal-glow space-y-4">
            <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono uppercase">
              {editingId ? 'Edit Company' : 'Add New Company'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Logo URL</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                  placeholder="https://example.com/logo.png or /logos/company.svg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">CEO</label>
                <input
                  type="text"
                  value={formData.ceo}
                  onChange={(e) => setFormData({ ...formData, ceo: e.target.value })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Founded Year</label>
                <input
                  type="number"
                  value={formData.foundedYear || ''}
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Valuation</label>
                <input
                  type="text"
                  value={formData.valuation}
                  onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                  placeholder="e.g., $100B"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Funding</label>
                <input
                  type="text"
                  value={typeof formData.funding === 'string' ? formData.funding : JSON.stringify(formData.funding)}
                  onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                  className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                  placeholder="e.g., $10B total"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Founders (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.founders) ? formData.founders.join(', ') : formData.founders}
                onChange={(e) => setFormData({ ...formData, founders: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                placeholder="e.g., Elon Musk, Sam Altman"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Products (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.products) ? formData.products.join(', ') : formData.products}
                onChange={(e) => setFormData({ ...formData, products: e.target.value.split(',').map(p => p.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                placeholder="e.g., ChatGPT, GPT-4, DALL-E"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-400 mb-1 font-mono uppercase">Controversies</label>
              <textarea
                value={formData.controversies}
                onChange={(e) => setFormData({ ...formData, controversies: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 focus:outline-none focus:border-red-500/80 font-mono"
                placeholder="List controversies, data scraping incidents, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`px-3 py-1 rounded-sm text-sm font-bold transition-all font-mono uppercase ${
                      formData.tags?.includes(tag.value)
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 terminal-glow'
                        : 'bg-cyber-dark text-red-400/60 border border-red-500/30 hover:border-red-500/50'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-red-400 font-mono uppercase">Featured</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-sm hover:opacity-90 transition-opacity font-mono font-bold uppercase text-sm border border-red-500/60"
              >
                {editingId ? 'Update Company' : 'Create Company'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-cyber-dark border border-red-500/40 text-red-400/70 rounded-sm hover:bg-red-500/10 transition-colors font-mono font-bold uppercase text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-red-400/60 font-mono">&gt; Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-red-400/60 font-mono">&gt; No companies found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-cyber-dark rounded-sm border border-red-500/30 cyber-border p-6 terminal-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-400 font-mono mb-2">
                      &gt; {company.name}
                    </h3>
                    <p className="text-red-400/70 font-mono text-sm mb-3">
                      {company.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {company.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-sm text-xs font-medium bg-cyber-dark text-red-400/60 border border-red-500/30 font-mono"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-red-400/60 font-mono space-y-1">
                      {company.ceo && <p>CEO: {company.ceo}</p>}
                      {company.foundedYear && <p>Founded: {company.foundedYear}</p>}
                      {company.valuation && <p>Valuation: {company.valuation}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-red-500/40">
                  <button
                    onClick={() => handleEdit(company)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-sm hover:opacity-90 transition-opacity font-mono font-bold uppercase text-sm border border-red-500/60"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/40 rounded-sm hover:bg-red-500/30 transition-colors font-mono font-bold uppercase text-sm"
                  >
                    Delete
                  </button>
                  <Link
                    href={`/companies/${company.id}`}
                    className="px-4 py-2 bg-cyber-dark border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500/10 transition-colors font-mono font-bold uppercase text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
