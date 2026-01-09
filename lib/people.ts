import { Person } from '@/types/person'
import { prisma } from './prisma'

/**
 * Get person by slug
 */
export async function getPersonBySlug(slug: string): Promise<Person | null> {
  try {
    const person = await prisma.person.findUnique({
      where: { slug },
      include: {
        boardPositions: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
        investments: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
            investorCompany: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
        foundedCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    })

    if (!person) return null

    return {
      id: person.id,
      name: person.name,
      slug: person.slug || undefined,
      bio: person.bio || undefined,
      photoUrl: person.photoUrl || undefined,
      photoSource: person.photoSource || undefined,
      photoSourceUrl: person.photoSourceUrl || undefined,
      linkedinUrl: person.linkedinUrl || undefined,
      twitterHandle: person.twitterHandle || undefined,
      wikipediaUrl: person.wikipediaUrl || undefined,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching person by slug:', error)
    return null
  }
}

/**
 * Get person by ID
 */
export async function getPersonById(id: string): Promise<Person | null> {
  try {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        boardPositions: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
        investments: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
            investorCompany: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
        foundedCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    })

    if (!person) return null

    return {
      id: person.id,
      name: person.name,
      slug: person.slug || undefined,
      bio: person.bio || undefined,
      photoUrl: person.photoUrl || undefined,
      photoSource: person.photoSource || undefined,
      photoSourceUrl: person.photoSourceUrl || undefined,
      linkedinUrl: person.linkedinUrl || undefined,
      twitterHandle: person.twitterHandle || undefined,
      wikipediaUrl: person.wikipediaUrl || undefined,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching person by ID:', error)
    return null
  }
}

/**
 * Get person with relationships (board positions, investments, founded companies)
 */
export async function getPersonWithRelationships(slugOrId: string) {
  const person = await getPersonBySlug(slugOrId) || await getPersonById(slugOrId)
  if (!person) return null

  const dbPerson = await prisma.person.findUnique({
    where: { id: person.id },
    include: {
      boardPositions: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      },
      investments: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
          investorCompany: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      },
      foundedCompanies: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })

  if (!dbPerson) return null

  return {
    person,
    boardPositions: dbPerson.boardPositions.map((bp) => ({
      id: bp.id,
      personId: bp.personId,
      companyId: bp.companyId,
      title: bp.title || undefined,
      startDate: bp.startDate?.toISOString() || undefined,
      endDate: bp.endDate?.toISOString() || undefined,
      company: {
        id: bp.company.id,
        name: bp.company.name,
        slug: bp.company.slug || undefined,
        logoUrl: bp.company.logoUrl || undefined,
      },
    })),
    investments: dbPerson.investments.map((inv) => ({
      id: inv.id,
      personId: inv.personId || undefined,
      companyId: inv.companyId,
      investorCompanyId: inv.investorCompanyId || undefined,
      amount: inv.amount || undefined,
      round: inv.round || undefined,
      date: inv.date || undefined,
      role: inv.role || undefined,
      company: {
        id: inv.company.id,
        name: inv.company.name,
        slug: inv.company.slug || undefined,
        logoUrl: inv.company.logoUrl || undefined,
      },
      investorCompany: inv.investorCompany
        ? {
            id: inv.investorCompany.id,
            name: inv.investorCompany.name,
            slug: inv.investorCompany.slug || undefined,
            logoUrl: inv.investorCompany.logoUrl || undefined,
          }
        : undefined,
    })),
    foundedCompanies: dbPerson.foundedCompanies.map((fc) => ({
      id: fc.id,
      personId: fc.personId,
      companyId: fc.companyId,
      company: {
        id: fc.company.id,
        name: fc.company.name,
        slug: fc.company.slug || undefined,
        logoUrl: fc.company.logoUrl || undefined,
      },
    })),
  }
}
