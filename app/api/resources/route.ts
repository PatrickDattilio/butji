import { NextResponse } from 'next/server'
import { getApprovedResources } from '@/lib/resources'

export async function GET() {
  try {
    const resources = await getApprovedResources()
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

