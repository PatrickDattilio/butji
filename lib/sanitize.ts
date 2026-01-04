import DOMPurify from 'isomorphic-dompurify'
import { CreateReportInput } from '@/types/report'

// Maximum lengths for different field types
const MAX_LENGTHS = {
  email: 255,
  url: 2048,
  shortText: 500,      // For fields like "field", "ceo"
  mediumText: 5000,    // For "newValue", "source"
  longText: 10000,     // For "message", "adminNotes"
}

// Sanitize HTML content (removes scripts, dangerous HTML)
export function sanitizeHtml(input: string | null | undefined, maxLength?: number): string {
  if (!input) return ''
  const trimmed = input.trim()
  if (maxLength && trimmed.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`)
  }
  return DOMPurify.sanitize(trimmed, { ALLOWED_TAGS: [] }) // Strip all HTML tags
}

// Sanitize plain text (no HTML allowed)
export function sanitizeText(input: string | null | undefined, maxLength?: number): string {
  return sanitizeHtml(input, maxLength)
}

// Sanitize email (basic format validation + length)
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim().toLowerCase()
  if (trimmed.length > MAX_LENGTHS.email) {
    throw new Error(`Email exceeds maximum length of ${MAX_LENGTHS.email} characters`)
  }
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    throw new Error('Invalid email format')
  }
  return trimmed
}

// Sanitize URL (validate format + length)
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (trimmed.length > MAX_LENGTHS.url) {
    throw new Error(`URL exceeds maximum length of ${MAX_LENGTHS.url} characters`)
  }
  try {
    new URL(trimmed) // Validate URL format
    return trimmed
  } catch {
    throw new Error('Invalid URL format')
  }
}

// Sanitize report input object
export function sanitizeReportInput(input: CreateReportInput): CreateReportInput {
  return {
    type: input.type, // Enum, validated separately
    targetId: sanitizeText(input.targetId, 100), // CUID length
    reporterEmail: input.reporterEmail ? sanitizeEmail(input.reporterEmail) || undefined : undefined,
    field: input.field ? sanitizeText(input.field, MAX_LENGTHS.shortText) : undefined,
    newValue: input.newValue ? sanitizeText(input.newValue, MAX_LENGTHS.mediumText) : undefined,
    source: input.source ? sanitizeUrl(input.source) || undefined : undefined,
    message: sanitizeText(input.message, MAX_LENGTHS.longText), // Required field
  }
}
