/**
 * GitHub photo fetcher
 * Fetches avatars from GitHub profiles
 */

import { PhotoFetchResult, PhotoSource } from './types'
import { sleep, validateImageUrl, USER_AGENT, normalizeNameForSearch } from './utils'

/**
 * Fetch photo from GitHub profile
 * Searches GitHub API for users matching the person's name
 */
export async function fetchPhotoFromGitHub(
  personId: string,
  personName: string,
  githubToken?: string
): Promise<PhotoFetchResult | null> {
  const result: PhotoFetchResult = {
    personId,
    name: personName,
    updated: false,
    photoUrl: null,
    source: null,
    attemptedSources: ['github'],
    errors: [],
  }

  try {
    const normalizedName = normalizeNameForSearch(personName)
    
    // Rate limiting
    await sleep(500)

    // GitHub API endpoint
    const searchUrl = `https://api.github.com/search/users?q=${encodeURIComponent(normalizedName)}&per_page=5`

    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
      Accept: 'application/vnd.github.v3+json',
    }

    // Add token if provided for higher rate limits
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(searchUrl, {
        signal: controller.signal,
        headers,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 403) {
          result.errors.push('GitHub API rate limit exceeded')
        } else {
          result.errors.push(`GitHub API returned ${response.status}`)
        }
        return result
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        result.errors.push('No GitHub users found matching name')
        return result
      }

      // Try each result until we find a valid avatar
      // GitHub avatars default to Gravatar, so we'll check if it's not the default
      for (const user of data.items) {
        if (!user.avatar_url) {
          continue
        }

        // Check if it's a GitHub default avatar (usually has identicon in URL or is default)
        // We want to prefer non-default avatars
        const avatarUrl = user.avatar_url + '&s=200' // Request larger size

        // Validate the image
        const validation = await validateImageUrl(avatarUrl)
        if (validation.valid) {
          // Additional check: GitHub default avatars are usually identicons
          // If the URL contains 'identicon' or other default patterns, we might want to skip
          // But for now, we'll accept it since it's still a photo
          result.photoUrl = avatarUrl
          result.source = 'github'
          result.metadata = {
            sourceUrl: user.html_url,
            confidence: 'medium', // Medium because it's based on name matching
          }
          return result
        }
      }

      result.errors.push('No valid GitHub avatar found')
      return result
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        result.errors.push('GitHub API request timeout')
      } else {
        result.errors.push(`GitHub API error: ${fetchError.message}`)
      }
      return result
    }
  } catch (error: any) {
    result.errors.push(`GitHub fetcher error: ${error.message}`)
    return result
  }
}
