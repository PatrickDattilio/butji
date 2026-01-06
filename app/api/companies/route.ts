import { NextRequest, NextResponse } from 'next/server'
import { getAllCompanies, createCompany } from '@/lib/companies'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const companies = await getAllCompanies()
    return NextResponse.json(companies, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Clean up controversies - remove empty ones and clean citations within each
    const cleanedControversies = body.controversies && Array.isArray(body.controversies)
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

    const company = await createCompany({
      name: body.name,
      description: body.description,
      website: body.website,
      logoUrl: body.logoUrl,
      founders: body.founders || [],
      ceo: body.ceo,
      foundedYear: body.foundedYear,
      funding: body.funding,
      valuation: body.valuation,
      products: body.products || [],
      controversies: cleanedControversies,
      layoffs: body.layoffs,
      tags: body.tags || [],
      citations: cleanedCitations,
      featured: body.featured || false,
      approved: body.approved !== false,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
