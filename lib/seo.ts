// SEO utility functions for structured data and meta tags

export interface OrganizationSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  logo?: string
  sameAs?: string[]
}

export interface WebSiteSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  description?: string
  potentialAction?: {
    '@type': string
    target: {
      '@type': string
      urlTemplate: string
    }
    'query-input': string
  }
}

export interface BreadcrumbListSchema {
  '@context': string
  '@type': string
  itemListElement: {
    '@type': string
    position: number
    name: string
    item: string
  }[]
}

export interface ArticleSchema {
  '@context': string
  '@type': string
  headline: string
  description?: string
  url: string
  datePublished?: string
  dateModified?: string
  author?: {
    '@type': string
    name: string
  }
  publisher?: {
    '@type': string
    name: string
    logo?: {
      '@type': string
      url: string
    }
  }
  image?: string
}

export interface CollectionPageSchema {
  '@context': string
  '@type': string
  name: string
  description?: string
  url: string
  mainEntity?: {
    '@type': string
    '@id': string
  }
}

export function generateOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Butji - Butlerian Jihad',
    description: 'A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.',
    url: baseUrl,
    sameAs: [
      'https://discord.gg/Kv9gJFMuJ',
    ],
  }
}

export function generateWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Butji - Butlerian Jihad',
    url: baseUrl,
    description: 'A curated collection of anti-AI tools, websites, and resources.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateArticleSchema(
  headline: string,
  url: string,
  description?: string,
  datePublished?: string,
  imageUrl?: string,
  author?: string
): ArticleSchema {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    url,
    datePublished,
    dateModified: datePublished,
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: 'Butji',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    ...(imageUrl && { image: imageUrl }),
  }
}

export function generateCollectionPageSchema(
  name: string,
  url: string,
  description?: string
): CollectionPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
  }
}

export function renderStructuredData(schema: object): string {
  return JSON.stringify(schema, null, 0)
}
