import { Company, ControversyInfo, Citation } from '@/types/company'
import { prisma } from './prisma'

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Ensure slug is unique by appending a number if needed
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  const maxAttempts = 1000

  while (counter < maxAttempts) {
    const existing = await prisma.company.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Fallback: append timestamp if still not unique
  return `${baseSlug}-${Date.now()}`
}

export async function getAllCompanies(): Promise<Company[]> {
  try {
    const dbCompanies = await prisma.company.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
    })

    return dbCompanies.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      website: c.website || undefined,
      logoUrl: c.logoUrl || undefined,
      founders: JSON.parse(c.founders) as string[],
      ceo: c.ceo || undefined,
      foundedYear: c.foundedYear || undefined,
      funding: c.funding ? (tryParseJSON(c.funding) || c.funding) : undefined,
      valuation: c.valuation || undefined,
      products: JSON.parse(c.products) as string[],
      controversies: c.controversies ? (tryParseControversies(c.controversies)) : undefined,
      layoffs: c.layoffs ? (JSON.parse(c.layoffs) as Company['layoffs']) : undefined,
      tags: JSON.parse(c.tags) as Company['tags'],
      citations: c.citations ? (tryParseJSON(c.citations) as Company['citations']) : undefined,
      slug: c.slug || undefined,
      featured: c.featured,
      approved: c.approved,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching companies:', error)
    return []
  }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        ownedDataCenters: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            users: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        usedDataCenters: {
          include: {
            dataCenter: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!company) return null

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      website: company.website || undefined,
      logoUrl: company.logoUrl || undefined,
      founders: JSON.parse(company.founders) as string[],
      ceo: company.ceo || undefined,
      foundedYear: company.foundedYear || undefined,
      funding: company.funding ? (tryParseJSON(company.funding) || company.funding) : undefined,
      valuation: company.valuation || undefined,
      products: JSON.parse(company.products) as string[],
      controversies: company.controversies ? (tryParseControversies(company.controversies)) : undefined,
      layoffs: company.layoffs ? (JSON.parse(company.layoffs) as Company['layoffs']) : undefined,
      tags: JSON.parse(company.tags) as Company['tags'],
      citations: company.citations ? (tryParseJSON(company.citations) as Company['citations']) : undefined,
      slug: company.slug || undefined,
      featured: company.featured,
      approved: company.approved,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      dataCenters: [
        ...company.ownedDataCenters.map((dc) => ({
          id: dc.id,
          handle: dc.handle,
          title: dc.title,
          project: dc.project || undefined,
          address: dc.address || undefined,
          latitude: dc.latitude || undefined,
          longitude: dc.longitude || undefined,
          timelapseImageUrl: dc.timelapseImageUrl || undefined,
          currentH100Equivalents: dc.currentH100Equivalents || undefined,
          currentPowerMW: dc.currentPowerMW || undefined,
          currentCapitalCostUSD: dc.currentCapitalCostUSD || undefined,
          investors: dc.investors ? (tryParseJSON(dc.investors) as string[]) : undefined,
          constructionCompanies: dc.constructionCompanies ? (tryParseJSON(dc.constructionCompanies) as string[]) : undefined,
          energyCompanies: dc.energyCompanies ? (tryParseJSON(dc.energyCompanies) as string[]) : undefined,
          citations: dc.citations ? (tryParseJSON(dc.citations) as Citation[]) : undefined,
          owner: dc.owner ? {
            id: dc.owner.id,
            name: dc.owner.name,
            slug: dc.owner.slug || undefined,
          } : undefined,
          users: dc.users.map((u) => ({
            id: u.id,
            company: {
              id: u.company.id,
              name: u.company.name,
              slug: u.company.slug || undefined,
            },
            confidence: u.confidence || undefined,
          })),
        })),
        ...company.usedDataCenters.map((uc) => ({
          id: uc.dataCenter.id,
          handle: uc.dataCenter.handle,
          title: uc.dataCenter.title,
          project: uc.dataCenter.project || undefined,
          address: uc.dataCenter.address || undefined,
          latitude: uc.dataCenter.latitude || undefined,
          longitude: uc.dataCenter.longitude || undefined,
          timelapseImageUrl: uc.dataCenter.timelapseImageUrl || undefined,
          currentH100Equivalents: uc.dataCenter.currentH100Equivalents || undefined,
          currentPowerMW: uc.dataCenter.currentPowerMW || undefined,
          currentCapitalCostUSD: uc.dataCenter.currentCapitalCostUSD || undefined,
          investors: uc.dataCenter.investors ? (tryParseJSON(uc.dataCenter.investors) as string[]) : undefined,
          constructionCompanies: uc.dataCenter.constructionCompanies ? (tryParseJSON(uc.dataCenter.constructionCompanies) as string[]) : undefined,
          energyCompanies: uc.dataCenter.energyCompanies ? (tryParseJSON(uc.dataCenter.energyCompanies) as string[]) : undefined,
          citations: uc.dataCenter.citations ? (tryParseJSON(uc.dataCenter.citations) as Citation[]) : undefined,
          owner: uc.dataCenter.owner ? {
            id: uc.dataCenter.owner.id,
            name: uc.dataCenter.owner.name,
            slug: uc.dataCenter.owner.slug || undefined,
          } : undefined,
          users: [], // Will be populated separately if needed
          userConfidence: uc.confidence || undefined,
        })),
      ],
    }
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        ownedDataCenters: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            users: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        usedDataCenters: {
          include: {
            dataCenter: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!company) return null

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      website: company.website || undefined,
      logoUrl: company.logoUrl || undefined,
      founders: JSON.parse(company.founders) as string[],
      ceo: company.ceo || undefined,
      foundedYear: company.foundedYear || undefined,
      funding: company.funding ? (tryParseJSON(company.funding) || company.funding) : undefined,
      valuation: company.valuation || undefined,
      products: JSON.parse(company.products) as string[],
      controversies: company.controversies ? (tryParseControversies(company.controversies)) : undefined,
      layoffs: company.layoffs ? (JSON.parse(company.layoffs) as Company['layoffs']) : undefined,
      tags: JSON.parse(company.tags) as Company['tags'],
      citations: company.citations ? (tryParseJSON(company.citations) as Company['citations']) : undefined,
      slug: company.slug || undefined,
      featured: company.featured,
      approved: company.approved,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      dataCenters: [
        ...company.ownedDataCenters.map((dc) => ({
          id: dc.id,
          handle: dc.handle,
          title: dc.title,
          project: dc.project || undefined,
          address: dc.address || undefined,
          latitude: dc.latitude || undefined,
          longitude: dc.longitude || undefined,
          timelapseImageUrl: dc.timelapseImageUrl || undefined,
          currentH100Equivalents: dc.currentH100Equivalents || undefined,
          currentPowerMW: dc.currentPowerMW || undefined,
          currentCapitalCostUSD: dc.currentCapitalCostUSD || undefined,
          investors: dc.investors ? (tryParseJSON(dc.investors) as string[]) : undefined,
          constructionCompanies: dc.constructionCompanies ? (tryParseJSON(dc.constructionCompanies) as string[]) : undefined,
          energyCompanies: dc.energyCompanies ? (tryParseJSON(dc.energyCompanies) as string[]) : undefined,
          citations: dc.citations ? (tryParseJSON(dc.citations) as Citation[]) : undefined,
          owner: dc.owner ? {
            id: dc.owner.id,
            name: dc.owner.name,
            slug: dc.owner.slug || undefined,
          } : undefined,
          users: dc.users.map((u) => ({
            id: u.id,
            company: {
              id: u.company.id,
              name: u.company.name,
              slug: u.company.slug || undefined,
            },
            confidence: u.confidence || undefined,
          })),
        })),
        ...company.usedDataCenters.map((uc) => ({
          id: uc.dataCenter.id,
          handle: uc.dataCenter.handle,
          title: uc.dataCenter.title,
          project: uc.dataCenter.project || undefined,
          address: uc.dataCenter.address || undefined,
          latitude: uc.dataCenter.latitude || undefined,
          longitude: uc.dataCenter.longitude || undefined,
          timelapseImageUrl: uc.dataCenter.timelapseImageUrl || undefined,
          currentH100Equivalents: uc.dataCenter.currentH100Equivalents || undefined,
          currentPowerMW: uc.dataCenter.currentPowerMW || undefined,
          currentCapitalCostUSD: uc.dataCenter.currentCapitalCostUSD || undefined,
          investors: uc.dataCenter.investors ? (tryParseJSON(uc.dataCenter.investors) as string[]) : undefined,
          constructionCompanies: uc.dataCenter.constructionCompanies ? (tryParseJSON(uc.dataCenter.constructionCompanies) as string[]) : undefined,
          energyCompanies: uc.dataCenter.energyCompanies ? (tryParseJSON(uc.dataCenter.energyCompanies) as string[]) : undefined,
          citations: uc.dataCenter.citations ? (tryParseJSON(uc.dataCenter.citations) as Citation[]) : undefined,
          owner: uc.dataCenter.owner ? {
            id: uc.dataCenter.owner.id,
            name: uc.dataCenter.owner.name,
            slug: uc.dataCenter.owner.slug || undefined,
          } : undefined,
          users: [], // Will be populated separately if needed
          userConfidence: uc.confidence || undefined,
        })),
      ],
    }
  } catch (error) {
    console.error('Error fetching company by slug:', error)
    return null
  }
}

