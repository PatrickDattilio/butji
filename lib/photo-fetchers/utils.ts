/**
 * Shared utilities for photo fetchers
 */

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Normalize person name for search
 * Remove common suffixes and clean up
 */
export function normalizeNameForSearch(name: string): string {
  return name
    .replace(/\s+(Jr|Sr|II|III|IV|PhD|MD|Esq)\.?$/i, '')
    .trim()
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Validate image URL - check if it's accessible and is an image
 */
export async function validateImageUrl(
  photoUrl: string,
  allowedDomains?: string[]
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  try {
    // Check domain restriction if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const domain = extractDomain(photoUrl)
      if (!domain || !allowedDomains.some(d => domain.includes(d))) {
        return { valid: false, error: 'Domain not in allowed list' }
      }
    }

    // Skip data URIs and base64 images
    if (photoUrl.startsWith('data:')) {
      return { valid: false, error: 'Data URI not allowed' }
    }

    // Make HEAD request to check accessibility and content type
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(photoUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ButjiPhotoFetcher/1.0; +https://butji.com)',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return { valid: false, error: `HTTP ${response.status}` }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.startsWith('image/')) {
        return { valid: false, error: 'Not an image content type' }
      }

      // Try to get content length to ensure it's not empty
      const contentLength = response.headers.get('content-length')
      if (contentLength && parseInt(contentLength) < 100) {
        return { valid: false, error: 'Image too small (likely placeholder)' }
      }

      // If we need dimensions, we'd need to fetch the image, but that's expensive
      // For now, just validate it's accessible and is an image type
      return { valid: true }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return { valid: false, error: 'Request timeout' }
      }
      throw fetchError
    }
  } catch (error: any) {
    return { valid: false, error: error.message || 'Validation failed' }
  }
}

/**
 * Extract images from HTML near a person's name
 * Looks for common patterns like team-member divs, figure tags, etc.
 */
export function extractImagesFromHTML(html: string, personName: string, baseUrl?: string): string[] {
  const images: Array<{ url: string; relevance: number }> = []
  const normalizedName = normalizeNameForSearch(personName).toLowerCase()
  const nameParts = normalizedName.split(/\s+/)

  // Patterns for finding images near person's name
  const patterns = [
    // Pattern 1: <div class="team-member"> with name nearby
    {
      regex: /<div[^>]*class="[^"]*(?:team-member|executive|leader|founder|bio|profile)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      extractImage: (match: string) => {
        // Check if person's name is in this section
        const lowerMatch = match.toLowerCase()
        const hasName = nameParts.some(part => lowerMatch.includes(part))
        if (!hasName) return null

        // Extract img tag
        const imgMatch = match.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
        if (imgMatch && imgMatch[1]) {
          return { url: imgMatch[1], relevance: 90 }
        }
        return null
      },
    },
    // Pattern 2: <figure> with caption containing name
    {
      regex: /<figure[^>]*>([\s\S]*?)<\/figure>/gi,
      extractImage: (match: string) => {
        const lowerMatch = match.toLowerCase()
        const hasName = nameParts.some(part => lowerMatch.includes(part))
        if (!hasName) return null

        const imgMatch = match.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
        if (imgMatch && imgMatch[1]) {
          return { url: imgMatch[1], relevance: 85 }
        }
        return null
      },
    },
    // Pattern 3: Images in tables with name in adjacent cells
    {
      regex: /<tr[^>]*>([\s\S]*?)<\/tr>/gi,
      extractImage: (match: string) => {
        const lowerMatch = match.toLowerCase()
        const hasName = nameParts.some(part => lowerMatch.includes(part))
        if (!hasName) return null

        const imgMatch = match.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
        if (imgMatch && imgMatch[1]) {
          return { url: imgMatch[1], relevance: 80 }
        }
        return null
      },
    },
    // Pattern 4: Any img with alt text containing the name
    {
      regex: /<img[^>]*alt=["']([^"']*?)["'][^>]*src=["']([^"']+)["'][^>]*>/gi,
      extractImage: (match: string, alt: string, src: string) => {
        const lowerAlt = alt.toLowerCase()
        const hasName = nameParts.some(part => lowerAlt.includes(part))
        if (hasName) {
          return { url: src, relevance: 75 }
        }
        return null
      },
    },
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.regex.exec(html)) !== null) {
      // Call extractImage with appropriate arguments based on match length
      // Use apply to handle variable number of arguments safely
      const result = (pattern.extractImage as any).apply(null, match.slice(0, match.length))
      
      if (result) {
        // Normalize URL
        let url = result.url
        if (url.startsWith('//')) {
          url = `https:${url}`
        } else if (url.startsWith('/') && baseUrl) {
          // Resolve relative URL using base URL
          url = resolveUrl(baseUrl, url)
        } else if (url.startsWith('/') && !baseUrl) {
          // Skip relative URLs if no base URL provided
          continue
        }

        // Skip data URIs
        if (url.startsWith('data:')) {
          continue
        }

        images.push({ url, relevance: result.relevance })
      }
    }
  }

  // Sort by relevance and return URLs
  return [...new Set(images.sort((a, b) => b.relevance - a.relevance).map(img => img.url))]
}

/**
 * Construct full URL from base and relative path
 */
export function resolveUrl(baseUrl: string, relativePath: string): string {
  try {
    return new URL(relativePath, baseUrl).href
  } catch {
    return relativePath
  }
}

/**
 * User agent string for respectful scraping
 */
export const USER_AGENT = 'Mozilla/5.0 (compatible; ButjiPhotoFetcher/1.0; +https://butji.com)'
