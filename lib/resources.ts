import { Resource } from '@/types/resource'
import { prisma } from './prisma'
import { getSubmissions } from './submissions'

export async function getAllResources(): Promise<Resource[]> {
  try {
    // Get approved resources from database
    const dbResources = await prisma.resource.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
    })

    // Get approved submissions
    const submissions = await getSubmissions()
    const approvedSubmissions = submissions
      .filter((s) => s.status === 'approved')
      .map((s) => {
        const { status, reviewedAt, reviewedBy, rejectionReason, ...resource } = s
        return { ...resource, approved: true } as Resource
      })

    // Combine both sources
    const dbResourcesFormatted: Resource[] = dbResources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      category: r.category as Resource['category'],
      tags: JSON.parse(r.tags) as Resource['tags'],
      featured: r.featured,
      approved: r.approved,
    }))

    return [...dbResourcesFormatted, ...approvedSubmissions]
  } catch (error) {
    console.error('Error fetching resources:', error)
    return []
  }
}

export async function getApprovedResources(): Promise<Resource[]> {
  const all = await getAllResources()
  return all.filter((r) => r.approved !== false)
}

export async function createResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
  const created = await prisma.resource.create({
    data: {
      title: resource.title,
      description: resource.description,
      url: resource.url,
      category: resource.category,
      tags: JSON.stringify(resource.tags),
      featured: resource.featured || false,
      approved: resource.approved !== false,
    },
  })

  return {
    id: created.id,
    title: created.title,
    description: created.description,
    url: created.url,
    category: created.category as Resource['category'],
    tags: JSON.parse(created.tags) as Resource['tags'],
    featured: created.featured,
    approved: created.approved,
  }
}
