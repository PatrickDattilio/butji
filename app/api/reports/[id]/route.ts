import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getReportById, updateReportStatus } from '@/lib/reports'
import { ReportStatus } from '@/types/report'
import { sanitizeText } from '@/lib/sanitize'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const report = await getReportById(id)

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.status || !body.reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: status and reviewedBy are required' },
        { status: 400 }
      )
    }

    // Validate status enum
    const validStatuses: ReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Sanitize adminNotes if provided
    let sanitizedNotes: string | undefined
    if (body.adminNotes) {
      try {
        sanitizedNotes = sanitizeText(body.adminNotes, 10000)
      } catch (sanitizeError) {
        const errorMessage = sanitizeError instanceof Error ? sanitizeError.message : 'Invalid admin notes'
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }
    }

    const report = await updateReportStatus(
      id,
      body.status as ReportStatus,
      body.reviewedBy,
      sanitizedNotes
    )

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating report:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update report'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
