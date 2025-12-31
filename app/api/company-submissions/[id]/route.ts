import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateCompanySubmission, deleteCompanySubmission } from '@/lib/companySubmissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { action, rejectionReason, reviewedBy, edits } = body
    const { id } = await params

    if (!action || !['approve', 'reject', 'update'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve", "reject", or "update"' },
        { status: 400 }
      )
    }

    if (action === 'update') {
      if (!edits) {
        return NextResponse.json(
          { error: 'Edits are required for update action' },
          { status: 400 }
        )
      }

      const updated = await updateCompanySubmission(id, {
        name: edits.name,
        description: edits.description,
        website: edits.website,
        founders: edits.founders,
        ceo: edits.ceo,
        foundedYear: edits.foundedYear,
        funding: edits.funding,
        valuation: edits.valuation,
        products: edits.products,
        controversies: edits.controversies,
        layoffs: edits.layoffs,
        tags: edits.tags,
      })

      if (!updated) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Submission updated' })
    } else if (action === 'approve') {
      const updateData: any = {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewedBy || 'Admin',
      }

      if (edits) {
        Object.assign(updateData, edits)
      }

      const updated = await updateCompanySubmission(id, updateData)

      if (!updated) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Submission approved' })
    } else if (action === 'reject') {
      const updated = await updateCompanySubmission(id, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewedBy || 'Admin',
        rejectionReason: rejectionReason || 'No reason provided',
      })

      if (!updated) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Submission rejected' })
    }
  } catch (error) {
    console.error('Error updating company submission:', error)
    return NextResponse.json(
      { error: 'Failed to update company submission' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const deleted = await deleteCompanySubmission(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Submission deleted' })
  } catch (error) {
    console.error('Error deleting company submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete company submission' },
      { status: 500 }
    )
  }
}
