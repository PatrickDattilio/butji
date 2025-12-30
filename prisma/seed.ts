import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.resource.deleteMany()
  await prisma.submission.deleteMany()

  // Seed resources
  const resources = [
    {
      title: 'Example Anti-AI Detection Tool',
      description: 'A tool that helps identify AI-generated content and protect against automated systems.',
      url: 'https://example.com',
      category: 'tool',
      tags: JSON.stringify(['detection', 'protection']),
      featured: true,
      approved: true,
    },
    {
      title: 'Human Verification Service',
      description: 'A service that verifies human users and blocks automated bots.',
      url: 'https://example.com',
      category: 'service',
      tags: JSON.stringify(['verification', 'protection']),
      approved: true,
    },
    {
      title: 'AI Ethics Research Group',
      description: 'A community of researchers and advocates working on AI ethics and regulation.',
      url: 'https://example.com',
      category: 'community',
      tags: JSON.stringify(['research', 'advocacy', 'education']),
      featured: true,
      approved: true,
    },
    {
      title: 'Privacy-First Browser Extension',
      description: 'Browser extension that blocks AI tracking and data collection.',
      url: 'https://example.com',
      category: 'extension',
      tags: JSON.stringify(['privacy', 'protection']),
      approved: true,
    },
    {
      title: 'Understanding AI Regulation',
      description: 'Comprehensive article on current AI regulation efforts and how to get involved.',
      url: 'https://example.com',
      category: 'article',
      tags: JSON.stringify(['education', 'legal', 'advocacy']),
      approved: true,
    },
  ]

  for (const resource of resources) {
    await prisma.resource.create({
      data: resource,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


