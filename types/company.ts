import { DataCenter } from './datacenter'

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
  slug?: string
  featured?: boolean
  approved?: boolean
  createdAt?: string
  updatedAt?: string
  dataCenters?: DataCenter[]
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
