import { NextRequest, NextResponse } from 'next/server'
import { getAllCompanies, createCompany } from '@/lib/companies'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const companies = await getAllCompanies()
    return NextResponse.json(companies)
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
    const company = await createCompany({
      name: body.name,
      description: body.description,
      website: body.website,
      founders: body.founders || [],
      ceo: body.ceo,
      foundedYear: body.foundedYear,
      funding: body.funding,
      valuation: body.valuation,
      products: body.products || [],
      controversies: body.controversies,
      layoffs: body.layoffs,
      tags: body.tags || [],
      featured: body.featured || false,
      approved: body.approved !== false,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
