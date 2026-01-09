/**
 * Corporate page photo fetcher
 * Fetches photos from company leadership/team pages
 */

import { prisma } from '@/lib/prisma'
import { PhotoFetchResult, PhotoSource } from './types'
import { sleep, extractImagesFromHTML, validateImageUrl, resolveUrl, USER_AGENT, extractDomain } from './utils'

/**
 * Common paths for leadership/team pages on company websites
 */
const LEADERSHIP_PATHS = [
  '/leadership',
  '/team',
  '/about/team',
  '/about/leadership',
  '/executives',
  '/people',
  '/about',
  '/company',
  '/founders',
  '/team/leadership',
  '/our-team',
]

/**
 * Fetch photo from corporate page
 */
export async function fetchPhotoFromCorporatePage(
  personId: string,
  personName: string
): Promise<PhotoFetchResult | null> {
  const result: PhotoFetchResult = {
    personId,
    name: personName,
    updated: false,
    photoUrl: null,
    source: null,
    attemptedSources: ['corporate'],
    errors: [],
  }

  try {
    // Get companies associated with this person
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        boardPositions: {
          include: { company: { select: { id: true, name: true, website: true } } },
        },
        foundedCompanies: {
          include: { company: { select: { id: true, name: true, website: true } } },
        },
        investments: {
          include: { company: { select: { id: true, name: true, website: true } } },
          where: { role: { contains: 'founder', mode: 'insensitive' } }, // Focus on founder roles
        },
      },
    })

    if (!person) {
      result.errors.push('Person not found')
      return result
    }

    // Collect all unique companies with websites
    const companies = new Map<string, { name: string; website: string }>()

    person.boardPositions.forEach((bp) => {
      if (bp.company.website) {
        companies.set(bp.company.id, { name: bp.company.name, website: bp.company.website })
      }
    })

    person.foundedCompanies.forEach((fc) => {
      if (fc.company.website) {
        companies.set(fc.company.id, { name: fc.company.name, website: fc.company.website })
      }
    })

    person.investments.forEach((inv) => {
      if (inv.company.website) {
        companies.set(inv.company.id, { name: inv.company.name, website: inv.company.website })
      }
    })

    if (companies.size === 0) {
      result.errors.push('No companies with websites found for this person')
      return result
    }

    // Try each company's website
    for (const [companyId, company] of companies) {
      try {
        const baseUrl = company.website
        const domain = extractDomain(baseUrl)
        if (!domain) {
          continue
        }

        // Try each common leadership path
        for (const path of LEADERSHIP_PATHS) {
          try {
            const url = resolveUrl(baseUrl, path)
            
            // Rate limiting
            await sleep(500)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000)

            const response = await fetch(url, {
              signal: controller.signal,
              headers: {
                'User-Agent': USER_AGENT,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              },
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              continue // Try next path
            }

            const html = await response.text()
            const imageUrls = extractImagesFromHTML(html, personName, url)

            if (imageUrls.length === 0) {
              continue // Try next path
            }

            // Validate each image URL until we find a valid one
            for (const imageUrl of imageUrls.slice(0, 5)) {
              // Resolve relative URLs to absolute
              let fullImageUrl = imageUrl
              if (!fullImageUrl.startsWith('http')) {
                if (fullImageUrl.startsWith('//')) {
                  fullImageUrl = `https:${fullImageUrl}`
                } else if (fullImageUrl.startsWith('/')) {
                  fullImageUrl = resolveUrl(baseUrl, fullImageUrl)
                } else {
                  fullImageUrl = resolveUrl(url, fullImageUrl)
                }
              }
              
              const validation = await validateImageUrl(fullImageUrl)
              
              if (validation.valid) {
                result.photoUrl = fullImageUrl
                result.source = 'corporate'
                result.metadata = {
                  sourceUrl: url,
                  confidence: 'high',
                }
                return result
              }
            }
          } catch (error: any) {
            // Continue to next path
            if (error.name !== 'AbortError') {
              // Only log non-timeout errors
              result.errors.push(`Error fetching ${path} from ${domain}: ${error.message}`)
            }
            continue
          }
        }
      } catch (error: any) {
        result.errors.push(`Error processing company ${company.name}: ${error.message}`)
        continue
      }
    }

    if (!result.photoUrl) {
      result.errors.push('No photo found on any company website')
    }

    return result
  } catch (error: any) {
    result.errors.push(`Corporate fetcher error: ${error.message}`)
    return result
  }
}
