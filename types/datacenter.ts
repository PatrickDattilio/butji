import { Citation } from './company'

export interface DataCenter {
  id: string
  handle: string
  title: string
  project?: string
  address?: string
  latitude?: string
  longitude?: string
  timelapseImageUrl?: string
  ownerCompanyId?: string
  currentH100Equivalents?: number
  currentPowerMW?: number
  currentCapitalCostUSD?: number // In billions
  investors?: string[]
  constructionCompanies?: string[]
  energyCompanies?: string[]
  citations?: Citation[]
  createdAt?: string
  updatedAt?: string
  // Relations
  owner?: {
    id: string
    name: string
    slug?: string
  }
  users?: Array<{
    id: string
    company: {
      id: string
      name: string
      slug?: string
    }
    confidence?: string
  }>
  // For data centers where this company is a user (not owner)
  userConfidence?: string
}
