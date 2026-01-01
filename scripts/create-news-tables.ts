import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating NewsSource and NewsArticle tables...')

  try {
    // Create NewsSource table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsSource" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'rss',
        "enabled" BOOLEAN NOT NULL DEFAULT true,
        "lastFetched" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create NewsArticle table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsArticle" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "url" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "sourceUrl" TEXT,
        "imageUrl" TEXT,
        "publishedAt" TIMESTAMP(3) NOT NULL,
        "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "tags" TEXT,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "approved" BOOLEAN NOT NULL DEFAULT true,

        CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NewsSource_enabled_idx" ON "NewsSource"("enabled");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NewsArticle_approved_idx" ON "NewsArticle"("approved");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NewsArticle_source_idx" ON "NewsArticle"("source");
    `)

    console.log('✓ Tables created successfully!')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
