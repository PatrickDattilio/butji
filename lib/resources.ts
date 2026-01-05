import { Resource } from '@/types/resource'
import { prisma } from './prisma'
import { getSubmissions } from './submissions'

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Ensure slug is unique by appending a number if needed
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  const maxAttempts = 1000

  while (counter < maxAttempts) {
    const existing = await prisma.resource.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Fallback: append timestamp if still not unique
  return `${baseSlug}-${Date.now()}`
}

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
      slug: r.slug || undefined,
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

export async function getResourceById(id: string): Promise<Resource | null> {
  try {
    // Check database resources first
    const dbResource = await prisma.resource.findUnique({
      where: { id },
    })

    if (dbResource && dbResource.approved) {
      return {
        id: dbResource.id,
        title: dbResource.title,
        description: dbResource.description,
        url: dbResource.url,
        category: dbResource.category as Resource['category'],
        tags: JSON.parse(dbResource.tags) as Resource['tags'],
        slug: dbResource.slug || undefined,
        featured: dbResource.featured,
        approved: dbResource.approved,
      }
    }

    // Check approved submissions
    const submissions = await getSubmissions()
    const submission = submissions.find((s) => s.id === id && s.status === 'approved')
    
    if (submission) {
      const { status, reviewedAt, reviewedBy, rejectionReason, ...resource } = submission
      return { ...resource, approved: true } as Resource
    }

    return null
  } catch (error) {
    console.error('Error fetching resource:', error)
    return null
  }
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  try {
    // Check database resources first
    const dbResource = await prisma.resource.findUnique({
      where: { slug },
    })

    if (dbResource && dbResource.approved) {
      return {
        id: dbResource.id,
        title: dbResource.title,
        description: dbResource.description,
        url: dbResource.url,
        category: dbResource.category as Resource['category'],
        tags: JSON.parse(dbResource.tags) as Resource['tags'],
        slug: dbResource.slug || undefined,
        featured: dbResource.featured,
        approved: dbResource.approved,
      }
    }

    // Submissions don't have slugs (they're stored in a different table)
    // So we can't look them up by slug
    return null
  } catch (error) {
    console.error('Error fetching resource by slug:', error)
    return null
  }
}

export async function createResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
  // Generate slug if not provided
  const baseSlug = resource.slug || generateSlug(resource.title)
  const slug = baseSlug ? await ensureUniqueSlug(baseSlug) : null

  const created = await prisma.resource.create({
    data: {
      title: resource.title,
      description: resource.description,
      url: resource.url,
      category: resource.category,
      tags: JSON.stringify(resource.tags),
      slug,
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
    slug: created.slug || undefined,
    featured: created.featured,
    approved: created.approved,
  }
}
