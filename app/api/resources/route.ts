import { NextResponse } from 'next/server'
import { getApprovedResources } from '@/lib/resources'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const resources = await getApprovedResources()
    return NextResponse.json(resources, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

