import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      error: null,
    },
    companies: {
      count: 0,
      error: null,
      sample: null,
    },
    resources: {
      count: 0,
      error: null,
      sample: null,
    },
  }

  // Test database connection
  try {
    await prisma.$connect()
    diagnostics.database.connected = true
  } catch (error: any) {
    diagnostics.database.error = error.message
    return NextResponse.json(diagnostics, { status: 500 })
  }

  // Test companies query
  try {
    const companies = await prisma.company.findMany({
      where: { approved: true },
      take: 5,
    })
    diagnostics.companies.count = await prisma.company.count({ where: { approved: true } })
    if (companies.length > 0) {
      diagnostics.companies.sample = {
        id: companies[0].id,
        name: companies[0].name,
        approved: companies[0].approved,
        founders: companies[0].founders,
        tags: companies[0].tags,
      }
      
      // Test JSON parsing
      try {
        JSON.parse(companies[0].founders)
        diagnostics.companies.sample.parsedFounders = 'OK'
      } catch (parseError: any) {
        diagnostics.companies.sample.parsedFounders = `ERROR: ${parseError.message}`
      }
      
      try {
        JSON.parse(companies[0].tags)
        diagnostics.companies.sample.parsedTags = 'OK'
      } catch (parseError: any) {
        diagnostics.companies.sample.parsedTags = `ERROR: ${parseError.message}`
      }
    }
  } catch (error: any) {
    diagnostics.companies.error = error.message
  }

  // Test resources query
  try {
    const resources = await prisma.resource.findMany({
      where: { approved: true },
      take: 5,
    })
    diagnostics.resources.count = await prisma.resource.count({ where: { approved: true } })
    if (resources.length > 0) {
      diagnostics.resources.sample = {
        id: resources[0].id,
        title: resources[0].title,
        approved: resources[0].approved,
        tags: resources[0].tags,
      }
      
      // Test JSON parsing
      try {
        JSON.parse(resources[0].tags)
        diagnostics.resources.sample.parsedTags = 'OK'
      } catch (parseError: any) {
        diagnostics.resources.sample.parsedTags = `ERROR: ${parseError.message}`
      }
    }
  } catch (error: any) {
    diagnostics.resources.error = error.message
  }

  await prisma.$disconnect()
  
  return NextResponse.json(diagnostics)
}
