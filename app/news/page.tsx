'use client'

import { useState, useEffect } from 'react'
import { NewsArticle } from '@/types/news'
import NewsCard from '@/components/NewsCard'
import Link from 'next/link'

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchNews()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      setArticles(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Trigger fetch from sources
    try {
      await fetch('/api/news/fetch', { method: 'POST' })
      // Wait a bit for processing, then fetch articles
      setTimeout(fetchNews, 2000)
    } catch (error) {
      console.error('Error refreshing news:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 terminal-glow">
                AI News Feed
              </h1>
              <p className="text-cyber-cyan/70 text-sm md:text-base">
                Latest headlines about AI companies, layoffs, and industry news
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-cyber-cyan/50 font-mono">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60 transition-all font-mono font-bold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-cyber-cyan/60">
            <Link href="/" className="hover:text-cyber-cyan transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>News</span>
          </div>
        </div>

        {/* News Grid */}
        {loading && articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse text-cyber-cyan/50 font-mono">
              Loading news feed...
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyber-cyan/50 mb-4">No news articles found.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 transition-all font-mono text-sm"
            >
              Fetch News
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-cyber-cyan/60 font-mono">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
