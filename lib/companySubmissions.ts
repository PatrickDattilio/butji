import { Company, ControversyInfo } from '@/types/company'
import { prisma } from './prisma'

export interface CompanySubmission extends Omit<Company, 'id' | 'createdAt' | 'updatedAt'> {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  submittedBy?: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export async function getCompanySubmissions(): Promise<CompanySubmission[]> {
  try {
    const submissions = await prisma.companySubmission.findMany({
      orderBy: { submittedAt: 'desc' },
    })

    return submissions.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      website: s.website || undefined,
      logoUrl: s.logoUrl || undefined,
      founders: JSON.parse(s.founders) as string[],
      ceo: s.ceo || undefined,
      foundedYear: s.foundedYear || undefined,
      funding: s.funding ? (tryParseJSON(s.funding) || s.funding) : undefined,
      valuation: s.valuation || undefined,
      products: JSON.parse(s.products) as string[],
      controversies: s.controversies ? (tryParseControversies(s.controversies)) : undefined,
      layoffs: s.layoffs ? (JSON.parse(s.layoffs) as Company['layoffs']) : undefined,
      tags: JSON.parse(s.tags) as Company['tags'],
      citations: s.citations ? (tryParseJSON(s.citations) as Company['citations']) : undefined,
      featured: s.featured,
      status: s.status as 'pending' | 'approved' | 'rejected',
      submittedAt: s.submittedAt.toISOString(),
      submittedBy: s.submittedBy || undefined,
      reviewedAt: s.reviewedAt?.toISOString(),
      reviewedBy: s.reviewedBy || undefined,
      rejectionReason: s.rejectionReason || undefined,
      approved: s.status === 'approved',
    }))
  } catch (error) {
    console.error('Error reading company submissions:', error)
    return []
  }
}

export async function getPendingCompanySubmissions(): Promise<CompanySubmission[]> {
  const submissions = await getCompanySubmissions()
  return submissions.filter((s) => s.status === 'pending')
}

export async function updateCompanySubmission(
  id: string,
  updates: Partial<CompanySubmission>
): Promise<boolean> {
  try {
    const updateData: any = {}

    if (updates.name) updateData.name = updates.name
    if (updates.description) updateData.description = updates.description
    if (updates.website !== undefined) updateData.website = updates.website
    if (updates.logoUrl !== undefined) updateData.logoUrl = updates.logoUrl
    if (updates.founders) updateData.founders = JSON.stringify(updates.founders)
    if (updates.ceo !== undefined) updateData.ceo = updates.ceo
    if (updates.foundedYear !== undefined) updateData.foundedYear = updates.foundedYear
    if (updates.funding !== undefined) {
      updateData.funding = typeof updates.funding === 'string' 
        ? updates.funding 
        : JSON.stringify(updates.funding)
    }
    if (updates.valuation !== undefined) updateData.valuation = updates.valuation
    if (updates.products) updateData.products = JSON.stringify(updates.products)
    if (updates.controversies !== undefined) updateData.controversies = updates.controversies ? JSON.stringify(updates.controversies) : null
    if (updates.layoffs) updateData.layoffs = JSON.stringify(updates.layoffs)
    if (updates.tags) updateData.tags = JSON.stringify(updates.tags)
    if (updates.citations !== undefined) updateData.citations = updates.citations ? JSON.stringify(updates.citations) : null
    if (updates.status) updateData.status = updates.status
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.reviewedAt) updateData.reviewedAt = new Date(updates.reviewedAt)
    if (updates.reviewedBy) updateData.reviewedBy = updates.reviewedBy
    if (updates.rejectionReason !== undefined) updateData.rejectionReason = updates.rejectionReason

    await prisma.companySubmission.update({
      where: { id },
      data: updateData,
    })

    // If approved, also create the company
    if (updates.status === 'approved') {
      const submission = await prisma.companySubmission.findUnique({ where: { id } })
      if (submission) {
        await prisma.company.create({
          data: {
            name: submission.name,
            description: submission.description,
            website: submission.website,
            logoUrl: submission.logoUrl,
            founders: submission.founders,
            ceo: submission.ceo,
            foundedYear: submission.foundedYear,
            funding: submission.funding,
            valuation: submission.valuation,
            products: submission.products,
            controversies: submission.controversies,
            layoffs: submission.layoffs,
            tags: submission.tags,
            citations: submission.citations,
            featured: submission.featured,
            approved: true,
          },
        })
      }
    }

    return true
  } catch (error) {
    console.error('Error updating company submission:', error)
    return false
  }
}

export async function deleteCompanySubmission(id: string): Promise<boolean> {
  try {
    await prisma.companySubmission.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting company submission:', error)
    return false
  }
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
