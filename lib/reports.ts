import { Report, CreateReportInput, ReportStatus } from '@/types/report'
import { prisma } from './prisma'
import { sanitizeReportInput, sanitizeText } from './sanitize'

// Get field names for companies (for dropdown)
export function getCompanyFieldNames(): string[] {
  return [
    'Description',
    'CEO',
    'Founded Year',
    'Valuation',
    'Funding',
    'Founders',
    'Products',
    'Controversies',
    'Layoffs',
    'Tags',
    'Website',
    'Logo URL',
    'Other',
  ]
}

// Get field names for resources (for dropdown)
export function getResourceFieldNames(): string[] {
  return [
    'Title',
    'Description',
    'URL',
    'Category',
    'Tags',
    'Other',
  ]
}

// Create a new report
export async function createReport(input: CreateReportInput): Promise<Report> {
  try {
    // Sanitize input
    const sanitized = sanitizeReportInput(input)

    // Verify target exists
    if (sanitized.type === 'company') {
      const company = await prisma.company.findUnique({
        where: { id: sanitized.targetId },
      })
      if (!company) {
        throw new Error('Company not found')
      }
    } else if (sanitized.type === 'resource') {
      const resource = await prisma.resource.findUnique({
        where: { id: sanitized.targetId },
      })
      if (!resource) {
        throw new Error('Resource not found')
      }
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        type: sanitized.type,
        targetId: sanitized.targetId,
        reporterEmail: sanitized.reporterEmail || null,
        field: sanitized.field || null,
        newValue: sanitized.newValue || null,
        source: sanitized.source || null,
        message: sanitized.message,
        status: 'pending',
      },
    })

    return mapDbReportToReport(report)
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}

// Get reports with optional filters
export async function getReports(filters?: {
  status?: ReportStatus
  type?: 'company' | 'resource'
  targetId?: string
}): Promise<Report[]> {
  try {
    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.type) where.type = filters.type
    if (filters?.targetId) where.targetId = filters.targetId

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return reports.map(mapDbReportToReport)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return []
  }
}

// Get single report by ID
export async function getReportById(id: string): Promise<Report | null> {
  try {
    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) return null

    return mapDbReportToReport(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return null
  }
}

// Update report status
export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  reviewedBy: string,
  adminNotes?: string
): Promise<Report> {
  try {
    // Sanitize admin notes
    const sanitizedNotes = adminNotes ? sanitizeText(adminNotes, 10000) : null

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        adminNotes: sanitizedNotes || null,
      },
    })

    return mapDbReportToReport(report)
  } catch (error) {
    console.error('Error updating report status:', error)
    throw error
  }
}

// Helper to map database report to Report interface
function mapDbReportToReport(dbReport: any): Report {
  return {
    id: dbReport.id,
    type: dbReport.type as Report['type'],
    targetId: dbReport.targetId,
    reporterEmail: dbReport.reporterEmail || undefined,
    field: dbReport.field || undefined,
    newValue: dbReport.newValue || undefined,
    source: dbReport.source || undefined,
    message: dbReport.message,
    status: dbReport.status as ReportStatus,
    createdAt: dbReport.createdAt,
    reviewedAt: dbReport.reviewedAt || undefined,
    reviewedBy: dbReport.reviewedBy || undefined,
    adminNotes: dbReport.adminNotes || undefined,
  }
}
