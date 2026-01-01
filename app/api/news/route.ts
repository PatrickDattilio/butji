import { NextResponse } from 'next/server'
import { getAllNewsArticles } from '@/lib/news'

export async function GET() {
  try {
    const articles = await getAllNewsArticles(100) // Get latest 100 articles
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
