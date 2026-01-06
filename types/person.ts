// Forward reference to avoid circular dependency
// Company interface is imported in company.ts

export interface Person {
  id: string
  name: string
  slug?: string
  bio?: string
  photoUrl?: string
  linkedinUrl?: string
  wikipediaUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface BoardPosition {
  id: string
  personId: string
  companyId: string
  title: string
  startDate?: string
  endDate?: string
  person?: Person
  // company?: Company - will be imported where needed
}

export interface Investment {
  id: string
  personId?: string
  companyId: string
  investorCompanyId?: string
  amount?: string
  round?: string
  date?: string
  role?: string
  person?: Person
  // company?: Company - will be imported where needed
  // investorCompany?: Company - will be imported where needed
}
