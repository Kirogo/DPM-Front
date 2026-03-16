// src/services/api/qsApi.ts
import axiosInstance from './axiosConfig'
import { SiteVisitReport, ReviewDecision, Comment } from '@/types/report.types'
import { PaginatedResponse } from '@/types/common.types'

export const qsApi = {
  // Get QS dashboard stats
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/Qs/dashboard/stats')
    return response
  },

  // Get pending reviews
  getPendingReviews: async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get('/Qs/reviews/pending', {
      params: { page, pageSize }
    })
    return response
  },

  // Get reviews in progress (rework status)
  getInProgressReviews: async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get('/Qs/reviews/in-progress', {
      params: { page, pageSize }
    })
    return response
  },

  // Get completed reviews (approved status)
  getCompletedReviews: async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get('/Qs/reviews/completed', {
      params: { page, pageSize }
    })
    return response
  },

  // Get report details
  getReportDetails: async (reportId: string) => {
    const response = await axiosInstance.get(`/Qs/reviews/${reportId}`)
    return response
  },

  // Get comments for a report
  getReportComments: async (reportId: string): Promise<{ data: Comment[] }> => {
    try {
      const response = await axiosInstance.get(`/Qs/reviews/${reportId}/comments`)
      return { data: response.data }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { data: [] }
    }
  },

  // Add comment to review
  addReviewComment: async (reportId: string, content: string, isInternal = false): Promise<{ data: Comment }> => {
    const response = await axiosInstance.post(`/Qs/reviews/${reportId}/comments`, {
      comment: content,
      isInternal
    })
    return response
  },

  // Assign report to self
  assignReport: async (reportId: string) => {
    const response = await axiosInstance.post(`/Qs/reviews/${reportId}/assign`)
    return response
  },

  // Request revision (rework)
  requestRevision: async (reportId: string, notes: string, requiredChanges: string[]) => {
    const response = await axiosInstance.post(`/Qs/reviews/${reportId}/revision`, {
      notes,
      requiredChanges,
    })
    return response
  },

  // Approve report
  approveReport: async (reportId: string, notes?: string) => {
    const response = await axiosInstance.post(`/Qs/reviews/${reportId}/approve`, 
      notes ? { notes } : undefined
    )
    return response
  },

  // Reject report
  rejectReport: async (reportId: string, reason: string) => {
    const response = await axiosInstance.post(`/Qs/reviews/${reportId}/reject`, { reason })
    return response
  },

  // Get report audit trail
  getReportAuditTrail: async (reportId: string) => {
    try {
      const response = await axiosInstance.get(`/Qs/reviews/${reportId}/audit`)
      return response
    } catch (error) {
      console.log('Audit trail endpoint not available yet')
      return { data: [] }
    }
  },

   // Schedule a site visit
  scheduleSiteVisit: async (reportId: string, data: { scheduledDate: string; notes: string }) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/schedule-site-visit`, data)
    return response.data
  },

  // Confirm a site visit with findings
  confirmSiteVisit: async (reportId: string, findings: string) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/confirm-site-visit`, { findings })
    return response.data
  },

  // Get all scheduled site visits
  getSiteVisits: async (page = 1, pageSize = 15) => {
    const response = await axiosInstance.get('/qs/reviews/site-visits', {
      params: { page, pageSize }
    })
    return response.data
  },

  // Get site visits statistics
  getSiteVisitsStats: async () => {
    const response = await axiosInstance.get('/qs/reviews/site-visits/stats')
    return response.data
}
}