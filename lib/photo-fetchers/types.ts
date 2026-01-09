/**
 * Type definitions for photo fetching system
 */

export type PhotoSource = 'wikipedia' | 'wikimedia' | 'corporate' | 'linkedin' | 'twitter' | 'github' | 'other'

export interface PhotoFetchResult {
  personId: string
  name: string
  updated: boolean
  photoUrl: string | null
  source: PhotoSource | null
  attemptedSources: PhotoSource[] // Track which sources were tried
  errors: string[]
  metadata?: {
    sourceUrl?: string // Where photo was found (e.g., company page URL)
    confidence?: 'high' | 'medium' | 'low'
  }
}

export interface PhotoFetcherOptions {
  dryRun?: boolean
  enableLinkedIn?: boolean
  enableTwitter?: boolean
  enableGitHub?: boolean
  enableWebSearch?: boolean
  maxFallbacks?: number
}
