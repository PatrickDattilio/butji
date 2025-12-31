import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const submission = await prisma.companySubmission.create({
      data: {
        name: body.name,
        description: body.description,
        website: body.website || null,
        founders: JSON.stringify(body.founders || []),
        ceo: body.ceo || null,
        foundedYear: body.foundedYear || null,
        funding: body.funding || null,
        valuation: body.valuation || null,
        products: JSON.stringify(body.products || []),
        controversies: body.controversies || null,
        tags: JSON.stringify(body.tags || []),
        submittedBy: body.submittedBy || null,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating company submission:', error)
    return NextResponse.json(
      { error: 'Failed to submit company' },
      { status: 500 }
    )
  }
}
