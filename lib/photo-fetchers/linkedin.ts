/**
 * LinkedIn photo fetcher
 * Only fetches if linkedinUrl is explicitly provided in database
 */

import { PhotoFetchResult, PhotoSource } from './types'
import { sleep, validateImageUrl, USER_AGENT } from './utils'

/**
 * Fetch photo from LinkedIn profile
 * Note: LinkedIn uses signed/expiring URLs, so direct access is limited
 * This fetcher attempts to extract profile image from public profile page
 */
export async function fetchPhotoFromLinkedIn(
  personId: string,
  personName: string,
  linkedinUrl: string
): Promise<PhotoFetchResult | null> {
  const result: PhotoFetchResult = {
    personId,
    name: personName,
    updated: false,
    photoUrl: null,
    source: null,
    attemptedSources: ['linkedin'],
    errors: [],
  }

  try {
    // Validate LinkedIn URL format
    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com')) {
      result.errors.push('Invalid LinkedIn URL')
      return result
    }

    // Normalize URL
    let profileUrl = linkedinUrl.trim()
    if (!profileUrl.startsWith('http')) {
      profileUrl = `https://${profileUrl}`
    }

    // Rate limiting
    await sleep(500)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      // Fetch LinkedIn profile page
      const response = await fetch(profileUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        result.errors.push(`LinkedIn page returned ${response.status}`)
        return result
      }

      const html = await response.text()

      // Look for profile image in meta tags (OpenGraph)
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
      if (ogImageMatch && ogImageMatch[1]) {
        let imageUrl = ogImageMatch[1]
        
        // LinkedIn images are often in media.licdn.com
        // Try to get higher resolution version if it's a thumbnail
        if (imageUrl.includes('media.licdn.com')) {
          // Remove size restrictions if present
          imageUrl = imageUrl.replace(/\/profile-displayphoto-shrink_\d+_\d+\//, '/profile-displayphoto/')
          imageUrl = imageUrl.replace(/\?.*$/, '') // Remove query params that might limit size
        }

        // Validate the image
        const validation = await validateImageUrl(imageUrl)
        if (validation.valid) {
          result.photoUrl = imageUrl
          result.source = 'linkedin'
          result.metadata = {
            sourceUrl: profileUrl,
            confidence: 'high',
          }
          return result
        } else {
          result.errors.push(`LinkedIn image validation failed: ${validation.error}`)
        }
      }

      // Fallback: Look for profile-photo image tag
      const photoPatterns = [
        /<img[^>]*class=["'][^"']*profile-photo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*class=["'][^"']*headshot[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*alt=["'][^"']*profile[^"']*["'][^>]*src=["']([^"']+)["']/i,
      ]

      for (const pattern of photoPatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          let imageUrl = match[1]
          
          // Resolve relative URLs
          if (imageUrl.startsWith('//')) {
            imageUrl = `https:${imageUrl}`
          } else if (imageUrl.startsWith('/')) {
            imageUrl = `https://www.linkedin.com${imageUrl}`
          }

          const validation = await validateImageUrl(imageUrl)
          if (validation.valid) {
            result.photoUrl = imageUrl
            result.source = 'linkedin'
            result.metadata = {
              sourceUrl: profileUrl,
              confidence: 'medium',
            }
            return result
          }
        }
      }

      result.errors.push('No profile image found on LinkedIn page')
      return result
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        result.errors.push('LinkedIn request timeout')
      } else {
        result.errors.push(`LinkedIn fetch error: ${fetchError.message}`)
      }
      return result
    }
  } catch (error: any) {
    result.errors.push(`LinkedIn fetcher error: ${error.message}`)
    return result
  }
}
