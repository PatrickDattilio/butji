/**
 * Web search photo fetcher (fallback)
 * Uses DuckDuckGo Image Search as a last resort
 * Note: This is least reliable and slowest
 */

import { PhotoFetchResult, PhotoSource } from './types'
import { sleep, validateImageUrl, USER_AGENT, normalizeNameForSearch } from './utils'

/**
 * Fetch photo using web search
 * This is a last resort fallback and may not be very accurate
 */
export async function fetchPhotoFromWebSearch(
  personId: string,
  personName: string
): Promise<PhotoFetchResult | null> {
  const result: PhotoFetchResult = {
    personId,
    name: personName,
    updated: false,
    photoUrl: null,
    source: null,
    attemptedSources: ['other'], // Using 'other' for web search
    errors: [],
  }

  try {
    const normalizedName = normalizeNameForSearch(personName)
    
    // Construct search query - focus on profile photos
    const searchQuery = `"${normalizedName}" (CEO OR founder OR executive) profile photo OR headshot site:linkedin.com OR site:company.com`

    // Rate limiting
    await sleep(500)

    // DuckDuckGo Image Search API (unofficial, but works)
    // Note: DuckDuckGo doesn't have an official image search API
    // We could use a service like SerpAPI, but for now we'll skip this
    // as it requires API keys and adds complexity

    // For now, this fetcher will indicate it's not implemented
    // If needed, could integrate with:
    // - SerpAPI (requires API key)
    // - Google Custom Search (requires API key)
    // - Bing Image Search API (requires API key)

    result.errors.push('Web search fetcher not fully implemented (requires API key)')
    return result
  } catch (error: any) {
    result.errors.push(`Web search fetcher error: ${error.message}`)
    return result
  }
}
