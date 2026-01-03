import { Company, ControversyInfo } from '@/types/company'
import { prisma } from './prisma'

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
      featured: company.featured,
      approved: company.approved,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

export async function createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
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
    featured: created.featured,
    approved: created.approved,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  }
}

export async function updateCompany(id: string, company: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company> {
  const updated = await prisma.company.update({
    where: { id },
    data: {
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
    },
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
    // If it's already an array, return it
    if (Array.isArray(parsed)) {
      return parsed as ControversyInfo[]
    }
    // If it's a plain string (old format), convert to array with single item
    if (typeof parsed === 'string') {
      return [{ text: parsed }]
    }
    return undefined
  } catch {
    // If parsing fails, treat as old format plain string
    return [{ text: str }]
  }
}
