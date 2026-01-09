/**
 * Twitter/X photo fetcher
 * Fetches profile photos from Twitter/X profiles
 */

import { PhotoFetchResult, PhotoSource } from './types'
import { sleep, validateImageUrl, USER_AGENT } from './utils'

/**
 * Extract Twitter handle from various formats
 */
function extractTwitterHandle(input: string): string | null {
  if (!input) return null

  // Remove @ if present
  let handle = input.trim().replace(/^@/, '')

  // Extract from URL
  const urlMatch = handle.match(/twitter\.com\/([a-zA-Z0-9_]+)/)
  if (urlMatch && urlMatch[1]) {
    handle = urlMatch[1]
  }

  // Validate handle format
  if (/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
    return handle
  }

  return null
}

/**
 * Fetch photo from Twitter/X profile
 */
export async function fetchPhotoFromTwitter(
  personId: string,
  personName: string,
  twitterHandleOrUrl: string
): Promise<PhotoFetchResult | null> {
  const result: PhotoFetchResult = {
    personId,
    name: personName,
    updated: false,
    photoUrl: null,
    source: null,
    attemptedSources: ['twitter'],
    errors: [],
  }

  try {
    const handle = extractTwitterHandle(twitterHandleOrUrl)
    if (!handle) {
      result.errors.push('Invalid Twitter handle')
      return result
    }

    const profileUrl = `https://twitter.com/${handle}`

    // Rate limiting
    await sleep(500)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      // Fetch Twitter profile page
      const response = await fetch(profileUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        result.errors.push(`Twitter page returned ${response.status}`)
        return result
      }

      const html = await response.text()

      // Look for profile image in meta tags (OpenGraph)
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
      if (ogImageMatch && ogImageMatch[1]) {
        let imageUrl = ogImageMatch[1]
        
        // Twitter images are at pbs.twimg.com
        // Get higher resolution version (remove _normal suffix)
        if (imageUrl.includes('pbs.twimg.com')) {
          imageUrl = imageUrl.replace(/_normal\.(jpg|png|jpeg)$/i, '_400x400.$1')
          // If that doesn't work, try larger
          if (!imageUrl.includes('_400x400') && !imageUrl.includes('_bigger')) {
            imageUrl = imageUrl.replace(/\.(jpg|png|jpeg)$/i, '_400x400.$1')
          }
        }

        // Validate the image
        const validation = await validateImageUrl(imageUrl)
        if (validation.valid) {
          result.photoUrl = imageUrl
          result.source = 'twitter'
          result.metadata = {
            sourceUrl: profileUrl,
            confidence: 'high',
          }
          return result
        } else {
          result.errors.push(`Twitter image validation failed: ${validation.error}`)
        }
      }

      // Fallback: Look for profile image in JSON-LD or other meta tags
      const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1])
          if (jsonLd.image) {
            const validation = await validateImageUrl(jsonLd.image)
            if (validation.valid) {
              result.photoUrl = jsonLd.image
              result.source = 'twitter'
              result.metadata = {
                sourceUrl: profileUrl,
                confidence: 'medium',
              }
              return result
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      }

      result.errors.push('No profile image found on Twitter page')
      return result
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        result.errors.push('Twitter request timeout')
      } else {
        result.errors.push(`Twitter fetch error: ${fetchError.message}`)
      }
      return result
    }
  } catch (error: any) {
    result.errors.push(`Twitter fetcher error: ${error.message}`)
    return result
  }
}
