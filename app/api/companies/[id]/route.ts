import { NextRequest, NextResponse } from 'next/server'
import { getCompanyById, updateCompany, deleteCompany } from '@/lib/companies'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const company = await getCompanyById(id)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}

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
    
    // Clean up controversies - remove empty ones and clean citations within each
    const cleanedControversies = body.controversies !== undefined
      ? (Array.isArray(body.controversies)
          ? body.controversies
              .map((c: any) => {
                if (!c || !c.text || !c.text.trim()) return null
                // Clean citations within controversy
                const cleanedCitations = c.citations && Array.isArray(c.citations)
                  ? c.citations.filter((cit: any) => cit && cit.url && cit.url.trim())
                  : []
                return {
                  text: c.text.trim(),
                  date: c.date?.trim() || undefined,
                  citations: cleanedCitations.length > 0 ? cleanedCitations : undefined,
                }
              })
              .filter((c: any) => c !== null)
          : undefined)
      : undefined

    // Clean up citations - remove empty citations and empty fields
    // Also remove 'controversies' key since citations are now embedded in controversy objects
    const cleanedCitations = body.citations ? Object.entries(body.citations).reduce((acc, [key, value]) => {
      // Skip controversies key - citations are now embedded in controversy objects
      if (key === 'controversies') return acc
      const citations = (value as any[]).filter((c: any) => c.url && c.url.trim())
      if (citations.length > 0) {
        acc[key] = citations
      }
      return acc
    }, {} as Record<string, any>) : undefined

    const updateData = { ...body }
    if (cleanedControversies !== undefined) {
      updateData.controversies = cleanedControversies.length > 0 ? cleanedControversies : undefined
    }
    if (cleanedCitations !== undefined) {
      updateData.citations = cleanedCitations
    }
    
    const company = await updateCompany(id, updateData)
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
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
    await deleteCompany(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
