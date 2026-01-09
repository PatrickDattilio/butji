/**
 * Wikipedia photo fetcher
 * Fetches photos from Wikipedia pages
 */

import { PhotoFetchResult, PhotoSource } from './types'
import { sleep, validateImageUrl, normalizeNameForSearch } from './utils'

/**
 * Generate Wikipedia page name variations
 */
function generateWikipediaNameVariations(name: string): string[] {
  const variations: string[] = []
  const normalized = normalizeNameForSearch(name)
  
  // Original name
  variations.push(normalized)
  
  // Try with middle initial removed (e.g., "Reid G. Hoffman" -> "Reid Hoffman")
  const parts = normalized.split(/\s+/)
  if (parts.length > 2) {
    // Remove middle parts that are single letters or initials
    const filtered = parts.filter(p => p.length > 1 || !p.match(/^[A-Z]\.?$/))
    if (filtered.length !== parts.length) {
      variations.push(filtered.join(' '))
    }
  }
  
  // Try with middle name expanded (if we have an initial)
  const withInitial = normalized.match(/^(\w+)\s+([A-Z])\.?\s+(\w+)$/)
  if (withInitial) {
    // Keep as is, but also try without the initial
    variations.push(`${withInitial[1]} ${withInitial[3]}`)
  }
  
  return [...new Set(variations)] // Remove duplicates
}

/**
 * Search Wikipedia for person's page
 */
async function searchWikipediaPage(personName: string): Promise<string | null> {
  const variations = generateWikipediaNameVariations(personName)
  
  for (const variation of variations) {
    try {
      // Try Wikipedia API summary endpoint
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variation)}`
      const response = await fetch(searchUrl)
      
      if (response.ok) {
        const data = await response.json()
        // Check if it's a disambiguation page or redirect
        if (data.type === 'standard' && !data.title.toLowerCase().includes('disambiguation')) {
          return data.title
        }
      }
    } catch (error) {
      // Continue to next variation
      continue
    }
  }
  
  return null
}

/**
 * Parse Wikipedia HTML to extract photo URL from infobox
 */
function parseWikipediaPhoto(html: string): string | null {
  // Wikipedia REST API HTML format uses <figure> tags
  // Look for <figure> with infobox or biography class containing <img>
  const patterns = [
    // Pattern 1: <figure> with infobox/biography class
    /<figure[^>]*class="[^"]*(?:infobox|biography|vcard)[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/i,
    // Pattern 2: Any <img> in a table with infobox class
    /<table[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/i,
    // Pattern 3: Any <img> with srcset or data-src (lazy loaded)
    /<img[^>]*(?:src|data-src|srcset)="([^"]+)"[^>]*class="[^"]*infobox[^"]*"[^>]*>/i,
    // Pattern 4: First image in the page (fallback)
    /<img[^>]*src="([^"]+)"[^>]*>/i,
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      let imageUrl = match[1]
      
      // Handle srcset (take first URL)
      if (imageUrl.includes(',')) {
        imageUrl = imageUrl.split(',')[0].trim().split(' ')[0]
      }
      
      // Convert relative URLs to absolute
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://en.wikipedia.org${imageUrl}`
      }
      
      // Skip data URIs and invalid URLs
      if (imageUrl.startsWith('data:') || !imageUrl.startsWith('http')) {
        continue
      }
      
      // Prefer Wikimedia Commons URLs (open source)
      if (imageUrl.includes('wikimedia.org') || imageUrl.includes('upload.wikimedia.org')) {
        // Convert thumbnail URLs to full-size when possible
        // Wikipedia thumbnails: /thumb/a/bc/filename.jpg/220px-filename.jpg
        // Full size: /a/bc/filename.jpg
        if (imageUrl.includes('/thumb/')) {
          const thumbMatch = imageUrl.match(/\/thumb\/(.+?)\/\d+px-[^/]+$/)
          if (thumbMatch) {
            imageUrl = `https://upload.wikimedia.org/wikipedia/commons/${thumbMatch[1]}`
          }
        }
        
        return imageUrl
      }
      
      // Also accept Wikipedia URLs (they often point to Wikimedia Commons)
      if (imageUrl.includes('wikipedia.org')) {
        return imageUrl
      }
    }
  }
  
  return null
}

/**
 * Fetch photo from Wikipedia
 */
export async function fetchPhotoFromWikipedia(
  personId: string,
  personName: string
): Promise<PhotoFetchResult | null> {
  const result: PhotoFetchResult = {
    personId,
    name: personName,
    updated: false,
    photoUrl: null,
    source: null,
    attemptedSources: ['wikipedia'],
    errors: [],
  }

  try {
    // Search Wikipedia
    await sleep(500) // Rate limiting
    const pageTitle = await searchWikipediaPage(personName)
    
    if (!pageTitle) {
      result.errors.push('Wikipedia page not found')
      return result
    }
    
    // Fetch photo from Wikipedia page
    await sleep(500)
    
    try {
      // Fetch HTML version of the page
      const htmlUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(pageTitle)}`
      const response = await fetch(htmlUrl)
      
      if (!response.ok) {
        result.errors.push(`Wikipedia API returned ${response.status}`)
        return result
      }
      
      const html = await response.text()
      const photoUrl = parseWikipediaPhoto(html)
      
      if (!photoUrl) {
        result.errors.push('Photo not found in Wikipedia infobox')
        return result
      }
      
      // Validate photo URL (must be from Wikimedia/Wikipedia)
      await sleep(500)
      const validation = await validateImageUrl(photoUrl, ['wikimedia.org', 'wikipedia.org'])
      
      if (!validation.valid) {
        result.errors.push(`Photo URL validation failed: ${validation.error}`)
        return result
      }
      
      result.photoUrl = photoUrl
      result.source = photoUrl.includes('wikimedia.org') ? 'wikimedia' : 'wikipedia'
      result.metadata = {
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
        confidence: 'high',
      }
      
      return result
    } catch (fetchError: any) {
      result.errors.push(`Wikipedia fetch error: ${fetchError.message}`)
      return result
    }
  } catch (error: any) {
    result.errors.push(`Wikipedia fetcher error: ${error.message}`)
    return result
  }
}
