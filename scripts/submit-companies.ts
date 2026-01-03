/**
 * Script to submit companies from companies-data.json to the database
 * 
 * Usage:
 *   tsx scripts/submit-companies.ts
 * 
 * Make sure the dev server is running on http://localhost:3000
 * Or set BASE_URL environment variable:
 *   BASE_URL=https://butji.com tsx scripts/submit-companies.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const API_URL = `${BASE_URL}/api/companies/submit`

interface CompanyData {
  name: string
  description: string
  website?: string
  ceo?: string
  founders: string[]
  foundedYear?: number
  valuation?: string
  funding?: string
  products: string[]
  controversies?: string
  tags: string[]
}

async function submitCompany(company: CompanyData): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error(`❌ Failed to submit ${company.name}:`, data.error || data.details || data)
      return false
    }
    
    console.log(`✅ Submitted: ${company.name}`)
    return true
  } catch (error) {
    console.error(`❌ Error submitting ${company.name}:`, error)
    return false
  }
}

async function main() {
  const filePath = join(process.cwd(), 'scripts', 'companies-data.json')
  const content = readFileSync(filePath, 'utf-8')
  const companies: CompanyData[] = JSON.parse(content)
  
  console.log(`Found ${companies.length} companies to submit\n`)
  console.log(`Submitting to: ${API_URL}\n`)
  
  let successCount = 0
  let failCount = 0
  
  for (const company of companies) {
    const success = await submitCompany(company)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n✅ Successfully submitted: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📊 Total: ${companies.length}`)
}

main().catch(console.error)
