import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getCompanySubmissions, getPendingCompanySubmissions } from '@/lib/companySubmissions'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    if (status === 'pending') {
      const pending = await getPendingCompanySubmissions()
      return NextResponse.json(pending)
    }

    const all = await getCompanySubmissions()
    return NextResponse.json(all)
  } catch (error) {
    console.error('Error fetching company submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company submissions' },
      { status: 500 }
    )
  }
}
