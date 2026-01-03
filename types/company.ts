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
  controversies?: string
  layoffs?: LayoffInfo[]
  tags: CompanyTag[]
  featured?: boolean
  approved?: boolean
  createdAt?: string
  updatedAt?: string
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
