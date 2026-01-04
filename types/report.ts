export type ReportType = 'company' | 'resource'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  type: ReportType
  targetId: string
  reporterEmail?: string
  field?: string
  newValue?: string
  source?: string
  message: string
  status: ReportStatus
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  adminNotes?: string
}

export interface CreateReportInput {
  type: ReportType
  targetId: string
  reporterEmail?: string
  field?: string
  newValue?: string
  source?: string
  message: string
}
