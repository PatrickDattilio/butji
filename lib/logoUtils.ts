/**
 * Utility functions for working with logo URLs
 */

/**
 * Check if a URL is from logo.dev
 * Logo.dev URLs follow the pattern: https://img.logo.dev/{domain}?token=...
 */
export function isLogoDevUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.startsWith('https://img.logo.dev/')
}
