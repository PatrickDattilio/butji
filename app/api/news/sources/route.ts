import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getNewsSources, createNewsSource } from '@/lib/news'

export async function GET() {
  try {
    const sources = await getNewsSources()
    return NextResponse.json(sources)
  } catch (error) {
    console.error('Error fetching news sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news sources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, url, type = 'rss', enabled = true } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const source = await createNewsSource({
      name: name.trim(),
      url: url.trim(),
      type: type === 'api' ? 'api' : 'rss',
      enabled,
    })

    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    console.error('Error creating news source:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create news source',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
