export interface NewsSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'api'
  enabled: boolean
  lastFetched?: string
  createdAt?: string
  updatedAt?: string
}

export interface NewsArticle {
  id: string
  title: string
  description?: string
  url: string
  source: string
  sourceUrl?: string
  imageUrl?: string
  publishedAt: string
  fetchedAt?: string
  tags?: string[]
  featured?: boolean
  approved?: boolean
}
