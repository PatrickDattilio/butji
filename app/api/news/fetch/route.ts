import { NextResponse } from 'next/server'
import { getNewsSources, createNewsArticle, updateNewsSourceLastFetched, checkArticleExists } from '@/lib/news'
import Parser from 'rss-parser'

const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
})

interface RSSItem {
  title: string
  link: string
  pubDate?: string
  isoDate?: string
  content?: string
  contentSnippet?: string
  description?: string
  enclosure?: {
    url?: string
    type?: string
  }
  mediaThumbnail?: {
    url?: string
  }
}

async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    const feed = await parser.parseURL(url)
    
    if (!feed.items || feed.items.length === 0) {
      return []
    }

    return feed.items.map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate,
      isoDate: item.isoDate,
      description: item.contentSnippet || item.content || '',
      content: item.content || item.contentSnippet || '',
      enclosure: item.enclosure as { url?: string; type?: string } | undefined,
      mediaThumbnail: item.mediaThumbnail as { url?: string } | undefined,
    }))
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error)
    return []
  }
}

function extractImageUrl(item: RSSItem): string | undefined {
  // Try to extract image from various sources
  if (item.enclosure?.type?.startsWith('image/') && item.enclosure.url) {
    return item.enclosure.url
  }
  if (item.mediaThumbnail?.url) {
    return item.mediaThumbnail.url
  }
  
  // Try to extract from description HTML
  const description = item.description || item.content || ''
  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) {
    return imgMatch[1]
  }
  
  return undefined
}

function parseDate(item: RSSItem): Date {
  // Prefer isoDate as it's more reliable
  if (item.isoDate) {
    return new Date(item.isoDate)
  }
  if (item.pubDate) {
    return new Date(item.pubDate)
  }
  return new Date()
}

export async function POST() {
  try {
    const sources = await getNewsSources()
    let totalFetched = 0
    let totalSkipped = 0
    const errors: string[] = []

    for (const source of sources) {
      if (!source.enabled) continue

      try {
        let items: RSSItem[] = []

        if (source.type === 'rss') {
          items = await fetchRSSFeed(source.url)
        } else {
          // Future: Handle API sources
          continue
        }

        for (const item of items) {
          try {
            // Check if article already exists
            const exists = await checkArticleExists(item.link)
            if (exists) {
              totalSkipped++
              continue
            }

            // Extract image URL
            const imageUrl = extractImageUrl(item)

            // Create article
            await createNewsArticle({
              title: item.title,
              description: item.description || item.content || undefined,
              url: item.link,
              source: source.name,
              sourceUrl: source.url,
              imageUrl,
              publishedAt: parseDate(item).toISOString(),
              tags: [], // Could add AI-related tag detection here
              featured: false,
              approved: true,
            })

            totalFetched++
          } catch (error) {
            console.error(`Error processing article "${item.title}":`, error)
            errors.push(`Failed to process: ${item.title}`)
          }
        }

        // Update last fetched timestamp
        await updateNewsSourceLastFetched(source.id)
      } catch (error) {
        const errorMsg = `Error fetching from ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg, error)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      fetched: totalFetched,
      skipped: totalSkipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error in news fetch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
