import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateSubmission, deleteSubmission } from '@/lib/submissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { action, rejectionReason, reviewedBy, edits } = body
    const { id } = params

    if (!action || !['approve', 'reject', 'update'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve", "reject", or "update"' },
        { status: 400 }
      )
    }

    // Check if submission exists (will be verified in updateSubmission)

    if (action === 'update') {
      // Update submission fields without changing status
      if (!edits) {
        return NextResponse.json(
          { error: 'Edits are required for update action' },
          { status: 400 }
        )
      }

      const updated = await updateSubmission(id, {
        title: edits.title,
        description: edits.description,
        url: edits.url,
        category: edits.category,
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
      // Update submission with edits if provided, then approve
      const updateData: any = {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewedBy || 'Admin',
        approved: true,
      }

      if (edits) {
        updateData.title = edits.title
        updateData.description = edits.description
        updateData.url = edits.url
        updateData.category = edits.category
        updateData.tags = edits.tags
      }

      const updated = await updateSubmission(id, updateData)

      if (!updated) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Submission approved' })
    } else if (action === 'reject') {
      const updated = await updateSubmission(id, {
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
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params
    const deleted = await deleteSubmission(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Submission deleted' })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}

