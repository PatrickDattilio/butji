import { Company, FundingInfo } from '@/types/company'
import { Person } from '@/types/person'
import { prisma } from './prisma'

// Graph Data Structure Types

export type GraphNodeType = 'company' | 'person' | 'data-center' | 'capital'

export interface GraphNode {
  id: string
  name: string
  type: GraphNodeType
  logoUrl?: string
  photoUrl?: string
  slug?: string
  metadata?: {
    companyId?: string
    personId?: string
    dataCenterId?: string
    capitalId?: string
    [key: string]: unknown
  }
}

export type GraphLinkType =
  | 'investor' // Person/Company → Company (investment)
  | 'parent' // Company → Company (parent)
  | 'subsidiary' // Company → Company (subsidiary)
  | 'board-member' // Person → Company (board position)
  | 'founder' // Person → Company (founded)
  | 'partnership' // Company → Company (partnership)
  | 'data-center-owner' // Company → DataCenter (owns)
  | 'data-center-user' // Company → DataCenter (uses)

export interface GraphLink {
  source: string // Node ID
  target: string // Node ID
  type: GraphLinkType
  strength?: number // For link thickness/visual weight
  metadata?: {
    amount?: string
    title?: string
    date?: string
    [key: string]: unknown
  }
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// Helper Functions

/**
 * Normalize a person name for deduplication
 * Removes common variations like middle initials, suffixes, etc.
 */
function normalizePersonName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/\s+(jr|sr|ii|iii|iv|phd|md|esq)\.?$/i, '')
    // Remove middle initials (e.g., "John D. Doe" -> "john doe")
    .replace(/\s+[a-z]\.\s+/i, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
}

/**
 * Check if two person names likely refer to the same person
 */
function areSamePerson(name1: string, name2: string): boolean {
  const normalized1 = normalizePersonName(name1)
  const normalized2 = normalizePersonName(name2)
  
  // Exact match after normalization
  if (normalized1 === normalized2) return true
  
  // Check if one is a subset of the other (e.g., "Reid Hoffman" vs "Reid G. Hoffman")
  const parts1 = normalized1.split(' ').filter(p => p.length > 1)
  const parts2 = normalized2.split(' ').filter(p => p.length > 1)
  
  // If they share at least 2 significant parts, likely the same person
  if (parts1.length >= 2 && parts2.length >= 2) {
    const sharedParts = parts1.filter(p => parts2.includes(p))
    if (sharedParts.length >= 2) return true
  }
  
  return false
}

/**
 * Check if a name represents an investment firm/capital entity
 */
function isCapitalEntity(name: string): boolean {
  const lower = name.toLowerCase().trim()
  
  // Investment firm indicators
  const capitalIndicators = [
    'capital', 'ventures', 'partners', 'investment', 'investments',
    'fund', 'funds', 'private equity', 'vc', 'venture capital',
    'equity', 'holdings', 'group', 'asset management',
    'sovereign wealth', 'pension fund', 'endowment',
    'advisors', 'advisory', 'management'
  ]
  
  // Known investment firms
  const knownCapitalEntities = [
    'andreessen horowitz', 'accel', 'kleiner perkins',
    'sequoia capital', 'greylock', 'benchmark', 'insight partners',
    'general catalyst', 'general atlantic', 'silver lake',
    'kkr', 'blackstone', 'carlyle', 'tpg', 'apollo',
    'blackrock', 'vanguard', 'fidelity', 'fidelity investments',
    't rowe price', 'capital group', 'franklin templeton',
    'goldman sachs', 'morgan stanley', 'jp morgan', 'jpmorgan',
    'wells fargo', 'bank of america', 'citigroup',
    'dst global', 'temasek', 'gic', 'softbank', 'vision fund',
    'mubadala', 'qatar investment authority', 'psp investments',
    'cpp investments', 'sovereign wealth fund', 'greycroft',
    'ivp', 'nea', 'asml', 'fujitsu'
  ]
  
  // Check for capital indicators
  if (capitalIndicators.some(indicator => lower.includes(indicator))) {
    return true
  }
  
  // Check against known capital entities
  if (knownCapitalEntities.some(entity => lower === entity || lower.includes(entity))) {
    return true
  }
  
  // Check for patterns like "XX Capital", "XX Ventures", "XX Partners"
  const capitalPattern = /^[a-z\s]+(capital|ventures|partners|investments?|funds?|group|holdings?)$/i
  if (capitalPattern.test(name)) {
    return true
  }
  
  return false
}

