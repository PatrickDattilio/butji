/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser: use current origin
    return window.location.origin
  }
  
  // Server: use environment variable or default
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    'https://www.butji.com'
  )
}

/**
 * Get absolute URL for a path
 */
export function getAbsoluteUrl(path: string): string {
  const base = getBaseUrl()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
