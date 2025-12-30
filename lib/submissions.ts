import { Submission } from '@/types/resource'
import { prisma } from './prisma'

export async function getSubmissions(): Promise<Submission[]> {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { submittedAt: 'desc' },
    })

    return submissions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      url: s.url,
      category: s.category as Submission['category'],
      tags: JSON.parse(s.tags) as Submission['tags'],
      status: s.status as Submission['status'],
      featured: s.featured,
      submittedAt: s.submittedAt.toISOString(),
      submittedBy: s.submittedBy || undefined,
      reviewedAt: s.reviewedAt?.toISOString(),
      reviewedBy: s.reviewedBy || undefined,
      rejectionReason: s.rejectionReason || undefined,
      approved: s.status === 'approved',
    }))
  } catch (error) {
    console.error('Error reading submissions:', error)
    return []
  }
}

export async function addSubmission(submission: Submission): Promise<void> {
  try {
    await prisma.submission.create({
      data: {
        id: submission.id,
        title: submission.title,
        description: submission.description,
        url: submission.url,
        category: submission.category,
        tags: JSON.stringify(submission.tags),
        status: submission.status || 'pending',
        featured: submission.featured || false,
        submittedAt: submission.submittedAt ? new Date(submission.submittedAt) : new Date(),
        submittedBy: submission.submittedBy || null,
      },
    })
  } catch (error) {
    console.error('Error adding submission:', error)
    throw error
  }
}

export async function updateSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<boolean> {
  try {
    const updateData: any = {}

    if (updates.title) updateData.title = updates.title
    if (updates.description) updateData.description = updates.description
    if (updates.url) updateData.url = updates.url
    if (updates.category) updateData.category = updates.category
    if (updates.tags) updateData.tags = JSON.stringify(updates.tags)
    if (updates.status) updateData.status = updates.status
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.reviewedAt) updateData.reviewedAt = new Date(updates.reviewedAt)
    if (updates.reviewedBy) updateData.reviewedBy = updates.reviewedBy
    if (updates.rejectionReason !== undefined) updateData.rejectionReason = updates.rejectionReason

    await prisma.submission.update({
      where: { id },
      data: updateData,
    })

    return true
  } catch (error) {
    console.error('Error updating submission:', error)
    return false
  }
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  const submissions = await getSubmissions()
  return submissions.filter((s) => s.status === 'pending')
}

export async function deleteSubmission(id: string): Promise<boolean> {
  try {
    await prisma.submission.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting submission:', error)
    return false
  }
}