export async function createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  // Generate slug if not provided
  const baseSlug = company.slug || generateSlug(company.name)
  const slug = baseSlug ? await ensureUniqueSlug(baseSlug) : null

  const created = await prisma.company.create({
    data: {
      name: company.name,
      description: company.description,
      website: company.website,
      logoUrl: company.logoUrl,
      founders: JSON.stringify(company.founders),
      ceo: company.ceo,
      foundedYear: company.foundedYear,
      funding: typeof company.funding === 'string' ? company.funding : JSON.stringify(company.funding),
      valuation: company.valuation,
      products: JSON.stringify(company.products),
      controversies: company.controversies ? JSON.stringify(company.controversies) : null,
      layoffs: company.layoffs ? JSON.stringify(company.layoffs) : null,
      tags: JSON.stringify(company.tags),
      citations: company.citations ? JSON.stringify(company.citations) : null,
      slug,
      featured: company.featured || false,
      approved: company.approved !== false,
    },
  })

    return {
      id: created.id,
      name: created.name,
      description: created.description,
      website: created.website || undefined,
      logoUrl: created.logoUrl || undefined,
      founders: JSON.parse(created.founders) as string[],
      ceo: created.ceo || undefined,
      foundedYear: created.foundedYear || undefined,
      funding: created.funding ? (tryParseJSON(created.funding) || created.funding) : undefined,
      valuation: created.valuation || undefined,
      products: JSON.parse(created.products) as string[],
      controversies: created.controversies ? (tryParseControversies(created.controversies)) : undefined,
      layoffs: created.layoffs ? (JSON.parse(created.layoffs) as Company['layoffs']) : undefined,
      tags: JSON.parse(created.tags) as Company['tags'],
      citations: created.citations ? (tryParseJSON(created.citations) as Company['citations']) : undefined,
      slug: created.slug || undefined,
      featured: created.featured,
      approved: created.approved,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  }

