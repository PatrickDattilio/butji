import { NextRequest, NextResponse } from 'next/server'
import { addSubmission } from '@/lib/submissions'
import { Submission, ResourceCategory, ResourceTag } from '@/types/resource'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, url, category, tags, submittedBy } = body

    // Validation
    if (!title || !description || !url || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories: ResourceCategory[] = [
      'tool',
      'website',
      'article',
      'community',
      'service',
      'extension',
      'other',
    ]
    if (!validCategories.includes(category as ResourceCategory)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate tags
    const validTags: ResourceTag[] = [
      'detection',
      'protection',
      'privacy',
      'verification',
      'education',
      'advocacy',
      'research',
      'legal',
    ]
    const validatedTags = (tags || []).filter((tag: string) =>
      validTags.includes(tag as ResourceTag)
    )

    // Create submission
    const submission: Submission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      category: category as ResourceCategory,
      tags: validatedTags as ResourceTag[],
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submittedBy: submittedBy?.trim() || 'Anonymous',
    }

    await addSubmission(submission)

    return NextResponse.json(
      { message: 'Submission received! It will be reviewed by an admin.', submission },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting resource:', error)
    return NextResponse.json(
      { error: 'Failed to submit resource' },
      { status: 500 }
    )
  }
}

