import { NewsArticle, NewsSource } from '@/types/news'
import { prisma } from './prisma'

export async function getAllNewsArticles(limit?: number): Promise<NewsArticle[]> {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { approved: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || undefined,
      url: a.url,
      source: a.source,
      sourceUrl: a.sourceUrl || undefined,
      imageUrl: a.imageUrl || undefined,
      publishedAt: a.publishedAt.toISOString(),
      fetchedAt: a.fetchedAt.toISOString(),
      tags: a.tags ? (JSON.parse(a.tags) as string[]) : undefined,
      featured: a.featured,
      approved: a.approved,
    }))
  } catch (error) {
    console.error('Error fetching news articles:', error)
    return []
  }
}

export async function getNewsSources(): Promise<NewsSource[]> {
  try {
    const sources = await prisma.newsSource.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' },
    })

    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      type: s.type as 'rss' | 'api',
      enabled: s.enabled,
      lastFetched: s.lastFetched?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching news sources:', error)
    return []
  }
}

export async function createNewsArticle(article: Omit<NewsArticle, 'id' | 'fetchedAt'>): Promise<NewsArticle> {
  const created = await prisma.newsArticle.create({
    data: {
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source,
      sourceUrl: article.sourceUrl,
      imageUrl: article.imageUrl,
      publishedAt: new Date(article.publishedAt),
      tags: article.tags ? JSON.stringify(article.tags) : null,
      featured: article.featured || false,
      approved: article.approved !== false,
    },
  })

  return {
    id: created.id,
    title: created.title,
    description: created.description || undefined,
    url: created.url,
    source: created.source,
    sourceUrl: created.sourceUrl || undefined,
    imageUrl: created.imageUrl || undefined,
    publishedAt: created.publishedAt.toISOString(),
    fetchedAt: created.fetchedAt.toISOString(),
    tags: created.tags ? (JSON.parse(created.tags) as string[]) : undefined,
    featured: created.featured,
    approved: created.approved,
  }
}

export async function createNewsSource(source: Omit<NewsSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsSource> {
  const created = await prisma.newsSource.create({
    data: {
      name: source.name,
      url: source.url,
      type: source.type,
      enabled: source.enabled,
    },
  })

  return {
    id: created.id,
    name: created.name,
    url: created.url,
    type: created.type as 'rss' | 'api',
    enabled: created.enabled,
    lastFetched: created.lastFetched?.toISOString(),
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  }
}

export async function updateNewsSourceLastFetched(id: string): Promise<void> {
  await prisma.newsSource.update({
    where: { id },
    data: { lastFetched: new Date() },
  })
}

export async function checkArticleExists(url: string): Promise<boolean> {
  const existing = await prisma.newsArticle.findFirst({
    where: { url },
  })
  return !!existing
}
