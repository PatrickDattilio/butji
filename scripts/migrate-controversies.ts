/**
 * Migration script to convert controversies from plain text to structured ControversyInfo[] format
 * 
 * This script:
 * 1. Reads all companies and company submissions with controversies
 * 2. Converts text controversies to ControversyInfo[] format
 * 3. Moves citations from citations.controversies to each controversy's citations array
 * 4. Updates the database records
 * 
 * Run with: npx tsx scripts/migrate-controversies.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface OldCitations {
  controversies?: Array<{ url: string; title?: string; date?: string }>
  [key: string]: any
}

async function migrateControversies() {
  console.log('Starting controversies migration...')

  // Migrate Companies
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { controversies: { not: null } },
        { citations: { not: null } },
      ],
    },
  })

  console.log(`Found ${companies.length} companies to process`)

  let migratedCount = 0
  let skippedCount = 0

  for (const company of companies) {
    try {
      let needsUpdate = false
      let newControversies: any[] | null = null
      let newCitations: OldCitations | null = null

      // Parse existing controversies
      let existingControversies: any = null
      if (company.controversies) {
        try {
          const parsed = JSON.parse(company.controversies)
          if (Array.isArray(parsed)) {
            // Already in new format, skip
            existingControversies = parsed
          } else if (typeof parsed === 'string') {
            // Old format: plain text
            existingControversies = parsed
          }
        } catch {
          // Not JSON, treat as plain text
          existingControversies = company.controversies
        }
      }

      // Parse existing citations
      let existingCitations: OldCitations = {}
      if (company.citations) {
        try {
          existingCitations = JSON.parse(company.citations) || {}
        } catch {
          // Invalid JSON, ignore
        }
      }

      // Convert if needed
      if (typeof existingControversies === 'string' && existingControversies.trim()) {
        // Old format: convert to array
        const controversyCitations = existingCitations.controversies || []
        
        newControversies = [{
          text: existingControversies.trim(),
          date: undefined,
          citations: controversyCitations.length > 0 ? controversyCitations : undefined,
        }]

        // Remove controversies from citations object
        newCitations = { ...existingCitations }
        delete newCitations.controversies

        needsUpdate = true
      } else if (Array.isArray(existingControversies)) {
        // Already in new format, but check if citations need to be moved
        if (existingCitations.controversies && existingCitations.controversies.length > 0) {
          // Move citations to first controversy if it doesn't have any
          newControversies = [...existingControversies]
          if (newControversies.length > 0 && (!newControversies[0].citations || newControversies[0].citations.length === 0)) {
            newControversies[0] = {
              ...newControversies[0],
              citations: existingCitations.controversies,
            }
          }

          // Remove controversies from citations object
          newCitations = { ...existingCitations }
          delete newCitations.controversies

          needsUpdate = true
        }
      }

      if (needsUpdate) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            controversies: newControversies ? JSON.stringify(newControversies) : null,
            citations: newCitations && Object.keys(newCitations).length > 0 
              ? JSON.stringify(newCitations) 
              : null,
          },
        })
        migratedCount++
        console.log(`✓ Migrated company: ${company.name}`)
      } else {
        skippedCount++
      }
    } catch (error) {
      console.error(`✗ Error migrating company ${company.id}:`, error)
    }
  }

  // Migrate Company Submissions
  const submissions = await prisma.companySubmission.findMany({
    where: {
      OR: [
        { controversies: { not: null } },
        { citations: { not: null } },
      ],
    },
  })

  console.log(`\nFound ${submissions.length} company submissions to process`)

  let submissionMigratedCount = 0
  let submissionSkippedCount = 0

  for (const submission of submissions) {
    try {
      let needsUpdate = false
      let newControversies: any[] | null = null
      let newCitations: OldCitations | null = null

      // Parse existing controversies
      let existingControversies: any = null
      if (submission.controversies) {
        try {
          const parsed = JSON.parse(submission.controversies)
          if (Array.isArray(parsed)) {
            existingControversies = parsed
          } else if (typeof parsed === 'string') {
            existingControversies = parsed
          }
        } catch {
          existingControversies = submission.controversies
        }
      }

      // Parse existing citations
      let existingCitations: OldCitations = {}
      if (submission.citations) {
        try {
          existingCitations = JSON.parse(submission.citations) || {}
        } catch {
          // Invalid JSON, ignore
        }
      }

      // Convert if needed
      if (typeof existingControversies === 'string' && existingControversies.trim()) {
        const controversyCitations = existingCitations.controversies || []
        
        newControversies = [{
          text: existingControversies.trim(),
          date: undefined,
          citations: controversyCitations.length > 0 ? controversyCitations : undefined,
        }]

        newCitations = { ...existingCitations }
        delete newCitations.controversies

        needsUpdate = true
      } else if (Array.isArray(existingControversies)) {
        if (existingCitations.controversies && existingCitations.controversies.length > 0) {
          newControversies = [...existingControversies]
          if (newControversies.length > 0 && (!newControversies[0].citations || newControversies[0].citations.length === 0)) {
            newControversies[0] = {
              ...newControversies[0],
              citations: existingCitations.controversies,
            }
          }

          newCitations = { ...existingCitations }
          delete newCitations.controversies

          needsUpdate = true
        }
      }

      if (needsUpdate) {
        await prisma.companySubmission.update({
          where: { id: submission.id },
          data: {
            controversies: newControversies ? JSON.stringify(newControversies) : null,
            citations: newCitations && Object.keys(newCitations).length > 0 
              ? JSON.stringify(newCitations) 
              : null,
          },
        })
        submissionMigratedCount++
        console.log(`✓ Migrated submission: ${submission.name}`)
      } else {
        submissionSkippedCount++
      }
    } catch (error) {
      console.error(`✗ Error migrating submission ${submission.id}:`, error)
    }
  }

  console.log('\n=== Migration Summary ===')
  console.log(`Companies: ${migratedCount} migrated, ${skippedCount} skipped`)
  console.log(`Submissions: ${submissionMigratedCount} migrated, ${submissionSkippedCount} skipped`)
  console.log('Migration complete!')
}

migrateControversies()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
