import { DataCenter } from './datacenter'
import type { Person, BoardPosition, Investment } from './person'

export interface Company {
  id: string
  name: string
  description: string
  website?: string
  logoUrl?: string
  founders: string[]
  ceo?: string
  foundedYear?: number
  funding?: string | FundingInfo
  valuation?: string
  products: string[]
  controversies?: ControversyInfo[]
  layoffs?: LayoffInfo[]
  tags: CompanyTag[]
  citations?: Record<string, Citation[]>
  locations?: OfficeLocation[]
  directAction?: CampaignLink[]
  unionInfo?: UnionInfo
  employeeCount?: number
  socialMedia?: SocialMedia
  contactInfo?: ContactInfo
  slug?: string
  featured?: boolean
  approved?: boolean
  createdAt?: string
  updatedAt?: string
  dataCenters?: DataCenter[]
  // Relationship fields
  parentCompanyId?: string
  parentCompany?: Company
  subsidiaries?: Company[]
  partnerships?: Partnership[]
  boardMembers?: BoardPosition[]
  investments?: Investment[]
  investors?: Investment[]
  foundersRelation?: Person[]
}

export interface Partnership {
  companyId: string
  type: 'strategic' | 'investment' | 'technology' | 'supply-chain' | 'other'
  description?: string
  date?: string
}

export type CompanyTag =
  | 'llm'
  | 'image-generation'
  | 'code-generation'
  | 'chatbot'
  | 'automation'
  | 'surveillance'
  | 'data-scraping'
  | 'layoffs'
  | 'controversy'
  | 'billionaire-owned'
  | 'major-player'

export interface FundingInfo {
  total?: string
  latestRound?: string
  investors?: string[]
  date?: string
}

export interface LayoffInfo {
  date: string
  count?: number
  percentage?: string
  reason?: string
  source?: string
}

export interface ControversyInfo {
  text: string
  date?: string
  citations?: Citation[]
}

export interface Citation {
  url: string
  title?: string
  date?: string
}

export interface OfficeLocation {
  type: 'headquarters' | 'office' | 'data-center' | 'other'
  address?: string
  city?: string
  state?: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  notes?: string
}

export interface CampaignLink {
  title: string
  url: string
  type: 'petition' | 'boycott' | 'protest' | 'organizing' | 'legal' | 'other'
  status: 'active' | 'completed'
  date?: string
  description?: string
}

export interface UnionInfo {
  status: 'unionized' | 'non-union' | 'organizing' | 'unknown'
  union?: {
    name: string
    url?: string
    description?: string
  }
  organizingEfforts?: OrganizingEffort[]
  laborViolations?: LaborViolation[]
}

export interface OrganizingEffort {
  date: string
  description: string
  status: 'active' | 'completed' | 'failed'
  url?: string
  union?: string
}

export interface LaborViolation {
  date: string
  type: 'strike' | 'walkout' | 'unfair-labor-practice' | 'wage-theft' | 'safety-violation' | 'discrimination' | 'retaliation' | 'other'
  description: string
  agency?: string // e.g., "NLRB", "OSHA", "EEOC"
  status?: 'pending' | 'resolved' | 'appealed'
  url?: string
}

export interface SocialMedia {
  twitter?: string // Twitter/X handle (without @)
  linkedin?: string // LinkedIn company page URL
  facebook?: string // Facebook page URL
  instagram?: string // Instagram handle (without @)
  youtube?: string // YouTube channel URL
  tiktok?: string // TikTok handle (without @)
}

export interface ContactInfo {
  email?: string // General contact email
  pressEmail?: string // Press/media contact email
  investorRelations?: string // Investor relations email or URL
  phone?: string // Public phone number
  address?: string // Mailing address (if different from HQ location)
  notes?: string // Additional contact information or notes
}
