// src/types/qs.types.ts
import { SiteVisitReport } from './report.types'

export interface ReviewStats {
  pendingReviews: number
  inProgress: number
  completedToday: number
  scheduledVisits: number
  averageResponseTime: string
  criticalIssues: number
  totalReviewed: number
  averageRating?: number
}

export interface ScheduledVisit {
  id: string
  reportId: string
  report?: SiteVisitReport
  scheduledDate: string
  location: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  assignedQS: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewAction {
  id: string
  reportId: string
  reportTitle?: string
  userId: string
  userName: string
  actionType: 'ASSIGNED' | 'STARTED' | 'COMMENTED' | 'RETURNED' | 'APPROVED' | 'REJECTED'
  details?: string
  createdAt: string
}

export interface ReviewComment {
  id: string
  reportId: string
  userId: string
  userName: string
  userRole: 'QS' | 'RM'
  content: string
  attachments?: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
  }>
  createdAt: string
  updatedAt: string
}

export interface ReviewQueueFilters {
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'high' | 'medium' | 'low'
  rmId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}