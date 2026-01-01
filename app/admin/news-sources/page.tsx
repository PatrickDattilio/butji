'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NewsSource } from '@/types/news'
import Link from 'next/link'

export default function NewsSourcesAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'rss' as 'rss' | 'api',
    enabled: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fetchingSource, setFetchingSource] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSources()
    }
  }, [status, router])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/news/sources')
      const data = await response.json()
      setSources(data)
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/news/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create source')
      }

      setFormData({ name: '', url: '', type: 'rss', enabled: true })
      setIsAdding(false)
      fetchSources()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/news/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })

      if (!response.ok) {
        throw new Error('Failed to update source')
      }

      fetchSources()
    } catch (error) {
      console.error('Error toggling source:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news source?')) return

    try {
      const response = await fetch(`/api/news/sources/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete source')
      }

      fetchSources()
    } catch (error) {
      console.error('Error deleting source:', error)
    }
  }

  const handleFetchNow = async (id: string) => {
    setFetchingSource(id)
    try {
      const response = await fetch('/api/news/fetch', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      alert(`Fetched ${data.fetched} new articles, skipped ${data.skipped} duplicates`)
      fetchSources()
    } catch (error) {
      console.error('Error fetching news:', error)
      alert('Failed to fetch news')
    } finally {
      setFetchingSource(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cyber-black text-cyber-cyan flex items-center justify-center">
        <div className="text-cyber-cyan/50 font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-cyan">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold terminal-glow">News Sources</h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 transition-all font-mono text-sm"
            >
              ← Back to Admin
            </Link>
          </div>
          <p className="text-cyber-cyan/70 text-sm md:text-base">
            Manage RSS feeds and news sources for the news section
          </p>
        </div>

        {/* Add Source Form */}
        {isAdding ? (
          <div className="mb-8 bg-cyber-dark border border-cyber-cyan/20 rounded-sm p-6">
            <h2 className="text-xl font-bold mb-4">Add News Source</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-mono uppercase mb-2 text-cyber-cyan/80">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-black border border-cyber-cyan/40 text-cyber-cyan rounded-sm focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-mono uppercase mb-2 text-cyber-cyan/80">
                  RSS Feed URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-black border border-cyber-cyan/40 text-cyber-cyan rounded-sm focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan font-mono"
                  placeholder="https://example.com/feed.xml"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-mono uppercase mb-2 text-cyber-cyan/80">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'rss' | 'api' })}
                  className="w-full px-4 py-2 bg-cyber-black border border-cyber-cyan/40 text-cyber-cyan rounded-sm focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan font-mono"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="api">API (Coming Soon)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 bg-cyber-black border-cyber-cyan/40 text-cyber-cyan focus:ring-cyber-cyan"
                />
                <label htmlFor="enabled" className="text-sm font-mono uppercase text-cyber-cyan/80">
                  Enabled
                </label>
              </div>
              {error && (
                <div className="text-red-400 text-sm font-mono">{error}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan rounded-sm hover:bg-cyber-cyan/30 transition-all font-mono font-bold uppercase text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Source'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setError('')
                    setFormData({ name: '', url: '', type: 'rss', enabled: true })
                  }}
                  className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 transition-all font-mono text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mb-6 px-4 py-2 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan rounded-sm hover:bg-cyber-cyan/30 transition-all font-mono font-bold uppercase text-sm"
          >
            + Add News Source
          </button>
        )}

        {/* Sources List */}
        <div className="space-y-4">
          {sources.length === 0 ? (
            <div className="text-center py-12 text-cyber-cyan/50">
              <p className="mb-4">No news sources configured.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan rounded-sm hover:bg-cyber-cyan/30 transition-all font-mono text-sm"
              >
                Add Your First Source
              </button>
            </div>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="bg-cyber-dark border border-cyber-cyan/20 rounded-sm p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-cyber-cyan">{source.name}</h3>
                      <span className="px-2 py-1 text-xs font-mono uppercase bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan/80 rounded-sm">
                        {source.type}
                      </span>
                      {source.enabled ? (
                        <span className="px-2 py-1 text-xs font-mono uppercase bg-green-500/20 border border-green-500/40 text-green-400 rounded-sm">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-mono uppercase bg-red-500/20 border border-red-500/40 text-red-400 rounded-sm">
                          Disabled
                        </span>
                      )}
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyber-cyan/60 hover:text-cyber-cyan transition-colors break-all"
                    >
                      {source.url}
                    </a>
                    {source.lastFetched && (
                      <p className="text-xs text-cyber-cyan/50 mt-2 font-mono">
                        Last fetched: {new Date(source.lastFetched).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleFetchNow(source.id)}
                      disabled={fetchingSource === source.id}
                      className="px-3 py-1.5 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan rounded-sm hover:bg-cyber-cyan/30 transition-all font-mono text-xs uppercase disabled:opacity-50"
                    >
                      {fetchingSource === source.id ? 'Fetching...' : 'Fetch Now'}
                    </button>
                    <button
                      onClick={() => handleToggleEnabled(source.id, source.enabled)}
                      className="px-3 py-1.5 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 transition-all font-mono text-xs uppercase"
                    >
                      {source.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500/30 transition-all font-mono text-xs uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
