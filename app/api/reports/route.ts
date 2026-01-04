import { NextRequest, NextResponse } from 'next/server'
import { createReport, getReports } from '@/lib/reports'
import { CreateReportInput, ReportType } from '@/types/report'
import { sanitizeReportInput } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.type || !body.targetId || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, targetId, and message are required' },
        { status: 400 }
      )
    }

    // Validate type enum
    if (body.type !== 'company' && body.type !== 'resource') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "company" or "resource"' },
        { status: 400 }
      )
    }

    // Validate message is not empty after trimming
    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Create input object
    const input: CreateReportInput = {
      type: body.type as ReportType,
      targetId: body.targetId,
      reporterEmail: body.reporterEmail,
      field: body.field,
      newValue: body.newValue,
      source: body.source,
      message: body.message,
    }

    // Sanitize input (this will also validate lengths and formats)
    try {
      const sanitized = sanitizeReportInput(input)
      const report = await createReport(sanitized)
      return NextResponse.json(report, { status: 201 })
    } catch (sanitizeError) {
      // Return user-friendly error messages from sanitization
      const errorMessage = sanitizeError instanceof Error ? sanitizeError.message : 'Invalid input'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const targetId = searchParams.get('targetId')

    const filters: any = {}
    if (status) filters.status = status
    if (type) filters.type = type
    if (targetId) filters.targetId = targetId

    const reports = await getReports(filters)
    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
