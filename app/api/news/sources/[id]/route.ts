import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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
    const { enabled } = body

    const source = await prisma.newsSource.update({
      where: { id },
      data: { enabled },
    })

    return NextResponse.json({
      id: source.id,
      name: source.name,
      url: source.url,
      type: source.type,
      enabled: source.enabled,
      lastFetched: source.lastFetched?.toISOString(),
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error updating news source:', error)
    return NextResponse.json(
      { error: 'Failed to update news source' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.newsSource.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news source:', error)
    return NextResponse.json(
      { error: 'Failed to delete news source' },
      { status: 500 }
    )
  }
}