/**
 * Extract person names from funding investors array
 */
function extractPersonNamesFromInvestors(investors: string[]): string[] {
  // Common company names that are not people
  const companyIndicators = [
    'inc', 'llc', 'corp', 'ltd', 'ventures', 'capital', 'partners',
    'group', 'holdings', 'technologies', 'systems', 'solutions',
    'company', 'co', 'fund', 'management', 'advisors', 'bank',
    'corporation', 'enterprises', 'industries', 'international'
  ]
  
  // Known company names that might not have indicators
  const knownCompanies = [
    'microsoft', 'google', 'apple', 'amazon', 'meta', 'facebook',
    'morgan stanley', 'goldman sachs', 'jpmorgan', 'nvidia',
    'intel', 'amd', 'oracle', 'ibm', 'salesforce', 'adobe',
    'cisco', 'tesla', 'netflix', 'disney'
  ]
  
  return investors.filter(investor => {
    const lower = investor.toLowerCase().trim()
    // If it contains company indicators, it's likely a company
    if (companyIndicators.some(indicator => lower.includes(indicator))) {
      return false
    }
    // Check against known company names
    if (knownCompanies.some(company => lower === company || lower.includes(company))) {
      return false
    }
    return true
  })
}

/**
 * Extract person names from founders array
 */
function extractPersonNamesFromFounders(founders: string[]): string[] {
  // Founders are typically people, but filter out obvious companies
  const companyIndicators = [
    'inc', 'llc', 'corp', 'ltd', 'ventures', 'capital', 'partners',
    'group', 'holdings', 'technologies', 'systems', 'solutions',
    'company', 'co', 'fund', 'management', 'advisors', 'bank'
  ]
  
  // Known company names that might not have indicators
  const knownCompanies = [
    'microsoft', 'google', 'apple', 'amazon', 'meta', 'facebook',
    'morgan stanley', 'goldman sachs', 'jpmorgan', 'nvidia',
    'intel', 'amd', 'oracle', 'ibm', 'salesforce', 'adobe',
    'cisco', 'tesla', 'netflix', 'disney'
  ]
  
  return founders.filter(founder => {
    const lower = founder.toLowerCase().trim()
    // If it contains company indicators, it's likely a company
    if (companyIndicators.some(indicator => lower.includes(indicator))) {
      return false
    }
    // Check against known company names
    if (knownCompanies.some(company => lower === company || lower.includes(company))) {
      return false
    }
    return true
  })
}

/**
 * Build a set of normalized company names for quick lookup
 */
async function buildCompanyNameSet(companyIds?: string[]): Promise<Set<string>> {
  const companyNameSet = new Set<string>()
  
  // Common company name patterns that don't have indicators
  const knownCompanyNames = [
    'microsoft', 'google', 'apple', 'amazon', 'meta', 'facebook',
    'morgan stanley', 'goldman sachs', 'jpmorgan', 'jpmorgan chase',
    'bank of america', 'wells fargo', 'citigroup', 'barclays', 
    'deutsche bank', 'nvidia', 'intel', 'amd', 'qualcomm', 
    'broadcom', 'oracle', 'ibm', 'salesforce', 'adobe', 'cisco',
    'tesla', 'ford', 'gm', 'general motors', 'toyota',
    'netflix', 'disney', 'warner', 'universal',
  ]
  
  // Add known company names
  for (const name of knownCompanyNames) {
    companyNameSet.add(name.toLowerCase().trim())
  }
  
  // Add company names from database
  try {
    const companies = await prisma.company.findMany({
      where: {
        approved: true,
        ...(companyIds && companyIds.length > 0 ? { id: { in: companyIds } } : {}),
      },
      select: { name: true },
    })
    
    for (const company of companies) {
      const normalized = company.name.toLowerCase().trim()
      companyNameSet.add(normalized)
      // Also add parts of the name (e.g., "Morgan Stanley" -> "morgan stanley")
      const parts = normalized.split(/\s+/).filter(p => p.length > 2)
      for (const part of parts) {
        companyNameSet.add(part)
      }
    }
  } catch (error) {
    // If query fails, just continue (don't block graph generation)
    console.warn('Error building company name set:', error)
  }
  
  return companyNameSet
}

