export type ResourceCategory = 
  | 'tool'
  | 'website'
  | 'article'
  | 'community'
  | 'service'
  | 'extension'
  | 'other'

export type ResourceTag = 
  | 'detection'
  | 'protection'
  | 'privacy'
  | 'verification'
  | 'education'
  | 'advocacy'
  | 'research'
  | 'legal'

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: ResourceCategory
  tags: ResourceTag[]
  slug?: string
  featured?: boolean
  approved?: boolean
  submittedAt?: string
  submittedBy?: string
}

export interface Submission extends Resource {
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}


