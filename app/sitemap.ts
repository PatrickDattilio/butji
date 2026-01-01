import { MetadataRoute } from 'next'
import { getApprovedResources } from '@/lib/resources'
import { getAllCompanies } from '@/lib/companies'
import { getAllNewsArticles } from '@/lib/news'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/manifesto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Resource pages (if we create detail pages)
  const resources = await getApprovedResources()
  const resourcePages: MetadataRoute.Sitemap = resources.slice(0, 100).map((resource) => ({
    url: `${baseUrl}/resources/${resource.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Company pages (if detail pages exist)
  const companies = await getAllCompanies()
  const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${baseUrl}/companies/${company.id}`,
    lastModified: company.updatedAt ? new Date(company.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // News articles
  const newsArticles = await getAllNewsArticles(100)
  const newsPages: MetadataRoute.Sitemap = newsArticles.map((article) => ({
    url: `${baseUrl}/news/${article.id}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'never' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...resourcePages, ...companyPages, ...newsPages]
}