export async function updateCompany(id: string, company: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company> {
  // Generate slug if name changed and slug not explicitly provided
  let slug = company.slug
  if (company.name && !slug) {
    const baseSlug = generateSlug(company.name)
    slug = baseSlug ? await ensureUniqueSlug(baseSlug, id) : undefined
  }

  const updateData: any = {
    name: company.name,
    description: company.description,
    website: company.website,
    logoUrl: company.logoUrl,
    founders: company.founders ? JSON.stringify(company.founders) : undefined,
    ceo: company.ceo,
    foundedYear: company.foundedYear,
    funding: company.funding ? (typeof company.funding === 'string' ? company.funding : JSON.stringify(company.funding)) : undefined,
    valuation: company.valuation,
    products: company.products ? JSON.stringify(company.products) : undefined,
    controversies: company.controversies ? JSON.stringify(company.controversies) : undefined,
    layoffs: company.layoffs ? JSON.stringify(company.layoffs) : undefined,
    tags: company.tags ? JSON.stringify(company.tags) : undefined,
    citations: company.citations ? JSON.stringify(company.citations) : undefined,
    featured: company.featured,
    approved: company.approved,
  }
  
  if (slug !== undefined) {
    updateData.slug = slug
  }

  const updated = await prisma.company.update({
    where: { id },
    data: updateData,
  })

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    website: updated.website || undefined,
    logoUrl: updated.logoUrl || undefined,
    founders: JSON.parse(updated.founders) as string[],
    ceo: updated.ceo || undefined,
    foundedYear: updated.foundedYear || undefined,
    funding: updated.funding ? (tryParseJSON(updated.funding) || updated.funding) : undefined,
    valuation: updated.valuation || undefined,
    products: JSON.parse(updated.products) as string[],
    controversies: updated.controversies ? (tryParseControversies(updated.controversies)) : undefined,
    layoffs: updated.layoffs ? (JSON.parse(updated.layoffs) as Company['layoffs']) : undefined,
    tags: JSON.parse(updated.tags) as Company['tags'],
    citations: updated.citations ? (tryParseJSON(updated.citations) as Company['citations']) : undefined,
    slug: updated.slug || undefined,
    featured: updated.featured,
    approved: updated.approved,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }
}

export async function deleteCompany(id: string): Promise<void> {
  await prisma.company.delete({
    where: { id },
  })
}

function tryParseJSON(str: string): any {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function tryParseControversies(str: string): ControversyInfo[] | undefined {
  try {
    const parsed = JSON.parse(str)
    let controversies: ControversyInfo[] = []
    
    // If it's already an array, use it
    if (Array.isArray(parsed)) {
      controversies = parsed as ControversyInfo[]
    }
    // If it's a plain string (old format), convert to array with single item
    else if (typeof parsed === 'string') {
      controversies = [{ text: parsed }]
    } else {
      return undefined
    }
    
    // Sort controversies by date (newest first)
    // Dates are in format like "2025-12", "2026-01", etc.
    controversies.sort((a, b) => {
      // If both have dates, compare them (descending order - newest first)
      if (a.date && b.date) {
        return b.date.localeCompare(a.date)
      }
      // If only a has a date, it comes first
      if (a.date && !b.date) {
        return -1
      }
      // If only b has a date, it comes first
      if (!a.date && b.date) {
        return 1
      }
      // If neither has a date, maintain original order
      return 0
    })
    
    return controversies
  } catch {
    // If parsing fails, treat as old format plain string
    return [{ text: str }]
  }
}