/**
 * Check if a name matches an existing company (to prevent treating companies as people)
 */
function isCompanyName(name: string, companyNameSet: Set<string>): boolean {
  const normalized = name.toLowerCase().trim()
  
  // Check exact match
  if (companyNameSet.has(normalized)) {
    return true
  }
  
  // Check if any part of the name matches a company name
  const parts = normalized.split(/\s+/)
  for (const part of parts) {
    if (part.length > 2 && companyNameSet.has(part)) {
      return true
    }
  }
  
  // Check if normalized name is contained in any company name or vice versa
  for (const companyName of companyNameSet) {
    if (normalized === companyName || 
        normalized.includes(companyName) ||
        companyName.includes(normalized)) {
      // But avoid false positives: "John" shouldn't match "Johnson"
      if (normalized.length >= 3 && companyName.length >= 3) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Find person ID by name in existing personMap (for matching JSON data to database records)
 * Returns null if person not found in map or if name is a company
 */
function findPersonByName(
  name: string,
  personMap: Map<string, Person>,
  personNameToId: Map<string, string>,
  companyNameSet: Set<string>
): string | null {
  // First check if this is actually a company name, not a person
  if (isCompanyName(name, companyNameSet)) {
    return null // Don't treat companies as people
  }
  
  const normalized = normalizePersonName(name)
  
  // Check if we've already seen this person (exact match)
  if (personNameToId.has(normalized)) {
    return personNameToId.get(normalized)!
  }
  
  // Check for similar names (deduplication)
  for (const [existingNormalized, personId] of personNameToId.entries()) {
    if (areSamePerson(name, existingNormalized.replace(/-/g, ' '))) {
      // Use existing person ID
      return personId
    }
  }
  
  // Also check personMap directly by comparing names
  for (const [personId, person] of personMap.entries()) {
    if (areSamePerson(name, person.name)) {
      personNameToId.set(normalized, personId)
      return personId
    }
  }
  
  return null
}

/**
 * Extract relationships from a company's funding data
 * Only creates links for people that already exist in personMap (from database)
 */
function extractFundingRelationships(
  company: Company,
  personMap: Map<string, Person>,
  personNameToId: Map<string, string>,
  companyNameSet: Set<string>
): GraphLink[] {
  const links: GraphLink[] = []
  
  if (!company.funding) return links
  
  let fundingData: FundingInfo | null = null
  
  if (typeof company.funding === 'string') {
    try {
      fundingData = JSON.parse(company.funding) as FundingInfo
    } catch {
      // Not JSON, skip
      return links
    }
  } else {
    fundingData = company.funding
  }
  
  if (!fundingData?.investors || !Array.isArray(fundingData.investors)) {
    return links
  }
  
  const personNames = extractPersonNamesFromInvestors(fundingData.investors)
  
  for (const investorName of personNames) {
    // Only create link if person exists in personMap (has database record)
    // Also checks if name is actually a company (not a person)
    const personId = findPersonByName(investorName, personMap, personNameToId, companyNameSet)
    
    if (personId && personMap.has(personId)) {
      // Check if link already exists (avoid duplicates)
      const linkExists = links.some(
        link => link.source === personId && link.target === company.id && link.type === 'investor'
      )
      
      if (!linkExists) {
        links.push({
          source: personId,
          target: company.id,
          type: 'investor',
          strength: 1,
          metadata: {
            amount: fundingData.total,
            round: fundingData.latestRound,
            date: fundingData.date,
          },
        })
      }
    }
    // If person not in database, skip (they'll be added when data is populated)
  }
  
  return links
}

/**
 * Extract founder relationships from a company
 * Only creates links for people that already exist in personMap (from database)
 */
function extractFounderRelationships(
  company: Company,
  personMap: Map<string, Person>,
  personNameToId: Map<string, string>,
  companyNameSet: Set<string>
): GraphLink[] {
  const links: GraphLink[] = []
  
  if (!company.founders || company.founders.length === 0) {
    return links
  }
  
  const personNames = extractPersonNamesFromFounders(company.founders)
  
  for (const founderName of personNames) {
    // Only create link if person exists in personMap (has database record)
    // Also checks if name is actually a company (not a person)
    const personId = findPersonByName(founderName, personMap, personNameToId, companyNameSet)
    
    if (personId && personMap.has(personId)) {
      // Check if link already exists (avoid duplicates)
      const linkExists = links.some(
        link => link.source === personId && link.target === company.id && link.type === 'founder'
      )
      
      if (!linkExists) {
        links.push({
          source: personId,
          target: company.id,
          type: 'founder',
          strength: 2, // Founders have stronger relationships
        })
      }
    }
    // If person not in database, skip (they'll be added when data is populated)
  }
  
  return links
}

/**
 * Extract parent/subsidiary relationships from companies
 */
function extractHierarchyRelationships(companies: Company[]): GraphLink[] {
  const links: GraphLink[] = []
  
  for (const company of companies) {
    if (company.parentCompanyId) {
      links.push({
        source: company.parentCompanyId,
        target: company.id,
        type: 'subsidiary',
        strength: 3, // Strong hierarchical relationship
      })
    }
  }
  
  return links
}

/**
 * Extract partnership relationships from companies
 */
function extractPartnershipRelationships(companies: Company[]): GraphLink[] {
  const links: GraphLink[] = []
  
  for (const company of companies) {
    if (company.partnerships && Array.isArray(company.partnerships)) {
      for (const partnership of company.partnerships) {
        links.push({
          source: company.id,
          target: partnership.companyId,
          type: 'partnership',
          strength: 1,
          metadata: {
            type: partnership.type,
            description: partnership.description,
            date: partnership.date,
          },
        })
      }
    }
  }
  
  return links
}

/**
 * Extract data center relationships from companies
 */
function extractDataCenterRelationships(companies: Company[]): GraphLink[] {
  const links: GraphLink[] = []
  
  for (const company of companies) {
    if (company.dataCenters) {
      for (const dataCenter of company.dataCenters) {
        // Owner relationship - if the company owns this data center
        if (dataCenter.ownerCompanyId === company.id) {
          links.push({
            source: company.id,
            target: dataCenter.id,
            type: 'data-center-owner',
            strength: 2,
          })
        }
      }
    }
  }
  
  return links
}

/**
 * Build graph nodes from companies, people, capital entities, and data centers
 * Separates Capital entities from Person nodes
 * Deduplicates nodes by ID to prevent duplicates
 */
function buildGraphNodes(
  companies: Company[],
  personMap: Map<string, Person>,
  dataCenters: Array<{ id: string; title: string }> = []
): GraphNode[] {
  const nodes: GraphNode[] = []
  const nodeIds = new Set<string>() // Track node IDs to prevent duplicates
  
  // Add company nodes - check if they're capital entities
  for (const company of companies) {
    if (!nodeIds.has(company.id)) {
      // Check if this company is a capital entity (investment firm)
      // Either by tags or by name matching isCapitalEntity()
      const isCapital = 
        (company.tags && Array.isArray(company.tags) && 
         (company.tags.includes('investment-firm' as any) || company.tags.includes('capital' as any))) ||
        isCapitalEntity(company.name)
      
      nodes.push({
        id: company.id,
        name: company.name,
        type: isCapital ? 'capital' : 'company',
        logoUrl: company.logoUrl,
        slug: company.slug,
        metadata: {
          companyId: company.id,
          ...(isCapital ? { capitalId: company.id } : {}),
        },
      })
      nodeIds.add(company.id)
    }
  }
  
  // Separate Person records into actual persons and Capital entities
  for (const [personId, person] of personMap.entries()) {
    if (!nodeIds.has(personId)) {
      // Check if this person is actually a capital entity (investment firm)
      if (isCapitalEntity(person.name)) {
        nodes.push({
          id: personId,
          name: person.name,
          type: 'capital',
          photoUrl: person.photoUrl,
          slug: person.slug,
          metadata: {
            capitalId: personId,
          },
        })
      } else {
        nodes.push({
          id: personId,
          name: person.name,
          type: 'person',
          photoUrl: person.photoUrl,
          slug: person.slug,
          metadata: {
            personId: personId,
          },
        })
      }
      nodeIds.add(personId)
    }
  }
  
  // Add data center nodes
  for (const dataCenter of dataCenters) {
    if (!nodeIds.has(dataCenter.id)) {
      nodes.push({
        id: dataCenter.id,
        name: dataCenter.title,
        type: 'data-center',
        metadata: {
          dataCenterId: dataCenter.id,
        },
      })
      nodeIds.add(dataCenter.id)
    }
  }
  
  return nodes
}

/**
 * Build complete graph data from companies
 * 
 * @param companyIds Optional array of company IDs to focus on. If not provided, uses all companies.
 * @param options Options for filtering and limiting the graph
 */
export async function buildGraphData(
  companyIds?: string[],
  options?: {
    includePeople?: boolean
    includeDataCenters?: boolean
    includePartnerships?: boolean
    maxDepth?: number
  }
): Promise<GraphData> {
  const {
    includePeople = true,
    includeDataCenters = true,
    includePartnerships = true,
    maxDepth = 2,
  } = options || {}
  
  // Fetch companies
  let companies: Company[]
  if (companyIds && companyIds.length > 0) {
    // Fetch specific companies
    const companiesWithNulls = await Promise.all(
      companyIds.map(async (id) => {
        const company = await prisma.company.findUnique({
          where: { id },
          include: {
            ownedDataCenters: true,
            usedDataCenters: {
              include: {
                dataCenter: true,
              },
            },
            parentCompany: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            subsidiaries: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            boardMembers: {
              include: {
                person: true,
              },
            },
            investments: {
              include: {
                person: true,
                investorCompany: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            foundersRelation: true,
          },
        })
        
        if (!company) return null
        
        // Transform to Company type
        return {
          id: company.id,
          name: company.name,
          description: company.description,
          website: company.website || undefined,
          logoUrl: company.logoUrl || undefined,
          founders: JSON.parse(company.founders) as string[],
          ceo: company.ceo || undefined,
          foundedYear: company.foundedYear || undefined,
          funding: company.funding ? (tryParseJSON(company.funding) || company.funding) : undefined,
          valuation: company.valuation || undefined,
          products: JSON.parse(company.products) as string[],
          tags: company.tags ? (tryParseJSON(company.tags) as Company['tags']) || [] : [],
          parentCompanyId: company.parentCompanyId || undefined,
          partnerships: company.partnerships ? (JSON.parse(company.partnerships) as Company['partnerships']) : undefined,
          dataCenters: company.ownedDataCenters.map(dc => ({
            id: dc.id,
            title: dc.title,
            ownerCompanyId: dc.ownerCompanyId || undefined,
          })),
        } as Company
      })
    )
    // Filter out null values (companies that weren't found)
    companies = companiesWithNulls.filter((c): c is Company => c !== null)
  } else {
    // Fetch all approved companies
    const dbCompanies = await prisma.company.findMany({
      where: { approved: true },
      include: {
        ownedDataCenters: true,
        parentCompany: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
    
    companies = dbCompanies.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      website: c.website || undefined,
      logoUrl: c.logoUrl || undefined,
      founders: JSON.parse(c.founders) as string[],
      ceo: c.ceo || undefined,
      foundedYear: c.foundedYear || undefined,
      funding: c.funding ? (tryParseJSON(c.funding) || c.funding) : undefined,
      valuation: c.valuation || undefined,
      products: JSON.parse(c.products) as string[],
      tags: c.tags ? (tryParseJSON(c.tags) as Company['tags']) || [] : [],
      parentCompanyId: c.parentCompanyId || undefined,
      partnerships: c.partnerships ? (JSON.parse(c.partnerships) as Company['partnerships']) : undefined,
      dataCenters: c.ownedDataCenters.map(dc => ({
        id: dc.id,
        title: dc.title,
        ownerCompanyId: dc.ownerCompanyId || undefined,
      })),
    })) as Company[]
  }
  
  // Build person map and extract relationships
  const personMap = new Map<string, Person>() // personId -> Person
  const personNameToId = new Map<string, string>() // normalized name -> personId (for deduplication)
  const links: GraphLink[] = []
  const companyIdsList = companies.map(c => c.id)
  
  // Collect investor company IDs that might not be in the initial companies list
  const investorCompanyIds = new Set<string>()
  
  // Build company name set for filtering out company names from person extraction
  const companyNameSet = await buildCompanyNameSet(companyIdsList)
  
  // FIRST: Extract from database relationships (these are the source of truth)
  // This populates personMap with real Person records from the database
  // BUT we filter out Person records whose names match company names
  const dbCompaniesWithRelations = await prisma.company.findMany({
    where: {
      id: { in: companies.map(c => c.id) },
      approved: true,
    },
    include: {
      boardMembers: {
        include: {
          person: true,
        },
      },
      investments: {
        include: {
          person: true,
          investorCompany: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      foundersRelation: {
        include: {
          person: true,
        },
      },
    },
  })
  
  // Build person map from database records first
  for (const dbCompany of dbCompaniesWithRelations) {
    // Board member relationships
    for (const boardMember of dbCompany.boardMembers) {
      const personId = boardMember.personId
      // Check if this person's name is actually a company name - if so, skip it
      if (isCompanyName(boardMember.person.name, companyNameSet)) {
        continue // Skip this person - they're actually a company
      }
      
      if (!personMap.has(personId)) {
        personMap.set(personId, {
          id: boardMember.person.id,
          name: boardMember.person.name,
          slug: boardMember.person.slug || undefined,
          bio: boardMember.person.bio || undefined,
          photoUrl: boardMember.person.photoUrl || undefined,
          linkedinUrl: boardMember.person.linkedinUrl || undefined,
          wikipediaUrl: boardMember.person.wikipediaUrl || undefined,
        })
        // Also add to name lookup for deduplication
        const normalized = normalizePersonName(boardMember.person.name)
        personNameToId.set(normalized, personId)
      }
      
      // Check if link already exists before adding
      const linkExists = links.some(
        link => link.source === personId && link.target === dbCompany.id && link.type === 'board-member'
      )
      
      if (!linkExists) {
        links.push({
          source: personId,
          target: dbCompany.id,
          type: 'board-member',
          strength: 2,
          metadata: {
            title: boardMember.title,
          },
        })
      }
    }
    
    // Investment relationships from database
    for (const investment of dbCompany.investments) {
      if (investment.personId && investment.person) {
        const personId = investment.personId
        // Check if this person's name is actually a company name - if so, skip it
        if (isCompanyName(investment.person.name, companyNameSet)) {
          continue // Skip this person - they're actually a company
        }
        
        if (!personMap.has(personId)) {
          personMap.set(personId, {
            id: investment.person.id,
            name: investment.person.name,
            slug: investment.person.slug || undefined,
            bio: investment.person.bio || undefined,
            photoUrl: investment.person.photoUrl || undefined,
            linkedinUrl: investment.person.linkedinUrl || undefined,
            wikipediaUrl: investment.person.wikipediaUrl || undefined,
          })
          // Also add to name lookup for deduplication
          const normalized = normalizePersonName(investment.person.name)
          personNameToId.set(normalized, personId)
        }
        
        // Check if link already exists before adding
        const linkExists = links.some(
          link => link.source === personId && link.target === dbCompany.id && link.type === 'investor'
        )
        
        if (!linkExists) {
          links.push({
            source: personId,
            target: dbCompany.id,
            type: 'investor',
            strength: 1,
            metadata: {
              amount: investment.amount || undefined,
              round: investment.round || undefined,
              role: investment.role || undefined,
            },
          })
        }
      } else if (investment.investorCompanyId && investment.investorCompany) {
        // Company-to-company investment link
        const investorCompanyId = investment.investorCompanyId
        
        // Track investor company IDs that might not be in initial companies list
        if (!companies.some(c => c.id === investorCompanyId)) {
          investorCompanyIds.add(investorCompanyId)
        }
        
        // Check if link already exists before adding
        const linkExists = links.some(
          link => link.source === investorCompanyId && link.target === dbCompany.id && link.type === 'investor'
        )
        
        if (!linkExists) {
          links.push({
            source: investorCompanyId,
            target: dbCompany.id,
            type: 'investor',
            strength: 1,
            metadata: {
              amount: investment.amount || undefined,
              round: investment.round || undefined,
            },
          })
        }
      }
    }
    
    // Founder relationships from database
    if (dbCompany.foundersRelation) {
      for (const founderRel of dbCompany.foundersRelation) {
        const personId = founderRel.personId
        if (!founderRel.person) continue
        
        // Check if this person's name is actually a company name - if so, skip it
        if (isCompanyName(founderRel.person.name, companyNameSet)) {
          continue // Skip this person - they're actually a company
        }
        
        if (!personMap.has(personId)) {
          personMap.set(personId, {
            id: founderRel.person.id,
            name: founderRel.person.name,
            slug: founderRel.person.slug || undefined,
            bio: founderRel.person.bio || undefined,
            photoUrl: founderRel.person.photoUrl || undefined,
            linkedinUrl: founderRel.person.linkedinUrl || undefined,
            wikipediaUrl: founderRel.person.wikipediaUrl || undefined,
          })
          // Also add to name lookup for deduplication
          const normalized = normalizePersonName(founderRel.person.name)
          personNameToId.set(normalized, personId)
        }
        
        // Check if link already exists before adding
        const linkExists = links.some(
          link => link.source === personId && link.target === dbCompany.id && link.type === 'founder'
        )
        
        if (!linkExists) {
          links.push({
            source: personId,
            target: dbCompany.id,
            type: 'founder',
            strength: 2,
            metadata: {
              role: founderRel.role || undefined,
            },
          })
        }
      }
    }
  }
  
  // Fetch any missing investor companies and add them to the companies array
  // This ensures company-to-company investment links have both nodes in the graph
  if (investorCompanyIds.size > 0) {
    const missingInvestorCompanies = await prisma.company.findMany({
      where: {
        id: { in: Array.from(investorCompanyIds) },
        approved: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        logoUrl: true,
        founders: true,
        ceo: true,
        foundedYear: true,
        funding: true,
        valuation: true,
        products: true,
        tags: true,
        slug: true,
      },
    })
    
    // Add missing investor companies to the companies array
    for (const invCompany of missingInvestorCompanies) {
      if (!companies.some(c => c.id === invCompany.id)) {
        companies.push({
          id: invCompany.id,
          name: invCompany.name,
          description: invCompany.description,
          website: invCompany.website || undefined,
          logoUrl: invCompany.logoUrl || undefined,
          founders: JSON.parse(invCompany.founders) as string[],
          ceo: invCompany.ceo || undefined,
          foundedYear: invCompany.foundedYear || undefined,
          funding: invCompany.funding ? (tryParseJSON(invCompany.funding) || invCompany.funding) : undefined,
          valuation: invCompany.valuation || undefined,
          products: JSON.parse(invCompany.products) as string[],
          tags: invCompany.tags ? (tryParseJSON(invCompany.tags) as Company['tags']) || [] : [],
          slug: invCompany.slug || undefined,
        } as Company)
      }
    }
  }
  
  // SECOND: Extract relationships from JSON data (only for relationships not already in database)
  // Only add people/links that aren't already captured by database relationships
  if (includePeople) {
    for (const company of companies) {
      // Extract funding relationships (person investors from JSON)
      // Only create links for people already in personMap (from database) and avoid duplicate links
      const fundingLinks = extractFundingRelationships(company, personMap, personNameToId, companyNameSet)
      links.push(...fundingLinks)
      
      // Extract founder relationships from JSON
      // Only create links for people already in personMap (from database) and avoid duplicate links
      const founderLinks = extractFounderRelationships(company, personMap, personNameToId, companyNameSet)
      links.push(...founderLinks)
    }
  }
  
  // Extract hierarchy relationships
  const hierarchyLinks = extractHierarchyRelationships(companies)
  links.push(...hierarchyLinks)
  
  // Extract partnership relationships
  if (includePartnerships) {
    const partnershipLinks = extractPartnershipRelationships(companies)
    links.push(...partnershipLinks)
  }
  
  // Extract data center relationships
  if (includeDataCenters) {
    const dataCenterLinks = extractDataCenterRelationships(companies)
    links.push(...dataCenterLinks)
  }
  
  // Collect data centers
  const dataCenters = companies.flatMap(c => c.dataCenters || [])
  
  // Build nodes (already deduplicated in buildGraphNodes)
  const nodes = buildGraphNodes(companies, personMap, dataCenters)
  
  // Final deduplication: Remove duplicate links
  const uniqueLinks: GraphLink[] = []
  const linkKeys = new Set<string>()
  
  for (const link of links) {
    // Create unique key for link: source-target-type
    const linkKey = `${link.source}-${link.target}-${link.type}`
    if (!linkKeys.has(linkKey)) {
      linkKeys.add(linkKey)
      uniqueLinks.push(link)
    }
  }
  
  // Final deduplication: Remove duplicate nodes (shouldn't happen, but just in case)
  const uniqueNodes: GraphNode[] = []
  const nodeIds = new Set<string>()
  
  for (const node of nodes) {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id)
      uniqueNodes.push(node)
    }
  }
  
  return {
    nodes: uniqueNodes,
    links: uniqueLinks,
  }
}

// Helper function for JSON parsing
function tryParseJSON(json: string): unknown {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
