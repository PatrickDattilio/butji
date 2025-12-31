import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating CompanySubmission table...')
  
  // Drop table if it exists (to recreate with correct schema)
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "CompanySubmission" CASCADE;`)
    console.log('Dropped existing table (if any)')
  } catch (e) {
    console.log('No existing table to drop')
  }
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE "CompanySubmission" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "website" TEXT,
      "founders" TEXT NOT NULL,
      "ceo" TEXT,
      "foundedYear" INTEGER,
      "funding" TEXT,
      "valuation" TEXT,
      "products" TEXT NOT NULL,
      "controversies" TEXT,
      "layoffs" TEXT,
      "tags" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "submittedBy" TEXT,
      "reviewedAt" TIMESTAMP(3),
      "reviewedBy" TEXT,
      "rejectionReason" TEXT,
      CONSTRAINT "CompanySubmission_pkey" PRIMARY KEY ("id")
    );
  `)

  await prisma.$executeRawUnsafe(`
    CREATE INDEX "CompanySubmission_status_idx" ON "CompanySubmission"("status");
  `)

  console.log('CompanySubmission table created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
