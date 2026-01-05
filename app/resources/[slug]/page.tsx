import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getResourceBySlug, getResourceById, getApprovedResources } from '@/lib/resources'
import Link from 'next/link'
import { generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'
import { Resource } from '@/types/resource'
import ShareButtons from '@/components/ShareButtons'
import ReportButton from '@/components/ReportButton'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

interface ResourcePageProps {
  params: Promise<{ slug: string }>
}

// Helper to check if a string looks like a CUID (typically starts with 'c' and is 25 chars)
function looksLikeId(str: string): boolean {
  return str.length === 25 && str.match(/^c[a-z0-9]+$/) !== null
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Try to find by slug first, then by ID (for backward compatibility)
  let resource = await getResourceBySlug(slug)
  if (!resource && looksLikeId(slug)) {
    resource = await getResourceById(slug)
  }
  
  if (!resource) {
    return {
      title: 'Resource Not Found - Butji.com',
    }
  }

  // If found by ID but has slug, redirect to slug URL in component
  // For metadata, use the slug URL if available
  const urlPath = resource.slug || slug
  const url = `${baseUrl}/resources/${urlPath}`

  return {
    title: `${resource.title} - Anti-AI Resource | Butji.com`,
    description: resource.description.substring(0, 160),
    keywords: ['anti-AI', 'privacy tools', resource.category, ...resource.tags].join(', '),
    openGraph: {
      title: resource.title,
      description: resource.description.substring(0, 160),
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: resource.title,
      description: resource.description.substring(0, 160),
    },
    alternates: {
      canonical: url,
    },
  }
}

export async function generateStaticParams() {
  const resources = await getApprovedResources()
  // Only generate static params for resources with slugs
  return resources
    .filter((r) => r.slug)
    .slice(0, 100)
    .map((resource) => ({
      slug: resource.slug!,
    }))
}

function getRelatedResources(currentResource: Resource, allResources: Resource[]): Resource[] {
  return allResources
    .filter((r) => 
      r.id !== currentResource.id && 
      (r.category === currentResource.category || 
       r.tags.some(tag => currentResource.tags.includes(tag)))
    )
    .slice(0, 6)
}

const categoryLabels: Record<Resource['category'], string> = {
  tool: 'Tool',
  website: 'Website',
  article: 'Article',
  community: 'Community',
  service: 'Service',
  extension: 'Extension',
  other: 'Other',
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { slug } = await params
  
  // Try to find by slug first, then by ID (for backward compatibility)
  let resource = await getResourceBySlug(slug)
  if (!resource && looksLikeId(slug)) {
    resource = await getResourceById(slug)
    // If found by ID but has slug, redirect to slug URL
    if (resource && resource.slug) {
      redirect(`/resources/${resource.slug}`)
    }
  }

  if (!resource) {
    notFound()
  }

  const allResources = await getApprovedResources()
  const relatedResources = getRelatedResources(resource, allResources)

  const urlPath = resource.slug || slug
  const resourceUrl = `${baseUrl}/resources/${urlPath}`

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Resources', url: baseUrl },
    { name: resource.title, url: resourceUrl },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(breadcrumbSchema),
        }}
      />
      <div className="min-h-screen bg-cyber-darker relative">
        {/* Scan line overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
          <div className="h-full w-full" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
          }}></div>
        </div>
        
        <header className="bg-cyber-dark border-b border-cyber-cyan/40 cyber-border relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav aria-label="Breadcrumb">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-cyber-cyan hover:text-cyber-cyan/80 font-mono mb-4 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
                <span>Back to Resources</span>
              </Link>
            </nav>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold neon-cyan font-mono uppercase tracking-wider glitch-text" data-text={resource.title}>
                    {resource.title}
                  </h1>
                  <ReportButton
                    type="resource"
                    targetId={resource.id}
                    targetName={resource.title}
                  />
                </div>
                {resource.featured && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-sm bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 font-mono uppercase terminal-glow">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <article className="bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border p-8 terminal-glow space-y-6">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
                &gt; About
              </h2>
              <p className="text-cyber-cyan/90 font-mono leading-relaxed text-lg">
                {resource.description}
              </p>
            </section>

            {/* Link */}
            <section>
              <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
                &gt; Visit Resource
              </h2>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 resistance-accent text-cyber-cyan rounded-sm font-bold hover:opacity-90 transition-all font-mono uppercase border border-cyber-cyan/60 terminal-glow"
              >
                Visit {categoryLabels[resource.category]} →
              </a>
            </section>

            {/* Share Buttons */}
            <section>
              <ShareButtons resource={resource} resourceUrl={resourceUrl} />
            </section>

            {/* Category and Tags */}
            <section>
              <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
                &gt; Category & Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/40 rounded-sm font-mono font-bold uppercase">
                  {categoryLabels[resource.category]}
                </span>
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-cyber-dark text-cyber-cyan/80 border border-cyber-cyan/30 rounded-sm font-mono text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
                  &gt; Related Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedResources.map((related) => (
                    <Link
                      key={related.id}
                      href={`/resources/${related.slug || related.id}`}
                      className="block p-4 bg-cyber-dark border border-cyber-cyan/30 rounded-sm hover:border-cyber-cyan/60 transition-all"
                    >
                      <h3 className="text-lg font-bold text-cyber-cyan mb-2 font-mono">
                        &gt; {related.title}
                      </h3>
                      <p className="text-cyber-cyan/70 text-sm font-mono line-clamp-2">
                        {related.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>
      </div>
    </>
  )
}
